/**
 * Relay: routes validated messages between phones and the TV host of a room.
 * Transport-agnostic (takes a Conn) so it can be unit-tested without sockets.
 */
import {
  HostToServer,
  PhoneToServer,
  PROTOCOL_VERSION,
  type ServerToHost,
  type ServerToPhone,
} from "../src/shared/protocol.ts";
import { playerInfo, RoomRegistry, safeEqual, type Conn, type Room } from "./rooms.ts";

type Role = { kind: "none" } | { kind: "host"; room: Room } | { kind: "phone"; room: Room; playerId: string };

export interface RelayConnection {
  onMessage(raw: string): void;
  onClose(): void;
}

const MAX_MSGS_PER_SECOND = 80;
const MAX_MESSAGE_BYTES = 16_000;

export class Relay {
  readonly rooms: RoomRegistry;
  private readonly now: () => number;
  constructor(rooms = new RoomRegistry(), now: () => number = () => Date.now()) {
    this.rooms = rooms;
    this.now = now;
  }

  connect(conn: Conn): RelayConnection {
    let role: Role = { kind: "none" };
    let windowStart = this.now();
    let count = 0;

    const toHost = (m: ServerToHost) => conn.send(JSON.stringify(m));
    const toPhone = (m: ServerToPhone) => conn.send(JSON.stringify(m));

    return {
      onMessage: (raw: string) => {
        const now = this.now();
        if (now - windowStart > 1000) {
          windowStart = now;
          count = 0;
        }
        if (++count > MAX_MSGS_PER_SECOND || raw.length > MAX_MESSAGE_BYTES) return; // drop floods silently
        let data: unknown;
        try {
          data = JSON.parse(raw);
        } catch {
          return;
        }
        const t = (data as { t?: unknown })?.t;
        if (typeof t !== "string") return;

        if (t.startsWith("h.")) {
          const parsed = HostToServer.safeParse(data);
          if (!parsed.success) return toHost({ t: "s.error", reason: "bad message" });
          const m = parsed.data;
          if (m.t === "h.create") {
            if (role.kind !== "none") return;
            const room = this.rooms.create(conn, now);
            role = { kind: "host", room };
            return toHost({ t: "s.created", roomId: room.roomId, code: room.code, roomEpoch: room.epoch, hostToken: room.hostToken });
          }
          if (m.t === "h.resume") {
            const room = this.rooms.resumeHost(m.roomId, m.hostToken, conn, now);
            if (!room) return toHost({ t: "s.resumeFailed", reason: "unknown room or token" });
            role = { kind: "host", room };
            toHost({
              t: "s.resumed",
              roomId: room.roomId,
              code: room.code,
              roomEpoch: room.epoch,
              players: [...room.players.values()].map(playerInfo),
            });
            // Tell phones a new host incarnation took over: they must resync clocks and restamp.
            for (const slot of room.players.values()) sendPhone(slot.conn, { t: "s.epoch", roomEpoch: room.epoch });
            return;
          }
          if (role.kind !== "host" || !safeEqual(role.room.hostToken, m.hostToken)) return;
          const room = role.room;
          if (m.t === "h.close") {
            if (m.roomId !== room.roomId) return;
            for (const slot of room.players.values()) sendPhone(slot.conn, { t: "s.roomClosed" });
            this.rooms.close(room);
            role = { kind: "none" };
            return;
          }
          // h.msg
          const msg = m.msg;
          if (msg.roomId !== room.roomId || msg.roomEpoch !== room.epoch) return; // stale host incarnation
          room.lastActivity = now;
          const out: ServerToPhone = { t: "s.fromHost", msg };
          if (msg.to === "all") for (const slot of room.players.values()) sendPhone(slot.conn, out);
          else sendPhone(room.players.get(msg.to)?.conn ?? null, out);
          return;
        }

        if (t.startsWith("p.")) {
          const parsed = PhoneToServer.safeParse(data);
          if (!parsed.success) {
            const v = (data as { protocolVersion?: unknown }).protocolVersion;
            if (t === "p.join" && v !== PROTOCOL_VERSION) return toPhone({ t: "s.joinFailed", reason: "version" });
            return toPhone({ t: "s.error", reason: "bad message" });
          }
          const m = parsed.data;
          if (m.t === "p.join") {
            const room = this.rooms.byRoomCode(m.code);
            if (!room) return toPhone({ t: "s.joinFailed", reason: "no-room" });
            const res = this.rooms.join(room, m, conn, m.resume, now);
            if ("error" in res) return toPhone({ t: "s.joinFailed", reason: res.error });
            role = { kind: "phone", room, playerId: res.slot.playerId };
            toPhone({
              t: "s.joined",
              roomId: room.roomId,
              code: room.code,
              roomEpoch: room.epoch,
              playerId: res.slot.playerId,
              playerToken: res.slot.playerToken,
            });
            sendHost(room.host, { t: "s.player", player: playerInfo(res.slot), rejoin: res.rejoin });
            if (!room.host) toPhone({ t: "s.hostAway" });
            return;
          }
          // p.msg
          if (role.kind !== "phone") return;
          const room = role.room;
          const slot = room.players.get(role.playerId);
          if (!slot || slot.conn !== conn || !safeEqual(slot.playerToken, m.playerToken)) return;
          const msg = m.msg;
          if (msg.playerId !== slot.playerId || msg.roomId !== room.roomId) return;
          if (msg.roomEpoch !== room.epoch) return toPhone({ t: "s.epoch", roomEpoch: room.epoch });
          slot.lastSeen = now;
          room.lastActivity = now;
          if (!room.host) return toPhone({ t: "s.hostAway" });
          sendHost(room.host, { t: "s.fromPlayer", msg, serverTime: now });
        }
      },

      onClose: () => {
        const now = this.now();
        if (role.kind === "host") this.rooms.hostDisconnected(role.room, conn, now);
        if (role.kind === "phone") {
          const slot = this.rooms.playerDisconnected(role.room, conn, now);
          if (slot) sendHost(role.room.host, { t: "s.playerLeft", playerId: slot.playerId });
        }
        role = { kind: "none" };
      },
    };
  }

  /** Periodic cleanup: close expired rooms and tell their phones. */
  sweep(): number {
    const closed = this.rooms.sweep(this.now());
    for (const room of closed) {
      for (const slot of room.players.values()) sendPhone(slot.conn, { t: "s.roomClosed" });
      this.rooms.close(room);
    }
    return closed.length;
  }
}

function sendHost(conn: Conn | null, m: ServerToHost) {
  conn?.send(JSON.stringify(m));
}
function sendPhone(conn: Conn | null, m: ServerToPhone) {
  conn?.send(JSON.stringify(m));
}

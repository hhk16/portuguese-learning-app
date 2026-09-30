/**
 * TV-side connection: owns the room, stamps envelopes, answers clock pings, de-duplicates inputs.
 */
import { gameNow } from "../tv/clock.ts";
import { randomId } from "../shared/ids.ts";
import {
  PROTOCOL_VERSION,
  ServerToHost,
  type ControllerView,
  type HostBody,
  type PlayerBody,
  type PlayerInfo,
} from "../shared/protocol.ts";
import { ReconnectingSocket, type SocketStatus } from "./socket.ts";

const STORAGE_KEY = "pp.host.room";

export interface HostEvents {
  onRoom(info: { code: string; roomId: string; epoch: number; resumed: boolean }): void;
  onPlayer(p: PlayerInfo, rejoin: boolean): void;
  onPlayerLeft(playerId: string): void;
  /** Deduplicated player bodies (except pings, handled here). */
  onPlayerBody(playerId: string, body: PlayerBody, meta: { messageId: string; serverTime: number }): void;
  onStatus(s: SocketStatus): void;
}

export class HostConnection {
  private sock: ReconnectingSocket;
  private roomId: string | null = null;
  private hostToken: string | null = null;
  private epoch = 0;
  private seq = 0;
  private seen = new Map<string, number>(); // messageId -> time (dedupe)
  private snapshotSeq = 0;
  private lastViews = new Map<string, ControllerView>();
  private readonly ev: HostEvents;
  code = "";

  constructor(ev: HostEvents, url?: string) {
    this.ev = ev;
    this.sock = new ReconnectingSocket(url);
    this.sock.onStatus = (s) => ev.onStatus(s);
    this.sock.onOpen = () => {
      const saved = loadSaved();
      if (saved) this.sock.send({ t: "h.resume", protocolVersion: PROTOCOL_VERSION, roomId: saved.roomId, hostToken: saved.hostToken });
      else this.sock.send({ t: "h.create", protocolVersion: PROTOCOL_VERSION });
    };
    this.sock.onMessage = (raw) => this.handle(raw);
  }

  private handle(raw: unknown) {
    const parsed = ServerToHost.safeParse(raw);
    if (!parsed.success) return;
    const m = parsed.data;
    switch (m.t) {
      case "s.created":
      case "s.resumed": {
        this.roomId = m.roomId;
        this.epoch = m.roomEpoch;
        this.code = m.code;
        if (m.t === "s.created") this.hostToken = m.hostToken;
        else this.hostToken = loadSaved()?.hostToken ?? this.hostToken;
        saveRoom({ roomId: m.roomId, hostToken: this.hostToken! });
        this.ev.onRoom({ code: m.code, roomId: m.roomId, epoch: m.roomEpoch, resumed: m.t === "s.resumed" });
        if (m.t === "s.resumed") {
          for (const p of m.players) this.ev.onPlayer(p, true);
          // Authoritative snapshot to every phone after a host restore.
          for (const [pid, view] of this.lastViews) this.sendView(pid, view);
        }
        return;
      }
      case "s.resumeFailed":
        clearSaved();
        this.sock.send({ t: "h.create", protocolVersion: PROTOCOL_VERSION });
        return;
      case "s.player":
        this.ev.onPlayer(m.player, m.rejoin);
        // A (re)joining phone always gets the latest authoritative view.
        {
          const v = this.lastViews.get(m.player.playerId);
          if (v) this.sendView(m.player.playerId, v);
        }
        return;
      case "s.playerLeft":
        this.ev.onPlayerLeft(m.playerId);
        return;
      case "s.fromPlayer": {
        const msg = m.msg;
        if (msg.roomEpoch !== this.epoch) return;
        if (msg.body.k === "ping") {
          this.sendBody(msg.playerId, { k: "pong", id: msg.body.id, t0: msg.body.t0, hostTime: gameNow() });
          return;
        }
        if (this.seen.has(msg.messageId)) {
          // Duplicate (retry after reconnect): re-ack, never re-apply.
          if (msg.body.k === "input") this.sendBody(msg.playerId, { k: "ack", messageIds: [msg.messageId] });
          return;
        }
        this.seen.set(msg.messageId, Date.now());
        if (this.seen.size > 2000) {
          const cutoff = [...this.seen.values()].sort((a, b) => a - b)[1000]!;
          for (const [k, t] of this.seen) if (t < cutoff) this.seen.delete(k);
        }
        if (msg.body.k === "input") this.sendBody(msg.playerId, { k: "ack", messageIds: [msg.messageId] });
        this.ev.onPlayerBody(msg.playerId, msg.body, { messageId: msg.messageId, serverTime: m.serverTime });
        return;
      }
      case "s.error":
        console.warn("[host] server error", m.reason);
    }
  }

  private sendBody(to: string, body: HostBody) {
    if (!this.roomId || !this.hostToken) return;
    this.sock.send({
      t: "h.msg",
      hostToken: this.hostToken,
      msg: { protocolVersion: PROTOCOL_VERSION, roomId: this.roomId, roomEpoch: this.epoch, messageId: randomId(8), sequence: this.seq++, to, body },
    });
  }

  sendView(playerId: string, view: ControllerView) {
    this.lastViews.set(playerId, view);
    this.sendBody(playerId, { k: "view", view, snapshotSeq: ++this.snapshotSeq });
  }

  resync(playerId: string) {
    this.sendBody(playerId, { k: "resync" });
  }

  /** Ask a phone to say Portuguese aloud (when the TV has no Portuguese voice). */
  speakOn(playerId: string, text: string) {
    this.sendBody(playerId, { k: "speak", text: text.slice(0, 200) });
  }

  fx(playerId: string, fx: "buzz" | "success" | "fail" | "boost") {
    this.sendBody(playerId, { k: "fx", fx });
  }

  /** Close the room for good (new session). */
  closeRoom() {
    if (this.roomId && this.hostToken) this.sock.send({ t: "h.close", hostToken: this.hostToken, roomId: this.roomId });
    clearSaved();
  }
}

function loadSaved(): { roomId: string; hostToken: string } | null {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return v && typeof v.roomId === "string" && typeof v.hostToken === "string" ? v : null;
  } catch {
    return null;
  }
}
function saveRoom(v: { roomId: string; hostToken: string }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {
    /* private mode */
  }
}
function clearSaved() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

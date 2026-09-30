/**
 * Room registry for the relay. Owns room codes, epochs, presence and tokens.
 * Knows nothing about game rules — the TV host is authoritative for game state.
 *
 * Epochs: a room's epoch increments every time a host (re)attaches. Messages stamped with a
 * stale epoch are dropped, so traffic addressed to a previous host incarnation can never be
 * applied to the restored one. Phones are told about the new epoch and resync their clocks.
 */
import { randomId, roomCode } from "../src/shared/ids.ts";
import { MAX_PLAYERS, type Avatar, type PlayerColor, type PlayerInfo } from "../src/shared/protocol.ts";

export interface Conn {
  send(data: string): void;
  close(code?: number, reason?: string): void;
}

export interface PlayerSlot {
  playerId: string;
  playerToken: string;
  name: string;
  color: PlayerColor;
  avatar: Avatar;
  profileHint?: string;
  conn: Conn | null;
  lastSeen: number;
}

export interface Room {
  roomId: string;
  code: string;
  epoch: number;
  hostToken: string;
  host: Conn | null;
  hostGoneAt: number | null;
  players: Map<string, PlayerSlot>;
  createdAt: number;
  lastActivity: number;
}

export interface RoomLimits {
  /** How long a room survives without its host before it is closed. */
  hostGraceMs: number;
  /** How long a room lives with no activity at all. */
  idleMs: number;
}

export const DEFAULT_LIMITS: RoomLimits = { hostGraceMs: 10 * 60_000, idleMs: 3 * 60 * 60_000 };

export class RoomRegistry {
  private byId = new Map<string, Room>();
  private byCode = new Map<string, Room>();
  private readonly limits: RoomLimits;
  constructor(limits: RoomLimits = DEFAULT_LIMITS) {
    this.limits = limits;
  }

  create(host: Conn, now = Date.now()): Room {
    let code = roomCode();
    while (this.byCode.has(code)) code = roomCode();
    const room: Room = {
      roomId: randomId(9),
      code,
      epoch: 1,
      hostToken: randomId(24),
      host,
      hostGoneAt: null,
      players: new Map(),
      createdAt: now,
      lastActivity: now,
    };
    this.byId.set(room.roomId, room);
    this.byCode.set(code, room);
    return room;
  }

  get(roomId: string): Room | undefined {
    return this.byId.get(roomId);
  }

  byRoomCode(code: string): Room | undefined {
    return this.byCode.get(code.toUpperCase());
  }

  /** Restore a host after a reconnect. Returns null when the token is wrong or the room is gone. */
  resumeHost(roomId: string, hostToken: string, host: Conn, now = Date.now()): Room | null {
    const room = this.byId.get(roomId);
    if (!room || !safeEqual(room.hostToken, hostToken)) return null;
    if (room.host && room.host !== host) room.host.close(4001, "replaced by resumed host");
    room.host = host;
    room.hostGoneAt = null;
    room.epoch += 1;
    room.lastActivity = now;
    return room;
  }

  hostDisconnected(room: Room, conn: Conn, now = Date.now()): void {
    if (room.host !== conn) return;
    room.host = null;
    room.hostGoneAt = now;
  }

  join(
    room: Room,
    p: { name: string; color: PlayerColor; avatar: Avatar; profileHint?: string },
    conn: Conn,
    resume?: { playerId: string; playerToken: string },
    now = Date.now(),
  ): { slot: PlayerSlot; rejoin: boolean } | { error: "full" | "bad-token" } {
    if (resume) {
      const slot = room.players.get(resume.playerId);
      if (!slot || !safeEqual(slot.playerToken, resume.playerToken)) return { error: "bad-token" };
      if (slot.conn && slot.conn !== conn) slot.conn.close(4002, "replaced by rejoin");
      slot.conn = conn;
      slot.lastSeen = now;
      Object.assign(slot, { name: p.name, color: p.color, avatar: p.avatar });
      room.lastActivity = now;
      return { slot, rejoin: true };
    }
    // A phone that lost its token but reuses the same profile takes over its disconnected slot.
    if (p.profileHint) {
      for (const slot of room.players.values()) {
        if (slot.profileHint === p.profileHint && !slot.conn) {
          slot.conn = conn;
          slot.lastSeen = now;
          slot.playerToken = randomId(24);
          Object.assign(slot, { name: p.name, color: p.color, avatar: p.avatar });
          return { slot, rejoin: true };
        }
      }
    }
    const active = [...room.players.values()].filter((s) => s.conn).length;
    if (room.players.size >= MAX_PLAYERS && active >= MAX_PLAYERS) return { error: "full" };
    if (room.players.size >= MAX_PLAYERS) {
      // Recycle the stalest disconnected slot.
      const stale = [...room.players.values()].filter((s) => !s.conn).sort((a, b) => a.lastSeen - b.lastSeen)[0];
      if (stale) room.players.delete(stale.playerId);
    }
    const slot: PlayerSlot = {
      playerId: randomId(9),
      playerToken: randomId(24),
      name: p.name,
      color: p.color,
      avatar: p.avatar,
      profileHint: p.profileHint,
      conn,
      lastSeen: now,
    };
    room.players.set(slot.playerId, slot);
    room.lastActivity = now;
    return { slot, rejoin: false };
  }

  playerDisconnected(room: Room, conn: Conn, now = Date.now()): PlayerSlot | null {
    for (const slot of room.players.values()) {
      if (slot.conn === conn) {
        slot.conn = null;
        slot.lastSeen = now;
        return slot;
      }
    }
    return null;
  }

  close(room: Room): void {
    this.byId.delete(room.roomId);
    this.byCode.delete(room.code);
    for (const slot of room.players.values()) slot.conn?.close(4000, "room closed");
    room.host?.close(4000, "room closed");
  }

  /** Close rooms whose host has been gone too long, or that are idle. Returns closed rooms. */
  sweep(now = Date.now()): Room[] {
    const closed: Room[] = [];
    for (const room of this.byId.values()) {
      const hostExpired = room.hostGoneAt !== null && now - room.hostGoneAt > this.limits.hostGraceMs;
      const idle = now - room.lastActivity > this.limits.idleMs;
      if (hostExpired || idle) {
        closed.push(room);
      }
    }
    return closed;
  }

  get size(): number {
    return this.byId.size;
  }
}

export function playerInfo(slot: PlayerSlot): PlayerInfo {
  return {
    playerId: slot.playerId,
    name: slot.name,
    color: slot.color,
    avatar: slot.avatar,
    profileHint: slot.profileHint,
    connected: slot.conn !== null,
  };
}

/** Constant-time-ish string compare for tokens. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

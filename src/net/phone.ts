/**
 * Phone-side connection: joins a room, keeps a host-synchronised clock, sends inputs with
 * retry-until-acked (the TV de-duplicates by messageId, so retries can never double-score).
 */
import { ClockSync } from "../shared/clock.ts";
import { randomId } from "../shared/ids.ts";
import {
  PROTOCOL_VERSION,
  ServerToPhone,
  type Avatar,
  type ControllerView,
  type InputValue,
  type NavDir,
  type PlayerBody,
  type PlayerColor,
} from "../shared/protocol.ts";
import { ReconnectingSocket, type SocketStatus } from "./socket.ts";

const RESUME_KEY = "pp.phone.resume";

export interface JoinProfile {
  code: string;
  name: string;
  color: PlayerColor;
  avatar: Avatar;
  profileHint: string;
}

export type PhoneState =
  | { status: "connecting" }
  | { status: "failed"; reason: string }
  | { status: "joined"; playerId: string; code: string; hostAway: boolean };

export class PhoneConnection {
  private sock: ReconnectingSocket;
  readonly clock = new ClockSync();
  private roomId = "";
  private epoch = 0;
  private playerId = "";
  private playerToken = "";
  private seq = 0;
  private pending = new Map<string, PlayerBody>(); // unacked inputs
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private pingCount = 0;
  private lastSnapshot = -1;
  private readonly profile: JoinProfile;
  onView: (v: ControllerView) => void = () => {};
  onFx: (fx: "buzz" | "success" | "fail" | "boost") => void = () => {};
  onState: (s: PhoneState) => void = () => {};
  onSocket: (s: SocketStatus) => void = () => {};

  constructor(profile: JoinProfile, url?: string) {
    this.profile = profile;
    this.sock = new ReconnectingSocket(url);
    this.sock.onStatus = (s) => this.onSocket(s);
    this.sock.onOpen = () => this.join();
    this.sock.onMessage = (raw) => this.handle(raw);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") this.sock.kick();
    });
  }

  private join() {
    const resume = loadResume();
    const sameRoom = resume && resume.code === this.profile.code.toUpperCase();
    this.sock.send({
      t: "p.join",
      protocolVersion: PROTOCOL_VERSION,
      code: this.profile.code.toUpperCase(),
      name: this.profile.name,
      color: this.profile.color,
      avatar: this.profile.avatar,
      profileHint: this.profile.profileHint,
      resume: sameRoom ? { playerId: resume.playerId, playerToken: resume.playerToken } : undefined,
    });
  }

  private handle(raw: unknown) {
    const parsed = ServerToPhone.safeParse(raw);
    if (!parsed.success) return;
    const m = parsed.data;
    switch (m.t) {
      case "s.joined":
        this.roomId = m.roomId;
        this.epoch = m.roomEpoch;
        this.playerId = m.playerId;
        this.playerToken = m.playerToken;
        saveResume({ code: m.code, playerId: m.playerId, playerToken: m.playerToken });
        this.onState({ status: "joined", playerId: m.playerId, code: m.code, hostAway: false });
        this.startPings(true);
        this.flushPending();
        return;
      case "s.joinFailed":
        if (m.reason === "bad-token") {
          clearResume();
          this.join();
          return;
        }
        this.onState({ status: "failed", reason: m.reason });
        return;
      case "s.epoch":
        // New host incarnation: host clock origin changed.
        this.epoch = m.roomEpoch;
        this.clock.reset();
        this.lastSnapshot = -1;
        this.startPings(true);
        this.flushPending();
        this.onState({ status: "joined", playerId: this.playerId, code: this.profile.code, hostAway: false });
        return;
      case "s.hostAway":
        this.onState({ status: "joined", playerId: this.playerId, code: this.profile.code, hostAway: true });
        return;
      case "s.roomClosed":
        clearResume();
        this.onState({ status: "failed", reason: "closed" });
        return;
      case "s.fromHost": {
        const body = m.msg.body;
        if (m.msg.roomEpoch !== this.epoch) return;
        if (body.k === "pong") {
          this.clock.addSample(body.t0, body.hostTime, performance.now());
        } else if (body.k === "view") {
          if (body.snapshotSeq < this.lastSnapshot) return; // out-of-order older view
          this.lastSnapshot = body.snapshotSeq;
          this.onView(body.view);
        } else if (body.k === "ack") {
          for (const id of body.messageIds) this.pending.delete(id);
        } else if (body.k === "fx") this.onFx(body.fx);
        return;
      }
    }
  }

  private startPings(burst: boolean) {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingCount = 0;
    const tick = () => {
      this.sendBody({ k: "ping", id: randomId(6), t0: performance.now() });
      this.pingCount++;
      if (this.pingCount === 10 && this.pingTimer) {
        clearInterval(this.pingTimer);
        this.pingTimer = setInterval(tick, 4000); // steady state
      }
    };
    tick();
    this.pingTimer = setInterval(tick, burst ? 250 : 4000);
  }

  private sendBody(body: PlayerBody, messageId = randomId(9)): string {
    if (!this.roomId) return messageId;
    this.sock.send({
      t: "p.msg",
      playerToken: this.playerToken,
      msg: {
        protocolVersion: PROTOCOL_VERSION,
        roomId: this.roomId,
        roomEpoch: this.epoch,
        playerId: this.playerId,
        messageId,
        sequence: this.seq++,
        clientTime: performance.now(),
        body,
      },
    });
    return messageId;
  }

  private flushPending() {
    for (const [id, body] of this.pending) {
      // Retries keep their messageId so the host de-duplicates them.
      this.sendBody(body.k === "input" ? { ...body } : body, id);
    }
  }

  /** Current time on the host clock (null until the first sync sample). */
  hostNow(): number | null {
    return this.clock.toHost(performance.now());
  }

  input(roundId: string, promptId: string, value: InputValue) {
    const clientHostTime = this.hostNow() ?? 0;
    const body: PlayerBody = { k: "input", roundId, promptId, value, clientHostTime };
    const id = randomId(9);
    this.pending.set(id, body);
    this.sendBody(body, id);
    setTimeout(() => {
      if (this.pending.has(id)) this.sendBody(body, id);
    }, 1500);
  }

  nav(dir: NavDir) {
    this.sendBody({ k: "nav", dir });
  }

  ready(ready: boolean) {
    this.sendBody({ k: "ready", ready });
  }

  leave() {
    clearResume();
    this.sock.close();
  }
}

function loadResume(): { code: string; playerId: string; playerToken: string } | null {
  try {
    return JSON.parse(localStorage.getItem(RESUME_KEY) ?? "null");
  } catch {
    return null;
  }
}
function saveResume(v: { code: string; playerId: string; playerToken: string }) {
  try {
    localStorage.setItem(RESUME_KEY, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}
function clearResume() {
  try {
    localStorage.removeItem(RESUME_KEY);
  } catch {
    /* ignore */
  }
}

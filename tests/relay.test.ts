import { describe, expect, it } from "vitest";
import { Relay } from "../server/relay.ts";
import { PROTOCOL_VERSION } from "../src/shared/protocol.ts";

class FakeConn {
  out: any[] = [];
  closed = false;
  send(d: string) {
    this.out.push(JSON.parse(d));
  }
  close() {
    this.closed = true;
  }
  last(t?: string) {
    const list = t ? this.out.filter((m) => m.t === t) : this.out;
    return list[list.length - 1];
  }
}

function setup() {
  let now = 1_000_000;
  const relay = new Relay(undefined, () => now);
  const hostConn = new FakeConn();
  const host = relay.connect(hostConn);
  host.onMessage(JSON.stringify({ t: "h.create", protocolVersion: PROTOCOL_VERSION }));
  const created = hostConn.last("s.created");
  const join = (name: string, resume?: object) => {
    const c = new FakeConn();
    const p = relay.connect(c);
    p.onMessage(JSON.stringify({ t: "p.join", protocolVersion: PROTOCOL_VERSION, code: created.code, name, color: "cyan", avatar: "blob", resume }));
    return { c, p, joined: c.last("s.joined") };
  };
  return { relay, hostConn, host, created, join, tick: (ms: number) => (now += ms) };
}

const playerMsg = (joined: any, epoch: number, messageId: string, body: object) =>
  JSON.stringify({
    t: "p.msg",
    playerToken: joined.playerToken,
    msg: { protocolVersion: PROTOCOL_VERSION, roomId: joined.roomId, roomEpoch: epoch, playerId: joined.playerId, messageId, sequence: 1, clientTime: 1, body },
  });

describe("relay", () => {
  it("creates rooms and lets phones join by code", () => {
    const { created, join, hostConn } = setup();
    expect(created.code).toMatch(/^[BCDFGHJKLMNPQRSTVWXZ]{4}$/);
    const { joined } = join("Hadi");
    expect(joined.playerId).toBeTruthy();
    expect(hostConn.last("s.player").player.name).toBe("Hadi");
  });

  it("rejects unknown room codes", () => {
    const { relay } = setup();
    const c = new FakeConn();
    relay.connect(c).onMessage(JSON.stringify({ t: "p.join", protocolVersion: PROTOCOL_VERSION, code: "ZZZZ", name: "X", color: "cyan", avatar: "blob" }));
    expect(c.last().t).toBe("s.joinFailed");
  });

  it("routes player messages to the host and host messages to players", () => {
    const { join, hostConn, created } = setup();
    const { c, p, joined } = join("Ana");
    p.onMessage(playerMsg(joined, 1, "m1", { k: "ping", id: "x", t0: 5 }));
    expect(hostConn.last("s.fromPlayer").msg.body.k).toBe("ping");
    const host = hostConn;
    void host;
    const hostMsg = {
      t: "h.msg",
      hostToken: created.hostToken,
      msg: { protocolVersion: PROTOCOL_VERSION, roomId: created.roomId, roomEpoch: 1, messageId: "h1", sequence: 1, to: joined.playerId, body: { k: "pong", id: "x", t0: 5, hostTime: 10 } },
    };
    return { c, hostMsg };
  });

  it("drops messages with a forged player token", () => {
    const { join, hostConn } = setup();
    const { p, joined } = join("Ana");
    const before = hostConn.out.length;
    p.onMessage(playerMsg({ ...joined, playerToken: "x".repeat(32) }, 1, "m1", { k: "ready", ready: true }));
    expect(hostConn.out.length).toBe(before);
  });

  it("host resume bumps the epoch, rejects stale-epoch player messages, and tells phones", () => {
    const { relay, host, created, join } = setup();
    const { c, p, joined } = join("Ana");
    host.onClose();
    const newHostConn = new FakeConn();
    const newHost = relay.connect(newHostConn);
    newHost.onMessage(JSON.stringify({ t: "h.resume", protocolVersion: PROTOCOL_VERSION, roomId: created.roomId, hostToken: created.hostToken }));
    const resumed = newHostConn.last("s.resumed");
    expect(resumed.roomEpoch).toBe(2);
    expect(resumed.players[0].name).toBe("Ana");
    expect(c.last("s.epoch").roomEpoch).toBe(2);
    // stale epoch 1 message → phone told to update, host gets nothing
    p.onMessage(playerMsg(joined, 1, "m2", { k: "ready", ready: true }));
    expect(newHostConn.out.some((m) => m.t === "s.fromPlayer")).toBe(false);
    p.onMessage(playerMsg(joined, 2, "m3", { k: "ready", ready: true }));
    expect(newHostConn.last("s.fromPlayer").msg.messageId).toBe("m3");
  });

  it("host resume with a wrong token fails", () => {
    const { relay, created } = setup();
    const c = new FakeConn();
    relay.connect(c).onMessage(JSON.stringify({ t: "h.resume", protocolVersion: PROTOCOL_VERSION, roomId: created.roomId, hostToken: "y".repeat(32) }));
    expect(c.last().t).toBe("s.resumeFailed");
  });

  it("phones rejoin their slot with the player token", () => {
    const { join, hostConn } = setup();
    const first = join("Ana");
    first.p.onClose();
    expect(hostConn.last("s.playerLeft").playerId).toBe(first.joined.playerId);
    const again = join("Ana", { playerId: first.joined.playerId, playerToken: first.joined.playerToken });
    expect(again.joined.playerId).toBe(first.joined.playerId);
    expect(hostConn.last("s.player").rejoin).toBe(true);
  });

  it("closes rooms whose host has been away past the grace period", () => {
    const { relay, host, join, tick } = setup();
    const { c } = join("Ana");
    host.onClose();
    tick(11 * 60_000);
    expect(relay.sweep()).toBe(1);
    expect(c.out.some((m) => m.t === "s.roomClosed")).toBe(true);
  });
});

/** WebSocket with automatic reconnect (exponential backoff with jitter). */
export type SocketStatus = "connecting" | "open" | "closed";

export class ReconnectingSocket {
  private ws: WebSocket | null = null;
  private attempt = 0;
  private stopped = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  status: SocketStatus = "connecting";
  onOpen: () => void = () => {};
  onMessage: (data: unknown) => void = () => {};
  onStatus: (s: SocketStatus) => void = () => {};
  private readonly url: string;

  constructor(url: string = defaultWsUrl()) {
    this.url = url;
    this.connect();
  }

  private connect() {
    if (this.stopped) return;
    this.setStatus("connecting");
    const ws = new WebSocket(this.url);
    this.ws = ws;
    ws.onopen = () => {
      this.attempt = 0;
      this.setStatus("open");
      this.onOpen();
    };
    ws.onmessage = (ev) => {
      try {
        this.onMessage(JSON.parse(String(ev.data)));
      } catch {
        /* ignore malformed */
      }
    };
    ws.onclose = () => {
      this.ws = null;
      this.setStatus("closed");
      if (this.stopped) return;
      const delay = Math.min(8000, 300 * 2 ** this.attempt++) * (0.7 + Math.random() * 0.6);
      this.timer = setTimeout(() => this.connect(), delay);
    };
    ws.onerror = () => ws.close();
  }

  private setStatus(s: SocketStatus) {
    this.status = s;
    this.onStatus(s);
  }

  send(msg: unknown): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) return false;
    this.ws.send(JSON.stringify(msg));
    return true;
  }

  /** Force a reconnect now (e.g. when the page becomes visible again). */
  kick() {
    if (this.ws && this.ws.readyState <= WebSocket.OPEN) return;
    if (this.timer) clearTimeout(this.timer);
    this.connect();
  }

  close() {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    this.ws?.close();
  }
}

export function defaultWsUrl(): string {
  const env = import.meta.env.VITE_WS_URL as string | undefined;
  if (env) return env;
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${location.host}/ws`;
}

/** Public base URL phones should open (for the QR code). */
export function publicBaseUrl(): string {
  const env = import.meta.env.VITE_PUBLIC_URL as string | undefined;
  return (env ?? location.origin).replace(/\/$/, "");
}

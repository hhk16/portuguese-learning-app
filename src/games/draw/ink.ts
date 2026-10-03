/** Desenha! ink (shared by the TV and the phone sketch pad — no game logic here). */
export const INK = ["#1f2a44", "#ff6b6b", "#4ba3f5", "#3ecf95", "#ffc23d", "#ffffff"];

export interface Stroke {
  c: number;
  w: number;
  /** Pieces by index (network order isn't guaranteed); flattened x,y pairs on 0..1000. */
  segs: number[][];
}

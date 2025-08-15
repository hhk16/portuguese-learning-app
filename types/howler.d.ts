declare module 'howler' {
  export class Howl {
    constructor(opts: any)
    play(id?: number | string): number
    stop(id?: number): void
  }
} 
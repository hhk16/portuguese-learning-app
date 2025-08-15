import { create } from "zustand";

interface GameState {
  overlayLessonId: string | null;
  setOverlayLesson: (lessonId: string | null) => void;
  playerPos: { x: number; z: number };
  setPlayerPos: (x: number, z: number) => void;
  inputForward: number; // -1..1
  inputTurn: number; // -1..1
  setInput: (forward: number, turn: number) => void;
  isTouch: boolean;
  setIsTouch: (v: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  overlayLessonId: null,
  setOverlayLesson: (lessonId) => set({ overlayLessonId: lessonId }),
  playerPos: { x: 0, z: 0 },
  setPlayerPos: (x, z) => set({ playerPos: { x, z } }),
  inputForward: 0,
  inputTurn: 0,
  setInput: (forward, turn) => set({ inputForward: forward, inputTurn: turn }),
  isTouch: false,
  setIsTouch: (v) => set({ isTouch: v }),
})); 
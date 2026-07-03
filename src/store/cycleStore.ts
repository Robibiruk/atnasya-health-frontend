// Zustand store — cycle data, current phase, prediction.
import { create } from "zustand";
import type { CycleEntry, CyclePhase, CyclePrediction } from "../types";

interface CycleState {
  cycles: CycleEntry[];
  currentPhase: CyclePhase;
  dayOfCycle: number | null;
  prediction: CyclePrediction | null;
  regularity: number | null;
  setCycles: (cycles: CycleEntry[]) => void;
  setInitialCycle: (cycle: CycleEntry) => void;
  setPrediction: (payload: {
    prediction: CyclePrediction | null;
    phase: CyclePhase;
    dayOfCycle: number | null;
    regularity: number | null;
  }) => void;
  addCycle: (cycle: CycleEntry) => void;
}

export const useCycleStore = create<CycleState>((set) => ({
  cycles: [],
  currentPhase: "unknown",
  dayOfCycle: null,
  prediction: null,
  regularity: null,
  setCycles: (cycles) => set({ cycles }),
  setInitialCycle: (cycle) => set({ cycles: [cycle] }),
  setPrediction: (payload) =>
    set({
      prediction: payload.prediction,
      currentPhase: payload.phase,
      dayOfCycle: payload.dayOfCycle,
      regularity: payload.regularity,
    }),
  addCycle: (cycle) => set((s) => ({ cycles: [cycle, ...s.cycles] })),
}));

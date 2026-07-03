// Selfcare store — self-care data, summary.
import { create } from "zustand";
import type { SelfcareEntry } from "../types";

interface SelfcareState {
  selfcareEntries: SelfcareEntry[];
  setSelfcareEntries: (entries: SelfcareEntry[]) => void;
  setInitialSelfcare: (entry: SelfcareEntry) => void;
  addSelfcareEntry: (entry: SelfcareEntry) => void;
}

export const useSelfcareStore = create<SelfcareState>((set) => ({
  selfcareEntries: [],
  setSelfcareEntries: (entries) => set({ selfcareEntries: entries }),
  setInitialSelfcare: (entry) => set({ selfcareEntries: [entry] }),
  addSelfcareEntry: (entry) => set((state) => ({ selfcareEntries: [entry, ...state.selfcareEntries] })),
}));

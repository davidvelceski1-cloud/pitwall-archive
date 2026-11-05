"use client";

import { useSyncExternalStore } from "react";

/** What the assistant knows about the page being viewed, plus panel open state. */
export type PageContext = {
  kind: "driver" | "team" | "season" | "circuit" | "race" | "era" | "home" | "other";
  id?: string;
  label?: string;
  suggestions: string[];
};

type State = { open: boolean; context: PageContext; pending?: string };

let state: State = {
  open: false,
  context: { kind: "home", suggestions: [] },
};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const askStore = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  setContext(context: PageContext) {
    state = { ...state, context };
    emit();
  },
  open(question?: string) {
    state = { ...state, open: true, pending: question };
    emit();
  },
  close() {
    state = { ...state, open: false };
    emit();
  },
  consumePending() {
    const q = state.pending;
    if (q) state = { ...state, pending: undefined };
    return q;
  },
};

export const useAsk = () => useSyncExternalStore(askStore.subscribe, askStore.get, askStore.get);

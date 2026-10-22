"use client";
// A tiny browser store that React can read with useSyncExternalStore.
// Nothing here ever leaves the visitor's browser.
import { useSyncExternalStore } from "react";

export type Store<T> = {
  get: () => T;
  set: (value: T, persist?: boolean) => void;
  clear: () => void;
  subscribe: (cb: () => void) => () => void;
  serverSnapshot: () => T;
};

export function createStore<T>(key: string, kind: "session" | "local", initial: T): Store<T> {
  let cache = initial;
  let loaded = false;
  const subs = new Set<() => void>();
  const storage = () => {
    try {
      return kind === "session" ? window.sessionStorage : window.localStorage;
    } catch {
      return null; // storage blocked: the page still works, it just forgets on reload
    }
  };
  const emit = () => subs.forEach((f) => f());

  return {
    get() {
      if (!loaded && typeof window !== "undefined") {
        loaded = true;
        try {
          const raw = storage()?.getItem(key);
          if (raw) cache = JSON.parse(raw) as T;
        } catch {
          /* ignore bad or blocked storage */
        }
      }
      return cache;
    },
    set(value, persist = true) {
      cache = value;
      loaded = true;
      try {
        if (persist) storage()?.setItem(key, JSON.stringify(value));
        else storage()?.removeItem(key);
      } catch {
        /* ignore */
      }
      emit();
    },
    clear() {
      cache = initial;
      try {
        storage()?.removeItem(key);
      } catch {
        /* ignore */
      }
      emit();
    },
    subscribe(cb) {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    serverSnapshot: () => initial,
  };
}

export function useStore<T>(s: Store<T>): T {
  return useSyncExternalStore(s.subscribe, s.get, s.serverSnapshot);
}

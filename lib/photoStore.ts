"use client";
// Live photos people take on this device. Kept in the browser only (there is no shared database
// yet), on this device only if the visitor agreed to storage; otherwise until the page is refreshed.
import { getSnapshot as getPrefs } from "./prefs";
import { createStore } from "./store";
import type { Evidence } from "./types";

export const MAX_PHOTOS_PER_DEVICE = 12;
export const photoStore = createStore<Record<string, Evidence[]>>("stepfree-photos", "local", {});

// Adds a photo for a place. Returns an error message, or null when it worked.
export function addPhoto(placeId: string, e: Evidence): string | null {
  const all = photoStore.get();
  const total = Object.values(all).reduce((n, list) => n + list.length, 0);
  if (total >= MAX_PHOTOS_PER_DEVICE) return `This device already holds ${MAX_PHOTOS_PER_DEVICE} photos. Remove one first.`;
  const next = { ...all, [placeId]: [e, ...(all[placeId] ?? [])] };
  try {
    photoStore.set(next, getPrefs().consent === "agree");
  } catch {
    return "Couldn't save the photo on this device. It may be full.";
  }
  return null;
}

export function removePhoto(placeId: string, id: string) {
  const all = photoStore.get();
  photoStore.set({ ...all, [placeId]: (all[placeId] ?? []).filter((p) => p.id !== id) }, getPrefs().consent === "agree");
}

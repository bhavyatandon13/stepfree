"use client";
// What the visitor is planning, kept in their own browser only.
// - The parent's profile and the trip dates last until the tab is closed (sessionStorage).
// - Booking requests are kept on this device only if the visitor agreed to storage; otherwise
//   they last until the page is refreshed. Nothing is sent to any server.
import { getSnapshot as getPrefs } from "./prefs";
import { createStore } from "./store";
import type { Booking, Stay } from "./trip";
import type { Profile } from "./types";

export const profileStore = createStore<Profile | null>("stepfree-profile", "session", null);
export const stayStore = createStore<Stay | null>("stepfree-stay", "session", null);
export const tripsStore = createStore<Booking[]>("stepfree-trips", "local", []);

export const tripsArePersisted = () => getPrefs().consent === "agree";

export function saveTrip(b: Booking) {
  tripsStore.set([b, ...tripsStore.get().filter((t) => t.ref !== b.ref)], tripsArePersisted());
}

export function cancelTrip(ref: string) {
  tripsStore.set(
    tripsStore.get().map((t) => (t.ref === ref ? { ...t, status: "cancelled" as const } : t)),
    tripsArePersisted(),
  );
}

// Called when the visitor agrees to storage after booking, so their trips are kept.
export function persistTripsNow() {
  tripsStore.set(tripsStore.get(), true);
}

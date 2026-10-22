// One list of places and rides for search and browsing, built from the same data the checker uses.
import { requirementsFor } from "./requirements";
import type { Hotel, Taxi } from "./types";

export const STANDARD_CHAIR_CM = 66; // a typical adult wheelchair; used only for the "bathroom" label
export const BATHROOM_MIN_CM = requirementsFor(STANDARD_CHAIR_CM).bathroomDoorCm;

export const FEATURES = ["Step-free entrance", "Ramp at entrance", "Lift", "Wide bathroom door", "Lends a wheelchair", "Ramp or lift vehicle"] as const;

// How a ramp reads in words. null means nobody has recorded it, which is not the same as "no".
export function rampText(ramp: boolean | null): string {
  return ramp === true ? "Ramp available" : ramp === false ? "No ramp" : "Ramp not recorded";
}
export type Feature = (typeof FEATURES)[number];

export type Listing = {
  id: string;
  name: string;
  city: string;
  area: string;
  category: "Hotel" | "Taxi";
  features: Feature[];
  auditDate: string | null;
  placeholder: boolean;
  ramp?: boolean | null; // hotels only
  hotel?: Hotel; // the full record, for hotels, so cards can show every detail
  taxi?: Taxi; // the full record, for taxis, so cards can answer "will the chair fit?"
};

export function hotelListing(h: Hotel): Listing {
  const features: Feature[] = [];
  if (h.entranceSteps === 0 || h.ramp === true) features.push("Step-free entrance");
  if (h.ramp === true) features.push("Ramp at entrance");
  if (h.liftDoorCm !== null) features.push("Lift");
  if (h.bathroomDoorCm !== null && h.bathroomDoorCm >= BATHROOM_MIN_CM) features.push("Wide bathroom door");
  if (h.wheelchairProvided === true) features.push("Lends a wheelchair");
  const [area, city] = h.area.split(",").map((s) => s.trim());
  return { id: h.id, name: h.name, city: city ?? "Delhi", area: area ?? h.area, category: "Hotel", features, auditDate: h.auditDate, placeholder: h.isPlaceholder, ramp: h.ramp, hotel: h };
}

export function taxiListing(t: Taxi): Listing {
  const features: Feature[] = t.vehicleType === "fold-chair-only" ? [] : ["Ramp or lift vehicle"];
  return { id: t.id, name: t.provider, city: t.city, area: t.city, category: "Taxi", features, auditDate: null, placeholder: true, taxi: t };
}

export function countBy(list: Listing[], key: "city" | "category") {
  const counts = new Map<string, number>();
  for (const l of list) counts.set(l[key], (counts.get(l[key]) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

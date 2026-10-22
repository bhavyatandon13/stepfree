// "Will the chair fit in this taxi?" as a plain answer. Pure code, no AI.
// Only the vehicle's size matters here; help with transferring is a separate question.
// Uses the same comfortable / tight / too-small sizes as the hotels.
import { band, requirementsFor } from "./requirements";
import type { Taxi } from "./types";

export type TaxiAnswer = { answer: "yes" | "tight" | "no" | "unsure" | "transfer"; headline: string; detail: string };

export function taxiAnswer(chairWidthCm: number, t: Taxi): TaxiAnswer {
  const r = requirementsFor(chairWidthCm);
  if (t.vehicleType === "fold-chair-only") {
    return {
      answer: "transfer",
      headline: "Only if your parent can move to a car seat",
      detail: "This taxi has no ramp or lift. The wheelchair folds into the boot, so your parent must move into a seat.",
    };
  }
  const door = t.doorWidthCm;
  const height = t.interiorHeightCm;
  const db = band(door, r.taxiDoor);
  const hb = band(height, r.taxiHeight);

  if (db === "fail") {
    return { answer: "no", headline: "No, the chair won't fit", detail: `The door is ${door} cm wide. A ${chairWidthCm} cm chair needs at least ${r.taxiDoor.minimum} cm to get in.` };
  }
  if (hb === "fail") {
    return { answer: "no", headline: "No, the chair won't fit", detail: `The inside is ${height} cm high. Sitting in a wheelchair needs at least ${r.taxiHeight.minimum} cm.` };
  }
  if (db === "unknown" || hb === "unknown") {
    return {
      answer: "unsure",
      headline: "Not sure, phone to check",
      detail: `We don't have this taxi's ${db === "unknown" ? "door width" : "inside height"} yet. Ask: is the door at least ${r.taxiDoor.minimum} cm wide (${r.taxiDoor.comfortable} cm is comfortable) and the inside at least ${r.taxiHeight.minimum} cm high?`,
    };
  }
  const sizes = `Door ${door} cm, inside ${height} cm high`;
  if (db === "tight" || hb === "tight") {
    const why = [db === "tight" ? `the door is only ${door! - chairWidthCm} cm wider than the chair` : "", hb === "tight" ? "the roof is a little low" : ""].filter(Boolean).join(" and ");
    return { answer: "tight", headline: "Yes, but it's a tight fit", detail: `${sizes}: ${why}. Someone may need to guide the chair in.` };
  }
  return {
    answer: "yes",
    headline: "Yes, the chair fits",
    detail: `${t.vehicleType === "ramp" ? "Ramp" : "Lift"} vehicle. ${sizes}, with room to spare.`,
  };
}

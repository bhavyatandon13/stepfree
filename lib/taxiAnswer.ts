// "Will the chair fit in this taxi?" as a plain yes or no. Pure code, no AI.
// Only the vehicle's size matters here; help with transferring is a separate question.
import { requirementsFor } from "./requirements";
import type { Taxi } from "./types";

export type TaxiAnswer = { answer: "yes" | "no" | "unsure" | "transfer"; headline: string; detail: string };

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
  if (door !== null && door < r.taxiDoorCm) {
    return { answer: "no", headline: "No, the chair won't fit", detail: `The door is ${door} cm wide. A ${chairWidthCm} cm chair needs at least ${r.taxiDoorCm} cm.` };
  }
  if (height !== null && height < r.taxiHeightCm) {
    return { answer: "no", headline: "No, the chair won't fit", detail: `The inside is ${height} cm high. Sitting in a wheelchair needs at least ${r.taxiHeightCm} cm.` };
  }
  if (door === null || height === null) {
    return {
      answer: "unsure",
      headline: "Not sure, phone to check",
      detail: `We don't have this taxi's ${door === null ? "door width" : "inside height"} yet. Ask: is the door at least ${r.taxiDoorCm} cm wide and the inside at least ${r.taxiHeightCm} cm high?`,
    };
  }
  return {
    answer: "yes",
    headline: "Yes, the chair fits",
    detail: `${t.vehicleType === "ramp" ? "Ramp" : "Lift"} vehicle. Door ${door} cm (needs ${r.taxiDoorCm}), inside ${height} cm high (needs ${r.taxiHeightCm}).`,
  };
}

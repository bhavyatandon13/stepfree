// A plain "what does this hotel have" list, in words. Pure code, no AI.
// Sizes are only called a fit once we know the parent's chair. Before that, they are shown as
// plain measurements ("info"), so the site never calls a hotel wheelchair-friendly untested.
import { band, requirementsFor, type Band } from "./requirements";
import type { Hotel } from "./types";

export const TYPICAL_CHAIR_CM = 66;

export type FactStatus = "yes" | "tight" | "no" | "unknown" | "info";
export type Fact = { key: string; label: string; status: FactStatus; text: string };

const STATUS: Record<Band, FactStatus> = { ok: "yes", tight: "tight", fail: "no", unknown: "unknown" };
const worst = (a: Band, b: Band): Band => {
  const order: Band[] = ["fail", "tight", "unknown", "ok"];
  return order[Math.min(order.indexOf(a), order.indexOf(b))];
};
const steps = (n: number) => `${n} step${n === 1 ? "" : "s"}`;

// The checklist, for a known chair: a step-free way in (no stairs, or a ramp) AND a washroom door
// the chair fits through. Unknown never earns the badge.
export function passesChecklist(h: Hotel, chairWidthCm: number): boolean {
  const f = Object.fromEntries(accessFacts(h, chairWidthCm).map((x) => [x.key, x.status]));
  return f.washroom === "yes" && f.stairs === "yes";
}

// Plain measurements with no verdict, for when we don't know the chair yet.
function measurementsOnly(h: Hotel): Fact[] {
  const cm = (n: number | null, what: string) => (n === null ? `${what} not measured yet` : `${what} ${n} cm`);
  return [
    { key: "washroom", label: "Washroom", status: h.bathroomDoorCm === null ? "unknown" : "info", text: h.bathroomDoorCm === null ? "Washroom door not measured yet" : `Washroom door ${h.bathroomDoorCm} cm wide` },
    { key: "lift", label: "Lift", status: h.liftDoorCm === null && h.liftDepthCm === null ? "unknown" : "info", text: h.liftDoorCm === null && h.liftDepthCm === null ? "Lift not recorded" : `Lift: ${cm(h.liftDoorCm, "door")}, ${cm(h.liftDepthCm, "depth")}` },
    { key: "roomDoor", label: "Room door", status: h.roomDoorCm === null ? "unknown" : "info", text: h.roomDoorCm === null ? "Room door not measured yet" : `Room door ${h.roomDoorCm} cm wide` },
    { key: "turning", label: "Turning space", status: h.turningSpaceCm === null ? "unknown" : "info", text: h.turningSpaceCm === null ? "Turning space not measured yet" : `Turning space ${h.turningSpaceCm} cm` },
  ];
}

export function accessFacts(h: Hotel, chairWidthCm: number | null): Fact[] {
  const facts: Fact[] = [];
  if (chairWidthCm === null) {
    const m = Object.fromEntries(measurementsOnly(h).map((f) => [f.key, f]));
    // Same order as with a chair: washroom, stairs, ramp, lift, room door, turning, wheelchair loan.
    facts.push(m.washroom);
    facts.push(...entranceFacts(h));
    facts.push(m.lift, m.roomDoor, m.turning, lendFact(h));
    return facts;
  }
  const r = requirementsFor(chairWidthCm);
  const forChair = `${chairWidthCm} cm chair`;

  // Washroom
  const wb = band(h.bathroomDoorCm, r.bathroomDoor);
  facts.push({
    key: "washroom",
    label: "Washroom",
    status: STATUS[wb],
    text:
      wb === "unknown" ? "Washroom door not measured yet"
      : wb === "ok" ? `Washroom door ${h.bathroomDoorCm} cm wide: fits a ${forChair}`
      : wb === "tight" ? `Washroom door ${h.bathroomDoorCm} cm: a tight fit for a ${forChair}`
      : `Washroom door ${h.bathroomDoorCm} cm: too narrow for a ${forChair}`,
  });

  facts.push(...entranceFacts(h));

  // Lift: the door and the depth both have to work
  if (h.liftDoorCm === null && h.liftDepthCm === null) {
    facts.push({ key: "lift", label: "Lift", status: "unknown", text: "Lift not recorded" });
  } else {
    const lb = worst(band(h.liftDoorCm, r.liftDoor), band(h.liftDepthCm, r.liftDepth));
    const sizes = [h.liftDoorCm !== null ? `door ${h.liftDoorCm} cm` : "door not measured", h.liftDepthCm !== null ? `depth ${h.liftDepthCm} cm` : "depth not measured"].join(", ");
    const tail = lb === "tight" ? " (a tight fit)" : lb === "fail" ? ` (too small for a ${forChair})` : "";
    facts.push({ key: "lift", label: "Lift", status: STATUS[lb], text: `Lift: ${sizes}${tail}` });
  }

  // Room door
  const rb = band(h.roomDoorCm, r.roomDoor);
  facts.push({
    key: "roomDoor",
    label: "Room door",
    status: STATUS[rb],
    text: rb === "unknown" ? "Room door not measured yet" : `Room door ${h.roomDoorCm} cm wide${rb === "tight" ? " (a tight fit)" : rb === "fail" ? " (too narrow)" : ""}`,
  });

  // Space to turn
  const tb = band(h.turningSpaceCm, r.turningSpace);
  facts.push({
    key: "turning",
    label: "Turning space",
    status: STATUS[tb],
    text:
      tb === "unknown" ? "Turning space not measured yet"
      : `Turning space ${h.turningSpaceCm} cm${tb === "tight" ? " (turning takes a few moves)" : tb === "fail" ? " (too small to turn a chair)" : ""}`,
  });

  facts.push(lendFact(h));
  return facts;
}

// Stairs and ramp don't depend on the chair, so they read the same before and after the check.
// A ramp beside the steps makes the way in step-free.
function entranceFacts(h: Hotel): Fact[] {
  const stairs: Fact =
    h.entranceSteps === null
      ? { key: "stairs", label: "Stairs", status: "unknown", text: "Entrance steps not recorded" }
      : h.entranceSteps === 0
        ? { key: "stairs", label: "Stairs", status: "yes", text: "No stairs at the entrance" }
        : h.ramp === true
          ? { key: "stairs", label: "Stairs", status: "yes", text: `${steps(h.entranceSteps)} at the entrance, with a ramp beside them` }
          : { key: "stairs", label: "Stairs", status: "no", text: `${steps(h.entranceSteps)} at the entrance` };
  const ramp: Fact =
    h.entranceSteps === 0
      ? { key: "ramp", label: "Ramp", status: "yes", text: "No ramp needed: there are no steps" }
      : h.ramp === true
        ? { key: "ramp", label: "Ramp", status: "yes", text: "Ramp available" }
        : h.ramp === false
          ? { key: "ramp", label: "Ramp", status: "no", text: "No ramp" }
          : { key: "ramp", label: "Ramp", status: "unknown", text: "Ramp not recorded" };
  return [stairs, ramp];
}

function lendFact(h: Hotel): Fact {
  return h.wheelchairProvided === true
    ? { key: "lend", label: "Wheelchair", status: "yes", text: "Hotel can lend a wheelchair" }
    : h.wheelchairProvided === false
      ? { key: "lend", label: "Wheelchair", status: "no", text: "Hotel has no wheelchair to lend" }
      : { key: "lend", label: "Wheelchair", status: "unknown", text: "Wheelchair loan not recorded" };
}

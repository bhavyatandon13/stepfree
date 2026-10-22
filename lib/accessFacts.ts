// A plain "what does this hotel have" list, in words. Pure code, no AI.
// Washroom, doors and turning space are judged against a typical 66 cm chair;
// the checker's table judges the same items against the parent's own chair.
import { BATHROOM_MIN_CM } from "./listings";
import { TURNING_SPACE_CM, requirementsFor } from "./requirements";
import type { Hotel } from "./types";

export type FactStatus = "yes" | "no" | "unknown";
export type Fact = { key: string; label: string; status: FactStatus; text: string };

const DOOR_MIN = BATHROOM_MIN_CM; // same rule as the washroom door
const LIFT_DEPTH_MIN = requirementsFor(66).liftDepthCm;

export function accessFacts(h: Hotel): Fact[] {
  const facts: Fact[] = [];

  // Washroom
  if (h.bathroomDoorCm === null) {
    facts.push({ key: "washroom", label: "Washroom", status: "unknown", text: "Washroom door not measured yet" });
  } else if (h.bathroomDoorCm >= DOOR_MIN) {
    facts.push({ key: "washroom", label: "Washroom", status: "yes", text: `Wheelchair-friendly washroom: door ${h.bathroomDoorCm} cm wide` });
  } else {
    facts.push({ key: "washroom", label: "Washroom", status: "no", text: `Washroom door too narrow for a wheelchair: ${h.bathroomDoorCm} cm (needs ${DOOR_MIN} cm or more)` });
  }

  // Stairs at the entrance
  if (h.entranceSteps === null) {
    facts.push({ key: "stairs", label: "Stairs", status: "unknown", text: "Entrance steps not recorded" });
  } else if (h.entranceSteps === 0) {
    facts.push({ key: "stairs", label: "Stairs", status: "yes", text: "No stairs at the entrance" });
  } else {
    facts.push({ key: "stairs", label: "Stairs", status: "no", text: `${h.entranceSteps} step${h.entranceSteps === 1 ? "" : "s"} at the entrance` });
  }

  // Ramp
  facts.push(
    h.ramp === true
      ? { key: "ramp", label: "Ramp", status: "yes", text: "Ramp available" }
      : h.ramp === false
        ? { key: "ramp", label: "Ramp", status: "no", text: "No ramp" }
        : { key: "ramp", label: "Ramp", status: "unknown", text: "Ramp not recorded" },
  );

  // Lift
  if (h.liftDoorCm === null) {
    facts.push({ key: "lift", label: "Lift", status: "unknown", text: "Lift not recorded" });
  } else {
    const roomy = h.liftDoorCm >= DOOR_MIN && (h.liftDepthCm === null || h.liftDepthCm >= LIFT_DEPTH_MIN);
    facts.push({
      key: "lift",
      label: "Lift",
      status: roomy ? "yes" : "no",
      text: `Lift: door ${h.liftDoorCm} cm${h.liftDepthCm !== null ? `, depth ${h.liftDepthCm} cm` : ""}${roomy ? "" : " (too small for a wheelchair)"}`,
    });
  }

  // Room door
  if (h.roomDoorCm !== null) {
    const ok = h.roomDoorCm >= DOOR_MIN;
    facts.push({ key: "roomDoor", label: "Room door", status: ok ? "yes" : "no", text: `Room door ${h.roomDoorCm} cm wide${ok ? "" : " (too narrow)"}` });
  } else {
    facts.push({ key: "roomDoor", label: "Room door", status: "unknown", text: "Room door not measured yet" });
  }

  // Space to turn
  if (h.turningSpaceCm !== null) {
    const ok = h.turningSpaceCm >= TURNING_SPACE_CM;
    facts.push({ key: "turning", label: "Turning space", status: ok ? "yes" : "no", text: `Turning space ${h.turningSpaceCm} cm${ok ? "" : " (too tight to turn a chair)"}` });
  } else {
    facts.push({ key: "turning", label: "Turning space", status: "unknown", text: "Turning space not measured yet" });
  }

  // Does the hotel lend a wheelchair?
  facts.push(
    h.wheelchairProvided === true
      ? { key: "lend", label: "Wheelchair", status: "yes", text: "Hotel can lend a wheelchair" }
      : h.wheelchairProvided === false
        ? { key: "lend", label: "Wheelchair", status: "no", text: "Hotel has no wheelchair to lend" }
        : { key: "lend", label: "Wheelchair", status: "unknown", text: "Wheelchair loan not recorded" },
  );

  return facts;
}

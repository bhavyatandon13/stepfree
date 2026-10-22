// Chair width -> what a place must offer. Plain code, no AI.
//
// Doors follow one simple rule: a door at least as wide as the chair fits; a narrower door doesn't.
// (For a 66 cm chair, any door 66 cm or wider fits.)
//
// Lengths and heights that don't depend on the chair's width have two numbers:
//  - comfortable: plenty of room.
//  - minimum: it works, but it's tight and a helper may need to guide the chair.
// Below the minimum, it won't work.
//
// These numbers are ASSUMPTIONS to confirm with an accessibility expert.
export const LIFT_DEPTH = { comfortable: 110, minimum: 100 }; // a chair is about 100-110 cm long
export const TURNING_SPACE = { comfortable: 150, minimum: 120 }; // 150 cm turns in one go; less takes a few moves
export const TAXI_HEIGHT = { comfortable: 140, minimum: 130 }; // sitting in a wheelchair inside the vehicle

export type Need = { comfortable: number; minimum: number };

export type Requirements = {
  roomDoor: Need;
  bathroomDoor: Need;
  liftDoor: Need;
  liftDepth: Need;
  turningSpace: Need;
  taxiDoor: Need;
  taxiHeight: Need;
};

export function requirementsFor(chairWidthCm: number): Requirements {
  const door = { comfortable: chairWidthCm, minimum: chairWidthCm }; // fits if the door is at least the chair's width
  return {
    roomDoor: door,
    bathroomDoor: door,
    liftDoor: door,
    liftDepth: LIFT_DEPTH,
    turningSpace: TURNING_SPACE,
    taxiDoor: door,
    taxiHeight: TAXI_HEIGHT,
  };
}

export type Band = "ok" | "tight" | "fail" | "unknown";

// Where a measurement falls: comfortable, tight, too small, or not measured.
export function band(measured: number | null, need: Need): Band {
  if (measured === null) return "unknown";
  if (measured >= need.comfortable) return "ok";
  if (measured >= need.minimum) return "tight";
  return "fail";
}

// Read as "the place needs at least this much": e.g. "66 cm or wider" for a door,
// "110 cm or more (100 cm at a squeeze)" for a lift.
export function needText(need: Need): string {
  return need.comfortable === need.minimum ? `${need.minimum} cm or wider` : `${need.comfortable} cm or more (${need.minimum} cm at a squeeze)`;
}

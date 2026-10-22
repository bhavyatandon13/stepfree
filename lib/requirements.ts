// Chair width -> what a place must offer. Plain code, no AI.
//
// Every size has two numbers:
//  - comfortable: the chair passes easily, with room for hands on the wheels.
//  - minimum: the chair can just get through, but it's tight and a helper may need to guide it.
// Below the minimum, the chair won't fit.
//
// These numbers are ASSUMPTIONS to confirm with an accessibility expert.
export const DOOR_COMFORT_SPARE_CM = 10; // door this much wider than the chair = comfortable
export const DOOR_MIN_SPARE_CM = 2; // door at least this much wider than the chair = can just pass
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
  const door = { comfortable: chairWidthCm + DOOR_COMFORT_SPARE_CM, minimum: chairWidthCm + DOOR_MIN_SPARE_CM };
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

// Read as "the place needs at least this much": e.g. "76 cm or more (68 cm at a squeeze)".
export function needText(need: Need): string {
  return `${need.comfortable} cm or more (${need.minimum} cm at a squeeze)`;
}

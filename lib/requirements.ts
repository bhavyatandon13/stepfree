// Chair width -> what a place must offer. Plain code, no AI.
// These constants are ASSUMPTIONS to confirm with an accessibility expert.
export const MARGIN_CM = 10; // clearance added to chair width for any door
export const LIFT_DEPTH_CM = 110; // lift cabin must fit a chair's length
export const TURNING_SPACE_CM = 150; // space to turn the chair around
export const TAXI_INTERIOR_HEIGHT_CM = 140; // seated person in a chair

export type Requirements = {
  roomDoorCm: number;
  bathroomDoorCm: number;
  liftDoorCm: number;
  liftDepthCm: number;
  turningSpaceCm: number;
  taxiDoorCm: number;
  taxiHeightCm: number;
};

export function requirementsFor(chairWidthCm: number): Requirements {
  const door = chairWidthCm + MARGIN_CM;
  return {
    roomDoorCm: door,
    bathroomDoorCm: door,
    liftDoorCm: door,
    liftDepthCm: LIFT_DEPTH_CM,
    turningSpaceCm: TURNING_SPACE_CM,
    taxiDoorCm: door,
    taxiHeightCm: TAXI_INTERIOR_HEIGHT_CM,
  };
}

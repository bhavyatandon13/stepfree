import type { AuditFields, Profile } from "./types";

export const RANGES = {
  chairWidthCm: [40, 90],
  steps: [0, 50],
  doorCm: [40, 150],
  liftDepthCm: [80, 300],
  turningSpaceCm: [90, 300],
} as const;

const outside = (n: number, [lo, hi]: readonly [number, number]) => n < lo || n > hi;

// Returns a list of plain-language problems. Empty list = fine.
export function validateProfile(p: Profile): string[] {
  const problems: string[] = [];
  if (p.chairWidthCm === null) {
    problems.push("We need the chair width in cm (for example 66). Please add it.");
  } else if (outside(p.chairWidthCm, RANGES.chairWidthCm)) {
    problems.push(
      `Chair width ${p.chairWidthCm} cm looks wrong. Most chairs are ${RANGES.chairWidthCm[0]}–${RANGES.chairWidthCm[1]} cm. Please fix it.`,
    );
  }
  if (p.maxSteps !== null && (!Number.isInteger(p.maxSteps) || outside(p.maxSteps, RANGES.steps))) {
    problems.push("Steps your parent can manage should be a whole number from 0 to 50.");
  }
  return problems;
}

export function validateAudit(a: AuditFields): string[] {
  const problems: string[] = [];
  const check = (name: string, v: number | null, range: readonly [number, number]) => {
    if (v !== null && outside(v, range)) {
      problems.push(`${name} of ${v} cm is outside ${range[0]}–${range[1]} cm. Please re-measure or correct it.`);
    }
  };
  if (a.entranceSteps !== null && (!Number.isInteger(a.entranceSteps) || outside(a.entranceSteps, RANGES.steps))) {
    problems.push("Entrance steps should be a whole number from 0 to 50.");
  }
  check("Room door", a.roomDoorCm, RANGES.doorCm);
  check("Bathroom door", a.bathroomDoorCm, RANGES.doorCm);
  check("Lift door", a.liftDoorCm, RANGES.doorCm);
  check("Lift depth", a.liftDepthCm, RANGES.liftDepthCm);
  check("Turning space", a.turningSpaceCm, RANGES.turningSpaceCm);
  return problems;
}

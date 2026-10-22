// The verdict is decided here, by plain comparison. Claude never decides it.
//
//  - Anything the chair can't get through, or stairs the parent can't manage  -> Doesn't fit
//  - Anything tight, unknown, or help needed to transfer                      -> Fits with help
//  - Everything comfortable                                                   -> Fits
import { band, needText, requirementsFor, type Need } from "./requirements";
import type { Check, CheckStatus, FitResult, Hotel, Profile, Taxi, Verdict } from "./types";

type Kind = "door" | "depth" | "turning" | "height";

// The problem in plain words, for a tight or failed measurement.
function noteFor(kind: Kind, label: string, m: number, need: Need, chairWidthCm: number, status: CheckStatus): string | undefined {
  const what = label.toLowerCase();
  if (status === "tight") {
    if (kind === "door") return `the ${what} is ${m} cm, only ${m - chairWidthCm} cm wider than the chair (${need.comfortable} cm is comfortable)`;
    if (kind === "depth") return `the lift is ${m} cm deep, a tight fit (${need.comfortable} cm is comfortable)`;
    if (kind === "turning") return `there is ${m} cm to turn, so turning takes a few moves (${need.comfortable} cm turns in one go)`;
    return `the inside is ${m} cm high, a little low (${need.comfortable} cm is comfortable)`;
  }
  if (status === "fail") {
    if (kind === "door") return `the ${what} is ${m} cm, but the chair needs at least ${need.minimum} cm to get through`;
    if (kind === "depth") return `the lift is only ${m} cm deep, but a wheelchair needs at least ${need.minimum} cm`;
    if (kind === "turning") return `there is only ${m} cm to turn, but a wheelchair needs at least ${need.minimum} cm`;
    return `the inside is only ${m} cm high, but sitting in a wheelchair needs at least ${need.minimum} cm`;
  }
  return undefined;
}

function sized(key: string, label: string, kind: Kind, measured: number | null, need: Need, chairWidthCm: number): Check {
  const status = band(measured, need);
  return {
    key,
    label,
    measured: measured === null ? "not measured" : `${measured} cm`,
    required: needText(need),
    status,
    note: measured === null ? undefined : noteFor(kind, label, measured, need, chairWidthCm, status),
  };
}

const stepsWord = (n: number) => `${n} step${n === 1 ? "" : "s"}`;

function stepsCheck(profile: Profile, steps: number | null, ramp: boolean | null): Check {
  const max = profile.maxSteps;
  const required = max === null ? "unknown (steps allowed not given)" : max === 0 ? "no steps, or a ramp" : `up to ${stepsWord(max)}, or a ramp`;
  const measured = steps === null ? "not measured" : `${stepsWord(steps)}${ramp === true ? ", with a ramp" : ramp === false ? ", no ramp" : ""}`;
  let status: CheckStatus;
  let gap: string | undefined;
  let note: string | undefined;
  if (steps === null) {
    status = "unknown";
    gap = "the number of entrance steps";
  } else if (steps === 0 || ramp === true) status = "ok";
  else if (max === null) {
    status = "unknown";
    gap = "how many steps your parent can manage";
  } else if (steps <= max) status = "ok";
  else if (ramp === null) {
    status = "unknown";
    gap = "whether the entrance has a ramp";
  } else {
    status = "fail";
    const can = max === 0 ? "can't manage any steps" : `can manage only ${stepsWord(max)}`;
    note = `there ${steps === 1 ? "is 1 step" : `are ${steps} steps`} at the entrance and no ramp, and your parent ${can}`;
  }
  return { key: "steps", label: "Entrance steps", measured, required, status, gap, note };
}

function decide(profile: Profile, checks: Check[], extraHelp = false): Verdict {
  if (checks.some((c) => c.status === "fail")) return "no";
  // Tight or unknown never becomes "fits", and neither does help needed to transfer.
  if (checks.some((c) => c.status === "tight" || c.status === "unknown")) return "help";
  if (extraHelp || profile.transferHelp !== "none") return "help";
  return "fits";
}

export function hotelFit(profile: Profile, hotel: Hotel): FitResult {
  const w = profile.chairWidthCm;
  if (w === null) return { verdict: "help", checks: [] };
  const r = requirementsFor(w);
  const checks = [
    stepsCheck(profile, hotel.entranceSteps, hotel.ramp),
    sized("roomDoor", "Room door", "door", hotel.roomDoorCm, r.roomDoor, w),
    sized("bathroomDoor", "Bathroom door", "door", hotel.bathroomDoorCm, r.bathroomDoor, w),
    sized("liftDoor", "Lift door", "door", hotel.liftDoorCm, r.liftDoor, w),
    sized("liftDepth", "Lift cabin depth", "depth", hotel.liftDepthCm, r.liftDepth, w),
    sized("turning", "Turning space", "turning", hotel.turningSpaceCm, r.turningSpace, w),
  ];
  return { verdict: decide(profile, checks), checks };
}

export function taxiFit(profile: Profile, taxi: Taxi): FitResult {
  const w = profile.chairWidthCm;
  if (w === null) return { verdict: "help", checks: [] };
  const r = requirementsFor(w);
  const checks = [
    sized("taxiDoor", "Taxi door", "door", taxi.doorWidthCm, r.taxiDoor, w),
    sized("taxiHeight", "Interior height", "height", taxi.interiorHeightCm, r.taxiHeight, w),
  ];
  // A fold-chair-only car means the parent must transfer into a seat.
  return { verdict: decide(profile, checks, taxi.vehicleType === "fold-chair-only"), checks };
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  fits: "Fits",
  help: "Fits with help",
  no: "Doesn't fit",
};

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const list = (parts: string[]) => parts.join("; ");
const andList = (parts: string[]) => (parts.length < 2 ? parts.join("") : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`);

// Plain-code reason, shown instantly. Claude can replace it with friendlier wording.
export function basicReason(result: FitResult): string {
  const fails = result.checks.filter((c) => c.status === "fail").map((c) => c.note ?? `${c.label.toLowerCase()} is too small`);
  const tights = result.checks.filter((c) => c.status === "tight").map((c) => c.note ?? `${c.label.toLowerCase()} is tight`);
  const unknown = result.checks.filter((c) => c.status === "unknown").map((c) => c.gap ?? `the ${c.label.toLowerCase()}`);

  if (result.verdict === "no") {
    return `Doesn't fit: ${list(fails)}.` + (tights.length ? ` Also tight: ${list(tights)}.` : "");
  }
  if (result.verdict === "help") {
    const parts: string[] = [];
    if (tights.length) parts.push(`${capitalise(list(tights))}. Someone may need to guide the chair.`);
    if (unknown.length) parts.push(`We don't know ${andList(unknown)} yet.`);
    if (!parts.length) parts.push("Every measurement is comfortable, but your parent needs help to transfer.");
    return `Fits with help: ${parts.join(" ")}`;
  }
  return "Fits: every measured item is comfortable for this chair.";
}

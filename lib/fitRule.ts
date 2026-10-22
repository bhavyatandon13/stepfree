// The verdict is decided here, by plain comparison. Claude never decides it.
import { requirementsFor } from "./requirements";
import type { Check, CheckStatus, FitResult, Hotel, Profile, Taxi, Verdict } from "./types";

const cm = (n: number) => `${n} cm`;

function atLeast(key: string, label: string, measured: number | null, required: number): Check {
  let status: CheckStatus = "unknown";
  if (measured !== null) status = measured >= required ? "ok" : "fail";
  return {
    key,
    label,
    measured: measured === null ? "not measured" : cm(measured),
    required: `at least ${cm(required)}`,
    status,
  };
}

function stepsCheck(profile: Profile, steps: number | null, ramp: boolean | null): Check {
  const required =
    profile.maxSteps === null ? "unknown (steps allowed not given)" : `${profile.maxSteps} step(s) or a ramp`;
  const measured =
    steps === null ? "not measured" : `${steps} step(s)${ramp === true ? ", ramp" : ramp === false ? ", no ramp" : ""}`;
  let status: CheckStatus;
  let gap: string | undefined;
  if (steps === null) {
    status = "unknown";
    gap = "the number of entrance steps";
  } else if (steps === 0 || ramp === true) status = "ok";
  else if (profile.maxSteps === null) {
    status = "unknown";
    gap = "how many steps your parent can manage";
  } else if (steps <= profile.maxSteps) status = "ok";
  else if (ramp === null) {
    status = "unknown";
    gap = "whether the entrance has a ramp";
  } else status = "fail";
  return { key: "steps", label: "Entrance steps", measured, required, status, gap };
}

function decide(profile: Profile, checks: Check[], extraHelp = false): Verdict {
  if (checks.some((c) => c.status === "fail")) return "no";
  // Unknown never becomes "fits": any gap, or help needed to transfer, means "fits with help".
  if (checks.some((c) => c.status === "unknown")) return "help";
  if (extraHelp || profile.transferHelp !== "none") return "help";
  return "fits";
}

export function hotelFit(profile: Profile, hotel: Hotel): FitResult {
  if (profile.chairWidthCm === null) {
    return { verdict: "help", checks: [] };
  }
  const r = requirementsFor(profile.chairWidthCm);
  const checks = [
    stepsCheck(profile, hotel.entranceSteps, hotel.ramp),
    atLeast("roomDoor", "Room door", hotel.roomDoorCm, r.roomDoorCm),
    atLeast("bathroomDoor", "Bathroom door", hotel.bathroomDoorCm, r.bathroomDoorCm),
    atLeast("liftDoor", "Lift door", hotel.liftDoorCm, r.liftDoorCm),
    atLeast("liftDepth", "Lift cabin depth", hotel.liftDepthCm, r.liftDepthCm),
    atLeast("turning", "Turning space", hotel.turningSpaceCm, r.turningSpaceCm),
  ];
  return { verdict: decide(profile, checks), checks };
}

export function taxiFit(profile: Profile, taxi: Taxi): FitResult {
  if (profile.chairWidthCm === null) {
    return { verdict: "help", checks: [] };
  }
  const r = requirementsFor(profile.chairWidthCm);
  const checks = [
    atLeast("taxiDoor", "Taxi door width", taxi.doorWidthCm, r.taxiDoorCm),
    atLeast("taxiHeight", "Interior height", taxi.interiorHeightCm, r.taxiHeightCm),
  ];
  // A fold-chair-only car means the parent must transfer into a seat.
  return { verdict: decide(profile, checks, taxi.vehicleType === "fold-chair-only"), checks };
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  fits: "Fits",
  help: "Fits with help",
  no: "Doesn't fit",
};

// Plain-code reason, shown instantly. Claude can replace it with friendlier wording.
export function basicReason(result: FitResult): string {
  const failed = result.checks.filter((c) => c.status === "fail");
  const unknown = result.checks.filter((c) => c.status === "unknown");
  if (result.verdict === "no") {
    return "Doesn't fit: " + failed.map((c) => `${c.label} is ${c.measured}, needs ${c.required}`).join("; ") + ".";
  }
  if (result.verdict === "help") {
    if (unknown.length > 0) {
      return "Fits with help: we don't know " + unknown.map((c) => c.gap ?? `the ${c.label.toLowerCase()} yet`).join(", ") + ".";
    }
    return "Fits with help: every measurement is enough, but your parent needs help to transfer.";
  }
  return "Fits: every measured item is wide enough for this chair.";
}

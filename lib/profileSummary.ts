// Says back, in plain words, what the results are based on. Pure code, no AI.
import type { Profile } from "./types";

export function profileSummary(p: Profile): string {
  const chair = p.chairWidthCm === null ? "chair width not given" : `chair ${p.chairWidthCm} cm wide`;
  const steps =
    p.maxSteps === null
      ? "steps: not sure"
      : p.maxSteps === 0
        ? "can't manage any steps"
        : `can manage up to ${p.maxSteps} step${p.maxSteps === 1 ? "" : "s"}`;
  const help =
    p.transferHelp === "none"
      ? "needs no help to transfer"
      : p.transferHelp === "some"
        ? "needs some help to transfer"
        : p.transferHelp === "full"
          ? "needs a lot of help to transfer"
          : "help to transfer: not sure";
  return `${chair} · ${steps} · ${help}`;
}

// What the family could tell us to get a firmer answer. Empty when nothing is unknown.
export function unknownNotes(p: Profile): string[] {
  const notes: string[] = [];
  if (p.transferHelp === null) notes.push("how much help your parent needs to transfer");
  if (p.maxSteps === null) notes.push("how many steps your parent can manage");
  return notes;
}

export function sameProfile(a: Profile, b: Profile): boolean {
  return a.chairWidthCm === b.chairWidthCm && a.maxSteps === b.maxSteps && a.transferHelp === b.transferHelp;
}

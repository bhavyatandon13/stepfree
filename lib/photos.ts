// Rules for proof photos. Pure code, easy to test.
// A live photo must be taken in the last MAX_PHOTO_AGE_MIN minutes, so an old or downloaded
// picture can't be passed off as today's. StepFree stamps the time onto the image itself.
import type { Evidence } from "./types";

export const MAX_PHOTO_AGE_MIN = 30;

// Is the file's own "last modified" time recent enough to count as just taken?
export function isFreshPhoto(lastModifiedMs: number, nowMs: number, maxMinutes = MAX_PHOTO_AGE_MIN): boolean {
  const age = nowMs - lastModifiedMs;
  return age >= -60_000 && age <= maxMinutes * 60_000; // allow a minute of clock difference
}

// "23 Oct 2026, 2:05 pm IST" — always shown in Indian time so everyone reads the same clock.
export function formatStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return (
    d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }) + " IST"
  );
}

// The line burned onto the top of a live photo.
export function stampLine(placeName: string, iso: string): string {
  return `📷 ${formatStamp(iso)} · ${placeName} · StepFree live photo`;
}

// The newest proof photo, shown as "Photo proof · <date>" on listings.
export function newestProof(evidence: Evidence[] | undefined): Evidence | null {
  if (!evidence?.length) return null;
  return [...evidence].sort((a, b) => Date.parse(b.takenAt) - Date.parse(a.takenAt))[0];
}

export function formatDay(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

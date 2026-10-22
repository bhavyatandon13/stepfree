import { describe, expect, it } from "vitest";
import hotels from "../data/hotels.json";
import taxis from "../data/taxis.json";
import { cityOfArea } from "../lib/cities";
import { hotelFit } from "../lib/fitRule";
import { formatStamp, isFreshPhoto, newestProof, stampLine } from "../lib/photos";
import type { Hotel, Taxi } from "../lib/types";

const H = hotels as Hotel[];
const parent = { chairWidthCm: 66, maxSteps: 0, transferHelp: "none" as const };

describe("live photo rules", () => {
  const now = Date.parse("2026-10-23T08:30:00Z");
  it("accepts a photo taken in the last 30 minutes", () => {
    expect(isFreshPhoto(now - 5 * 60_000, now)).toBe(true);
    expect(isFreshPhoto(now - 30 * 60_000, now)).toBe(true);
  });
  it("refuses an older photo, so old or downloaded pictures can't be reused", () => {
    expect(isFreshPhoto(now - 31 * 60_000, now)).toBe(false);
    expect(isFreshPhoto(now - 3 * 86_400_000, now)).toBe(false);
  });
  it("allows a minute of clock difference but not a photo from the future", () => {
    expect(isFreshPhoto(now + 30_000, now)).toBe(true);
    expect(isFreshPhoto(now + 10 * 60_000, now)).toBe(false);
  });
  it("stamps the time in Indian time, with the place", () => {
    expect(formatStamp("2026-10-23T08:35:00Z")).toBe("23 Oct 2026, 2:05 pm IST");
    expect(stampLine("Sample MG Road Hotel", "2026-10-23T08:35:00Z")).toBe("📷 23 Oct 2026, 2:05 pm IST · Sample MG Road Hotel · StepFree live photo");
  });
  it("finds the newest proof photo", () => {
    expect(newestProof(H.find((h) => h.id === "h1")!.evidence)!.by).toBe("Guest reviewer");
    expect(newestProof([])).toBeNull();
  });
});

describe("sample data covers every city", () => {
  const cities = [...new Set([...H.map((h) => cityOfArea(h.area)), ...(taxis as Taxi[]).map((t) => t.city)])];
  it("no city shows zero hotels", () => {
    for (const c of cities) expect(H.filter((h) => cityOfArea(h.area) === c).length, c).toBeGreaterThan(0);
  });
  it("every city has a hotel that fits a 66 cm chair and one that doesn't fully fit", () => {
    for (const c of cities) {
      const v = H.filter((h) => cityOfArea(h.area) === c).map((h) => hotelFit(parent, h).verdict);
      expect(v, c).toContain("fits");
      expect(v.some((x) => x !== "fits"), c).toBe(true);
    }
  });
  it("hotel ids are unique and every hotel has a sample price", () => {
    expect(new Set(H.map((h) => h.id)).size).toBe(H.length);
    for (const h of H) expect(typeof h.ratePerNight, h.id).toBe("number");
  });
});

describe("proof photos match the measurements", () => {
  it("every hotel has at least one time-stamped proof photo with a valid time", () => {
    for (const h of H) {
      expect(h.evidence?.length, h.id).toBeGreaterThan(0);
      for (const e of h.evidence!) expect(Number.isNaN(Date.parse(e.takenAt)), e.id).toBe(false);
    }
  });
  it("a washroom photo states the same width as the hotel's measurement", () => {
    for (const h of H) {
      const w = h.evidence!.find((e) => e.shows === "Washroom door");
      if (h.bathroomDoorCm === null) expect(w, h.id).toBeUndefined();
      else expect(w?.detail, h.id).toBe(`Tape measure reads ${h.bathroomDoorCm} cm`);
    }
  });
  it("a guest photo only appears where the hotel lends a wheelchair, and all sample photos say so", () => {
    for (const h of H) for (const e of h.evidence!) expect(e.sample, e.id).toBe(true);
  });
});

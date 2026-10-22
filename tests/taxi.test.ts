import { describe, expect, it } from "vitest";
import taxis from "../data/taxis.json";
import { taxiAnswer } from "../lib/taxiAnswer";
import type { Taxi } from "../lib/types";

const T = taxis as Taxi[];
const taxi = (id: string) => T.find((t) => t.id === id)!;
const base: Taxi = { id: "x", city: "Test", provider: "Test Cabs", vehicleType: "ramp", doorWidthCm: 90, interiorHeightCm: 150, verified: false, note: "" };

describe("taxiAnswer: a plain yes or no", () => {
  it("yes when the door and height are enough (Mobicab, 66 cm chair)", () => {
    const a = taxiAnswer(66, taxi("t1"));
    expect(a.answer).toBe("yes");
    expect(a.headline).toBe("Yes, the chair fits");
  });
  it("a 70 cm door is wide enough for a 66 cm chair; Ability on Wheels is tight only because its roof is low (135 cm)", () => {
    const a = taxiAnswer(66, taxi("t5"));
    expect(a.answer).toBe("tight");
    expect(a.detail).toMatch(/door is wide enough, but the roof is a little low/);
  });
  it("yes when the door is exactly as wide as the chair", () => expect(taxiAnswer(66, { ...base, doorWidthCm: 66 }).answer).toBe("yes"));
  it("no when the door is narrower than the chair", () => {
    const a = taxiAnswer(66, { ...base, doorWidthCm: 65 });
    expect(a.answer).toBe("no");
    expect(a.detail).toBe("The door is 65 cm wide, narrower than the 66 cm chair.");
  });
  it("no when the inside is too low, tight when a little low", () => {
    expect(taxiAnswer(66, { ...base, interiorHeightCm: 120 }).answer).toBe("no");
    expect(taxiAnswer(66, { ...base, interiorHeightCm: 135 }).answer).toBe("tight");
  });
  it("an 80 cm door fits chairs up to 80 cm and no wider", () => {
    for (const w of [60, 66, 75, 80]) expect(taxiAnswer(w, { ...base, doorWidthCm: 80 }).answer).toBe("yes");
    expect(taxiAnswer(81, { ...base, doorWidthCm: 80 }).answer).toBe("no");
  });
  it("not sure when a size is missing, and says what to ask", () => {
    const a = taxiAnswer(66, { ...base, doorWidthCm: null });
    expect(a.answer).toBe("unsure");
    expect(a.detail).toMatch(/door width/);
  });
  it("fold-chair-only means the parent must transfer (Buddy Cabs)", () => {
    expect(taxiAnswer(66, taxi("t4")).answer).toBe("transfer");
  });
});

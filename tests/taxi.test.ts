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
  it("tight, not no, when the door is narrower than comfortable but the chair gets through (Ability on Wheels: 70 cm)", () => {
    const a = taxiAnswer(66, taxi("t5"));
    expect(a.answer).toBe("tight");
    expect(a.headline).toBe("Yes, but it's a tight fit");
    expect(a.detail).toMatch(/only 4 cm wider than the chair/);
  });
  it("no when the door is narrower than chair + 2 cm", () => {
    const a = taxiAnswer(66, { ...base, doorWidthCm: 67 });
    expect(a.answer).toBe("no");
    expect(a.detail).toMatch(/67 cm wide.*at least 68 cm/);
  });
  it("no when the inside is too low, tight when a little low", () => {
    expect(taxiAnswer(66, { ...base, interiorHeightCm: 120 }).answer).toBe("no");
    expect(taxiAnswer(66, { ...base, interiorHeightCm: 135 }).answer).toBe("tight");
  });
  it("a wider chair moves the answer from yes to tight to no", () => {
    expect(taxiAnswer(66, { ...base, doorWidthCm: 80 }).answer).toBe("yes");
    expect(taxiAnswer(75, { ...base, doorWidthCm: 80 }).answer).toBe("tight");
    expect(taxiAnswer(79, { ...base, doorWidthCm: 80 }).answer).toBe("no");
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

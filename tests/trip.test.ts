import { describe, expect, it } from "vitest";
import { addDays, defaultStay, formatINR, makeRef, nightsBetween, stayTotal, validateGuest, validateStay } from "../lib/trip";

const TODAY = "2026-10-22";

describe("dates and nights", () => {
  it("adds days across a month end", () => expect(addDays("2026-10-30", 3)).toBe("2026-11-02"));
  it("counts nights", () => {
    expect(nightsBetween("2026-10-29", "2026-10-31")).toBe(2);
    expect(nightsBetween("2026-10-29", "2026-10-29")).toBe(0);
    expect(nightsBetween("bad", "2026-10-29")).toBe(0);
  });
  it("defaults to a 2-night stay a week from today for 2 guests", () => {
    expect(defaultStay(TODAY)).toEqual({ checkIn: "2026-10-29", checkOut: "2026-10-31", guests: 2 });
  });
});

describe("validateStay", () => {
  const ok = { checkIn: "2026-10-29", checkOut: "2026-10-31", guests: 2 };
  it("accepts a normal stay", () => expect(validateStay(ok, TODAY)).toEqual([]));
  it("rejects past check-in", () => expect(validateStay({ ...ok, checkIn: "2026-10-01" }, TODAY).join()).toMatch(/past/));
  it("rejects check-out on or before check-in", () => expect(validateStay({ ...ok, checkOut: "2026-10-29" }, TODAY).join()).toMatch(/at least one day/));
  it("rejects more than 30 nights", () => expect(validateStay({ ...ok, checkOut: "2026-12-15" }, TODAY).join()).toMatch(/30 nights/));
  it("rejects 0 or 7 guests", () => {
    expect(validateStay({ ...ok, guests: 0 }, TODAY)).toHaveLength(1);
    expect(validateStay({ ...ok, guests: 7 }, TODAY)).toHaveLength(1);
  });
  it("asks for dates when they are missing", () => expect(validateStay({ ...ok, checkIn: "" }, TODAY)[0]).toMatch(/choose/));
});

describe("prices", () => {
  it("totals rate x nights", () => expect(stayTotal(3800, 2)).toBe(7600));
  it("has no total without a rate or nights", () => {
    expect(stayTotal(null, 2)).toBeNull();
    expect(stayTotal(3800, 0)).toBeNull();
  });
  it("formats rupees the Indian way", () => expect(formatINR(125000)).toBe("₹1,25,000"));
});

describe("booking reference", () => {
  it("looks like SF-XXXXXX without confusing characters", () => {
    for (let i = 0; i < 50; i++) expect(makeRef()).toMatch(/^SF-[A-HJ-NP-Z2-9]{6}$/);
  });
  it("is repeatable with a fixed random source", () => expect(makeRef(() => 0)).toBe("SF-AAAAAA"));
});

describe("validateGuest", () => {
  it("accepts a name and an Indian mobile in common formats", () => {
    expect(validateGuest({ guestName: "Asha Rao", phone: "98765 43210" })).toEqual([]);
    expect(validateGuest({ guestName: "Asha Rao", phone: "+91 98765-43210" })).toEqual([]);
    expect(validateGuest({ guestName: "Asha Rao", phone: "09876543210" })).toEqual([]);
  });
  it("rejects a missing name and a bad number", () => {
    expect(validateGuest({ guestName: " ", phone: "12345" })).toHaveLength(2);
    expect(validateGuest({ guestName: "Asha", phone: "5876543210" })).toHaveLength(1); // must start 6-9
  });
});

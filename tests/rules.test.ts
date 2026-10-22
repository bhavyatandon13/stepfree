import { describe, expect, it } from "vitest";
import hotels from "../data/hotels.json";
import taxis from "../data/taxis.json";
import { accessFacts } from "../lib/accessFacts";
import { basicReason, hotelFit, taxiFit } from "../lib/fitRule";
import { cleanMakeMyTripUrl, mmtCityUrl } from "../lib/links";
import { hotelListing, rampText } from "../lib/listings";
import { readProfileText } from "../lib/readProfileText";
import { requirementsFor } from "../lib/requirements";
import { validateAudit, validateProfile } from "../lib/validate";
import type { Hotel, Profile, Taxi } from "../lib/types";

const papa: Profile = { chairWidthCm: 66, maxSteps: 0, transferHelp: "none" };
const H = hotels as Hotel[];
const T = taxis as Taxi[];
const hotel = (id: string) => H.find((h) => h.id === id)!;

describe("requirements", () => {
  it("66 cm chair needs 76 cm doors", () => {
    const r = requirementsFor(66);
    expect([r.bathroomDoorCm, r.liftDoorCm, r.roomDoorCm, r.taxiDoorCm]).toEqual([76, 76, 76, 76]);
  });
  it("70 cm chair needs 80 cm doors", () => {
    expect(requirementsFor(70).bathroomDoorCm).toBe(80);
  });
});

describe("hotelFit", () => {
  it("seed covers fits, help and no", () => {
    const verdicts = H.map((h) => hotelFit(papa, h).verdict);
    expect(verdicts).toContain("fits");
    expect(verdicts).toContain("help");
    expect(verdicts).toContain("no");
  });
  it("step-free wide hotel fits", () => expect(hotelFit(papa, hotel("h1")).verdict).toBe("fits"));
  it("2 steps and no ramp doesn't fit", () => expect(hotelFit(papa, hotel("h2")).verdict).toBe("no"));
  it("70 cm bathroom door doesn't fit a 66 cm chair", () => expect(hotelFit(papa, hotel("h3")).verdict).toBe("no"));
  it("ramp makes steps ok", () => expect(hotelFit(papa, hotel("h4")).verdict).toBe("fits"));
  it("unmeasured fields never give 'fits'", () => expect(hotelFit(papa, hotel("h5")).verdict).toBe("help"));
  it("unknown ramp with a step gives help", () => expect(hotelFit(papa, hotel("h6")).verdict).toBe("help"));
  it("unknown steps allowed never gives 'fits'", () => {
    expect(hotelFit({ ...papa, maxSteps: null }, hotel("h2")).verdict).not.toBe("fits");
    expect(hotelFit({ ...papa, transferHelp: null }, hotel("h1")).verdict).toBe("help");
  });
  it("transfer help needed gives help", () => {
    expect(hotelFit({ ...papa, transferHelp: "some" }, hotel("h1")).verdict).toBe("help");
  });
  it("no chair width gives help, never fits", () => {
    expect(hotelFit({ ...papa, chairWidthCm: null }, hotel("h1")).verdict).toBe("help");
  });
});

describe("readProfileText (backup reader)", () => {
  const read = (s: string) => readProfileText(s);
  it("reads the example sentence", () => {
    expect(read("Papa's chair is 66 cm wide and he can't manage any steps")).toEqual({ chairWidthCm: 66, maxSteps: 0, transferHelp: null });
  });
  it("reads a counted number of steps and help", () => {
    expect(read("Mummy's wheelchair is 70 cm. She can manage two low steps with support")).toEqual({ chairWidthCm: 70, maxSteps: 2, transferHelp: "some" });
  });
  it("converts inches", () => expect(read("chair is 26 inches wide").chairWidthCm).toBe(66));
  it("leaves unknowns as null", () => {
    expect(read("my dad uses a wheelchair")).toEqual({ chairWidthCm: null, maxSteps: null, transferHelp: null });
  });
});

describe("listings (for search and browsing)", () => {
  it("marks step-free, lift and wide bathroom from the measurements", () => {
    expect(hotelListing(hotel("h1")).features).toEqual(["Step-free entrance", "Lift", "Wide bathroom door", "Lends a wheelchair"]);
  });
  it("a ramp counts as step-free", () => expect(hotelListing(hotel("h4")).features).toContain("Step-free entrance"));
  it("lists the ramp only when one is recorded", () => {
    expect(hotelListing(hotel("h4")).features).toContain("Ramp at entrance"); // ramp: true
    expect(hotelListing(hotel("h2")).features).not.toContain("Ramp at entrance"); // ramp: false
    expect(hotelListing(hotel("h1")).features).not.toContain("Ramp at entrance"); // ramp: not recorded
  });
  it("says 'not recorded' rather than 'no' when the ramp is unknown", () => {
    expect([true, false, null].map(rampText)).toEqual(["Ramp available", "No ramp", "Ramp not recorded"]);
  });
  it("2 steps and no ramp is not step-free; a 75 cm bathroom door is not wide", () => {
    const f = hotelListing(hotel("h2")).features;
    expect(f).not.toContain("Step-free entrance");
    expect(f).not.toContain("Wide bathroom door");
  });
  it("unmeasured items are not claimed", () => expect(hotelListing(hotel("h5")).features).not.toContain("Lift"));
  it("splits area and city", () => expect(hotelListing(hotel("h1"))).toMatchObject({ area: "Karol Bagh", city: "Delhi" }));
});

describe("accessFacts (hotel summary in words)", () => {
  const facts = (id: string) => Object.fromEntries(accessFacts(hotel(id)).map((f) => [f.key, f]));
  it("wide washroom door is wheelchair-friendly and says the width", () => {
    expect(facts("h1").washroom).toMatchObject({ status: "yes" });
    expect(facts("h1").washroom.text).toMatch(/Wheelchair-friendly washroom: door 82 cm/);
  });
  it("narrow washroom door says so with the needed width", () => {
    expect(facts("h3").washroom).toMatchObject({ status: "no" });
    expect(facts("h3").washroom.text).toMatch(/70 cm \(needs 76 cm or more\)/);
  });
  it("unmeasured washroom is 'not measured', never friendly", () => expect(facts("h5").washroom.status).toBe("unknown"));
  it("stairs: none, some and unknown", () => {
    expect(facts("h1").stairs.text).toBe("No stairs at the entrance");
    expect(facts("h2").stairs.text).toBe("2 steps at the entrance");
    expect(facts("h6").stairs.text).toBe("1 step at the entrance");
  });
  it("ramp and wheelchair loan: yes, no and not recorded", () => {
    expect(facts("h4").ramp.status).toBe("yes");
    expect(facts("h2").ramp.status).toBe("no");
    expect(facts("h1").ramp.status).toBe("unknown");
    expect(facts("h1").lend.status).toBe("yes");
    expect(facts("h2").lend.status).toBe("no");
    expect(facts("h3").lend.status).toBe("unknown");
  });
  it("a small lift is called out", () => expect(facts("h2").lift.status).toBe("no"));
  it("every hotel gets all seven lines", () => H.forEach((h) => expect(accessFacts(h)).toHaveLength(7)));
});

describe("MakeMyTrip links", () => {
  it("builds the city page address", () => {
    expect(mmtCityUrl("Delhi")).toBe("https://www.makemytrip.com/hotels/delhi-hotels.html");
    expect(mmtCityUrl(" New Delhi ")).toBe("https://www.makemytrip.com/hotels/new-delhi-hotels.html");
  });
  it("accepts real makemytrip.com https pages", () => {
    expect(cleanMakeMyTripUrl("https://www.makemytrip.com/hotels/hotel-details/?hotelId=1")).toMatch(/^https:\/\/www\.makemytrip\.com\//);
    expect(cleanMakeMyTripUrl("https://makemytrip.com/hotels/delhi-hotels.html")).not.toBeNull();
  });
  it("refuses look-alike, non-https and malformed addresses", () => {
    expect(cleanMakeMyTripUrl("http://www.makemytrip.com/hotels/")).toBeNull();
    expect(cleanMakeMyTripUrl("https://makemytrip.com.evil.com/hotels")).toBeNull();
    expect(cleanMakeMyTripUrl("https://evilmakemytrip.com/hotels")).toBeNull();
    expect(cleanMakeMyTripUrl("https://user:pw@www.makemytrip.com/")).toBeNull();
    expect(cleanMakeMyTripUrl("javascript:alert(1)")).toBeNull();
    expect(cleanMakeMyTripUrl("not a link")).toBeNull();
    expect(cleanMakeMyTripUrl("")).toBeNull();
  });
});

describe("basicReason", () => {
  it("says the ramp is unknown, not that the steps are unmeasured", () => {
    const text = basicReason(hotelFit(papa, hotel("h6")));
    expect(text).toMatch(/whether the entrance has a ramp/);
    expect(text).not.toMatch(/not measured yet for entrance steps/);
  });
});

describe("taxiFit", () => {
  const taxi = (id: string) => T.find((t) => t.id === id)!;
  it("90 cm door ramp taxi fits", () => expect(taxiFit(papa, taxi("t1")).verdict).toBe("fits"));
  it("70 cm door doesn't fit a 66 cm chair", () => expect(taxiFit(papa, taxi("t5")).verdict).toBe("no"));
  it("unknown dimensions / fold-chair-only gives help", () => expect(taxiFit(papa, taxi("t4")).verdict).toBe("help"));
});

describe("validate", () => {
  it("missing chair width is flagged", () => {
    expect(validateProfile({ ...papa, chairWidthCm: null })).toHaveLength(1);
  });
  it("6 cm chair is rejected", () => {
    expect(validateProfile({ ...papa, chairWidthCm: 6 })[0]).toMatch(/looks wrong/);
  });
  it("66 cm chair is fine", () => expect(validateProfile(papa)).toEqual([]));
  it("18 cm bathroom door is flagged", () => {
    const fields = { entranceSteps: 0, ramp: null, roomDoorCm: null, bathroomDoorCm: 18, liftDoorCm: null, liftDepthCm: null, turningSpaceCm: null, wheelchairProvided: null };
    expect(validateAudit(fields)[0]).toMatch(/Bathroom door/);
  });
});

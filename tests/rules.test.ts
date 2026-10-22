import { describe, expect, it } from "vitest";
import hotels from "../data/hotels.json";
import taxis from "../data/taxis.json";
import { accessFacts, passesChecklist } from "../lib/accessFacts";
import { basicReason, hotelFit, taxiFit } from "../lib/fitRule";
import { cleanMakeMyTripUrl, mmtCityUrl } from "../lib/links";
import { hotelListing, rampText } from "../lib/listings";
import { profileSummary, sameProfile, unknownNotes } from "../lib/profileSummary";
import { readProfileText } from "../lib/readProfileText";
import { band, requirementsFor } from "../lib/requirements";
import { validateAudit, validateProfile } from "../lib/validate";
import type { Hotel, Profile, Taxi } from "../lib/types";

const papa: Profile = { chairWidthCm: 66, maxSteps: 0, transferHelp: "none" };
const H = hotels as Hotel[];
const T = taxis as Taxi[];
const hotel = (id: string) => H.find((h) => h.id === id)!;

describe("requirements: comfortable and minimum sizes", () => {
  it("a 66 cm chair: doors are comfortable at 76 cm and passable from 68 cm", () => {
    const r = requirementsFor(66);
    for (const d of [r.bathroomDoor, r.liftDoor, r.roomDoor, r.taxiDoor]) expect(d).toEqual({ comfortable: 76, minimum: 68 });
  });
  it("a 70 cm chair: 80 comfortable, 72 minimum", () => expect(requirementsFor(70).bathroomDoor).toEqual({ comfortable: 80, minimum: 72 }));
  it("bands a measurement as ok, tight, fail or unknown", () => {
    const need = { comfortable: 76, minimum: 68 };
    expect([band(80, need), band(76, need), band(75, need), band(68, need), band(67, need), band(null, need)]).toEqual(["ok", "ok", "tight", "tight", "fail", "unknown"]);
  });
});

describe("reason wording", () => {
  it("lists unknowns once, joined with 'and', with a single 'yet'", () => {
    expect(basicReason(hotelFit(papa, hotel("h5")))).toBe("Fits with help: We don't know the bathroom door, the lift door and the lift cabin depth yet.");
  });
  it("never repeats a word twice in a row", () => {
    for (const h of H) for (const p of [papa, { ...papa, maxSteps: null }, { ...papa, transferHelp: null }]) {
      expect(basicReason(hotelFit(p, h))).not.toMatch(/\b(\w+) \1\b/i);
    }
  });
});

describe("the reported case: a 75 cm bathroom door and a 66 cm chair", () => {
  const check = (id: string, key: string, p = papa) => hotelFit(p, hotel(id)).checks.find((c) => c.key === key)!;
  it("the 75 cm door is tight, not a failure", () => {
    expect(check("h2", "bathroomDoor").status).toBe("tight");
    expect(check("h2", "bathroomDoor").note).toMatch(/75 cm, only 9 cm wider than the chair/);
  });
  it("Hotel 2 still doesn't fit, but for the real reason: 2 steps and no ramp", () => {
    const r = hotelFit(papa, hotel("h2"));
    expect(r.verdict).toBe("no");
    const reason = basicReason(r);
    expect(reason).toMatch(/^Doesn't fit: there are 2 steps at the entrance and no ramp, and your parent can't manage any steps\./);
    expect(reason).toMatch(/Also tight: .*bathroom door is 75 cm/);
    expect(reason).not.toMatch(/Doesn't fit:[^.]*bathroom/);
  });
  it("if the parent could manage 2 steps, Hotel 2 fits with help (tight, not failed)", () => {
    expect(hotelFit({ ...papa, maxSteps: 2 }, hotel("h2")).verdict).toBe("help");
  });
  it("a door narrower than chair + 2 cm really doesn't fit", () => {
    expect(hotelFit(papa, { ...hotel("h1"), bathroomDoorCm: 67 }).verdict).toBe("no");
    expect(basicReason(hotelFit(papa, { ...hotel("h1"), bathroomDoorCm: 67 }))).toMatch(/needs at least 68 cm to get through/);
  });
  it("lift depth and turning space are banded too (105 cm lift, 130 cm turning = tight)", () => {
    expect(check("h2", "liftDepth").status).toBe("tight");
    expect(check("h2", "turning").status).toBe("tight");
    expect(hotelFit(papa, { ...hotel("h1"), liftDepthCm: 95 }).verdict).toBe("no");
    expect(hotelFit(papa, { ...hotel("h1"), turningSpaceCm: 110 }).verdict).toBe("no");
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
  it("a 70 cm bathroom door is tight for a 66 cm chair: fits with help", () => expect(hotelFit(papa, hotel("h3")).verdict).toBe("help"));
  it("the same 70 cm door doesn't fit a 69 cm chair (needs 71)", () => expect(hotelFit({ ...papa, chairWidthCm: 69 }, hotel("h3")).verdict).toBe("no"));
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
  it("reads a number typed on its own as the width (the '63' screenshot)", () => {
    expect(read("63")).toEqual({ chairWidthCm: 63, maxSteps: null, transferHelp: null });
    expect(read("  70 ")).toMatchObject({ chairWidthCm: 70 });
  });
  it("reads a width without 'cm' when it sits next to 'wide' or 'chair'", () => {
    expect(read("chair is 64 wide").chairWidthCm).toBe(64);
    expect(read("wheelchair width 68, no steps")).toMatchObject({ chairWidthCm: 68, maxSteps: 0 });
  });
  it("does not mistake a step count for a width", () => expect(read("can manage 2 steps").chairWidthCm).toBeNull());
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
  it("a 70 cm washroom door is a tight fit for a typical 66 cm chair, not 'too narrow'", () => {
    expect(facts("h3").washroom).toMatchObject({ status: "tight" });
    expect(facts("h3").washroom.text).toBe("Washroom door 70 cm: a tight fit for a 66 cm chair");
  });
  it("judges the washroom for the parent's own chair when known", () => {
    const own = (w: number) => Object.fromEntries(accessFacts(hotel("h2"), w).map((f) => [f.key, f]));
    expect(own(60).washroom.status).toBe("yes"); // 75 cm door, 60 cm chair: 15 cm spare
    expect(own(66).washroom.status).toBe("tight"); // 9 cm spare
    expect(own(74).washroom.status).toBe("no"); // needs 76 to pass
  });
  it("steps with a ramp count as a step-free way in", () => {
    expect(facts("h4").stairs).toMatchObject({ status: "yes", text: "3 steps at the entrance, with a ramp beside them" });
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
    expect(facts("h1").ramp).toMatchObject({ status: "yes", text: "No ramp needed: there are no steps" }); // 0 steps
    expect(facts("h6").ramp.status).toBe("unknown"); // 1 step, ramp not recorded
    expect(facts("h1").lend.status).toBe("yes");
    expect(facts("h2").lend.status).toBe("no");
    expect(facts("h3").lend.status).toBe("unknown");
  });
  it("a 105 cm-deep lift is called a tight fit, and a 90 cm one too small", () => {
    expect(facts("h2").lift).toMatchObject({ status: "tight", text: "Lift: door 80 cm, depth 105 cm (a tight fit)" });
    expect(Object.fromEntries(accessFacts({ ...hotel("h2"), liftDepthCm: 90 }).map((f) => [f.key, f])).lift.status).toBe("no");
  });
  it("every hotel gets all seven lines", () => H.forEach((h) => expect(accessFacts(h)).toHaveLength(7)));
});

describe("profileSummary (says the numbers back)", () => {
  it("describes the example parent", () => {
    expect(profileSummary({ chairWidthCm: 66, maxSteps: 0, transferHelp: "none" })).toBe(
      "chair 66 cm wide · can't manage any steps · needs no help to transfer",
    );
  });
  it("says 'not sure' for unknowns and pluralises steps", () => {
    expect(profileSummary({ chairWidthCm: 70, maxSteps: 1, transferHelp: null })).toBe("chair 70 cm wide · can manage up to 1 step · help to transfer: not sure");
    expect(profileSummary({ chairWidthCm: 70, maxSteps: 3, transferHelp: "some" })).toContain("up to 3 steps");
    expect(profileSummary({ chairWidthCm: 70, maxSteps: null, transferHelp: "full" })).toContain("steps: not sure");
  });
  it("lists what is unknown, and nothing when all is known", () => {
    expect(unknownNotes({ chairWidthCm: 66, maxSteps: null, transferHelp: null })).toHaveLength(2);
    expect(unknownNotes({ chairWidthCm: 66, maxSteps: 0, transferHelp: "none" })).toEqual([]);
  });
  it("sameProfile notices any change", () => {
    const a = { chairWidthCm: 66, maxSteps: 0, transferHelp: "none" as const };
    expect(sameProfile(a, { ...a })).toBe(true);
    expect(sameProfile(a, { ...a, chairWidthCm: 67 })).toBe(false);
    expect(sameProfile(a, { ...a, maxSteps: null })).toBe(false);
  });
});

describe("passesChecklist (step-free way in + friendly washroom)", () => {
  const passing = () => H.filter(passesChecklist).map((h) => h.id);
  it("passes hotels with no stairs or a ramp, and a wide washroom door", () => expect(passing()).toEqual(["h1", "h4"]));
  it("narrow washroom fails (h3), stairs without a ramp fail (h2)", () => {
    expect(passesChecklist(hotel("h3"))).toBe(false);
    expect(passesChecklist(hotel("h2"))).toBe(false);
  });
  it("unknown never passes: unmeasured washroom (h5), 1 step with unknown ramp (h6)", () => {
    expect(passesChecklist(hotel("h5"))).toBe(false);
    expect(passesChecklist(hotel("h6"))).toBe(false);
  });
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
  it("a 70 cm taxi door is tight for a 66 cm chair: fits with help", () => expect(taxiFit(papa, taxi("t5")).verdict).toBe("help"));
  it("a 65 cm taxi door doesn't fit a 66 cm chair", () => expect(taxiFit(papa, { ...taxi("t5"), doorWidthCm: 65 }).verdict).toBe("no"));
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

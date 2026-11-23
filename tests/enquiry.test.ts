import { describe, expect, it } from "vitest";
import { autoReply, checkEnquiry, isBot, notifyEmail } from "../lib/enquiry";

describe("Write to us form", () => {
  it("accepts a filled-in form and trims spaces", () => {
    expect(checkEnquiry({ name: " Asha ", email: "asha@example.com ", message: " Is there a ramp? " })).toEqual({
      ok: true,
      enquiry: { name: "Asha", email: "asha@example.com", message: "Is there a ramp?" },
    });
  });
  it("asks for whatever is missing or wrong", () => {
    expect(checkEnquiry({ email: "a@b.co", message: "hi" })).toEqual({ ok: false, error: "Please add your name." });
    expect(checkEnquiry({ name: "A", email: "not-an-email", message: "hi" })).toMatchObject({ ok: false, error: expect.stringContaining("valid email") });
    expect(checkEnquiry({ name: "A", email: "a@b.co", message: "   " })).toEqual({ ok: false, error: "Please write a message." });
    expect(checkEnquiry(null)).toMatchObject({ ok: false });
    expect(checkEnquiry({ name: "A", email: "a@b.co", message: "x".repeat(2001) })).toMatchObject({ ok: false });
  });
  it("spots bots by the hidden field", () => {
    expect(isBot({ website: "spam.com" })).toBe(true);
    expect(isBot({ website: "" })).toBe(false);
    expect(isBot(null)).toBe(false);
  });
  it("writes both emails with the sender's details", () => {
    const e = { name: "Asha", email: "asha@example.com", message: "Is there a ramp?" };
    expect(notifyEmail(e).subject).toBe("New StepFree enquiry from Asha");
    expect(notifyEmail(e).text).toContain("asha@example.com");
    expect(autoReply(e).text).toMatch(/^Hi Asha,/);
    expect(autoReply(e).text).toContain("Is there a ramp?");
  });
});

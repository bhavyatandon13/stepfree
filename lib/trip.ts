// Dates, prices and booking references for the demo booking flow. Pure code, easy to test.
import type { Verdict } from "./types";

export type Stay = { checkIn: string; checkOut: string; guests: number };

export type Booking = {
  ref: string;
  hotelId: string;
  hotelName: string;
  area: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  ratePerNight: number | null;
  total: number | null;
  guestName: string;
  phone: string;
  requests: string;
  verdict: Verdict | null; // the fit result for the parent at the time of booking
  parent: string | null; // the parent's needs in words, e.g. "chair 66 cm wide · can't manage any steps"
  createdAt: string;
  status: "requested" | "cancelled";
};

const DAY = 24 * 60 * 60 * 1000;
const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const isISO = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(toDate(s).getTime());

export function todayISO(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, n: number): string {
  return new Date(toDate(iso).getTime() + n * DAY).toISOString().slice(0, 10);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  if (!isISO(checkIn) || !isISO(checkOut)) return 0;
  return Math.round((toDate(checkOut).getTime() - toDate(checkIn).getTime()) / DAY);
}

export function defaultStay(today: string): Stay {
  return { checkIn: addDays(today, 7), checkOut: addDays(today, 9), guests: 2 };
}

// Plain-language problems with the dates and guests. Empty list = fine.
export function validateStay(s: Stay, today: string): string[] {
  const problems: string[] = [];
  if (!isISO(s.checkIn) || !isISO(s.checkOut)) return ["Please choose a check-in and a check-out date."];
  if (s.checkIn < today) problems.push("Check-in can't be in the past.");
  const nights = nightsBetween(s.checkIn, s.checkOut);
  if (nights < 1) problems.push("Check-out must be at least one day after check-in.");
  if (nights > 30) problems.push("Stays can be at most 30 nights.");
  if (!Number.isInteger(s.guests) || s.guests < 1 || s.guests > 6) problems.push("Guests must be between 1 and 6.");
  return problems;
}

export function stayTotal(ratePerNight: number | null | undefined, nights: number): number | null {
  return typeof ratePerNight === "number" && nights > 0 ? ratePerNight * nights : null;
}

export function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function formatDate(iso: string): string {
  return isISO(iso) ? toDate(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : iso;
}

// Easy to read aloud on the phone: no 0/O or 1/I.
const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function makeRef(random: () => number = Math.random): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += REF_CHARS[Math.floor(random() * REF_CHARS.length)];
  return `SF-${s}`;
}

export function validateGuest(g: { guestName: string; phone: string }): string[] {
  const problems: string[] = [];
  if (g.guestName.trim().length < 2) problems.push("Please enter the lead guest's name.");
  const digits = g.phone.replace(/[\s-]/g, "").replace(/^(\+91|0)/, "");
  if (!/^[6-9]\d{9}$/.test(digits)) problems.push("Please enter a 10-digit Indian mobile number.");
  return problems;
}

"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StayFields, useStay } from "@/components/StaySearch";
import { Badge } from "@/components/ui";
import { VERDICT_LABEL, hotelFit } from "@/lib/fitRule";
import { profileSummary } from "@/lib/profileSummary";
import { useStore } from "@/lib/store";
import { formatDate, formatINR, makeRef, nightsBetween, stayTotal, todayISO, validateGuest, validateStay } from "@/lib/trip";
import { profileStore, saveTrip, stayStore } from "@/lib/tripState";
import taxiData from "@/data/taxis.json";
import { cityOfArea } from "@/lib/cities";
import { taxiAnswer } from "@/lib/taxiAnswer";
import type { Hotel, Taxi } from "@/lib/types";

const TAXIS = taxiData as Taxi[];

const STEPS = ["Your stay", "Guest details", "Confirm"];
const input = "mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900";

function Progress({ step }: { step: number }) {
  return (
    <ol className="flex gap-2 text-sm" aria-label="Booking steps">
      {STEPS.map((s, i) => (
        <li key={s} aria-current={i === step ? "step" : undefined}
          className={`flex-1 rounded-full px-3 py-2 text-center font-semibold ${i === step ? "bg-brand text-white" : i < step ? "bg-tint text-brand" : "bg-gray-100 text-gray-600"}`}>
          {i < step ? "✓ " : `${i + 1}. `}{s}
        </li>
      ))}
    </ol>
  );
}

export default function BookingFlow({ hotelId }: { hotelId: string }) {
  const router = useRouter();
  const profile = useStore(profileStore);
  const [stay, setStay] = useStay();
  const [hotel, setHotel] = useState<Hotel | null | undefined>(undefined);
  const [step, setStep] = useState(0);
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [requests, setRequests] = useState<string | null>(null);
  const [understood, setUnderstood] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);
  const [taxiId, setTaxiId] = useState<string>("");

  useEffect(() => {
    fetch("/api/hotels")
      .then((r) => r.json())
      .then((d) => setHotel((d.hotels as Hotel[]).find((h) => h.id === hotelId) ?? null))
      .catch(() => setHotel(null));
  }, [hotelId]);

  if (hotel === undefined) return <main className="mx-auto max-w-3xl p-4 py-10"><p>Loading…</p></main>;
  if (hotel === null) {
    return (
      <main className="mx-auto max-w-3xl space-y-3 p-4 py-10">
        <h1 className="text-2xl font-bold">We couldn&apos;t find that hotel</h1>
        <Link href="/places?category=Hotel" className="underline">Choose a hotel</Link>
      </main>
    );
  }

  const fit = profile?.chairWidthCm != null ? hotelFit(profile, hotel) : null;
  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const total = stayTotal(hotel.ratePerNight, nights);
  const defaultRequests = profile?.chairWidthCm != null
    ? `Wheelchair user (${profileSummary(profile)}). Please give us a step-free room close to the lift, with a wheelchair-friendly washroom.`
    : "Wheelchair user. Please give us a step-free room close to the lift, with a wheelchair-friendly washroom.";
  const requestText = requests ?? defaultRequests;
  // Wheelchair taxis in the hotel's city, each with the answer for this parent's chair.
  const width = profile?.chairWidthCm ?? null;
  const cityTaxis = TAXIS.filter((t) => t.city === cityOfArea(hotel.area)).map((t) => ({ t, a: width !== null ? taxiAnswer(width, t) : null }));
  const chosen = cityTaxis.find((x) => x.t.id === taxiId) ?? null;

  function next() {
    let p: string[] = [];
    if (step === 0) {
      p = validateStay(stay, todayISO());
      if (fit?.verdict === "no" && !understood) p.push("Please tick the box to show you understand this hotel doesn't fit your parent's chair.");
      if (!p.length) stayStore.set(stay);
    }
    if (step === 1) p = validateGuest({ guestName, phone });
    setProblems(p);
    if (!p.length) setStep(step + 1);
  }

  function confirm() {
    const ref = makeRef();
    saveTrip({
      ref,
      hotelId: hotel!.id,
      hotelName: hotel!.name,
      area: hotel!.area,
      checkIn: stay.checkIn,
      checkOut: stay.checkOut,
      nights,
      guests: stay.guests,
      ratePerNight: hotel!.ratePerNight ?? null,
      total,
      guestName: guestName.trim(),
      phone: phone.trim(),
      requests: requestText.trim(),
      verdict: fit?.verdict ?? null,
      parent: profile?.chairWidthCm != null ? profileSummary(profile) : null,
      taxi: chosen ? { provider: chosen.t.provider, fare: chosen.t.sampleFare ?? null, answer: chosen.a?.headline ?? "Chair size not checked" } : null,
      createdAt: new Date().toISOString(),
      status: "requested",
    });
    router.push(`/trips?ref=${ref}`);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 py-8">
      <Link href={`/hotels/${hotel.id}`} className="text-sm underline">← Back to {hotel.name}</Link>
      <h1 className="text-3xl font-bold">Book {hotel.name}</h1>
      <Progress step={step} />

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-tint p-4">
        <div>
          <p className="font-semibold">{hotel.name}</p>
          <p className="text-sm text-muted">{hotel.area}</p>
        </div>
        {fit ? <Badge verdict={fit.verdict} /> : <Link href={`/check?next=/book?hotel=${hotel.id}`} className="text-sm font-semibold text-brand underline">Check if it fits my parent</Link>}
      </section>

      {step === 0 && (
        <section className="space-y-4" aria-label="Your stay">
          <div className="grid gap-3 sm:grid-cols-3"><StayFields value={stay} onChange={setStay} idPrefix="bk" /></div>
          <p className="rounded-lg border border-gray-200 p-3">
            {nights > 0 ? `${nights} night${nights === 1 ? "" : "s"} · ${formatDate(stay.checkIn)} to ${formatDate(stay.checkOut)}` : "Choose your dates"}
            {total !== null && <span className="float-right font-bold">{formatINR(total)}</span>}
          </p>
          {fit?.verdict === "no" && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
              <p className="font-semibold">This hotel doesn&apos;t fit your parent&apos;s chair.</p>
              <label className="mt-2 flex items-start gap-2">
                <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} className="mt-1" />
                I understand, and I still want to request it (for example for another guest).
              </label>
            </div>
          )}
          {fit?.verdict === "help" && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">This hotel fits with help: some details are unknown or your parent needs help to transfer. Phone the hotel to check before you travel.</p>}

          <fieldset className="rounded-xl border border-gray-200 p-4">
            <legend className="px-1 text-lg font-bold"><span aria-hidden>🚕 </span>Add a wheelchair taxi <span className="text-sm font-normal text-muted">(optional)</span></legend>
            {cityTaxis.length === 0 ? (
              <p className="text-sm text-muted">No wheelchair taxi in our data for {cityOfArea(hotel.area)} yet.</p>
            ) : (
              <div className="space-y-2">
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                  <input type="radio" name="taxi" checked={taxiId === ""} onChange={() => setTaxiId("")} />
                  <span>No taxi, thanks</span>
                </label>
                {cityTaxis.map(({ t, a }) => {
                  const blocked = a?.answer === "no";
                  return (
                    <label key={t.id} className={`flex items-start gap-3 rounded-lg border p-3 ${taxiId === t.id ? "border-brand bg-tint" : "border-gray-200"} ${blocked ? "opacity-60" : "cursor-pointer"}`}>
                      <input type="radio" name="taxi" className="mt-1" disabled={blocked} checked={taxiId === t.id} onChange={() => setTaxiId(t.id)} />
                      <span className="flex-1">
                        <span className="font-semibold">{t.provider}</span>
                        <span className="block text-sm">
                          {a ? <><span aria-hidden>{a.answer === "yes" ? "✓" : a.answer === "no" ? "✕" : a.answer === "tight" ? "≈" : "?"} </span>{a.headline}</> : "Add your parent's chair to see if it fits"}
                        </span>
                      </span>
                      <span className="text-sm font-semibold">{typeof t.sampleFare === "number" ? `${formatINR(t.sampleFare)}` : "Ask fare"}</span>
                    </label>
                  );
                })}
                <p className="text-xs text-muted">Sample fares for one trip in the city. You pay the driver. Taxis that won&apos;t fit the chair can&apos;t be chosen.</p>
              </div>
            )}
          </fieldset>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-4" aria-label="Guest details">
          <label className="block text-sm font-semibold">Lead guest&apos;s full name
            <input className={input} value={guestName} onChange={(e) => setGuestName(e.target.value)} autoComplete="name" />
          </label>
          <label className="block text-sm font-semibold">Mobile number
            <input className={input} type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="98765 43210" />
          </label>
          <label className="block text-sm font-semibold">Requests for the hotel
            <textarea className={input} rows={3} value={requestText} onChange={(e) => setRequests(e.target.value)} />
          </label>
          <p className="text-xs text-muted">These details stay in this browser. This demo sends them nowhere and no hotel is contacted.</p>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-3 rounded-xl border border-gray-200 p-5" aria-label="Confirm">
          <h2 className="text-xl font-bold">Check and confirm</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted">Hotel</dt><dd>{hotel.name}, {hotel.area}</dd>
            <dt className="text-muted">Dates</dt><dd>{formatDate(stay.checkIn)} to {formatDate(stay.checkOut)} ({nights} night{nights === 1 ? "" : "s"})</dd>
            <dt className="text-muted">Guests</dt><dd>{stay.guests}</dd>
            <dt className="text-muted">Lead guest</dt><dd>{guestName} · {phone}</dd>
            <dt className="text-muted">Fit for your parent</dt><dd>{fit ? VERDICT_LABEL[fit.verdict] : "Not checked"}</dd>
            <dt className="text-muted">Requests</dt><dd>{requestText}</dd>
            <dt className="text-muted">Taxi</dt><dd>{chosen ? `${chosen.t.provider}${typeof chosen.t.sampleFare === "number" ? `, ${formatINR(chosen.t.sampleFare)} sample fare, pay the driver` : ", fare to be agreed"}` : "No taxi"}</dd>
            <dt className="text-muted">Hotel total</dt><dd className="font-bold">{total !== null ? `${formatINR(total)} (sample price)` : "Price on request"}</dd>
            <dt className="text-muted">Payment</dt><dd>Pay at the hotel. Nothing is charged now.</dd>
          </dl>
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
            Demo: this creates a booking request saved in your browser. No hotel is contacted and no money is taken.
          </p>
        </section>
      )}

      {problems.length > 0 && <ul role="alert" className="list-disc rounded bg-red-50 p-3 pl-6 text-sm text-red-900">{problems.map((p) => <li key={p}>{p}</li>)}</ul>}

      <div className="flex flex-wrap gap-3">
        {step > 0 && <button onClick={() => { setProblems([]); setStep(step - 1); }} className="rounded-full border border-brand px-6 py-3 font-semibold text-brand">Back</button>}
        {step < 2 && <button onClick={next} className="rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark">Continue</button>}
        {step === 2 && <button onClick={confirm} className="rounded-full bg-accent px-6 py-3 font-bold text-slate-900 hover:bg-accent-dark">Confirm booking request</button>}
      </div>
    </main>
  );
}

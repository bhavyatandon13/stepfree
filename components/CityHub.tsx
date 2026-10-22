"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import taxiData from "@/data/taxis.json";
import { MakeMyTripCity } from "@/components/BookingLinks";
import { StayFields, useStay } from "@/components/StaySearch";
import { ProofBadge } from "@/components/ProofPhotos";
import TaxiCard from "@/components/TaxiCard";
import { Badge } from "@/components/ui";
import { CITIES, cityOfArea, citySlug } from "@/lib/cities";
import { hotelFit } from "@/lib/fitRule";
import { profileSummary } from "@/lib/profileSummary";
import { requirementsFor } from "@/lib/requirements";
import { useStore } from "@/lib/store";
import { formatDate, formatINR, nightsBetween, stayTotal, todayISO, validateStay } from "@/lib/trip";
import { profileStore, stayStore } from "@/lib/tripState";
import type { Hotel, Taxi, Verdict } from "@/lib/types";

const TAXIS = taxiData as Taxi[];
const FIT_ORDER: Record<Verdict, number> = { fits: 0, help: 1, no: 2 };

// One page per city with everything a family needs there: hotels, taxis and how to book.
export default function CityHub({ city }: { city: string }) {
  const router = useRouter();
  const profile = useStore(profileStore);
  const hasChair = profile?.chairWidthCm != null;
  const [stay, setStay] = useStay();
  const [editingDates, setEditingDates] = useState(false);
  const [dateProblems, setDateProblems] = useState<string[]>([]);
  const [hotels, setHotels] = useState<Hotel[] | null>(null);
  const slug = citySlug(city);
  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const taxis = TAXIS.filter((t) => t.city === city);

  useEffect(() => {
    fetch("/api/hotels")
      .then((r) => r.json())
      .then((d) => setHotels((d.hotels as Hotel[]).filter((h) => cityOfArea(h.area) === city)))
      .catch(() => setHotels([]));
  }, [city]);

  const sorted = (hotels ?? []).slice().sort((a, b) => {
    if (hasChair) {
      const d = FIT_ORDER[hotelFit(profile!, a).verdict] - FIT_ORDER[hotelFit(profile!, b).verdict];
      if (d !== 0) return d;
    }
    return (a.ratePerNight ?? Infinity) - (b.ratePerNight ?? Infinity);
  });

  return (
    <main>
      <section className="hero bg-gradient-to-br from-brand-dark via-brand to-pink-600 text-white">
        <div className="mx-auto max-w-5xl space-y-4 px-4 py-10">
          <label className="block text-sm font-semibold text-pink-100">Choose a city
            <select
              value={slug}
              onChange={(e) => router.push(`/city/${e.target.value}`)}
              className="mt-1 block rounded-lg border-0 bg-white p-2.5 font-semibold text-slate-900"
            >
              {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </label>
          <h1 className="rise text-4xl font-bold sm:text-5xl"><span aria-hidden className="float inline-block">{CITIES.find((c) => c.name === city)?.emoji ?? "📍"}</span> Accessible travel in {city}</h1>
          <p className="text-lg text-pink-50">Hotels and wheelchair taxis, checked against your parent&apos;s chair.</p>
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <a href="#hotels" className="rounded-full bg-white/15 px-4 py-2 hover:bg-white/25">{hotels === null ? "…" : hotels.length} hotel{hotels?.length === 1 ? "" : "s"}</a>
            <a href="#taxis" className="rounded-full bg-white/15 px-4 py-2 hover:bg-white/25">{taxis.length} taxi provider{taxis.length === 1 ? "" : "s"}</a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
        <section aria-label="Your trip" className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-tint p-4">
            <p className="text-sm font-semibold text-brand">Your parent</p>
            {hasChair ? (
              <p className="mt-1">{profileSummary(profile!)} · <Link href={`/check?next=/city/${slug}`} className="font-semibold text-brand underline">change</Link></p>
            ) : (
              <p className="mt-1">
                Not added yet.{" "}
                <Link href={`/check?next=/city/${slug}`} className="font-semibold text-brand underline">Add the chair width</Link> to see what fits.
              </p>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 bg-tint p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-brand">Your dates</p>
              <button onClick={() => setEditingDates(!editingDates)} aria-expanded={editingDates} className="text-sm font-semibold text-brand underline">{editingDates ? "Close" : "Change"}</button>
            </div>
            <p className="mt-1">{formatDate(stay.checkIn)} → {formatDate(stay.checkOut)} · {nights} night{nights === 1 ? "" : "s"} · {stay.guests} guest{stay.guests === 1 ? "" : "s"}</p>
            {editingDates && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <StayFields value={stay} onChange={setStay} idPrefix="ch" />
                <button
                  onClick={() => {
                    const p = validateStay(stay, todayISO());
                    setDateProblems(p);
                    if (!p.length) { stayStore.set(stay); setEditingDates(false); }
                  }}
                  className="self-end rounded-full bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark"
                >
                  Update
                </button>
                {dateProblems.length > 0 && <ul role="alert" className="list-disc rounded bg-red-50 p-3 pl-6 text-sm text-red-900 sm:col-span-2">{dateProblems.map((p) => <li key={p}>{p}</li>)}</ul>}
              </div>
            )}
          </div>
        </section>

        <section id="hotels" aria-labelledby="hotels-h" className="scroll-mt-4 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 id="hotels-h" className="text-2xl font-bold"><span aria-hidden>🏨 </span>Hotels in {city}</h2>
            {hasChair && sorted.length > 0 && <p className="text-sm text-muted">Best fit for your parent first</p>}
          </div>
          {hotels === null && <p className="text-muted">Loading hotels…</p>}
          {hotels !== null && sorted.length === 0 && (
            <div className="rounded-xl border border-gray-200 p-5">
              <p className="font-semibold">No measured hotels in {city} yet.</p>
              <p className="text-muted">We&apos;re starting in Delhi. <Link href="/submit" className="underline">Suggest a hotel in {city}</Link> and we&apos;ll measure it.</p>
            </div>
          )}
          <ul className="space-y-4">
            {sorted.map((h) => {
              const verdict = hasChair ? hotelFit(profile!, h).verdict : null;
              const total = stayTotal(h.ratePerNight, nights);
              return (
                <li key={h.id} className="lift reveal flex flex-wrap gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={h.photo} alt="" className="h-28 w-40 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-48 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold">{h.name}</h3>
                        <p className="text-sm text-gray-600">{h.area}{h.isPlaceholder && " · sample hotel"}</p>
                        <div className="mt-1"><ProofBadge evidence={h.evidence} /></div>
                      </div>
                      {verdict && <Badge verdict={verdict} />}
                    </div>
                    <p className="mt-2 text-sm">
                      {h.entranceSteps === 0 ? "✓ No stairs at the entrance" : h.ramp ? "✓ Ramp at the entrance" : h.entranceSteps ? `✕ ${h.entranceSteps} step${h.entranceSteps === 1 ? "" : "s"} at the entrance` : "? Entrance not recorded"}
                      {" · "}
                      {h.bathroomDoorCm !== null ? `Washroom door ${h.bathroomDoorCm} cm` : "Washroom not measured"}
                    </p>
                  </div>
                  <div className="flex w-full flex-col items-end justify-between gap-2 sm:w-auto">
                    <p className="text-right">
                      {typeof h.ratePerNight === "number" ? <><span className="text-xl font-extrabold">{formatINR(h.ratePerNight)}</span><span className="text-sm text-muted"> / night</span></> : <span className="text-sm text-muted">Price on request</span>}
                      {total !== null && <span className="block text-xs text-muted">{formatINR(total)} for {nights} night{nights === 1 ? "" : "s"} · sample</span>}
                    </p>
                    <Link href={`/hotels/${h.id}`} className="rounded-full bg-accent px-5 py-2.5 font-bold text-slate-900 hover:bg-accent-dark">View &amp; book</Link>
                  </div>
                </li>
              );
            })}
          </ul>
          <MakeMyTripCity city={city} />
        </section>

        <section id="taxis" aria-labelledby="taxis-h" className="scroll-mt-4 space-y-4">
          <h2 id="taxis-h" className="text-2xl font-bold"><span aria-hidden>🚕 </span>Wheelchair taxis in {city}</h2>
          {taxis.length === 0 ? (
            <div className="rounded-xl border border-gray-200 p-5">
              <p className="font-semibold">No wheelchair taxi provider in our data for {city} yet.</p>
              <p className="text-muted">
                When you phone a taxi company, ask for a ramp or lift vehicle{hasChair ? ` with a door at least ${requirementsFor(profile!.chairWidthCm!).taxiDoor.minimum} cm wide` : ""}.
              </p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">{taxis.map((t) => <li key={t.id} className="lift reveal rounded-xl"><TaxiCard taxi={t} /></li>)}</ul>
          )}
        </section>

        <section aria-labelledby="tips-h" className="rounded-xl bg-warm p-6">
          <h2 id="tips-h" className="text-xl font-bold">Before you travel to {city}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            <li>Phone the hotel and ask for a step-free room close to the lift.</li>
            <li>Ask the taxi company for a ramp or lift vehicle when you book.</li>
            <li>Carry the chair&apos;s width written down, so staff can check doors for you.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}

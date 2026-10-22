"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import taxis from "@/data/taxis.json";
import AccessSummary from "@/components/AccessSummary";
import { BookOnMakeMyTrip, MakeMyTripCity } from "@/components/BookingLinks";
import { FEATURES, countBy, hotelListing, taxiListing, type Feature, type Listing } from "@/lib/listings";
import type { Hotel, Taxi } from "@/lib/types";

const TAXI_LISTINGS = (taxis as Taxi[]).map(taxiListing);

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium ${on ? "border-brand bg-brand text-white" : "border-gray-300 bg-white text-gray-900 hover:bg-tint"}`}
    >
      {children}
    </button>
  );
}

function Explore() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [city, setCity] = useState(params.get("city") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [features, setFeatures] = useState<Feature[]>([]);
  const [hotels, setHotels] = useState<Listing[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/hotels")
      .then((r) => r.json())
      .then((d) => setHotels((d.hotels as Hotel[]).map(hotelListing)))
      .catch(() => setFailed(true));
  }, []);

  const all = useMemo(() => [...hotels, ...TAXI_LISTINGS], [hotels]);
  const cities = countBy(all, "city");
  const shown = all.filter(
    (l) =>
      (!q.trim() || `${l.name} ${l.area} ${l.city} ${l.category}`.toLowerCase().includes(q.trim().toLowerCase())) &&
      (!city || l.city === city) &&
      (!category || l.category === category) &&
      features.every((f) => l.features.includes(f)),
  );
  // One MakeMyTrip link per city that has hotels in the current results (or all hotel cities if none match).
  const hotelCities = [...new Set((shown.some((l) => l.category === "Hotel") ? shown : all).filter((l) => l.category === "Hotel").map((l) => l.city))];
  const toggle = (f: Feature) => setFeatures((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 py-10">
      <header>
        <h1 className="text-3xl font-bold">Explore places</h1>
        <p className="text-muted">Search by name, city or type, then narrow down by what each place offers.</p>
      </header>

      <div role="search">
        <label htmlFor="q" className="sr-only">Search places</label>
        <input
          id="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a city, a hotel or a taxi provider"
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="City">
          <span className="text-sm font-semibold">City</span>
          {cities.map(([c, n]) => <Chip key={c} on={city === c} onClick={() => setCity(city === c ? "" : c)}>{c} ({n})</Chip>)}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Type">
          <span className="text-sm font-semibold">Type</span>
          {["Hotel", "Taxi"].map((c) => <Chip key={c} on={category === c} onClick={() => setCategory(category === c ? "" : c)}>{c}</Chip>)}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Features">
          <span className="text-sm font-semibold">Features</span>
          {FEATURES.map((f) => <Chip key={f} on={features.includes(f)} onClick={() => toggle(f)}>{f}</Chip>)}
        </div>
      </div>

      <p className="text-sm text-muted" aria-live="polite">{shown.length} of {all.length} places shown. All are placeholders, not real audits.</p>
      {failed && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-900">Couldn&apos;t load the hotel list. Showing taxis only.</p>}

      {shown.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-tint p-5">Nothing matches. Try removing a filter.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {shown.map((l) => (
            <li key={l.id} className="rounded-lg border border-gray-200 bg-white p-4 text-gray-900">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{l.name}</h2>
                  <p className="text-sm text-gray-600">{l.area === l.city ? l.city : `${l.area}, ${l.city}`}</p>
                </div>
                <span className="rounded-full bg-tint px-2.5 py-1 text-xs font-semibold text-brand">{l.category}</span>
              </div>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {l.features.length === 0 && <li className="text-xs text-gray-600">No step-free features recorded</li>}
                {l.features.map((f) => <li key={f} className="rounded-full border border-gray-300 px-2 py-0.5 text-xs">✓ {f}</li>)}
              </ul>
              {l.hotel && <AccessSummary hotel={l.hotel} compact />}
              {l.hotel?.bookingUrl && <BookOnMakeMyTrip url={l.hotel.bookingUrl} name={l.name} />}
              <p className="mt-3 text-xs text-gray-600">
                {l.auditDate ? `Audited ${l.auditDate}` : "Not audited yet"}
                {l.placeholder && " · placeholder data"}
              </p>
              <Link href="/check" className="mt-3 inline-block text-sm font-semibold text-brand underline">Check for my parent&apos;s chair</Link>
            </li>
          ))}
        </ul>
      )}

      {hotelCities.map((c) => <MakeMyTripCity key={c} city={c} />)}
    </main>
  );
}

export default function Places() {
  return (
    <Suspense fallback={<p className="p-4">Loading places…</p>}>
      <Explore />
    </Suspense>
  );
}

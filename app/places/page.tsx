"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import taxis from "@/data/taxis.json";
import { MakeMyTripCity } from "@/components/BookingLinks";
import { StayFields, useStay } from "@/components/StaySearch";
import TaxiCard from "@/components/TaxiCard";
import { Badge } from "@/components/ui";
import { hotelFit } from "@/lib/fitRule";
import { FEATURES, countBy, hotelListing, taxiListing, type Feature, type Listing } from "@/lib/listings";
import { useStore } from "@/lib/store";
import { formatDate, formatINR, nightsBetween, stayTotal, todayISO, validateStay } from "@/lib/trip";
import { profileStore, stayStore } from "@/lib/tripState";
import type { Hotel, Taxi, Verdict } from "@/lib/types";

const TAXI_LISTINGS = (taxis as Taxi[]).map(taxiListing);
const FIT_ORDER: Record<Verdict, number> = { fits: 0, help: 1, no: 2 };
type Sort = "fit" | "price-low" | "price-high";

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
  // The address bar is the single source of truth for the filters, so footer links, the home page,
  // the back button and shared links all behave the same way.
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const city = params.get("city") ?? "";
  const category = params.get("category") ?? "";
  const features = params.getAll("f").filter((f): f is Feature => (FEATURES as readonly string[]).includes(f));
  const searchRef = useRef<HTMLInputElement>(null);
  const [hotels, setHotels] = useState<Listing[]>([]);
  const [failed, setFailed] = useState(false);
  const profile = useStore(profileStore);
  const [stay, setStay] = useStay();
  const [editingDates, setEditingDates] = useState(false);
  const [dateProblems, setDateProblems] = useState<string[]>([]);
  const hasProfile = profile?.chairWidthCm != null;
  const sortParam = params.get("sort") as Sort | null;
  const sort: Sort = sortParam ?? (hasProfile ? "fit" : "price-low");

  function update(changes: { q?: string; city?: string; category?: string; features?: Feature[]; sort?: Sort }) {
    const p = new URLSearchParams(params.toString());
    const setOrClear = (key: string, value: string) => (value ? p.set(key, value) : p.delete(key));
    if (changes.q !== undefined) setOrClear("q", changes.q);
    if (changes.city !== undefined) setOrClear("city", changes.city);
    if (changes.category !== undefined) setOrClear("category", changes.category);
    if (changes.sort !== undefined) setOrClear("sort", changes.sort);
    if (changes.features) {
      p.delete("f");
      changes.features.forEach((f) => p.append("f", f));
    }
    const s = p.toString();
    router.replace(s ? `/places?${s}` : "/places", { scroll: false });
  }

  // When the address changes from outside the box (a footer link, the back button), show it in the box.
  useEffect(() => {
    if (searchRef.current && searchRef.current.value !== q) searchRef.current.value = q;
  }, [q]);

  useEffect(() => {
    fetch("/api/hotels")
      .then((r) => r.json())
      .then((d) => setHotels((d.hotels as Hotel[]).map(hotelListing)))
      .catch(() => setFailed(true));
  }, []);

  const all = useMemo(() => [...hotels, ...TAXI_LISTINGS], [hotels]);
  const cities = countBy(all, "city");
  const verdictOf = (l: Listing): Verdict | null => (hasProfile && l.hotel ? hotelFit(profile!, l.hotel).verdict : null);
  const priceOf = (l: Listing) => l.hotel?.ratePerNight ?? null;
  const shown = all
    .filter(
      (l) =>
        (!q.trim() || `${l.name} ${l.area} ${l.city} ${l.category}`.toLowerCase().includes(q.trim().toLowerCase())) &&
        (!city || l.city === city) &&
        (!category || l.category === category) &&
        features.every((f) => l.features.includes(f)),
    )
    .sort((a, b) => {
      // Hotels first, then the chosen order. Unknown prices and taxis go last.
      if (a.category !== b.category) return a.category === "Hotel" ? -1 : 1;
      if (sort === "fit") {
        const va = verdictOf(a), vb = verdictOf(b);
        const d = (va ? FIT_ORDER[va] : 3) - (vb ? FIT_ORDER[vb] : 3);
        if (d !== 0) return d;
      }
      const pa = priceOf(a), pb = priceOf(b);
      if (pa === null || pb === null) return pa === null ? (pb === null ? 0 : 1) : -1;
      return sort === "price-high" ? pb - pa : pa - pb;
    });
  // One MakeMyTrip link per city that has hotels in the current results (or all hotel cities if none match).
  const hotelCities = [...new Set((shown.some((l) => l.category === "Hotel") ? shown : all).filter((l) => l.category === "Hotel").map((l) => l.city))];
  const toggle = (f: Feature) => update({ features: features.includes(f) ? features.filter((x) => x !== f) : [...features, f] });
  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const here = `/places${params.toString() ? `?${params.toString()}` : ""}`;
  const title = category === "Hotel" ? `Accessible hotels${city ? ` in ${city}` : ""}` : category === "Taxi" ? `Wheelchair taxis${city ? ` in ${city}` : ""}` : `Hotels and taxis${city ? ` in ${city}` : ""}`;

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 py-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted">Every place is measured on site. Filter by what your parent needs.</p>
      </header>

      <section aria-label="Your stay" className="rounded-xl border border-gray-200 bg-tint p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold">
            {formatDate(stay.checkIn)} → {formatDate(stay.checkOut)} · {nights} night{nights === 1 ? "" : "s"} · {stay.guests} guest{stay.guests === 1 ? "" : "s"}
          </p>
          <button onClick={() => setEditingDates(!editingDates)} className="text-sm font-semibold text-brand underline" aria-expanded={editingDates}>
            {editingDates ? "Close" : "Change dates"}
          </button>
        </div>
        {editingDates && (
          <div className="mt-3 grid gap-3 sm:grid-cols-4 sm:items-end">
            <StayFields value={stay} onChange={setStay} idPrefix="pl" />
            <button
              onClick={() => {
                const p = validateStay(stay, todayISO());
                setDateProblems(p);
                if (!p.length) { stayStore.set(stay); setEditingDates(false); }
              }}
              className="rounded-full bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark"
            >
              Update
            </button>
            {dateProblems.length > 0 && <ul role="alert" className="list-disc rounded bg-red-50 p-3 pl-6 text-sm text-red-900 sm:col-span-4">{dateProblems.map((p) => <li key={p}>{p}</li>)}</ul>}
          </div>
        )}
      </section>

      {!hasProfile && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-dashed border-brand p-4">
          <p><span className="font-semibold">See which hotels fit your parent.</span> <span className="text-muted">Add the wheelchair width once and we&apos;ll mark every hotel.</span></p>
          <Link href={`/check?next=${encodeURIComponent(here)}`} className="rounded-full bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark">Add my parent&apos;s chair</Link>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <aside aria-label="Filters" className="space-y-4 lg:sticky lg:top-4 lg:h-fit">
          <div role="search">
            <label htmlFor="q" className="text-sm font-semibold">Search</label>
            <input
              id="q"
              ref={searchRef}
              defaultValue={q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="City, hotel or area"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900"
            />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Type">
            <span className="w-full text-sm font-semibold">Type</span>
            {["Hotel", "Taxi"].map((c) => <Chip key={c} on={category === c} onClick={() => update({ category: category === c ? "" : c })}>{c}s</Chip>)}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="City">
            <span className="w-full text-sm font-semibold">City</span>
            {cities.map(([c, n]) => <Chip key={c} on={city === c} onClick={() => update({ city: city === c ? "" : c })}>{c} ({n})</Chip>)}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Must have">
            <span className="w-full text-sm font-semibold">Must have</span>
            {FEATURES.map((f) => <Chip key={f} on={features.includes(f)} onClick={() => toggle(f)}>{f}</Chip>)}
          </div>
          {(q || city || category || features.length > 0) && (
            <Link href="/places" className="inline-block text-sm font-semibold text-brand underline">Clear all filters</Link>
          )}
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted" aria-live="polite">{shown.length} of {all.length} places · sample data, not real audits</p>
            <label className="text-sm font-semibold">Sort by{" "}
              <select value={sort} onChange={(e) => update({ sort: e.target.value as Sort })} className="ml-1 rounded-lg border border-gray-300 bg-white p-2 text-gray-900">
                {hasProfile && <option value="fit">Best fit for my parent</option>}
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>
          </div>
          {failed && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-900">Couldn&apos;t load the hotel list. Showing taxis only.</p>}

          {shown.length === 0 ? (
            <p className="rounded-lg border border-gray-200 bg-tint p-5">Nothing matches. Try removing a filter.</p>
          ) : (
            <ul className="space-y-4">
              {shown.map((l) => {
                if (l.taxi) return <li key={l.id}><TaxiCard taxi={l.taxi} /></li>;
                const verdict = verdictOf(l);
                const price = priceOf(l);
                const total = stayTotal(price, nights);
                return (
                  <li key={l.id} className="flex flex-wrap gap-4 rounded-xl border border-gray-200 bg-white p-4 text-gray-900 shadow-sm">
                    {l.hotel && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={l.hotel.photo} alt="" className="h-28 w-40 shrink-0 rounded-lg object-cover" />
                    )}
                    <div className="min-w-48 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h2 className="text-lg font-semibold">{l.name}</h2>
                          <p className="text-sm text-gray-600">{l.area === l.city ? l.city : `${l.area}, ${l.city}`} · {l.category}</p>
                        </div>
                        {verdict && <Badge verdict={verdict} />}
                      </div>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {l.features.length === 0 && <li className="text-xs text-gray-600">No step-free features recorded</li>}
                        {l.features.map((f) => <li key={f} className="rounded-full border border-gray-300 px-2 py-0.5 text-xs">✓ {f}</li>)}
                      </ul>
                      <p className="mt-2 text-xs text-gray-600">{l.auditDate ? `Audited ${l.auditDate}` : "Not audited yet"}{l.placeholder && " · sample data"}</p>
                    </div>
                    <div className="flex w-full flex-col items-end justify-between gap-2 sm:w-auto">
                      {l.category === "Hotel" && (
                        <>
                          <p className="text-right">
                            {price !== null ? <><span className="text-xl font-extrabold">{formatINR(price)}</span><span className="text-sm text-muted"> / night</span></> : <span className="text-sm text-muted">Price on request</span>}
                            {total !== null && <span className="block text-xs text-muted">{formatINR(total)} for {nights} night{nights === 1 ? "" : "s"} · sample</span>}
                          </p>
                          <Link href={`/hotels/${l.id}`} className="rounded-full bg-accent px-5 py-2.5 font-bold text-slate-900 hover:bg-accent-dark">View &amp; book</Link>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {hotelCities.map((c) => <MakeMyTripCity key={c} city={c} />)}
        </div>
      </div>
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

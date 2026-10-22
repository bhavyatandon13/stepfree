"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AccessSummary from "@/components/AccessSummary";
import { BookOnMakeMyTrip, NearbyOnMakeMyTrip } from "@/components/BookingLinks";
import { StayFields, useStay } from "@/components/StaySearch";
import { Badge, CheckTable, Reason, useExplanation, type Lang } from "@/components/ui";
import { citySlug } from "@/lib/cities";
import { hotelFit } from "@/lib/fitRule";
import { profileSummary } from "@/lib/profileSummary";
import { useStore } from "@/lib/store";
import { formatINR, nightsBetween, stayTotal, todayISO, validateStay } from "@/lib/trip";
import { profileStore, stayStore } from "@/lib/tripState";
import type { Hotel, Profile } from "@/lib/types";

function FitPanel({ hotel, profile, lang }: { hotel: Hotel; profile: Profile; lang: Lang }) {
  const result = hotelFit(profile, hotel);
  const reason = useExplanation(hotel.name, result, lang);
  return (
    <section aria-labelledby="fit" className="rounded-xl border border-gray-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="fit" className="text-xl font-bold">Does it fit your parent?</h2>
        <Badge verdict={result.verdict} />
      </div>
      <p className="mt-1 text-sm text-muted">For: {profileSummary(profile)} · <Link href={`/check?next=/hotels/${hotel.id}`} className="underline">change</Link></p>
      <Reason text={reason.text} byAI={reason.byAI} />
      <CheckTable checks={result.checks} />
    </section>
  );
}

export default function HotelDetail({ id }: { id: string }) {
  const router = useRouter();
  const profile = useStore(profileStore);
  const [stay, setStay] = useStay();
  const [hotel, setHotel] = useState<Hotel | null | undefined>(undefined); // undefined = loading, null = not found
  const [problems, setProblems] = useState<string[]>([]);
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    fetch("/api/hotels")
      .then((r) => r.json())
      .then((d) => setHotel((d.hotels as Hotel[]).find((h) => h.id === id) ?? null))
      .catch(() => setHotel(null));
  }, [id]);

  if (hotel === undefined) return <main className="mx-auto max-w-5xl p-4 py-10"><p>Loading hotel…</p></main>;
  if (hotel === null) {
    return (
      <main className="mx-auto max-w-5xl space-y-3 p-4 py-10">
        <h1 className="text-2xl font-bold">Hotel not found</h1>
        <p className="text-muted">It may have been removed. <Link href="/places?category=Hotel" className="underline">See all hotels</Link>.</p>
      </main>
    );
  }

  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const total = stayTotal(hotel.ratePerNight, nights);
  const [area, city] = hotel.area.split(",").map((s) => s.trim());

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="underline">Home</Link> › <Link href={`/city/${citySlug(city ?? "Delhi")}`} className="underline">{city ?? "Delhi"}</Link> › <span aria-current="page">{hotel.name}</span>
      </nav>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{hotel.name}</h1>
          <p className="text-muted">{area}, {city ?? "Delhi"} · audited {hotel.auditDate}</p>
          {hotel.isPlaceholder && <p className="mt-1 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">Sample hotel for the demo, not a real audit</p>}
        </div>
        <button onClick={() => setLang(lang === "en" ? "hi" : "en")} className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm" aria-label="Switch explanation language">
          {lang === "en" ? "हिन्दी" : "English"}
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hotel.photo} alt={hotel.photoCaption} className="max-h-80 w-full rounded-xl object-cover" />
            <figcaption className="mt-1 text-xs text-muted">{hotel.photoCaption} · audited {hotel.auditDate}</figcaption>
          </figure>

          {profile?.chairWidthCm != null ? (
            <FitPanel hotel={hotel} profile={profile} lang={lang} />
          ) : (
            <section className="rounded-xl border-2 border-dashed border-brand bg-tint p-5">
              <h2 className="text-xl font-bold">Will your parent&apos;s wheelchair fit?</h2>
              <p className="mt-1 text-muted">Add the chair width once and every hotel shows Fits, Fits with help or Doesn&apos;t fit, with the measurements behind it.</p>
              <Link href={`/check?next=/hotels/${hotel.id}`} className="mt-3 inline-block rounded-full bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark">
                Add my parent&apos;s chair
              </Link>
            </section>
          )}

          <div className="rounded-xl border border-gray-200 p-5">
            <AccessSummary hotel={hotel} chairWidthCm={profile?.chairWidthCm} compact />
          </div>

          <section aria-labelledby="policies" className="rounded-xl border border-gray-200 p-5 text-sm">
            <h2 id="policies" className="text-lg font-bold">Good to know</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
              <li>Room: accessible room with a step-free route from the entrance (sample).</li>
              <li>Payment: pay at the hotel. StepFree never asks for card details.</li>
              <li>Before you travel, phone the hotel to confirm the steps, ramp, lift and washroom door.</li>
            </ul>
          </section>
        </div>

        <aside aria-labelledby="reserve" className="h-fit space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-lg lg:sticky lg:top-4">
          <h2 id="reserve" className="text-lg font-bold">Reserve</h2>
          {typeof hotel.ratePerNight === "number" ? (
            <p><span className="text-2xl font-extrabold">{formatINR(hotel.ratePerNight)}</span> <span className="text-muted">/ night · sample price</span></p>
          ) : (
            <p className="text-muted">Price on request</p>
          )}
          <StayFields value={stay} onChange={setStay} idPrefix="hd" />
          {total !== null && (
            <p className="flex justify-between border-t border-gray-200 pt-3 font-semibold">
              <span>{nights} night{nights === 1 ? "" : "s"}</span><span>{formatINR(total)}</span>
            </p>
          )}
          {problems.length > 0 && <ul role="alert" className="list-disc rounded bg-red-50 p-3 pl-6 text-sm text-red-900">{problems.map((p) => <li key={p}>{p}</li>)}</ul>}
          <button
            onClick={() => {
              const p = validateStay(stay, todayISO());
              setProblems(p);
              if (p.length) return;
              stayStore.set(stay);
              router.push(`/book?hotel=${encodeURIComponent(hotel.id)}`);
            }}
            className="w-full rounded-full bg-accent px-6 py-3 font-bold text-slate-900 hover:bg-accent-dark"
          >
            Reserve
          </button>
          <p className="text-xs text-muted">You won&apos;t pay anything now. This is a demo booking request.</p>
          {hotel.bookingUrl && <BookOnMakeMyTrip url={hotel.bookingUrl} name={hotel.name} />}
          <NearbyOnMakeMyTrip hotel={hotel} />
        </aside>
      </div>
    </main>
  );
}

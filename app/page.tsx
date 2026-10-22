import Link from "next/link";
import { Suspense } from "react";
import hotels from "@/data/hotels.json";
import { Mark, Wordmark } from "@/components/Logo";
import StaySearch from "@/components/StaySearch";
import { accessFacts, passesChecklist } from "@/lib/accessFacts";
import { CITIES } from "@/lib/cities";
import { formatINR } from "@/lib/trip";
import type { Hotel } from "@/lib/types";

const HOTELS = hotels as Hotel[];
// Every city we have hotels or taxis for. Choosing one opens that city's page.
const CITY_NAMES = CITIES.map((c) => c.name);
const TOPS = ["border-t-brand", "border-t-accent", "border-t-pink-500"];
// Hotels with a step-free way in and a wheelchair-friendly washroom.
const FEATURED = HOTELS.filter(passesChecklist);

const STEPS = [
  { n: "1", title: "Tell us about the chair", body: "Type the wheelchair width and how many steps your parent can manage. It takes a minute." },
  { n: "2", title: "See what fits", body: "Every hotel shows Fits, Fits with help or Doesn't fit, with the measurements behind it." },
  { n: "3", title: "Book and relax", body: "Request your room, pay at the hotel, and arrive knowing there are no surprise stairs." },
];

const WHY = [
  { color: "border-t-brand", title: "Measured, not claimed", body: "A person with a tape measure checks steps, ramps, lifts and washroom doors on site." },
  { color: "border-t-accent", title: "Matched to your parent", body: "We compare every place with your parent's actual chair width, not a vague \"accessible\" label." },
  { color: "border-t-pink-500", title: "Clear answers", body: "The number measured, the number needed and a dated photo, in English or Hindi." },
];

export default function Home() {
  return (
    <main>
      <section className="hero bg-gradient-to-br from-brand-dark via-brand to-pink-600 text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
          <p className="flex items-center gap-3" aria-label="StepFree">
            <Mark size={52} tone="light" />
            <Wordmark tone="light" className="text-5xl sm:text-6xl" />
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            Hotels your parent&apos;s wheelchair can <span className="text-yellow-300">really</span> get into.
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-violet-50">Every hotel is measured on site and checked against your parent&apos;s chair before you book.</p>
          <div className="mt-8">
            {/* The search box reads today's date, so it renders in the browser. */}
            <Suspense fallback={<div className="h-44 rounded-2xl bg-white/20" aria-hidden />}>
              <StaySearch cities={CITY_NAMES} />
            </Suspense>
          </div>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-violet-50">
            <li>✓ Measured on site</li>
            <li>✓ Matched to your parent&apos;s chair</li>
            <li>✓ Pay at the hotel</li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="pick-city" className="mx-auto max-w-5xl px-4 py-14">
        <h2 id="pick-city" className="text-2xl font-bold sm:text-3xl">Choose your city</h2>
        <p className="mt-1 text-muted">One page per city with its hotels and wheelchair taxis.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {CITIES.map((c, i) => (
            <li key={c.slug}>
              <Link href={`/city/${c.slug}`} className={`block rounded-xl border border-gray-200 border-t-4 ${TOPS[i % TOPS.length]} bg-white p-5 shadow-sm hover:shadow-md`}>
                <span className="text-xl font-bold">{c.name}</span>
                <span className="mt-1 block text-sm text-muted">{c.hotels} hotel{c.hotels === 1 ? "" : "s"} · {c.taxis} taxi provider{c.taxis === 1 ? "" : "s"}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="how" className="scroll-mt-4 bg-tint">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-2xl font-bold sm:text-3xl">How it works</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-xl bg-white p-5 shadow-sm">
                <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-lg font-bold text-slate-900">{s.n}</span>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
          <Link href="/check" className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark">Start with my parent&apos;s chair</Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-bold sm:text-3xl">Hotels that pass the checklist</h2>
          <Link href="/city/delhi" className="font-semibold text-brand underline">See all of Delhi</Link>
        </div>
        <p className="mt-1 text-muted">A step-free way in and a wheelchair-friendly washroom. Sample hotels for this demo.</p>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2">
          {FEATURED.map((h) => {
            const facts = accessFacts(h).filter((f) => f.status === "yes").slice(0, 3);
            return (
              <li key={h.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={h.photo} alt="" className="h-40 w-full object-cover" />
                <div className="space-y-2 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">{h.name}</h3>
                      <p className="text-sm text-muted">{h.area}</p>
                    </div>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-900">✓ Passes checklist</span>
                  </div>
                  <ul className="space-y-0.5 text-sm">{facts.map((f) => <li key={f.key}>✓ {f.text}</li>)}</ul>
                  <div className="flex items-center justify-between pt-2">
                    <p>{typeof h.ratePerNight === "number" ? <><span className="text-xl font-extrabold">{formatINR(h.ratePerNight)}</span><span className="text-sm text-muted"> / night · sample</span></> : "Price on request"}</p>
                    <Link href={`/hotels/${h.id}`} className="rounded-full bg-accent px-5 py-2.5 font-bold text-slate-900 hover:bg-accent-dark">View &amp; book</Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bg-warm">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-2xl font-bold sm:text-3xl">Why families use StepFree</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3">
            {WHY.map((w) => (
              <li key={w.title} className={`rounded-xl border border-gray-200 border-t-4 ${w.color} bg-white p-5 shadow-sm`}>
                <h3 className="font-semibold text-brand">{w.title}</h3>
                <p className="mt-2 text-muted">{w.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="hero bg-gradient-to-br from-brand-dark via-brand to-pink-600 text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Planning a trip with your parent?</h2>
          <p className="mx-auto mt-2 max-w-xl text-violet-50">Add their wheelchair once and see in minutes which hotels they can enter.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/check" className="rounded-full bg-accent px-8 py-3 text-lg font-bold text-slate-900 shadow-lg hover:bg-accent-dark">Check my parent&apos;s chair</Link>
            <Link href="/submit" className="rounded-full border-2 border-white px-6 py-3 text-lg font-semibold text-white hover:bg-white/15">Suggest a hotel</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import hotels from "@/data/hotels.json";
import market from "@/data/market.json";
import { hotelFit } from "@/lib/fitRule";
import { countBy } from "@/lib/listings";
import { listings } from "@/lib/siteData";
import type { Hotel } from "@/lib/types";

// The numbers on this page come from the data and rules, so they can't drift from the app.
const criteria = hotelFit({ chairWidthCm: 66, maxSteps: 0, transferHelp: "none" }, hotels[0] as Hotel).checks.length;
const byCity = countBy(listings, "city");
const byCategory = countBy(listings, "category");
const STATS = [
  { value: listings.length, label: "sample listings" },
  { value: byCity.length, label: "cities" },
  { value: criteria, label: "measurements checked per hotel" },
];

const PILLARS = [
  { title: "We measure", body: "A person with a tape measure checks steps, ramps, lifts and doors on site. A label that says \"accessible\" tells you nothing." },
  { title: "We match", body: "You describe the wheelchair once. Every place is compared with that exact width, not with a generic idea of access." },
  { title: "We explain", body: "Each answer shows the number measured, the number needed and a dated photo, in English or Hindi." },
];

const STEPS = [
  { n: "1", title: "Describe your parent", body: "Type the chair width and what steps they can manage. Confirm the numbers we read." },
  { n: "2", title: "See what fits", body: "Every hotel and taxi shows Fits, Fits with help or Doesn't fit, with the measurements behind it." },
  { n: "3", title: "Book with confidence", body: "Choose a place that works, and skip the surprise stairs on arrival." },
];

const INVOLVED = [
  { href: "/volunteer", title: "Volunteer", body: "Measure places in your city, take photos and help us reach more neighbourhoods.", cta: "Join the team" },
  { href: "/submit", title: "Submit a place", body: "Know a hotel or taxi provider with good or bad access? Tell us and we will measure it.", cta: "Suggest a place" },
  { href: "/partner", title: "Partner with us", body: "Schools, businesses and groups can help with audits and awareness drives.", cta: "Start a conversation" },
];

const FILTER_CHIPS = ["Step-free entrance", "Ramp at entrance", "Lift", "Wide bathroom door"];

export default function Home() {
  return (
    <main>
      <section className="hero bg-gradient-to-br from-brand-dark via-brand to-blue-600 text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-200">Accessible trip planning for families</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Access, <span className="text-sky-200">measured.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-blue-50">
            Real measurements. Dated photos. Plain answers. Know before you book whether your parent&apos;s wheelchair can get in.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/places" className="rounded-full bg-white px-6 py-3 font-semibold text-brand hover:bg-blue-50">Explore places</Link>
            <Link href="/check" className="rounded-full border-2 border-white px-6 py-3 font-semibold text-white hover:bg-white/15">Check my parent&apos;s chair</Link>
            <Link href="/submit" className="rounded-full border-2 border-white px-6 py-3 font-semibold text-white hover:bg-white/15">Submit a place</Link>
          </div>
        </div>
      </section>

      <section aria-label="At a glance" className="border-y border-gray-200">
        <dl className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="text-3xl font-bold text-brand">{s.value}</span>
                <span className="ml-2 text-muted">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mx-auto max-w-5xl px-4 pb-6 text-xs text-muted">Sample data for this demo. None of it is a real audit yet.</p>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Our approach</p>
        <h2 className="mt-1 text-2xl font-bold">What makes Stepfree different</h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <li key={p.title} className="rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-brand">{p.title}</h3>
              <p className="mt-2 text-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-tint">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-bold">Find accessible places</h2>
          <p className="mt-1 text-muted">Search by city, place name or type.</p>
          <form action="/places" method="get" role="search" className="mt-4 flex flex-wrap gap-2">
            <label htmlFor="home-q" className="sr-only">Search places</label>
            <input id="home-q" name="q" placeholder="Search a city, a hotel or a taxi provider" className="min-w-60 flex-1 rounded-lg border border-gray-300 bg-white p-3 text-gray-900" />
            <button className="rounded-full bg-brand px-6 py-3 font-semibold text-white">Search</button>
          </form>
          <p className="mt-4 text-sm font-semibold">Popular cities</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {byCity.slice(0, 4).map(([c]) => (
              <li key={c}><Link href={`/places?city=${encodeURIComponent(c)}`} className="inline-block rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 hover:bg-white">{c}</Link></li>
            ))}
          </ul>
          <p className="mt-4 text-sm font-semibold">Features</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {FILTER_CHIPS.map((f) => (
              <li key={f} className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900">✓ {f}</li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-muted">You can filter by these on the Explore page.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-bold">Browse by city</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {byCity.map(([c, n]) => (
            <li key={c}>
              <Link href={`/places?city=${encodeURIComponent(c)}`} className="block rounded-lg border border-gray-200 p-4 hover:border-brand">
                <span className="font-semibold">{c}</span>
                <span className="block text-sm text-muted">{n} sample listing{n === 1 ? "" : "s"}</span>
              </Link>
            </li>
          ))}
        </ul>
        <h2 className="mt-12 text-2xl font-bold">Browse by type</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {byCategory.map(([c, n]) => (
            <li key={c}>
              <Link href={`/places?category=${encodeURIComponent(c)}`} className="block rounded-lg border border-gray-200 p-4 hover:border-brand">
                <span className="font-semibold">{c}s</span>
                <span className="block text-sm text-muted">{n} sample listing{n === 1 ? "" : "s"}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="how" className="bg-tint">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Process</p>
          <h2 className="mt-1 text-2xl font-bold">How it works</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-lg bg-white p-5 shadow-sm">
                <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-bold text-white">{s.n}</span>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Why it matters</p>
        <h2 className="mt-1 text-2xl font-bold">The need is real</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {market.facts.slice(0, 3).map((f) => (
            <li key={f.what} className="rounded-lg border border-gray-200 p-4">
              <p className="text-2xl font-bold text-brand">{f.figure}</p>
              <p className="text-sm">{f.what}</p>
              <p className="mt-1 text-xs text-muted">Source: {f.source}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">{market.caveat} <Link href="/market" className="underline">See all figures</Link>.</p>
      </section>

      <section className="bg-tint">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">Events and campaigns</p>
            <h2 className="mt-1 text-2xl font-bold">What&apos;s happening</h2>
            <p className="mt-2 text-muted">No events are scheduled yet. We would rather show nothing than invent dates.</p>
            <Link href="/events" className="mt-3 inline-block font-semibold text-brand underline">See what we plan</Link>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">Built for everyone</p>
            <h2 className="mt-1 text-2xl font-bold">Usable by all</h2>
            <p className="mt-2 text-muted">Text size and high contrast controls are at the top of every page, and the whole site works with a keyboard.</p>
            <Link href="/accessibility" className="mt-3 inline-block font-semibold text-brand underline">Read our accessibility commitment</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Get involved</p>
        <h2 className="mt-1 text-2xl font-bold">Help us build a Stepfree India</h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
          {INVOLVED.map((i) => (
            <li key={i.href} className="rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-brand">{i.title}</h3>
              <p className="mt-2 text-muted">{i.body}</p>
              <Link href={i.href} className="mt-3 inline-block font-semibold underline">{i.cta}</Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

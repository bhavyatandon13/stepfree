import Link from "next/link";
import hotels from "@/data/hotels.json";
import taxis from "@/data/taxis.json";
import { hotelFit } from "@/lib/fitRule";
import type { Hotel } from "@/lib/types";

// The numbers on this page come from the data and rules, so they can't drift from the app.
const sample = hotelFit({ chairWidthCm: 66, maxSteps: 0, transferHelp: "none" }, hotels[0] as Hotel);
const STATS = [
  { value: hotels.length, label: "sample hotels in Delhi" },
  { value: new Set(taxis.map((t) => t.city)).size, label: "cities with wheelchair taxis listed" },
  { value: sample.checks.length, label: "measurements checked per hotel" },
];

const PILLARS = [
  { title: "Measured, not claimed", body: "A person with a tape measure checks steps, ramps, lifts and doors on site. A label that says \"accessible\" tells you nothing." },
  { title: "Matched to your parent", body: "You describe the wheelchair once. Every place is compared with that exact width, not with a generic idea of access." },
  { title: "Explained in plain words", body: "Each answer shows the number measured, the number needed and a dated photo, in English or Hindi." },
];

const STEPS = [
  { n: "1", title: "Describe your parent", body: "Type the chair width and what steps they can manage. Confirm the numbers we read." },
  { n: "2", title: "See what fits", body: "Every hotel and taxi shows Fits, Fits with help or Doesn't fit, with the measurements behind it." },
  { n: "3", title: "Book with confidence", body: "Choose a place that works, and skip the surprise stairs on arrival." },
];

export default function Home() {
  return (
    <main>
      <section className="bg-tint">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Accessible trip planning for families</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Know before you book whether the wheelchair can get in.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Stepfree checks hotels and taxis against your parent&apos;s real wheelchair, using measurements taken on site.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/check" className="rounded-full bg-accent px-6 py-3 font-semibold text-gray-900 hover:brightness-95">
              Check a place
            </Link>
            <Link href="/#how" className="rounded-full border border-brand px-6 py-3 font-semibold text-brand hover:bg-white">
              How it works
            </Link>
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
        <h2 className="text-2xl font-bold">What makes it different</h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <li key={p.title} className="rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-brand">{p.title}</h3>
              <p className="mt-2 text-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="how" className="bg-tint">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-bold">How it works</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-lg bg-white p-5 shadow-sm">
                <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-bold text-white">{s.n}</span>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
          <Link href="/check" className="mt-8 inline-block rounded-full bg-accent px-6 py-3 font-semibold text-gray-900 hover:brightness-95">
            Try it with your parent&apos;s chair
          </Link>
        </div>
      </section>
    </main>
  );
}

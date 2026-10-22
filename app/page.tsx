import Link from "next/link";
import { Suspense } from "react";
import market from "@/data/market.json";
import FeaturedHotels from "@/components/FeaturedHotels";
import HeroArt from "@/components/HeroArt";
import { Mark, Wordmark } from "@/components/Logo";
import StaySearch from "@/components/StaySearch";
import { CITIES } from "@/lib/cities";

// Every city we have hotels or taxis for. Choosing one opens that city's page.
const CITY_NAMES = CITIES.map((c) => c.name);
const TOPS = ["border-t-brand", "border-t-accent", "border-t-pink-500"];

const STEPS = [
  { icon: "🦽", title: "Tell us about the chair", body: "Type the wheelchair width and how many steps your parent can manage. It takes a minute." },
  { icon: "✅", title: "See what fits", body: "Every hotel and taxi says Fits, Fits with help or Doesn't fit, with the measurements behind it." },
  { icon: "🎉", title: "Book and relax", body: "Request your room and a wheelchair taxi, pay at the hotel, and arrive with no surprise stairs." },
];

const TRUST = [
  { icon: "📏", title: "Measured on site", body: "A StepFree auditor visits with a tape measure: entrance steps, ramp, lift door and depth, washroom and room doors." },
  { icon: "📸", title: "Live, time-stamped photos", body: "Every photo is stamped with the date and time it was taken. Photos older than 30 minutes are refused, so an old picture can't pass as today's." },
  { icon: "🦽", title: "Checked against your chair", body: "We only say a hotel or taxi fits after comparing it with your parent's actual chair width." },
  { icon: "⭐", title: "Guests confirm it", body: "Families add their own live photos after a stay, and say whether it really worked for their wheelchair." },
];

const WHY = [
  { icon: "📏", color: "border-t-brand", title: "Measured, not claimed", body: "A person with a tape measure checks steps, ramps, lifts and washroom doors on site." },
  { icon: "🎯", color: "border-t-accent", title: "Matched to your parent", body: "Every place is compared with your parent's actual chair width, not a vague \"accessible\" label." },
  { icon: "💬", color: "border-t-pink-500", title: "Clear answers", body: "The number measured, the number needed and a dated photo, in English or Hindi." },
];

export default function Home() {
  return (
    <main>
      <section className="hero relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-pink-600 text-white">
        {/* soft floating blobs behind the content */}
        <div aria-hidden className="float-slow absolute -left-16 -top-16 h-64 w-64 rounded-full bg-pink-400/30 blur-3xl" />
        <div aria-hidden className="float absolute -bottom-20 right-10 h-72 w-72 rounded-full bg-yellow-300/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-5xl gap-8 px-4 py-14 sm:py-16 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <p className="rise inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold">♿ Made for wheelchair users and their families</p>
            <p className="rise rise-1 mt-5 flex items-center gap-3" aria-label="StepFree">
              <Mark size={52} tone="light" />
              <Wordmark tone="light" className="text-5xl sm:text-6xl" />
            </p>
            <h1 className="rise rise-2 mt-5 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
              Hotels your parent&apos;s wheelchair can <span className="text-yellow-300">really</span> get into.
            </h1>
            <p className="rise rise-3 mt-3 max-w-2xl text-lg text-violet-50">Measured on site. Matched to your parent&apos;s chair. Taxis too.</p>
          </div>
          <HeroArt className="rise rise-2 mx-auto w-full max-w-sm drop-shadow-xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-14">
          {/* The search box reads today's date, so it renders in the browser. */}
          <Suspense fallback={<div className="h-44 rounded-2xl bg-white/20" aria-hidden />}>
            <StaySearch cities={CITY_NAMES} />
          </Suspense>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-violet-50">
            <li>📏 Measured on site</li>
            <li>🎯 Matched to your parent&apos;s chair</li>
            <li>🚕 Wheelchair taxis</li>
            <li>💳 Pay at the hotel</li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="pick-city" className="reveal mx-auto max-w-5xl px-4 py-14">
        <h2 id="pick-city" className="text-2xl font-bold sm:text-3xl">Where are you going? <span aria-hidden>🧳</span></h2>
        <p className="mt-1 text-muted">Pick a city to see its hotels and wheelchair taxis on one page.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {CITIES.map((c, i) => (
            <li key={c.slug}>
              <Link href={`/city/${c.slug}`} className={`lift wiggle-parent flex items-center gap-4 rounded-2xl border border-gray-200 border-t-4 ${TOPS[i % TOPS.length]} bg-white p-5 shadow-sm`}>
                <span aria-hidden className="wiggle text-4xl">{c.emoji}</span>
                <span>
                  <span className="block text-xl font-bold">{c.name}</span>
                  <span className="block text-sm text-muted">{c.hotels} hotel{c.hotels === 1 ? "" : "s"} · {c.taxis} taxi{c.taxis === 1 ? "" : "s"}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="how" className="reveal scroll-mt-4 bg-tint">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-2xl font-bold sm:text-3xl">How it works</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="lift relative rounded-2xl bg-white p-6 shadow-sm">
                <span className="absolute right-4 top-3 text-5xl font-extrabold text-violet-100" aria-hidden>{i + 1}</span>
                <span aria-hidden className="relative block text-5xl">{s.icon}</span>
                <h3 className="relative mt-3 text-lg font-semibold"><span className="sr-only">Step {i + 1}: </span>{s.title}</h3>
                <p className="relative mt-1 text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
          <Link href="/check" className="lift mt-6 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark">Start with my parent&apos;s chair →</Link>
        </div>
      </section>

      <section className="reveal mx-auto max-w-5xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-bold sm:text-3xl">Hotels that fit your parent <span aria-hidden>🏨</span></h2>
          <Link href="/cities" className="font-semibold text-brand underline">See every city</Link>
        </div>
        <FeaturedHotels />
      </section>

      <section aria-labelledby="real" className="reveal bg-tint">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 id="real" className="text-2xl font-bold sm:text-3xl">How we keep it real <span aria-hidden>🔍</span></h2>
          <p className="mt-1 max-w-3xl text-muted">
            A website saying &ldquo;wheelchair friendly&rdquo; isn&apos;t proof. Families arrive to find a step, a lift too small for the chair, or a washroom door
            it can&apos;t get through. StepFree only trusts what can be checked.
          </p>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((t, i) => (
              <li key={t.title} className="lift rounded-2xl bg-white p-6 shadow-sm">
                <span aria-hidden className="text-4xl">{t.icon}</span>
                <h3 className="mt-2 font-semibold"><span className="sr-only">{i + 1}. </span>{t.title}</h3>
                <p className="mt-1 text-sm text-muted">{t.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted">
            What we check: a <strong>step-free way in</strong> (no steps, or a ramp), <strong>doors and lifts at least as wide as the chair</strong>, a lift deep
            enough to hold it, room to turn, and a <strong>washroom the chair can get into</strong>.
          </p>
        </div>
      </section>

      <section className="reveal bg-warm">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-2xl font-bold sm:text-3xl">Why families use StepFree</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3">
            {WHY.map((w) => (
              <li key={w.title} className={`lift rounded-2xl border border-gray-200 border-t-4 ${w.color} bg-white p-6 shadow-sm`}>
                <span aria-hidden className="text-4xl">{w.icon}</span>
                <h3 className="mt-2 font-semibold text-brand">{w.title}</h3>
                <p className="mt-2 text-muted">{w.body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {market.facts.slice(0, 2).map((f) => (
              <p key={f.what} className="rounded-2xl bg-white p-5 shadow-sm">
                <span className="block text-sm font-semibold text-pink-700">Did you know? 💡</span>
                <span className="mt-1 block text-3xl font-extrabold text-brand">{f.figure}</span>
                <span className="block">{f.what}</span>
                <span className="mt-1 block text-xs text-muted">Source: {f.source} (unverified search snippet)</span>
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="hero relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-pink-600 text-white">
        <div aria-hidden className="float absolute -right-10 -top-10 h-48 w-48 rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-14 text-center">
          <p aria-hidden className="text-5xl">🧳 ♿ 🚕</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Planning a trip with your parent?</h2>
          <p className="mx-auto mt-2 max-w-xl text-violet-50">Add their wheelchair once and see in minutes which hotels and taxis work.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/check" className="lift rounded-full bg-accent px-8 py-3 text-lg font-bold text-slate-900 shadow-lg hover:bg-accent-dark">Check my parent&apos;s chair</Link>
            <Link href="/submit" className="rounded-full border-2 border-white px-6 py-3 text-lg font-semibold text-white hover:bg-white/15">Suggest a hotel</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

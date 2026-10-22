"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useSyncExternalStore } from "react";
import Confetti from "@/components/Confetti";
import { Badge } from "@/components/ui";
import { getServerSnapshot, getSnapshot, setPrefs, subscribe } from "@/lib/prefs";
import { useStore } from "@/lib/store";
import { formatDate, formatINR, type Booking } from "@/lib/trip";
import { cancelTrip, persistTripsNow, tripsStore } from "@/lib/tripState";

function TripCard({ t, highlight }: { t: Booking; highlight: boolean }) {
  const [asking, setAsking] = useState(false);
  const cancelled = t.status === "cancelled";
  return (
    <li className={`rounded-xl border p-5 ${highlight ? "border-green-400 ring-2 ring-green-300" : "border-gray-200"} ${cancelled ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Reference {t.ref}</p>
          <h2 className="text-lg font-bold">{t.hotelName}</h2>
          <p className="text-sm text-muted">{t.area}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${cancelled ? "bg-gray-200 text-gray-800" : "bg-green-100 text-green-900"}`}>
          {cancelled ? "Cancelled" : "Requested"}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-muted">Dates</dt><dd>{formatDate(t.checkIn)} to {formatDate(t.checkOut)} ({t.nights} night{t.nights === 1 ? "" : "s"})</dd>
        <dt className="text-muted">Guests</dt><dd>{t.guests} · lead guest {t.guestName}</dd>
        <dt className="text-muted">Total</dt><dd>{t.total !== null ? `${formatINR(t.total)}, pay at hotel (sample price)` : "Price on request"}</dd>
        {t.parent && <><dt className="text-muted">Parent</dt><dd>{t.parent}</dd></>}
        {t.taxi && <><dt className="text-muted">Taxi</dt><dd>🚕 {t.taxi.provider}{t.taxi.fare !== null ? ` · ${formatINR(t.taxi.fare)} sample fare, pay the driver` : ""} · {t.taxi.answer}</dd></>}
      </dl>
      {t.verdict && <div className="mt-2"><Badge verdict={t.verdict} /></div>}
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link href={`/hotels/${t.hotelId}`} className="rounded-full border border-brand px-4 py-2 font-semibold text-brand">View hotel</Link>
        {!cancelled && !asking && <button onClick={() => setAsking(true)} className="rounded-full border border-red-300 px-4 py-2 font-semibold text-red-800">Cancel request</button>}
        {asking && (
          <span className="flex flex-wrap items-center gap-2">
            Cancel this request?
            <button onClick={() => { cancelTrip(t.ref); setAsking(false); }} className="rounded-full bg-red-700 px-4 py-2 font-semibold text-white">Yes, cancel</button>
            <button onClick={() => setAsking(false)} className="rounded-full border border-gray-300 px-4 py-2 font-semibold">Keep it</button>
          </span>
        )}
      </div>
    </li>
  );
}

function Trips() {
  const ref = useSearchParams().get("ref");
  const trips = useStore(tripsStore);
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const fresh = trips.find((t) => t.ref === ref);
  const saved = prefs.consent === "agree";

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 py-10">
      {fresh && <Confetti />}
      {fresh && (
        <section role="status" className="rise rounded-2xl bg-green-50 p-6 text-green-950">
          <p aria-hidden className="text-5xl">🎉</p>
          <p className="mt-2 text-2xl font-bold">You&apos;re all set! Booking request confirmed</p>
          <p className="mt-1">Reference <strong>{fresh.ref}</strong> for {fresh.hotelName}, {formatDate(fresh.checkIn)}.</p>
          <h2 className="mt-4 font-semibold">What to do next</h2>
          <ol className="mt-1 list-decimal space-y-1 pl-5">
            <li>Phone the hotel and quote your reference.</li>
            <li>Ask them to confirm the entrance steps or ramp, the lift, and the washroom door width.</li>
            <li>Pay at the hotel when you arrive. Nothing has been charged.</li>
          </ol>
          <p className="mt-3 text-sm">Demo: this request was not sent to any hotel.</p>
        </section>
      )}

      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold">My trips</h1>
        <button onClick={() => window.print()} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold">Print</button>
      </header>

      {trips.length > 0 && !saved && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <p>Your trips are only kept until you refresh this page, because you haven&apos;t agreed to storage on this device.</p>
          <button onClick={() => { setPrefs({ consent: "agree" }); persistTripsNow(); }} className="mt-2 rounded-full bg-brand px-4 py-2 font-semibold text-white">Keep my trips on this device</button>
        </div>
      )}

      {trips.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-tint p-6">
          <p aria-hidden className="text-4xl">🧳</p>
          <p className="mt-2 font-semibold">No trips yet.</p>
          <p className="text-muted">Find a hotel that fits your parent&apos;s wheelchair and request a booking.</p>
          <Link href="/places?category=Hotel" className="mt-3 inline-block rounded-full bg-accent px-5 py-2.5 font-bold text-slate-900">Find a hotel</Link>
        </div>
      ) : (
        <ul className="space-y-4">{trips.map((t) => <TripCard key={t.ref} t={t} highlight={t.ref === ref} />)}</ul>
      )}
    </main>
  );
}

export default function TripsPage() {
  return (
    <Suspense fallback={<p className="p-4">Loading…</p>}>
      <Trips />
    </Suspense>
  );
}

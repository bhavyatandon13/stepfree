import Link from "next/link";
import { CITIES } from "@/lib/cities";

const TOPS = ["border-t-brand", "border-t-accent", "border-t-pink-500"];

export default function Cities() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 py-10">
      <header>
        <h1 className="text-3xl font-bold">Choose your city</h1>
        <p className="text-muted">Each city page has its hotels and wheelchair taxis, checked against your parent&apos;s chair.</p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-3">
        {CITIES.map((c, i) => (
          <li key={c.slug}>
            <Link href={`/city/${c.slug}`} className={`lift wiggle-parent block rounded-2xl border border-gray-200 border-t-4 ${TOPS[i % TOPS.length]} bg-white p-5 shadow-sm`}>
              <span aria-hidden className="wiggle text-4xl">{c.emoji}</span>
              <span className="mt-2 block text-xl font-bold">{c.name}</span>
              <span className="mt-1 block text-sm text-muted">
                {c.hotels} hotel{c.hotels === 1 ? "" : "s"} · {c.taxis} taxi provider{c.taxis === 1 ? "" : "s"}
              </span>
              <span className="mt-3 inline-block font-semibold text-brand">Open {c.name} →</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">All listings are sample data for this demo. Don&apos;t see your city? <Link href="/submit" className="underline">Suggest a place</Link>.</p>
    </main>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4 py-16 text-center">
      <p aria-hidden className="text-6xl">🧭</p>
      <h1 className="text-3xl font-bold">We couldn&apos;t find that page</h1>
      <p className="text-muted">The link may be old or mistyped. Here are some good places to start.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark">Go to the home page</Link>
        <Link href="/cities" className="rounded-full border-2 border-brand px-6 py-3 font-semibold text-brand">Choose a city</Link>
      </div>
    </main>
  );
}

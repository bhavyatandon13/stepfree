import market from "@/data/market.json";

export default function MarketPanel() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Why accessible travel matters</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {market.facts.map((f) => (
          <li key={f.what} className="rounded-lg border border-gray-300 bg-white p-4 text-gray-900">
            <p className="text-2xl font-bold">{f.figure}</p>
            <p className="text-sm">{f.what}</p>
            <p className="mt-1 text-xs text-gray-600">Source: {f.source}</p>
          </li>
        ))}
      </ul>
      <section className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        <h3 className="font-semibold">Still needs research</h3>
        <ul className="list-disc pl-5">
          {market.gaps.map((g) => <li key={g}>{g}</li>)}
        </ul>
      </section>
      <p className="text-xs text-gray-600 dark:text-gray-400">{market.caveat}</p>
    </div>
  );
}

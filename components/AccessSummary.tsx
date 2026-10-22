import { accessFacts, type FactStatus } from "@/lib/accessFacts";
import type { Hotel } from "@/lib/types";

const MARK: Record<FactStatus, { symbol: string; word: string; cls: string }> = {
  yes: { symbol: "✓", word: "Yes", cls: "text-green-800" },
  no: { symbol: "✕", word: "No", cls: "text-red-800" },
  unknown: { symbol: "?", word: "Not recorded", cls: "text-gray-600" },
};

// The whole story in words, one line per thing a wheelchair user cares about.
export default function AccessSummary({ hotel, compact = false }: { hotel: Hotel; compact?: boolean }) {
  const facts = accessFacts(hotel);
  return (
    <section aria-label={`Accessibility summary for ${hotel.name}`} className={compact ? "mt-3" : "mt-3 rounded-lg border border-gray-200 bg-tint p-3"}>
      <h4 className="text-sm font-semibold">Accessibility at a glance</h4>
      <ul className="mt-1 space-y-0.5 text-sm">
        {facts.map((f) => (
          <li key={f.key} className="flex gap-2">
            <span aria-hidden className={`w-4 shrink-0 font-bold ${MARK[f.status].cls}`}>{MARK[f.status].symbol}</span>
            <span><span className="sr-only">{f.label}, {MARK[f.status].word}: </span>{f.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

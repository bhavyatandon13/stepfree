import { TYPICAL_CHAIR_CM, accessFacts, type FactStatus } from "@/lib/accessFacts";
import type { Hotel } from "@/lib/types";

const MARK: Record<FactStatus, { symbol: string; word: string; cls: string }> = {
  yes: { symbol: "✓", word: "Yes", cls: "text-green-800" },
  tight: { symbol: "≈", word: "Tight", cls: "text-amber-700" },
  no: { symbol: "✕", word: "No", cls: "text-red-800" },
  unknown: { symbol: "?", word: "Not recorded", cls: "text-gray-600" },
};

// The whole story in words, one line per thing a wheelchair user cares about.
export default function AccessSummary({ hotel, compact = false, chairWidthCm }: { hotel: Hotel; compact?: boolean; chairWidthCm?: number | null }) {
  const width = chairWidthCm ?? TYPICAL_CHAIR_CM;
  const facts = accessFacts(hotel, width);
  return (
    <section aria-label={`Accessibility summary for ${hotel.name}`} className={compact ? "mt-3" : "mt-3 rounded-lg border border-gray-200 bg-tint p-3"}>
      <h4 className="text-sm font-semibold">Accessibility at a glance</h4>
      <p className="text-xs text-muted">{chairWidthCm ? `Sizes judged for your parent's ${width} cm chair.` : `Sizes judged for a typical ${width} cm chair.`} A door fits if it is at least as wide as the chair. ≈ means a lift or turning space is tight.</p>
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

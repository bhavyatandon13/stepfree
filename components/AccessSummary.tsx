import Link from "next/link";
import { accessFacts, type FactStatus } from "@/lib/accessFacts";
import type { Hotel } from "@/lib/types";

const MARK: Record<FactStatus, { symbol: string; word: string; cls: string }> = {
  yes: { symbol: "✓", word: "Yes", cls: "text-green-800" },
  tight: { symbol: "≈", word: "Tight", cls: "text-amber-700" },
  no: { symbol: "✕", word: "No", cls: "text-red-800" },
  unknown: { symbol: "?", word: "Not recorded", cls: "text-gray-600" },
  info: { symbol: "•", word: "Measured", cls: "text-gray-700" },
};

const ICON: Record<string, string> = { washroom: "🚻", stairs: "🪜", ramp: "♿", lift: "🛗", roomDoor: "🚪", turning: "🔄", lend: "🦽" };

// The whole story in words, one line per thing a wheelchair user cares about.
// Without the parent's chair it only lists measurements; it never calls a size a fit untested.
export default function AccessSummary({ hotel, compact = false, chairWidthCm }: { hotel: Hotel; compact?: boolean; chairWidthCm?: number | null }) {
  const width = chairWidthCm ?? null;
  const facts = accessFacts(hotel, width);
  return (
    <section aria-label={`Accessibility summary for ${hotel.name}`} className={compact ? "mt-3" : "mt-3 rounded-lg border border-gray-200 bg-tint p-3"}>
      <h4 className="text-sm font-semibold">Accessibility at a glance</h4>
      <p className="text-xs text-muted">
        {width !== null ? (
          <>Judged for your parent&apos;s {width} cm chair. A door fits if it is at least as wide as the chair. ≈ means a lift or turning space is tight.</>
        ) : (
          <>Measurements only. <Link href={`/check?next=/hotels/${hotel.id}`} className="font-semibold text-brand underline">Add your parent&apos;s chair</Link> to see whether each one fits.</>
        )}
      </p>
      <ul className="mt-1 space-y-0.5 text-sm">
        {facts.map((f) => (
          <li key={f.key} className="flex gap-2">
            <span aria-hidden className={`w-4 shrink-0 font-bold ${MARK[f.status].cls}`}>{MARK[f.status].symbol}</span>
            <span aria-hidden className="w-6 shrink-0 text-center">{ICON[f.key] ?? ""}</span>
            <span><span className="sr-only">{f.label}, {MARK[f.status].word}: </span>{f.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

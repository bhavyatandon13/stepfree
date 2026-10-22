"use client";
import { useEffect, useState } from "react";
import { VERDICT_LABEL, basicReason } from "@/lib/fitRule";
import type { Check, FitResult, Verdict } from "@/lib/types";

export type Lang = "en" | "hi";

const BADGE: Record<Verdict, string> = {
  fits: "bg-green-100 text-green-900 border-green-300",
  help: "bg-amber-100 text-amber-900 border-amber-300",
  no: "bg-red-100 text-red-900 border-red-300",
};
const ICON: Record<Verdict, string> = { fits: "✓", help: "!", no: "✕" };

export function Badge({ verdict }: { verdict: Verdict }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold ${BADGE[verdict]}`}>
      <span aria-hidden>{ICON[verdict]}</span>
      {VERDICT_LABEL[verdict]}
    </span>
  );
}

export function CheckTable({ checks }: { checks: Check[] }) {
  if (checks.length === 0) return null;
  const mark = { ok: "✓", fail: "✕", unknown: "?" } as const;
  return (
    <table className="mt-3 w-full text-left text-sm">
      <thead>
        <tr className="text-gray-600">
          <th className="py-1 pr-2 font-medium">Item</th>
          <th className="py-1 pr-2 font-medium">Measured</th>
          <th className="py-1 font-medium">Needs</th>
        </tr>
      </thead>
      <tbody>
        {checks.map((c) => (
          <tr key={c.key} className="border-t border-gray-200">
            <td className="py-1 pr-2">
              <span className="mr-1" aria-label={c.status}>{mark[c.status]}</span>
              {c.label}
            </td>
            <td className="py-1 pr-2">{c.measured}</td>
            <td className="py-1">{c.required}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Shows the plain-code reason at once, then swaps in Claude's wording when it arrives.
export function useExplanation(name: string, result: FitResult, lang: Lang) {
  const fallback = basicReason(result);
  const key = JSON.stringify([name, result, lang]);
  // The answer is stored with the inputs it was written for, so a stale answer is never shown.
  const [answer, setAnswer] = useState<{ key: string; text: string } | null>(null);
  const text = answer?.key === key ? answer.text : null;

  useEffect(() => {
    if (result.checks.length === 0) return;
    let live = true;
    fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, verdict: result.verdict, checks: result.checks, lang }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => live && d?.text && setAnswer({ key, text: d.text }))
      .catch(() => {});
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const note = lang === "hi" && text === null ? " (Hindi isn't available right now, so this is in English.)" : "";
  return { text: text ?? fallback + note, byAI: text !== null };
}

// Tells the reader who wrote the sentence, so AI wording is never mistaken for a measurement.
export function Reason({ text, byAI }: { text: string; byAI: boolean }) {
  return (
    <>
      <p className="mt-2">{text}</p>
      <p className="text-xs text-gray-600">
        {byAI ? "Wording by Claude. The badge and table come from the measurements." : "Written by the rule from the measurements (no AI)."}
      </p>
    </>
  );
}

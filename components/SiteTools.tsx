"use client";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { SIZES, getServerSnapshot, getSnapshot, initPrefs, setPrefs, subscribe } from "@/lib/prefs";

function usePrefs() {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => initPrefs(), []);
  return prefs;
}

// Text size and high contrast, available on every page.
export function AccessibilityToolbar() {
  const p = usePrefs();
  const i = SIZES.indexOf(p.size);
  const btn = "rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold hover:bg-tint disabled:opacity-40";
  return (
    <div className="border-b border-gray-200 bg-tint">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-end gap-2 px-4 py-1.5 text-xs text-muted" role="group" aria-label="Display settings">
        <span>Text size</span>
        <button className={btn} onClick={() => setPrefs({ size: SIZES[Math.max(0, i - 1)] })} disabled={i <= 0} aria-label="Smaller text">A−</button>
        <button className={btn} onClick={() => setPrefs({ size: 100 })} aria-label="Normal text size">A</button>
        <button className={btn} onClick={() => setPrefs({ size: SIZES[Math.min(SIZES.length - 1, i + 1)] })} disabled={i >= SIZES.length - 1} aria-label="Larger text">A+</button>
        <button className={btn} onClick={() => setPrefs({ contrast: !p.contrast })} aria-pressed={p.contrast}>High contrast</button>
      </div>
    </div>
  );
}

// Asks once whether we may remember display settings. No trackers either way.
export function ConsentBanner() {
  const p = usePrefs();
  if (!p.loaded || p.consent !== "unset") return null;
  return (
    <div role="dialog" aria-label="Storage choice" className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-300 bg-white p-4 shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4">
        <p className="min-w-60 flex-1 text-sm">
          StepFree has no trackers or adverts. If you agree, we remember your text size and contrast choice in this browser. If you disagree, we remember only this choice. Read the{" "}
          <Link href="/terms" className="underline">terms</Link> and <Link href="/privacy" className="underline">privacy notice</Link>.
        </p>
        <div className="flex gap-2">
          <button onClick={() => setPrefs({ consent: "disagree" })} className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand">Disagree</button>
          <button onClick={() => setPrefs({ consent: "agree" })} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">Agree</button>
        </div>
      </div>
    </div>
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label="Back to top"
      className="fixed bottom-20 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-brand text-xl text-white shadow-lg"
    >
      ↑
    </button>
  );
}

"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { MakeMyTripCity } from "@/components/BookingLinks";
import HotelCard from "@/components/HotelCard";
import ProfileForm from "@/components/ProfileForm";
import TaxiPanel from "@/components/TaxiPanel";
import type { Lang } from "@/components/ui";
import { profileSummary, unknownNotes } from "@/lib/profileSummary";
import { useStore } from "@/lib/store";
import { profileStore } from "@/lib/tripState";
import type { Hotel } from "@/lib/types";

// Only send people back to a page on this site.
const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : null);

function Check() {
  const next = safeNext(useSearchParams().get("next"));
  const profile = useStore(profileStore);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    fetch("/api/hotels").then((r) => r.json()).then((d) => setHotels(d.hotels)).catch(() => setHotels([]));
  }, []);

  return (
    <main className="mx-auto max-w-3xl space-y-10 p-4 py-8">
      <header>
        <h1 className="text-3xl font-bold">Check my parent&apos;s chair</h1>
        <p className="text-muted">Two steps: tell us about your parent, then see which hotels and taxis their wheelchair can use.</p>
      </header>

      <section aria-labelledby="step1" className="space-y-3">
        <h2 id="step1" className="text-xl font-semibold"><span className="text-brand">1.</span> Describe your parent</h2>
        <ProfileForm
          key={profile ? "known" : "new"}
          confirmed={profile}
          onConfirm={(p) => {
            profileStore.set(p);
            // Bring the results (or the way back to the hotel) into view.
            setTimeout(() => document.getElementById("results")?.scrollIntoView({ block: "start" }), 50);
          }}
        />
      </section>

      <section id="results" aria-labelledby="step2" className="scroll-mt-4 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="step2" className="text-xl font-semibold"><span className="text-brand">2.</span> What fits</h2>
          {profile && (
            <button onClick={() => setLang(lang === "en" ? "hi" : "en")} className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm" aria-label="Switch explanation language">
              {lang === "en" ? "हिन्दी" : "English"}
            </button>
          )}
        </div>

        {!profile && <p className="rounded border border-gray-200 bg-tint p-4 text-muted">Confirm your parent&apos;s details above and the results will appear here.</p>}

        {profile && next && (
          <div className="rounded-xl bg-green-50 p-4 text-green-950">
            <p className="font-semibold">✓ Saved for this visit. Every hotel now shows whether it fits.</p>
            <Link href={next} className="mt-2 inline-block rounded-full bg-accent px-5 py-2.5 font-bold text-slate-900 hover:bg-accent-dark">Continue where you were</Link>
          </div>
        )}

        {profile && (
          <div className="rounded-lg border border-blue-200 bg-tint p-4 text-sm text-slate-900">
            <p><span className="font-semibold">Showing results for:</span> {profileSummary(profile)}</p>
            {unknownNotes(profile).length > 0 && (
              <p className="mt-1 text-muted">
                We don&apos;t know {unknownNotes(profile).join(" or ")}. Where we can&apos;t be sure, a hotel shows &ldquo;Fits with help&rdquo; rather than
                &ldquo;Fits&rdquo;. Pick an answer above and confirm again for a firmer result.
              </p>
            )}
          </div>
        )}

        {profile && (
          <>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Hotels in Delhi</h3>
              {hotels.map((h) => <HotelCard key={h.id} hotel={h} profile={profile} lang={lang} />)}
              <MakeMyTripCity city="Delhi" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Wheelchair taxis</h3>
              <TaxiPanel profile={profile} lang={lang} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default function CheckPage() {
  return (
    <Suspense fallback={<p className="p-4">Loading…</p>}>
      <Check />
    </Suspense>
  );
}

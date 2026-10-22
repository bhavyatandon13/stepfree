"use client";
import { useEffect, useState } from "react";
import { MakeMyTripCity } from "@/components/BookingLinks";
import HotelCard from "@/components/HotelCard";
import ProfileForm from "@/components/ProfileForm";
import TaxiPanel from "@/components/TaxiPanel";
import type { Lang } from "@/components/ui";
import type { Hotel, Profile } from "@/lib/types";

export default function Check() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    fetch("/api/hotels").then((r) => r.json()).then((d) => setHotels(d.hotels));
  }, []);

  // When the profile is confirmed, bring the results into view.
  useEffect(() => {
    if (profile) document.getElementById("results")?.scrollIntoView({ block: "start" });
  }, [profile]);

  return (
    <main className="mx-auto max-w-3xl space-y-10 p-4">
      <header>
        <h1 className="text-2xl font-bold">Check a place</h1>
        <p className="text-muted">Two steps: tell us about your parent, then see which hotels and taxis their wheelchair can use.</p>
      </header>

      <section aria-labelledby="step1" className="space-y-3">
        <h2 id="step1" className="text-xl font-semibold"><span className="text-brand">1.</span> Describe your parent</h2>
        <ProfileForm confirmed={profile} onConfirm={setProfile} />
      </section>

      <section id="results" aria-labelledby="step2" className="scroll-mt-4 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="step2" className="text-xl font-semibold"><span className="text-brand">2.</span> What fits</h2>
          {profile && (
            <button
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm"
              aria-label="Switch explanation language"
            >
              {lang === "en" ? "हिन्दी" : "English"}
            </button>
          )}
        </div>

        {!profile && <p className="rounded border border-gray-200 bg-tint p-4 text-muted">Confirm your parent&apos;s details above and the results will appear here.</p>}

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

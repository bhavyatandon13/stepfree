"use client";
import { useCallback, useEffect, useState } from "react";
import AuditForm from "@/components/AuditForm";
import HotelCard from "@/components/HotelCard";
import MarketPanel from "@/components/MarketPanel";
import ProfileForm from "@/components/ProfileForm";
import TaxiPanel from "@/components/TaxiPanel";
import type { Lang } from "@/components/ui";
import type { Hotel, Profile } from "@/lib/types";

const TABS = ["Parent", "Hotels", "Taxis", "Market", "Auditor"] as const;
type Tab = (typeof TABS)[number];

export default function Home() {
  const [tab, setTab] = useState<Tab>("Parent");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [lang, setLang] = useState<Lang>("en");

  const loadHotels = useCallback(() => {
    fetch("/api/hotels").then((r) => r.json()).then((d) => setHotels(d.hotels));
  }, []);
  useEffect(loadHotels, [loadHotels]);

  const needProfile = (
    <p className="rounded border border-gray-300 bg-gray-50 p-3 text-gray-900">
      Tell us about your parent first on the <button className="underline" onClick={() => setTab("Parent")}>Parent tab</button>.
    </p>
  );

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4">
      <header>
        <h1 className="text-2xl font-bold">Check a place</h1>
        <p className="text-sm text-muted">Tell us about your parent, then see which hotels and taxis their wheelchair can use. Pilot city: Delhi.</p>
      </header>

      <nav className="flex flex-wrap items-center gap-2" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-current={tab === t}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${tab === t ? "border-brand bg-brand text-white" : "border-gray-300 bg-white text-gray-900"}`}
          >
            {t}
          </button>
        ))}
        <button
          onClick={() => setLang(lang === "en" ? "hi" : "en")}
          className="ml-auto rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900"
          aria-label="Switch explanation language"
        >
          {lang === "en" ? "हिन्दी" : "English"}
        </button>
      </nav>

      {tab === "Parent" && (
        <ProfileForm
          confirmed={profile}
          onConfirm={(p) => {
            setProfile(p);
            setTab("Parent");
          }}
        />
      )}
      {tab === "Hotels" &&
        (profile ? (
          <div className="space-y-3">
            {hotels.map((h) => <HotelCard key={h.id} hotel={h} profile={profile} lang={lang} />)}
          </div>
        ) : needProfile)}
      {tab === "Taxis" && (profile ? <TaxiPanel profile={profile} lang={lang} /> : needProfile)}
      {tab === "Market" && <MarketPanel />}
      {tab === "Auditor" && <AuditForm onSaved={loadHotels} />}
    </main>
  );
}

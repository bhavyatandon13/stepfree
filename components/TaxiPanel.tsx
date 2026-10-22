"use client";
import { useState } from "react";
import taxiData from "@/data/taxis.json";
import { taxiFit } from "@/lib/fitRule";
import type { Profile, Taxi } from "@/lib/types";
import { Badge, CheckTable, Reason, useExplanation, type Lang } from "./ui";

const TAXIS = taxiData as Taxi[];
const CITIES = ["Delhi", ...Array.from(new Set(TAXIS.map((t) => t.city)))];
const TYPE_LABEL = { ramp: "Ramp vehicle", lift: "Lift vehicle", "fold-chair-only": "Folding chair only (parent transfers to a seat)" };

function TaxiCard({ taxi, profile, lang }: { taxi: Taxi; profile: Profile; lang: Lang }) {
  const result = taxiFit(profile, taxi);
  const reason = useExplanation(`${taxi.provider} (${taxi.city})`, result, lang);
  return (
    <article className="rounded-lg border border-gray-300 bg-white p-4 text-gray-900">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{taxi.provider}</h3>
          <p className="text-sm text-gray-600">{taxi.city} · {TYPE_LABEL[taxi.vehicleType]}</p>
        </div>
        <Badge verdict={result.verdict} />
      </div>
      <Reason text={reason.text} byAI={reason.byAI} />
      <CheckTable checks={result.checks} />
      <p className="mt-2 text-xs text-gray-600">{taxi.verified ? "Measured by Stepfree." : "NOT VERIFIED: "}{taxi.note}</p>
    </article>
  );
}

export default function TaxiPanel({ profile, lang }: { profile: Profile; lang: Lang }) {
  const [city, setCity] = useState("Delhi");
  const list = TAXIS.filter((t) => t.city === city);
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">City
        <select className="mt-1 block rounded border border-gray-300 bg-white p-2 text-gray-900" value={city} onChange={(e) => setCity(e.target.value)}>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <p className="text-sm text-gray-700">Wheelchair taxis are local, so we list them city by city. None of these has been measured by Stepfree yet.</p>
      {list.length === 0 && (
        <p className="rounded border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900">
          No wheelchair taxi provider in our data for {city} yet. Use the taxi door width in the &ldquo;What a chair needs&rdquo; box above when you phone a provider.
        </p>
      )}
      {list.map((t) => <TaxiCard key={t.id} taxi={t} profile={profile} lang={lang} />)}
    </div>
  );
}

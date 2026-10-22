"use client";
import Link from "next/link";
import { hotelFit } from "@/lib/fitRule";
import { formatINR } from "@/lib/trip";
import AccessSummary from "./AccessSummary";
import type { Hotel, Profile } from "@/lib/types";
import { Badge, CheckTable, Reason, useExplanation, type Lang } from "./ui";

// The short version: the answer, the reason and the price. Everything else is one click away.
export default function HotelCard({ hotel, profile, lang }: { hotel: Hotel; profile: Profile; lang: Lang }) {
  const result = hotelFit(profile, hotel);
  const reason = useExplanation(hotel.name, result, lang);
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 text-gray-900 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{hotel.name}</h3>
          <p className="text-sm text-gray-600">{hotel.area}{hotel.isPlaceholder && " · sample hotel"}</p>
        </div>
        <Badge verdict={result.verdict} />
      </div>
      <Reason text={reason.text} byAI={reason.byAI} />
      <details className="mt-3 rounded-lg border border-gray-200 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-brand">See the measurements</summary>
        <CheckTable checks={result.checks} />
        <AccessSummary hotel={hotel} compact />
      </details>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          {typeof hotel.ratePerNight === "number" ? <><span className="text-lg font-bold">{formatINR(hotel.ratePerNight)}</span> / night · sample price</> : "Price on request"}
        </p>
        <Link href={`/hotels/${hotel.id}`} className="rounded-full bg-accent px-5 py-2.5 font-bold text-slate-900 hover:bg-accent-dark">View &amp; book</Link>
      </div>
    </article>
  );
}

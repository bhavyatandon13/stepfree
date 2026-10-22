"use client";
import Link from "next/link";
import hotels from "@/data/hotels.json";
import { ProofBadge } from "@/components/ProofPhotos";
import { Badge } from "@/components/ui";
import { hotelFit } from "@/lib/fitRule";
import { profileSummary } from "@/lib/profileSummary";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/trip";
import { profileStore } from "@/lib/tripState";
import type { Hotel } from "@/lib/types";

const HOTELS = hotels as Hotel[];

// Home page hotels. We only call a hotel a fit after the family has entered the chair:
// before that, this section asks for the chair instead of making any claims.
export default function FeaturedHotels() {
  const profile = useStore(profileStore);

  if (profile?.chairWidthCm == null) {
    return (
      <div className="mt-6 grid gap-6 rounded-2xl border-2 border-dashed border-brand bg-tint p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <span aria-hidden className="text-5xl">🦽</span>
        <div>
          <p className="text-lg font-bold">Which hotels fit your parent&apos;s wheelchair?</p>
          <p className="text-muted">We only call a hotel a fit after checking it against the chair. Add the width once, and we&apos;ll show the hotels that pass.</p>
        </div>
        <Link href="/check?next=/" className="lift rounded-full bg-accent px-6 py-3 text-center font-bold text-slate-900 hover:bg-accent-dark">Add my parent&apos;s chair</Link>
      </div>
    );
  }

  const results = HOTELS.map((h) => ({ h, verdict: hotelFit(profile, h).verdict }));
  // Up to six, so the home page stays short; the city pages list every one.
  const fits = results.filter((r) => r.verdict === "fits").slice(0, 6);
  const withHelp = results.filter((r) => r.verdict === "help").length;

  return (
    <>
      <p className="mt-1 text-muted">
        Checked for: {profileSummary(profile)} · <Link href="/check?next=/" className="font-semibold text-brand underline">change</Link>
      </p>
      {fits.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-gray-200 bg-tint p-6">
          No hotel fully fits yet. {withHelp > 0 && `${withHelp} fit${withHelp === 1 ? "s" : ""} with help. `}
          <Link href="/cities" className="font-semibold text-brand underline">Choose a city to see every hotel and why</Link>.
        </p>
      ) : (
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
          {fits.map(({ h, verdict }) => (
            <li key={h.id} className="lift overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={h.photo} alt="" className="h-36 w-full object-cover" />
              <div className="space-y-2 p-5">
                <Badge verdict={verdict} />
                <h3 className="text-lg font-semibold">{h.name}</h3>
                <p className="text-sm text-muted">{h.area}{h.isPlaceholder && " · sample hotel"}</p>
                <ProofBadge evidence={h.evidence} />
                <div className="flex items-center justify-between pt-2">
                  <p>{typeof h.ratePerNight === "number" ? <><span className="text-xl font-extrabold">{formatINR(h.ratePerNight)}</span><span className="text-sm text-muted"> / night</span></> : "Price on request"}</p>
                  <Link href={`/hotels/${h.id}`} className="rounded-full bg-accent px-4 py-2 font-bold text-slate-900 hover:bg-accent-dark">View</Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {fits.length > 0 && withHelp > 0 && (
        <p className="mt-4 text-sm text-muted">{withHelp} more hotel{withHelp === 1 ? "" : "s"} fit with help. <Link href="/cities" className="font-semibold text-brand underline">See them by city</Link>.</p>
      )}
    </>
  );
}

"use client";
import { hotelFit } from "@/lib/fitRule";
import AccessSummary from "./AccessSummary";
import { BookOnMakeMyTrip } from "./BookingLinks";
import type { Hotel, Profile } from "@/lib/types";
import { Badge, CheckTable, Reason, useExplanation, type Lang } from "./ui";

export default function HotelCard({ hotel, profile, lang }: { hotel: Hotel; profile: Profile; lang: Lang }) {
  const result = hotelFit(profile, hotel);
  const reason = useExplanation(hotel.name, result, lang);
  return (
    <article className="rounded-lg border border-gray-300 bg-white p-4 text-gray-900">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{hotel.name}</h3>
          <p className="text-sm text-gray-600">{hotel.area}</p>
        </div>
        <Badge verdict={result.verdict} />
      </div>
      <Reason text={reason.text} byAI={reason.byAI} />
      <AccessSummary hotel={hotel} />
      {hotel.bookingUrl && <BookOnMakeMyTrip url={hotel.bookingUrl} name={hotel.name} />}
      <CheckTable checks={result.checks} />
      <figure className="mt-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hotel.photo} alt={hotel.photoCaption} className="max-h-48 w-full rounded object-cover" />
        <figcaption className="mt-1 text-xs text-gray-600">
          {hotel.photoCaption} · audited {hotel.auditDate}
          {hotel.isPlaceholder && " · PLACEHOLDER data, not a real audit"}
        </figcaption>
      </figure>
    </article>
  );
}

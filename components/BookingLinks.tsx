import { passesChecklist } from "@/lib/accessFacts";
import { mmtCityUrl } from "@/lib/links";
import type { Hotel } from "@/lib/types";

// One clear next step per city, with an honest note about what MakeMyTrip does and doesn't tell you,
// plus accessibleGO, which lets travellers filter hotels by accessibility features. We only link to
// accessibleGO: its terms don't allow copying its listings, and its features are self-reported.
export function MakeMyTripCity({ city }: { city: string }) {
  return (
    <aside className="rounded-lg border border-violet-200 bg-tint p-4 text-sm text-slate-900">
      <p className="font-semibold">Ready to book? Find hotels in {city} on MakeMyTrip</p>
      <p className="mt-1 text-muted">
        MakeMyTrip does not say which hotels are wheelchair-accessible, and StepFree has not approved its listings. Use the checks above, then phone the
        hotel to confirm the steps, ramp, lift and washroom door before you book.
      </p>
      <a
        href={mmtCityUrl(city)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block rounded-full bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-dark"
      >
        Search {city} hotels on MakeMyTrip<span className="sr-only"> (opens in a new tab)</span> ↗
      </a>
      <p className="mt-4 font-semibold">Want hotels filtered by accessibility features?</p>
      <p className="mt-1 text-muted">
        accessibleGO lets you search hotels by features such as roll-in showers. Those features are reported by the hotels, not measured by StepFree, so
        still check the door widths and steps.
      </p>
      <a
        href="https://accessiblego.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block rounded-full border-2 border-brand px-5 py-2 font-semibold text-brand hover:bg-white"
      >
        Search on accessibleGO<span className="sr-only"> (opens in a new tab)</span> ↗
      </a>
    </aside>
  );
}

// Shown only once we know the parent's chair, on a hotel that passes the checklist for that chair
// but has no page of its own to link to. MakeMyTrip has no area pages we can rely on, so we link to
// the city page and say what to search.
export function NearbyOnMakeMyTrip({ hotel, chairWidthCm }: { hotel: Hotel; chairWidthCm: number | null | undefined }) {
  if (chairWidthCm == null || !passesChecklist(hotel, chairWidthCm) || hotel.bookingUrl) return null;
  const city = hotel.area.split(",").map((s) => s.trim())[1] ?? "Delhi";
  const area = hotel.area.split(",")[0].trim();
  return (
    <div className="mt-3 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-950">
      <p className="font-semibold">✓ Passes the checklist for your parent&apos;s {chairWidthCm} cm chair: a step-free way in and a washroom door it fits through</p>
      <p className="mt-1">
        Looking for real hotels near {area}? Open MakeMyTrip&apos;s {city} page and search for &ldquo;{area}&rdquo;. It doesn&apos;t show wheelchair access, so
        phone any hotel to confirm the same things before you book.
      </p>
      <a
        href={mmtCityUrl(city)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block font-semibold text-brand underline"
      >
        Hotels in {city} on MakeMyTrip<span className="sr-only"> (opens in a new tab)</span> ↗
      </a>
    </div>
  );
}

// Shown only for a hotel an auditor has linked to its real MakeMyTrip page.
export function BookOnMakeMyTrip({ url, name }: { url: string; name: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 inline-block rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
    >
      Book {name} on MakeMyTrip<span className="sr-only"> (opens in a new tab)</span> ↗
    </a>
  );
}

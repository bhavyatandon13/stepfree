import { mmtCityUrl } from "@/lib/links";

// One clear next step per city, with an honest note about what MakeMyTrip does and doesn't tell you.
export function MakeMyTripCity({ city }: { city: string }) {
  return (
    <aside className="rounded-lg border border-blue-200 bg-tint p-4 text-sm text-slate-900">
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
    </aside>
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

// Links to MakeMyTrip. We only ever link to makemytrip.com over https, and we never call a
// MakeMyTrip listing "approved": only StepFree's own measurements say whether a chair fits.

export function mmtCityUrl(city: string): string {
  const slug = city.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `https://www.makemytrip.com/hotels/${slug}-hotels.html`;
}

// Accepts a pasted address only if it is a real https makemytrip.com page. Otherwise returns null.
export function cleanMakeMyTripUrl(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.toLowerCase();
    const ok = u.protocol === "https:" && (host === "makemytrip.com" || host.endsWith(".makemytrip.com")) && !u.username && !u.password;
    return ok ? u.href : null;
  } catch {
    return null;
  }
}

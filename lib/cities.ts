// Every city we have anything for, with how many hotels and taxis it has.
import { listings } from "./siteData";

export type CityInfo = { name: string; slug: string; hotels: number; taxis: number; emoji: string };

// A friendly picture for each city card.
const EMOJI: Record<string, string> = { Delhi: "🕌", Mumbai: "🌊", Goa: "🏖️", Ahmedabad: "🪁", Chandigarh: "🌹", Coimbatore: "⛰️" };

export function citySlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const CITIES: CityInfo[] = [...new Set(listings.map((l) => l.city))]
  .map((name) => ({
    name,
    slug: citySlug(name),
    hotels: listings.filter((l) => l.city === name && l.category === "Hotel").length,
    taxis: listings.filter((l) => l.city === name && l.category === "Taxi").length,
    emoji: EMOJI[name] ?? "📍",
  }))
  .sort((a, b) => b.hotels + b.taxis - (a.hotels + a.taxis) || a.name.localeCompare(b.name));

export function cityBySlug(slug: string): CityInfo | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function cityOfArea(area: string): string {
  return area.split(",").map((s) => s.trim())[1] ?? "Delhi";
}

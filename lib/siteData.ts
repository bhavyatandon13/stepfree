import hotels from "@/data/hotels.json";
import taxis from "@/data/taxis.json";
import { hotelListing, taxiListing, type Listing } from "./listings";
import type { Hotel, Taxi } from "./types";

// Static listings used by the home page, footer and search. Hotels audited in the Auditor
// page appear on /places too (they are fetched from /api/hotels there).
export const listings: Listing[] = [
  ...(hotels as Hotel[]).map(hotelListing),
  ...(taxis as Taxi[]).map(taxiListing),
];

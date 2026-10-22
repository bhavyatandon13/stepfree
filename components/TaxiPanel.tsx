"use client";
import { useState } from "react";
import taxiData from "@/data/taxis.json";
import type { Taxi } from "@/lib/types";
import TaxiCard from "./TaxiCard";

const TAXIS = taxiData as Taxi[];
const CITIES = Array.from(new Set(["Delhi", ...TAXIS.map((t) => t.city)]));

export default function TaxiPanel({ initialCity = "Delhi" }: { initialCity?: string }) {
  const [city, setCity] = useState(initialCity);
  const list = TAXIS.filter((t) => t.city === city);
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">City
        <select className="mt-1 block rounded border border-gray-300 bg-white p-2 text-gray-900" value={city} onChange={(e) => setCity(e.target.value)}>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      {list.length === 0 && (
        <p className="rounded border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900">
          No wheelchair taxi provider in our data for {city} yet. Use the taxi door width in the &ldquo;What a chair needs&rdquo; box above when you phone a provider.
        </p>
      )}
      {list.map((t) => <TaxiCard key={t.id} taxi={t} />)}
    </div>
  );
}

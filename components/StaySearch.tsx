"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { citySlug } from "@/lib/cities";
import { addDays, defaultStay, todayISO, validateStay, type Stay } from "@/lib/trip";
import { stayStore } from "@/lib/tripState";
import { useStore } from "@/lib/store";

const input = "mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900";

// Check-in, check-out and guests. Used on the home page, the hotel page and the booking page.
export function StayFields({ value, onChange, idPrefix }: { value: Stay; onChange: (s: Stay) => void; idPrefix: string }) {
  const today = todayISO();
  return (
    <>
      <label htmlFor={`${idPrefix}-in`} className="block text-sm font-semibold">Check-in
        <input id={`${idPrefix}-in`} type="date" className={input} min={today} value={value.checkIn}
          onChange={(e) => {
            const checkIn = e.target.value;
            // Keep check-out after check-in so people don't have to fix both.
            const checkOut = value.checkOut > checkIn ? value.checkOut : addDays(checkIn, 1);
            onChange({ ...value, checkIn, checkOut });
          }} />
      </label>
      <label htmlFor={`${idPrefix}-out`} className="block text-sm font-semibold">Check-out
        <input id={`${idPrefix}-out`} type="date" className={input} min={value.checkIn ? addDays(value.checkIn, 1) : today} value={value.checkOut}
          onChange={(e) => onChange({ ...value, checkOut: e.target.value })} />
      </label>
      <label htmlFor={`${idPrefix}-g`} className="block text-sm font-semibold">Guests
        <select id={`${idPrefix}-g`} className={input} value={value.guests} onChange={(e) => onChange({ ...value, guests: Number(e.target.value) })}>
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} guest{n === 1 ? "" : "s"}</option>)}
        </select>
      </label>
    </>
  );
}

// The current stay: what the visitor last chose, or a sensible default.
export function useStay(): [Stay, (s: Stay) => void] {
  const saved = useStore(stayStore);
  const [draft, setDraft] = useState<Stay | null>(null);
  const value = draft ?? saved ?? defaultStay(todayISO());
  return [value, setDraft];
}

// The big search box on the home page.
export default function StaySearch({ cities }: { cities: string[] }) {
  const router = useRouter();
  const [stay, setStay] = useStay();
  const [city, setCity] = useState(cities[0] ?? "Delhi");
  const [problems, setProblems] = useState<string[]>([]);

  return (
    <form
      className="grid gap-3 rounded-2xl bg-white p-4 text-slate-900 shadow-xl sm:grid-cols-5 sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        const p = validateStay(stay, todayISO());
        setProblems(p);
        if (p.length) return;
        stayStore.set(stay);
        router.push(`/city/${citySlug(city)}`);
      }}
    >
      <label htmlFor="hs-city" className="block text-sm font-semibold">City
        <select id="hs-city" className={input} value={city} onChange={(e) => setCity(e.target.value)}>
          {cities.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <StayFields value={stay} onChange={setStay} idPrefix="hs" />
      <button className="rounded-full bg-accent px-6 py-3 font-bold text-slate-900 hover:bg-accent-dark sm:col-span-5">Show hotels and taxis in {city}</button>
      {problems.length > 0 && (
        <ul role="alert" className="list-disc rounded bg-red-50 p-3 pl-6 text-sm text-red-900 sm:col-span-5">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
      )}
    </form>
  );
}

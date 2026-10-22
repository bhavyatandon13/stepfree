"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { taxiAnswer, type TaxiAnswer } from "@/lib/taxiAnswer";
import ProofPhotos from "@/components/ProofPhotos";
import { formatINR } from "@/lib/trip";
import { profileStore } from "@/lib/tripState";
import type { Taxi } from "@/lib/types";
import { RANGES } from "@/lib/validate";

const TYPE_LABEL: Record<Taxi["vehicleType"], string> = {
  ramp: "Ramp vehicle",
  lift: "Lift vehicle",
  "fold-chair-only": "Ordinary car (chair folds into the boot)",
};

const STYLE: Record<TaxiAnswer["answer"], { box: string; mark: string }> = {
  yes: { box: "border-green-300 bg-green-50 text-green-950", mark: "✓" },
  tight: { box: "border-amber-300 bg-amber-50 text-amber-950", mark: "≈" },
  no: { box: "border-red-300 bg-red-50 text-red-950", mark: "✕" },
  unsure: { box: "border-amber-300 bg-amber-50 text-amber-950", mark: "?" },
  transfer: { box: "border-amber-300 bg-amber-50 text-amber-950", mark: "!" },
};

// Asks for the chair width right here if we don't have it yet, so the answer is one step away.
function AskWidth({ taxiName }: { taxiName: string }) {
  const [value, setValue] = useState("");
  const [problem, setProblem] = useState("");
  const [lo, hi] = RANGES.chairWidthCm;
  return (
    <form
      className="mt-3 flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const w = Number(value);
        if (!value.trim() || !Number.isFinite(w) || w < lo || w > hi) {
          setProblem(`Please enter the chair width in cm (most chairs are ${lo}–${hi} cm).`);
          return;
        }
        setProblem("");
        const current = profileStore.get();
        profileStore.set({ chairWidthCm: w, maxSteps: current?.maxSteps ?? null, transferHelp: current?.transferHelp ?? null });
      }}
    >
      <label className="text-sm font-semibold">Will it fit? Chair width (cm)
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="numeric"
          className="mt-1 block w-32 rounded-lg border border-gray-300 bg-white p-2 text-gray-900"
          aria-describedby={problem ? `w-${taxiName}` : undefined}
        />
      </label>
      <button className="rounded-full bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark">Check</button>
      {problem && <p id={`w-${taxiName}`} role="alert" className="w-full text-sm text-red-900">{problem}</p>}
    </form>
  );
}

export default function TaxiCard({ taxi }: { taxi: Taxi }) {
  const profile = useStore(profileStore);
  const width = profile?.chairWidthCm ?? null;
  const a = width !== null ? taxiAnswer(width, taxi) : null;
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 text-gray-900 shadow-sm">
      <h3 className="text-lg font-semibold">{taxi.provider}</h3>
      <p className="text-sm text-gray-600">{taxi.city} · {TYPE_LABEL[taxi.vehicleType]}</p>
      {a ? (
        <div className={`mt-3 rounded-lg border p-3 ${STYLE[a.answer].box}`} role="status">
          <p className="text-lg font-bold"><span aria-hidden>{STYLE[a.answer].mark} </span>{a.headline}</p>
          <p className="text-sm">{a.detail}</p>
          <p className="mt-1 text-xs">For a {width} cm chair.</p>
        </div>
      ) : (
        <AskWidth taxiName={taxi.id} />
      )}
      {taxi.details && <p className="mt-3 text-sm">{taxi.details}</p>}
      {taxi.serviceArea && <p className="mt-1 text-sm"><span className="font-semibold">Where:</span> {taxi.serviceArea}</p>}
      <p className="mt-2 text-sm">
        {taxi.fareText ? (
          <><span className="font-semibold">Fares:</span> {taxi.fareText}</>
        ) : typeof taxi.sampleFare === "number" ? (
          <><span className="font-bold">{formatINR(taxi.sampleFare)}</span> <span className="text-gray-600">per trip in the city · sample fare</span></>
        ) : (
          <span className="text-gray-600">Fare: ask the provider</span>
        )}
      </p>
      {(taxi.contactPhones?.length || taxi.contactEmail) && (
        <p className="mt-2 text-sm">
          <span className="font-semibold">Book:</span>{" "}
          {taxi.contactPhones?.map((ph, i) => (
            <span key={ph}>{i > 0 && " · "}<a href={`tel:${ph.replace(/[^\d+]/g, "")}`} className="font-semibold text-brand underline">{ph}</a></span>
          ))}
          {taxi.contactEmail && <> · <a href={`mailto:${taxi.contactEmail}`} className="font-semibold text-brand underline">{taxi.contactEmail}</a></>}
        </p>
      )}
      <p className="mt-3 text-xs text-gray-600">
        {taxi.verified ? "Sizes measured by StepFree. " : "Sizes not yet verified by StepFree. "}
        {taxi.note}
        {taxi.sourceUrl && <> <a href={taxi.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">Source: {taxi.sourceName ?? "provider website"}<span className="sr-only"> (opens in a new tab)</span> ↗</a></>}
      </p>
      <details className="mt-3 rounded-lg border border-gray-200 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-brand">📸 Photos of this taxi</summary>
        <div className="mt-3">
          <ProofPhotos placeId={taxi.id} placeName={taxi.provider} />
        </div>
      </details>
      {!taxi.contactPhones && (
        <p className="mt-1 text-xs text-gray-600">Add it when you book a hotel in {taxi.city}, or contact {taxi.provider} directly and ask for a wheelchair-accessible vehicle.</p>
      )}
    </article>
  );
}

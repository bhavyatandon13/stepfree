"use client";
import { useState } from "react";
import { MAX_PHOTO_AGE_MIN, formatDay, formatStamp, isFreshPhoto, newestProof, stampLine } from "@/lib/photos";
import { addPhoto, photoStore, removePhoto } from "@/lib/photoStore";
import { useStore } from "@/lib/store";
import type { Evidence } from "@/lib/types";

const WHAT = ["Entrance", "Ramp", "Lift", "Washroom door", "Room door", "Inside the taxi", "Other"];

// Draws the photo smaller (so it is quick to load) and burns the time and place across the top.
function stampPhoto(file: File, line: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const band = Math.max(34, Math.round(w * 0.06));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      ctx.fillStyle = "rgba(76, 29, 149, 0.88)";
      ctx.fillRect(0, 0, w, band);
      let size = Math.round(band * 0.45);
      ctx.font = `bold ${size}px sans-serif`;
      while (ctx.measureText(line).width > w - 20 && size > 10) ctx.font = `bold ${--size}px sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";
      ctx.fillText(line, 10, band / 2);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.78));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("bad image"));
    };
    img.src = url;
  });
}

function PhotoCard({ e, onRemove }: { e: Evidence; onRemove?: () => void }) {
  return (
    <figure className="lift overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={e.photo} alt={`${e.shows}: ${e.detail}`} className="h-40 w-full object-cover" />
        {/* Sample pictures get the stamp as an overlay; live photos have it burned in. */}
        {e.by !== "You" && (
          <p className="absolute inset-x-0 top-0 bg-brand-dark/90 px-2 py-1 text-xs font-semibold text-white">📷 {formatStamp(e.takenAt)}</p>
        )}
      </div>
      <figcaption className="space-y-0.5 p-3 text-sm">
        <p className="font-semibold">{e.shows}</p>
        <p>{e.detail}</p>
        {e.worked && <p className="text-xs">{e.worked === "yes" ? "✓ Worked for their wheelchair" : e.worked === "no" ? "✕ Did not work for their wheelchair" : "? Not sure if it worked"}</p>}
        <p className="text-xs text-muted">
          {e.by === "You" ? "Your live photo, saved on this device" : e.by} · {formatStamp(e.takenAt)}
          {e.sample && " · sample photo"}
        </p>
        {onRemove && <button onClick={onRemove} className="text-xs font-semibold text-red-800 underline">Remove</button>}
      </figcaption>
    </figure>
  );
}

// Lets anyone on site take a live photo. Old photos are refused, and the time is stamped onto the image.
function LivePhotoUpload({ placeId, placeName }: { placeId: string; placeName: string }) {
  const [open, setOpen] = useState(false);
  const [what, setWhat] = useState(WHAT[0]);
  const [detail, setDetail] = useState("");
  const [worked, setWorked] = useState<"" | "yes" | "no" | "unsure">("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const input = "mt-1 w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900";

  async function onFile(file: File | undefined) {
    if (!file) return;
    setMessage(null);
    if (!file.type.startsWith("image/")) return setMessage({ ok: false, text: "Please choose a photo." });
    if (!isFreshPhoto(file.lastModified, Date.now())) {
      return setMessage({ ok: false, text: `This photo is older than ${MAX_PHOTO_AGE_MIN} minutes. Please take a new photo now, so everyone can trust it shows the place today.` });
    }
    setBusy(true);
    try {
      const takenAt = new Date().toISOString();
      const photo = await stampPhoto(file, stampLine(placeName, takenAt));
      const error = addPhoto(placeId, {
        id: `you-${Date.now()}`,
        photo,
        shows: what,
        detail: detail.trim() || "Live photo",
        takenAt,
        by: "You",
        worked: worked || undefined,
      });
      setMessage(error ? { ok: false, text: error } : { ok: true, text: "Added. The time and place are stamped on the photo." });
      if (!error) { setDetail(""); setWorked(""); }
    } catch {
      setMessage({ ok: false, text: "Couldn't read that photo. Please try another." });
    }
    setBusy(false);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="lift rounded-full bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark">
        📸 Add a live photo
      </button>
    );
  }
  return (
    <div className="space-y-3 rounded-xl border border-violet-200 bg-tint p-4">
      <p className="font-semibold">Add a live, time-stamped photo</p>
      <p className="text-sm text-muted">
        Take it now, on site. Photos older than {MAX_PHOTO_AGE_MIN} minutes are refused, and StepFree stamps the date, time and place onto the picture so it can&apos;t be reused.
        In this demo the photo stays on this device.
      </p>
      <label className="block text-sm font-semibold">What does it show?
        <select className={input} value={what} onChange={(e) => setWhat(e.target.value)}>{WHAT.map((w) => <option key={w}>{w}</option>)}</select>
      </label>
      <label className="block text-sm font-semibold">What did you see? (optional)
        <input className={input} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="e.g. tape measure reads 80 cm" maxLength={140} />
      </label>
      <label className="block text-sm font-semibold">Did it work for your wheelchair? (optional)
        <select className={input} value={worked} onChange={(e) => setWorked(e.target.value as typeof worked)}>
          <option value="">Don&apos;t say</option><option value="yes">Yes</option><option value="no">No</option><option value="unsure">Not sure</option>
        </select>
      </label>
      <label className="block text-sm font-semibold">Photo
        <input type="file" accept="image/*" capture="environment" disabled={busy} className={input} onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
      </label>
      {busy && <p className="text-sm">Stamping the photo…</p>}
      {message && <p role={message.ok ? "status" : "alert"} className={`rounded p-2 text-sm ${message.ok ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"}`}>{message.text}</p>}
      <button onClick={() => setOpen(false)} className="text-sm font-semibold text-brand underline">Close</button>
    </div>
  );
}

// "📷 Photo proof · 20 Oct 2026": shows a listing has time-stamped photos behind it.
export function ProofBadge({ evidence }: { evidence?: Evidence[] }) {
  const p = newestProof(evidence);
  if (!p) return <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">No proof photos yet</span>;
  return (
    <span className="inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-900">
      📷 Photo proof · {formatDay(p.takenAt)} · {evidence!.length} photo{evidence!.length === 1 ? "" : "s"}{p.sample ? " (sample)" : ""}
    </span>
  );
}

// Proof photos for a hotel or taxi: the audited ones, plus any live photos taken on this device.
export default function ProofPhotos({ placeId, placeName, evidence = [] }: { placeId: string; placeName: string; evidence?: Evidence[] }) {
  const mine = useStore(photoStore)[placeId] ?? [];
  const all = [...mine, ...[...evidence].sort((a, b) => Date.parse(b.takenAt) - Date.parse(a.takenAt))];
  return (
    <section aria-label={`Proof photos for ${placeName}`} className="space-y-3">
      {all.length === 0 ? (
        <p className="text-sm text-muted">No proof photos yet. Be the first to add one.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((e) => <li key={e.id}><PhotoCard e={e} onRemove={e.by === "You" ? () => removePhoto(placeId, e.id) : undefined} /></li>)}
        </ul>
      )}
      <LivePhotoUpload placeId={placeId} placeName={placeName} />
    </section>
  );
}

"use client";
import { useState } from "react";
import { validateAudit } from "@/lib/validate";
import type { AuditFields } from "@/lib/types";

const EMPTY: AuditFields = { entranceSteps: null, ramp: null, roomDoorCm: null, bathroomDoorCm: null, liftDoorCm: null, liftDepthCm: null, turningSpaceCm: null };
const toNum = (s: string) => (s.trim() === "" ? null : Number(s));

const NUMBER_FIELDS: [keyof AuditFields, string][] = [
  ["entranceSteps", "Entrance steps (count)"],
  ["roomDoorCm", "Room door clear width (cm)"],
  ["bathroomDoorCm", "Bathroom door clear width (cm)"],
  ["liftDoorCm", "Lift door clear width (cm)"],
  ["liftDepthCm", "Lift cabin depth (cm)"],
  ["turningSpaceCm", "Turning space (cm)"],
];

// Shrinks the photo so it travels quickly on a phone connection.
function readPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => reject(new Error("bad image"));
    img.src = url;
  });
}

export default function AuditForm({ onSaved }: { onSaved: () => void }) {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [fields, setFields] = useState<AuditFields>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [problems, setProblems] = useState<string[]>([]);

  async function extract() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/extract-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note, photoDataUrl: photo ?? undefined }),
      });
      const data = await res.json();
      if (!res.ok) setMessage(data.message ?? "Couldn't read the notes. Please type the numbers.");
      else {
        setFields(data.fields);
        setProblems(validateAudit(data.fields));
        setMessage("Claude filled these in. Check every number against your tape measure before saving.");
      }
    } catch {
      setMessage("Couldn't reach the server. Please type the numbers.");
    }
    setBusy(false);
  }

  async function save() {
    const p = validateAudit(fields);
    setProblems(p);
    if (!name.trim()) return setMessage("Please give the hotel a name.");
    if (p.length) return;
    const res = await fetch("/api/hotels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, area: area || "Delhi", ...fields, photo: photo ?? undefined, photoCaption: "Auditor photo" }),
    });
    const data = await res.json();
    if (!res.ok) return setProblems([data.error]);
    setMessage(`Saved ${data.hotel.name}. It now appears on the Hotels tab (until the server restarts).`);
    setName(""); setArea(""); setNote(""); setPhoto(null); setFields(EMPTY); setProblems([]);
    onSaved();
  }

  const input = "mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900";
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-700">For auditors: write what you measured on site, then let Claude fill the boxes. You confirm every number.</p>
      <label className="block text-sm font-medium">Hotel name<input className={input} value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label className="block text-sm font-medium">Area<input className={input} value={area} onChange={(e) => setArea(e.target.value)} placeholder="Delhi" /></label>
      <label className="block text-sm font-medium">Notes (English or Hindi)
        <textarea className={input} rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="2 steps at the entrance, no ramp. Bathroom door 81 cm. Lift door 80 cm…" />
      </label>
      <label className="block text-sm font-medium">Photo (tape measure, door or entrance)
        <input type="file" accept="image/*" capture="environment" className={input} onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) setPhoto(await readPhoto(f).catch(() => null));
        }} />
      </label>
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="Audit upload preview" className="max-h-40 rounded" />
      )}
      <button onClick={extract} disabled={busy || (!note.trim() && !photo)} className="rounded bg-brand px-4 py-2 font-medium text-white disabled:opacity-50">
        {busy ? "Reading…" : "Fill boxes with Claude"}
      </button>

      <fieldset className="space-y-3 rounded-lg border border-gray-300 p-4">
        <legend className="px-1 font-semibold">Confirm the measurements</legend>
        {NUMBER_FIELDS.map(([k, label]) => (
          <label key={k} className="block text-sm">{label}
            <input className={input} inputMode="numeric" value={(fields[k] as number | null) ?? ""} onChange={(e) => setFields({ ...fields, [k]: toNum(e.target.value) })} />
          </label>
        ))}
        <label className="block text-sm">Ramp at entrance
          <select className={input} value={fields.ramp === null ? "" : String(fields.ramp)} onChange={(e) => setFields({ ...fields, ramp: e.target.value === "" ? null : e.target.value === "true" })}>
            <option value="">Not sure</option><option value="true">Yes</option><option value="false">No</option>
          </select>
        </label>
        {problems.length > 0 && (
          <ul role="alert" className="list-disc rounded bg-red-50 p-3 pl-6 text-sm text-red-900">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
        )}
        <button onClick={save} className="rounded bg-green-700 px-4 py-2 font-medium text-white">Confirm and save</button>
      </fieldset>
      {message && <p className="text-sm text-gray-700">{message}</p>}
    </div>
  );
}

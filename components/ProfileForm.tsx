"use client";
import { useState } from "react";
import { requirementsFor } from "@/lib/requirements";
import { profileSummary, sameProfile } from "@/lib/profileSummary";
import { validateProfile } from "@/lib/validate";
import type { Profile, TransferHelp } from "@/lib/types";

const EMPTY: Profile = { chairWidthCm: null, maxSteps: null, transferHelp: null };
const toNum = (s: string) => (s.trim() === "" ? null : Number(s));

export function RequirementsChecklist({ chairWidthCm }: { chairWidthCm: number }) {
  const r = requirementsFor(chairWidthCm);
  const rows: [string, number, number][] = [
    ["Room door", r.roomDoor.comfortable, r.roomDoor.minimum],
    ["Bathroom door", r.bathroomDoor.comfortable, r.bathroomDoor.minimum],
    ["Lift door", r.liftDoor.comfortable, r.liftDoor.minimum],
    ["Lift cabin depth", r.liftDepth.comfortable, r.liftDepth.minimum],
    ["Turning space", r.turningSpace.comfortable, r.turningSpace.minimum],
    ["Taxi door", r.taxiDoor.comfortable, r.taxiDoor.minimum],
  ];
  return (
    <section className="rounded-lg border border-violet-200 bg-tint p-4 text-gray-900">
      <h3 className="font-semibold">Sizes to look for with a {chairWidthCm} cm chair</h3>
      <p className="text-sm text-gray-700">
        These are <strong>not</strong> hotel measurements. They are how wide a door or space should be for your parent&apos;s chair. A door this wide
        <strong> or wider</strong> works: for example, a {chairWidthCm + 10} cm door fits a {chairWidthCm} cm chair easily, with room for hands on the wheels.
        Below the &ldquo;squeeze&rdquo; size the chair won&apos;t get through.
      </p>
      <table className="mt-2 w-full text-left text-sm">
        <thead>
          <tr className="text-gray-700"><th className="py-1 pr-2 font-medium">Item</th><th className="py-1 pr-2 font-medium">Fits easily if at least</th><th className="py-1 font-medium">Squeezes through if at least</th></tr>
        </thead>
        <tbody>
          {rows.map(([k, comfortable, minimum]) => (
            <tr key={k} className="border-t border-violet-200"><td className="py-1 pr-2">{k}</td><td className="py-1 pr-2">{comfortable} cm</td><td className="py-1">{minimum} cm</td></tr>
          ))}
          <tr className="border-t border-violet-200"><td className="py-1 pr-2">Entrance steps</td><td className="py-1" colSpan={2}>no more than your parent can manage, or a ramp</td></tr>
        </tbody>
      </table>
    </section>
  );
}

export default function ProfileForm({ confirmed, onConfirm }: { confirmed: Profile | null; onConfirm: (p: Profile) => void }) {
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<Profile>(confirmed ?? EMPTY);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [problems, setProblems] = useState<string[]>([]);

  async function understand() {
    setBusy(true);
    setMessage("");
    setProblems([]);
    try {
      const res = await fetch("/api/parse-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message ?? "Something went wrong. Please fill the numbers by hand.");
      } else {
        setDraft(data.profile);
        const p = validateProfile(data.profile);
        const how = data.source === "rules" ? "The AI isn't available, so we read your text with simple rules. " : "";
        setMessage(p.length ? how : how + "Here is what we understood. Please check every number and confirm.");
        setProblems(p);
      }
    } catch {
      setMessage("Couldn't reach the server. Please fill the numbers by hand.");
    }
    setBusy(false);
  }

  function confirm() {
    const p = validateProfile(draft);
    setProblems(p);
    if (p.length === 0) {
      setMessage("");
      onConfirm(draft);
    }
  }

  const field = "mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900";
  return (
    <div className="space-y-4">
      <aside className="rounded-lg border border-violet-200 bg-tint p-3 text-sm text-slate-900">
        <p className="font-semibold">Your parent&apos;s details are not saved.</p>
        <p>
          StepFree keeps no copy on its server. Your parent&apos;s details stay in this browser tab, so every hotel can show whether it fits,
          and are forgotten when you close the tab. To read your text, it may be sent to Claude (through OpenRouter), which has its own
          data policy. Please don&apos;t type a name, address or phone number here.
        </p>
      </aside>
      <section className="space-y-2">
        <label htmlFor="desc" className="block font-semibold">Tell us about your parent</label>
        <textarea
          id="desc"
          className={field}
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Papa's chair is 66 cm wide and he can't manage any steps"
        />
        <button onClick={understand} disabled={busy || !text.trim()} className="rounded bg-brand px-4 py-2 font-medium text-white disabled:opacity-50">
          {busy ? "Reading…" : "Understand"}
        </button>
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </section>

      <section className="space-y-3 rounded-lg border border-gray-300 p-4">
        <h3 className="font-semibold">Check the numbers (you can type or fix them)</h3>
        <label className="block text-sm">Chair width (cm)
          <input className={field} inputMode="numeric" value={draft.chairWidthCm ?? ""} onChange={(e) => setDraft({ ...draft, chairWidthCm: toNum(e.target.value) })} />
        </label>
        <label className="block text-sm">How many steps can your parent manage?
          <select
            className={field}
            value={draft.maxSteps === null ? "" : String(draft.maxSteps)}
            onChange={(e) => setDraft({ ...draft, maxSteps: e.target.value === "" ? null : Number(e.target.value) })}
          >
            <option value="">Not sure</option>
            <option value="0">None: can&apos;t manage any steps</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} step{n === 1 ? "" : "s"}</option>)}
            {draft.maxSteps !== null && (draft.maxSteps > 5 || !Number.isInteger(draft.maxSteps)) && <option value={draft.maxSteps}>{draft.maxSteps} steps</option>}
          </select>
        </label>
        <label className="block text-sm">Help needed to transfer (chair ↔ bed/seat)
          <select className={field} value={draft.transferHelp ?? ""} onChange={(e) => setDraft({ ...draft, transferHelp: (e.target.value || null) as TransferHelp | null })}>
            <option value="">Not sure</option>
            <option value="none">None</option>
            <option value="some">Some</option>
            <option value="full">A lot</option>
          </select>
        </label>
        {problems.length > 0 && (
          <ul role="alert" className="list-disc rounded bg-red-50 p-3 pl-6 text-sm text-red-900">
            {problems.map((p) => <li key={p}>{p}</li>)}
          </ul>
        )}
        {confirmed && !sameProfile(confirmed, draft) && (
          <p role="status" className="rounded bg-amber-50 p-3 text-sm text-amber-950">
            You changed the numbers. Click <strong>Confirm profile</strong> to update the results below.
          </p>
        )}
        <button onClick={confirm} className="rounded bg-brand hover:bg-brand-dark px-4 py-2 font-medium text-white">Confirm profile</button>
        {confirmed && sameProfile(confirmed, draft) && (
          <p role="status" className="text-sm font-medium text-green-800">✓ Confirmed: {profileSummary(confirmed)}</p>
        )}
        <p className="text-xs text-gray-600">Anything left blank is treated as unknown, so results will say &ldquo;Fits with help&rdquo;, never &ldquo;Fits&rdquo;.</p>
      </section>

      {confirmed?.chairWidthCm != null && <RequirementsChecklist chairWidthCm={confirmed.chairWidthCm} />}
    </div>
  );
}

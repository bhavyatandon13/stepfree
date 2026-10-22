"use client";
import { useState } from "react";

type Kind = "volunteer" | "submit" | "partner" | "contact";

const CONFIG: Record<Kind, { button: string; thanks: string; extra?: { name: string; label: string; placeholder: string }[]; messageLabel: string }> = {
  volunteer: {
    button: "Offer to help",
    thanks: "Thank you for offering to help.",
    extra: [{ name: "city", label: "Your city", placeholder: "Delhi" }],
    messageLabel: "How would you like to help? (for example measuring places, taking photos, translating)",
  },
  submit: {
    button: "Suggest this place",
    thanks: "Thank you for suggesting a place.",
    extra: [
      { name: "place", label: "Name of the place", placeholder: "Hotel or taxi provider" },
      { name: "city", label: "City", placeholder: "Delhi" },
    ],
    messageLabel: "What do you know about its access? (steps, ramp, lift, bathroom door)",
  },
  partner: {
    button: "Start a conversation",
    thanks: "Thank you for reaching out.",
    extra: [{ name: "org", label: "Organisation", placeholder: "School, business or NGO" }],
    messageLabel: "How would you like to work together?",
  },
  contact: { button: "Send message", thanks: "Thank you for your message.", messageLabel: "Your message" },
};

// A demo form: it checks the fields but does not send or store anything yet, and says so.
export default function InterestForm({ kind }: { kind: Kind }) {
  const c = CONFIG[kind];
  const [done, setDone] = useState(false);
  const input = "mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900";

  if (done) {
    return (
      <div role="status" className="rounded-lg border border-green-300 bg-green-50 p-4 text-green-950">
        <p className="font-semibold">{c.thanks}</p>
        <p className="text-sm">This is a demo, so nothing was sent or saved. Real submissions will be switched on when StepFree has a team to answer them.</p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <label className="block text-sm font-medium">Your name
        <input className={input} name="name" required autoComplete="name" />
      </label>
      <label className="block text-sm font-medium">Email
        <input className={input} name="email" type="email" required autoComplete="email" />
      </label>
      {c.extra?.map((f) => (
        <label key={f.name} className="block text-sm font-medium">{f.label}
          <input className={input} name={f.name} placeholder={f.placeholder} required />
        </label>
      ))}
      <label className="block text-sm font-medium">{c.messageLabel}
        <textarea className={input} name="message" rows={4} required />
      </label>
      <p className="text-xs text-muted">Demo only: nothing you type here is sent or stored. Please don&apos;t add private details.</p>
      <button className="rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark">{c.button}</button>
    </form>
  );
}

"use client";
import { useState } from "react";

// The "Write to us" form: saved in Supabase, the team is emailed, and the sender gets an automatic reply.
export default function EnquiryForm() {
  const [state, setState] = useState<{ status: "idle" | "sending" | "sent"; error?: string; emailed?: boolean }>({ status: "idle" });
  const input = "mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ status: "sending" });
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      });
      const data = await res.json();
      setState(res.ok ? { status: "sent", emailed: data.emailed } : { status: "idle", error: data.error });
    } catch {
      setState({ status: "idle", error: "We couldn't reach StepFree. Check your internet and try again." });
    }
  }

  if (state.status === "sent") {
    return (
      <div role="status" className="rounded-2xl border border-green-300 bg-green-50 p-6 text-green-950">
        <p className="text-lg font-semibold">Thank you! 🎉 We got your message.</p>
        <p className="mt-1">
          {state.emailed ? "We've sent a confirmation to your email (check spam if you can't see it). " : ""}
          We&apos;ll reply within 2 working days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">Your name
          <input className={input} name="name" required maxLength={100} autoComplete="name" />
        </label>
        <label className="block text-sm font-medium">Email
          <input className={input} name="email" type="email" required maxLength={200} autoComplete="email" />
        </label>
      </div>
      <label className="block text-sm font-medium">Your question or idea
        <textarea className={input} name="message" rows={4} required maxLength={2000} placeholder="For example: does this hotel have a ramp at the back entrance?" />
      </label>
      {/* Hidden from people; bots fill it in and are ignored. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {state.error && <p role="alert" className="font-medium text-red-700">{state.error}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <button disabled={state.status === "sending"} className="lift rounded-full bg-accent px-8 py-3 font-bold text-slate-900 hover:bg-accent-dark disabled:opacity-60">
          {state.status === "sending" ? "Sending…" : "Send message"}
        </button>
        <p className="text-xs text-muted">We keep your name, email and message only to reply to you. See our <a href="/privacy" className="underline">privacy notice</a>.</p>
      </div>
    </form>
  );
}

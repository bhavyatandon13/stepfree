// Checks and email wording for the "Write to us" form. Plain code, no AI.

export type Enquiry = { name: string; email: string; message: string };

export const LIMITS = { name: 100, email: 200, message: 2000 };

// Returns the cleaned enquiry, or a plain message saying what to fix.
export function checkEnquiry(body: unknown): { ok: true; enquiry: Enquiry } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const message = typeof b.message === "string" ? b.message.trim() : "";
  if (!name) return { ok: false, error: "Please add your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please add a valid email, so we can reply." };
  if (!message) return { ok: false, error: "Please write a message." };
  if (name.length > LIMITS.name || email.length > LIMITS.email || message.length > LIMITS.message)
    return { ok: false, error: `Please keep your message under ${LIMITS.message} characters.` };
  return { ok: true, enquiry: { name, email, message } };
}

// Bots fill every field, including the hidden "website" one people never see.
export function isBot(body: unknown): boolean {
  const w = (body as Record<string, unknown> | null)?.website;
  return typeof w === "string" && w.trim() !== "";
}

// Supabase shows the URL in a few forms; the client needs just "https://<project>.supabase.co".
export function projectUrl(url: string) {
  return url.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
}

export function notifyEmail(e: Enquiry) {
  return {
    subject: `New StepFree enquiry from ${e.name}`,
    text: `Someone filled in the form on StepFree.\n\nName: ${e.name}\nEmail: ${e.email}\n\nMessage:\n${e.message}\n\nReply to this email to answer them.`,
  };
}

export function autoReply(e: Enquiry) {
  return {
    subject: "We got your message – StepFree",
    text:
      `Hi ${e.name},\n\nThank you for writing to StepFree. We've received your message and will reply within 2 working days.\n\n` +
      `Your message:\n${e.message}\n\nWarm wishes,\nThe StepFree team\nhttps://stepfree-psi.vercel.app`,
  };
}

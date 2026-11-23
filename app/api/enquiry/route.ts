import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { SUPABASE_DEFAULTS, autoReply, checkEnquiry, isBot, notifyEmail, projectUrl } from "@/lib/enquiry";

// Saves a "Write to us" message in Supabase, emails the team, and sends the sender a thank-you.
// Supabase is reached with the public (publishable) key built into lib/enquiry.ts; the table only lets it
// add rows, never read them (see supabase/enquiries.sql). The Gmail keys stay on the server.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 400 });
  }
  if (isBot(body)) return Response.json({ ok: true });
  const check = checkEnquiry(body);
  if (!check.ok) return Response.json({ error: check.error }, { status: 400 });
  const e = check.enquiry;

  const env = process.env;
  const url = projectUrl(env.SUPABASE_URL?.trim() || SUPABASE_DEFAULTS.url);
  const key = env.SUPABASE_PUBLISHABLE_KEY?.trim() || SUPABASE_DEFAULTS.publishableKey;
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from("enquiries").insert(e);
  if (error) {
    console.error("Supabase insert failed:", error.message);
    return Response.json({ error: "Sorry, we couldn't save your message. Please try again." }, { status: 500 });
  }
  const missingMail = missingKeys(["GMAIL_USER", "GMAIL_APP_PASSWORD"]);
  if (missingMail) console.warn(`Enquiry saved without emails. Missing keys: ${missingMail}`);

  // The message is already saved, so an email problem doesn't lose it.
  let emailed = false;
  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
    const mail = nodemailer.createTransport({ service: "gmail", auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD } });
    const from = `StepFree <${env.GMAIL_USER}>`;
    try {
      await Promise.all([
        mail.sendMail({ from, to: env.NOTIFY_EMAIL || env.GMAIL_USER, replyTo: e.email, ...notifyEmail(e) }),
        mail.sendMail({ from, to: e.email, ...autoReply(e) }),
      ]);
      emailed = true;
    } catch (err) {
      console.error("Email failed:", err instanceof Error ? err.message : err);
    }
  }
  return Response.json({ ok: true, emailed });
}

// Names only, never values, so the log is safe to read.
function missingKeys(names: string[]) {
  return names.filter((n) => !process.env[n]?.trim()).join(", ");
}

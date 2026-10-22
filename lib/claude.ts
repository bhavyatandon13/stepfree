// Claude is called through OpenRouter. The key is read from .env.local (OPENROUTER_API_KEY)
// and is never written in code.
const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-5.5";
const URL = "https://openrouter.ai/api/v1/chat/completions";

export class MissingKeyError extends Error {}
export class AiHttpError extends Error {
  constructor(public status: number, detail: string) {
    super(`OpenRouter ${status}: ${detail}`);
  }
}

function hasRealKey(key: string | undefined): key is string {
  return !!key && !key.includes("paste-your");
}

// True when an AI key is set, so pages can skip AI calls that would only fail.
export function aiConfigured(): boolean {
  return hasRealKey(process.env.OPENROUTER_API_KEY);
}

export async function askClaude(opts: {
  system: string;
  text: string;
  imageDataUrl?: string;
  maxTokens?: number;
}): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!hasRealKey(key)) throw new MissingKeyError("OPENROUTER_API_KEY is not set in .env.local");

  const userContent: unknown[] = [];
  if (opts.imageDataUrl?.startsWith("data:image/")) {
    userContent.push({ type: "image_url", image_url: { url: opts.imageDataUrl } });
  }
  userContent.push({ type: "text", text: opts.text });

  const res = await fetch(URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: opts.maxTokens ?? 500,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: userContent },
      ],
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new AiHttpError(res.status, (await res.text()).slice(0, 200));
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("OpenRouter returned no text");
  return content;
}

// Claude is told "JSON only", but we still pull out the first {...} defensively.
export function parseJsonObject(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

export function errorResponse(e: unknown) {
  if (e instanceof MissingKeyError) {
    return Response.json({ error: "no-key", message: "The AI key is missing. Fill the form by hand instead." }, { status: 503 });
  }
  console.error("AI call failed:", e instanceof Error ? e.message : e);
  let why = "The AI didn't answer.";
  if (e instanceof AiHttpError) {
    if (e.status === 401) why = "The AI key was rejected.";
    else if (e.status === 402) why = "The AI account is out of credit.";
    else if (e.status === 403 || e.status === 404) why = "The AI service refused this request (an account setting may be blocking the model).";
    else if (e.status === 429) why = "The AI is busy right now.";
  } else if (e instanceof Error && e.name === "TimeoutError") why = "The AI took too long.";
  return Response.json({ error: "ai-failed", message: `${why} You can fill the numbers in by hand.` }, { status: 502 });
}

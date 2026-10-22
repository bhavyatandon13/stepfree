import { askClaude, errorResponse, parseJsonObject } from "@/lib/claude";
import { PARSE_PROFILE_SYSTEM } from "@/lib/prompts";
import { readProfileText } from "@/lib/readProfileText";
import type { Profile } from "@/lib/types";

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

export async function POST(req: Request) {
  const { text } = (await req.json()) as { text?: string };
  if (!text || !text.trim()) {
    return Response.json({ error: "empty", message: "Please describe your parent first." }, { status: 400 });
  }
  const clipped = text.slice(0, 1000);

  // 1. Ask Claude. 2. If Claude is unavailable, fall back to the simple reader. The user confirms either way.
  let aiError: unknown = null;
  try {
    const raw = await askClaude({ system: PARSE_PROFILE_SYSTEM, text: clipped, maxTokens: 200 });
    const obj = parseJsonObject(raw);
    if (obj) {
      const t = obj.transferHelp;
      const profile: Profile = {
        chairWidthCm: num(obj.chairWidthCm),
        maxSteps: num(obj.maxSteps),
        transferHelp: t === "none" || t === "some" || t === "full" ? t : null,
      };
      return Response.json({ profile, source: "ai" });
    }
  } catch (e) {
    aiError = e;
  }

  const rules = readProfileText(clipped);
  if (rules.chairWidthCm !== null || rules.maxSteps !== null || rules.transferHelp !== null) {
    return Response.json({ profile: rules, source: "rules" });
  }
  if (aiError) return errorResponse(aiError);
  return Response.json({ error: "bad-json", message: "Couldn't read that. Fill the form by hand." }, { status: 502 });
}

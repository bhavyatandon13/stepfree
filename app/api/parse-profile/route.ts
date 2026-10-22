import { askClaude, errorResponse, parseJsonObject } from "@/lib/claude";
import { PARSE_PROFILE_SYSTEM } from "@/lib/prompts";
import type { Profile } from "@/lib/types";

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

export async function POST(req: Request) {
  const { text } = (await req.json()) as { text?: string };
  if (!text || !text.trim()) {
    return Response.json({ error: "empty", message: "Please describe your parent first." }, { status: 400 });
  }
  try {
    const raw = await askClaude({ system: PARSE_PROFILE_SYSTEM, text: text.slice(0, 1000), maxTokens: 200 });
    const obj = parseJsonObject(raw);
    if (!obj) return Response.json({ error: "bad-json", message: "Couldn't read that. Fill the form by hand." }, { status: 502 });
    const t = obj.transferHelp;
    const profile: Profile = {
      chairWidthCm: num(obj.chairWidthCm),
      maxSteps: num(obj.maxSteps),
      transferHelp: t === "none" || t === "some" || t === "full" ? t : null,
    };
    return Response.json({ profile });
  } catch (e) {
    return errorResponse(e);
  }
}

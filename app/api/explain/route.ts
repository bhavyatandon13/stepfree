import { askClaude, errorResponse } from "@/lib/claude";
import { explainSystem } from "@/lib/prompts";
import { VERDICT_LABEL } from "@/lib/fitRule";
import type { Check, Verdict } from "@/lib/types";

export async function POST(req: Request) {
  const { name, verdict, checks, lang } = (await req.json()) as {
    name: string;
    verdict: Verdict;
    checks: Check[];
    lang: "en" | "hi";
  };
  const lines = checks.map((c) => `- ${c.label}: measured ${c.measured}, needs ${c.required} (${c.status})`).join("\n");
  try {
    const text = await askClaude({
      system: explainSystem(lang === "hi" ? "hi" : "en"),
      text: `Place: ${name}\nVerdict (fixed): ${VERDICT_LABEL[verdict]}\n${lines}`,
      maxTokens: 250,
    });
    return Response.json({ text: text.trim() });
  } catch (e) {
    return errorResponse(e);
  }
}

// All the questions we ask Claude, in one place. Claude never decides a verdict.

export const PARSE_PROFILE_SYSTEM = `You read a family's description of an elderly parent who uses a wheelchair. The text may be English, Hindi or a mix.
Extract exactly these fields and output JSON only, with no other text:
{"chairWidthCm": number or null, "maxSteps": number or null, "transferHelp": "none" | "some" | "full" | null}
- chairWidthCm: the wheelchair width in centimetres. Convert inches (1 in = 2.54 cm).
- maxSteps: how many steps the parent can manage. "can't manage any steps" = 0.
- transferHelp: help needed to move between chair and bed/seat: none, some or full.
Use null for anything not stated. Never guess.`;

export const EXTRACT_AUDIT_SYSTEM = `You read an on-site accessibility audit of a hotel: free-text notes (English or Hindi) and sometimes a photo of a tape measure.
Output JSON only, with no other text:
{"entranceSteps": number or null, "ramp": true | false | null, "roomDoorCm": number or null, "bathroomDoorCm": number or null, "liftDoorCm": number or null, "liftDepthCm": number or null, "turningSpaceCm": number or null}
All widths are clear widths in centimetres. Convert inches (1 in = 2.54 cm). Use null when unclear. Never guess a number. The auditor will confirm every value.`;

export function explainSystem(lang: "en" | "hi") {
  const language = lang === "hi" ? "Hindi (Devanagari script)" : "English";
  return `You explain an accessibility result to an adult child planning a trip for a parent who uses a wheelchair.
The verdict is already decided by a fixed rule. Do not change it, question it or soften it. Write 1 or 2 short, plain sentences in ${language}.
Mention the specific measured numbers that explain the verdict. If something was not measured, say so. No headings or bullet points.`;
}

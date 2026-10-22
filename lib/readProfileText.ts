// A simple, plain-code reader for the parent description. It is the backup when the AI is
// unavailable. It only understands plain statements like "66 cm" and "can't manage any steps",
// and it leaves anything unclear as null (never guesses). The user always confirms the result.
import type { Profile, TransferHelp } from "./types";

const WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, ek: 1, do: 2, teen: 3 };
const STEP = "(?:steps?|stairs?|staircases?|seedhi\\w*|सीढ़\\S*|सीढ\\S*)";

export function readProfileText(text: string): Profile {
  const t = text.toLowerCase();

  let chairWidthCm: number | null = null;
  const cm = t.match(/(\d+(?:\.\d+)?)\s*(?:cm|centimet\w*|सेमी)/);
  const inch = t.match(/(\d+(?:\.\d+)?)\s*(?:inches|inch|in\b|"|इंच)/);
  // A number near "wide", "width" or "chair", or a number typed on its own (like "63"), is the width in cm.
  const near = t.match(/(\d{2,3}(?:\.\d+)?)\s*(?:wide|width)|(?:width|wide|chair)\D{0,20}?(\d{2,3}(?:\.\d+)?)(?!\s*(?:steps?|stairs?|in\b|inch))/);
  const alone = t.match(/^\s*(\d{2,3}(?:\.\d+)?)\s*$/);
  if (cm) chairWidthCm = Number(cm[1]);
  else if (inch) chairWidthCm = Math.round(Number(inch[1]) * 2.54);
  else if (alone) chairWidthCm = Number(alone[1]);
  else if (near) chairWidthCm = Number(near[1] ?? near[2]);

  let maxSteps: number | null = null;
  const none = new RegExp(
    `(?:\\b(?:no|zero|any|without)\\s+(?:\\w+\\s+)?${STEP})|(?:step[- ]?free)|(?:\\b(?:cannot|can't|cant|can not|unable to)\\s+(?:\\w+\\s+){0,3}${STEP})`,
  );
  const counted = new RegExp(`\\b(\\d+|one|two|three|four|five|ek|do|teen)\\s+(?:\\w+\\s+)?${STEP}`);
  const n = t.match(counted);
  if (none.test(t) && !n) maxSteps = 0;
  else if (n) maxSteps = /^\d+$/.test(n[1]) ? Number(n[1]) : WORDS[n[1]];

  let transferHelp: TransferHelp | null = null;
  if (/(?:cannot|can't|cant|unable to)\s+(?:\w+\s+)?(?:transfer|stand)|full help|fully dependent|hoist/.test(t)) transferHelp = "full";
  else if (/(?:no|without)\s+help|independent|transfers?\s+(?:himself|herself|alone|on (?:his|her) own)/.test(t)) transferHelp = "none";
  else if (/(?:some|little|with)\s+(?:help|support)|needs?\s+(?:help|support)|sahare|सहारे/.test(t)) transferHelp = "some";

  return { chairWidthCm, maxSteps, transferHelp };
}

# StepFree

Know before you book whether your parent's wheelchair can get in.

StepFree is a hackathon MVP. A family describes their parent's wheelchair in plain words, and the app shows which hotels (and wheelchair taxis) the chair can actually use, with the measurement behind each answer.

**Status:** all hotel, taxi and market data are **placeholders**, not real audits. The rule-based parts are tested. The Claude (AI) parts were **not** tested end to end because the author's OpenRouter account blocked the model during testing.

## Job to be done

> When I'm planning a family trip and my parent (65+, wheelchair user) needs to get into hotels, I want to describe their needs in plain words and see which hotels in one pilot city they can actually enter, backed by on-site measurements, so I can book with confidence and avoid surprise stairs.

**User:** an adult child aged 30–50 in urban India who books and plans trips for a parent aged 65+ who uses a wheelchair.

### The 3 tests

1. I type "Papa's chair is 66 cm wide and he can't manage any steps" and within about 10 seconds see the hotel list with a Fits / Fits with help / Doesn't fit label on each hotel.
2. Each hotel shows a plain-language reason (English or Hindi) and the dated photo behind it.
3. When the input is bad, the app doesn't guess. It asks me to fix or confirm it. If a profile field is unknown, the verdict is "Fits with help", never "Fits".

| Test | Result so far |
|---|---|
| 1 | Manual entry: pass (under 1 s). Typing the sentence for Claude to read: **untested** (AI blocked). |
| 2 | Reason, table and dated photo: pass. Hindi wording: **untested** (needs AI; falls back to English). |
| 3 | Pass: no width, a 6 cm chair, an empty description and an 18 cm audit door are all rejected with clear messages. Unknown values never give "Fits". |

## Current workflow → future workflow

**Today:** the family searches hotels, filters for "accessible" (a label with no definition), asks strangers on TripAdvisor or Facebook, phones the hotel about steps, lifts and bathroom doors, hunts for a wheelchair taxi city by city, and often finds out about the stairs on arrival.

**With StepFree:**
1. A trained auditor measures each place on site (steps, ramp, lift door and depth, bathroom door, turning space) and takes photos.
2. The child describes the parent once, in plain words, and confirms the numbers.
3. The child sees Fits / Fits with help / Doesn't fit per place, with the measurement behind it.
4. Each verdict links to a dated photo.
5. Wheelchair taxis are listed city by city, checked against the same chair.
6. The family books through the place's normal channel (outside this MVP).

## Architecture: Input → AI → Logic → Action → Output

| Stage | What happens |
|---|---|
| **Input** | The parent's description (text), the auditor's notes and photo, and dropdown choices. |
| **AI** (Claude) | Turns the description into numbers. Turns audit notes and photos into measurement fields. Writes a short English or Hindi reason. |
| **Logic** (plain code) | Range checks. Chair width → required measurements (chair + 10 cm for doors, 110 cm lift depth, 150 cm turning space). The Fits / Fits with help / Doesn't fit verdict. |
| **Action** | The child confirms the profile. The auditor confirms each measurement and saves. The user picks the language. |
| **Output** | A badge, a measured-vs-needed table, a reason, and a dated photo for each hotel or taxi. |

**Claude never decides the verdict.** It prepares inputs and writes words. A fixed rule compares numbers.

```
app/page.tsx              home page (hero, stats, search, browse by city and type, how it works)
app/check                 the fit checker: describe your parent, then see hotels and taxis
app/places                search and filter listings by city, type and features
app/auditor, market       auditor form and market facts
app/about, events, accessibility, volunteer, submit, partner, contact, terms, privacy   content pages and demo forms
components/SiteTools.tsx  text size, high contrast, storage choice and back-to-top
app/api/parse-profile     AI: text → chair width, steps, transfer help
app/api/extract-audit     AI: audit notes/photo → measurements
app/api/explain           AI: verdict + numbers → plain-language reason
app/api/hotels            read/save hotels (in memory, no AI)
lib/requirements.ts       chair width → required measurements
lib/fitRule.ts            hotelFit / taxiFit (the verdict)
lib/validate.ts           range checks
lib/claude.ts, prompts.ts the OpenRouter call and the three prompts
data/*.json               placeholder hotels, taxis and market facts
tests/rules.test.ts       unit tests for the rules
```

## Where AI is used, and why

| Step | AI or code | Why |
|---|---|---|
| Description → numbers | AI | "Papa can manage two low steps with support", in English or Hindi, can't be read by a fixed rule. A manual form is always there as a fallback. |
| Audit notes/photo → fields | AI | Free text in Hindi or English, and numbers inside photos of a tape measure. The auditor confirms every value. |
| Reason sentence | AI | Writing in the family's language. A plain-code English reason always shows first and when AI fails. |
| Requirements, range checks, verdict, saving | Code | Numeric comparisons must be exact and auditable. |

Every reason on screen is labelled "Wording by Claude" or "Written by the rule (no AI)".

## What stays human

- The child confirms or fixes every parsed number before any result is shown.
- The auditor confirms every extracted measurement before it is saved.
- The measuring itself happens on site. AI can't verify a physical step.
- Booking and the final judgement stay with the family.

## Why these tools

- **Next.js:** one project for the screen and the server routes, and it deploys to Vercel.
- **Claude through OpenRouter:** reads messy English/Hindi text and photos well. OpenRouter is used because that was the key available. Set `OPENROUTER_MODEL` to change the model.
- **Plain TypeScript rules and JSON files:** simple, testable, and no database to run for a hackathon.
- **Vitest:** fast unit tests for the rules.

## Failure cases and what the screen does

| What goes wrong | What happens |
|---|---|
| Empty description | The button is disabled, and the API also rejects it. |
| No chair width, or a 6 cm chair | A red message asks you to fix it. The profile can't be confirmed. |
| Steps allowed or transfer help unknown | Allowed, but the verdict can only be "Fits with help". |
| Audit value out of range (for example an 18 cm door) | Red message on the form, and the server refuses the save too. |
| Claude can't read a field | The field is left blank and shown as "not measured". |
| AI key missing, account blocks the model, service down, or unreadable reply | A plain message says why, the form stays editable, and rule-based reasons still show. |
| Claude misreads a number (81 read as 18) | The value appears in an editable box with "check every number", and the range check flags it. |
| Claude's sentence disagrees with the verdict | The badge and table come from code and sit beside the sentence. The prompt forbids changing the verdict. |
| Stale data (a hotel renovates) | Not handled yet. Each profile shows its audit date. Re-audits are future work. |

## Privacy

StepFree does not store any person's measurements.

- The parent profile (chair width, steps, transfer help) lives only in the browser page. It is not written to a database, a file, cookies or browser storage, and it is gone on refresh.
- The server routes keep no copy of what they receive and do not log it. The only log line prints the AI service's error text.
- To read the description and write each reason, the text and the numbers behind each verdict are sent to Claude through OpenRouter. Their data policy applies there. The screen says so and asks users not to type names, addresses or phone numbers.
- Hotel and taxi measurements are about places, not people. Audits saved on the Auditor page are kept in server memory only. The volunteer, submit, partner and contact forms are demos and store nothing.

## Known limits

- All hotels, taxis and photos are placeholders. The Market figures come from search snippets in the scope doc and are unverified.
- The measurement constants (+10 cm, 110 cm, 150 cm, 140 cm taxi height) are assumptions to confirm with an accessibility expert.
- Audits saved on the Auditor page live in memory and are lost when the server restarts.
- No taxi provider for Delhi is listed, because none was named in the scope doc.

## Run it locally

You need Node.js (LTS) and git.

```bash
npm install
```

Create `.env.local` (it is git-ignored) from the example and put your OpenRouter key in it:

```bash
copy .env.example .env.local
```

```
OPENROUTER_API_KEY=your-key-here
```

Then start the app and open http://localhost:3000:

```bash
npm run dev
```

Run the tests:

```bash
npm test
```

Without a key, everything works except the three AI features (Understand, Hindi reasons, and the Auditor's fill-in). You can type the numbers by hand.

**Never commit a real key.** `.env.local` is listed in `.gitignore`.

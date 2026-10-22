import { askClaude, errorResponse, parseJsonObject } from "@/lib/claude";
import { EXTRACT_AUDIT_SYSTEM } from "@/lib/prompts";
import type { AuditFields } from "@/lib/types";

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

export async function POST(req: Request) {
  const { note, photoDataUrl } = (await req.json()) as { note?: string; photoDataUrl?: string };
  if (!note?.trim() && !photoDataUrl) {
    return Response.json({ error: "empty", message: "Add a note or a photo first." }, { status: 400 });
  }
  try {
    const raw = await askClaude({
      system: EXTRACT_AUDIT_SYSTEM,
      text: (note ?? "").slice(0, 3000) || "See the photo.",
      imageDataUrl: photoDataUrl,
      maxTokens: 300,
    });
    const obj = parseJsonObject(raw);
    if (!obj) return Response.json({ error: "bad-json", message: "Couldn't read that. Fill the form by hand." }, { status: 502 });
    const fields: AuditFields = {
      entranceSteps: num(obj.entranceSteps),
      ramp: typeof obj.ramp === "boolean" ? obj.ramp : null,
      roomDoorCm: num(obj.roomDoorCm),
      bathroomDoorCm: num(obj.bathroomDoorCm),
      liftDoorCm: num(obj.liftDoorCm),
      liftDepthCm: num(obj.liftDepthCm),
      turningSpaceCm: num(obj.turningSpaceCm),
    };
    return Response.json({ fields });
  } catch (e) {
    return errorResponse(e);
  }
}

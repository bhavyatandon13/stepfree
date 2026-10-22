import seed from "@/data/hotels.json";
import { validateAudit } from "@/lib/validate";
import type { Hotel } from "@/lib/types";

// Saved audits live in memory for the MVP (Vercel's disk is read-only). They reset on restart.
const saved: Hotel[] = [];

export async function GET() {
  return Response.json({ hotels: [...(seed as Hotel[]), ...saved] });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Hotel>;
  if (!body.name?.trim()) {
    return Response.json({ error: "Please give the hotel a name." }, { status: 400 });
  }
  const hotel: Hotel = {
    id: `u${Date.now()}`,
    name: body.name.trim().slice(0, 80),
    area: (body.area ?? "Delhi").slice(0, 80),
    isPlaceholder: false,
    auditDate: new Date().toISOString().slice(0, 10),
    entranceSteps: body.entranceSteps ?? null,
    ramp: body.ramp ?? null,
    roomDoorCm: body.roomDoorCm ?? null,
    bathroomDoorCm: body.bathroomDoorCm ?? null,
    liftDoorCm: body.liftDoorCm ?? null,
    liftDepthCm: body.liftDepthCm ?? null,
    turningSpaceCm: body.turningSpaceCm ?? null,
    photo: body.photo ?? "/photos/entrance.svg",
    photoCaption: body.photoCaption ?? "Auditor photo",
  };
  // The server checks ranges again, so a bad number can't be saved even if the form is bypassed.
  const problems = validateAudit(hotel);
  if (problems.length > 0) return Response.json({ error: problems.join(" ") }, { status: 400 });
  saved.push(hotel);
  return Response.json({ hotel });
}

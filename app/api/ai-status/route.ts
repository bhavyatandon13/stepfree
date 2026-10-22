import { connection } from "next/server";
import { aiConfigured } from "@/lib/claude";

// Tells the browser whether AI wording is available, without revealing anything about the key.
export async function GET() {
  await connection(); // read the setting at request time, not at build time
  return Response.json({ enabled: aiConfigured() });
}

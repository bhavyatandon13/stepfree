import { Suspense } from "react";
import HotelDetail from "@/components/HotelDetail";
import hotels from "@/data/hotels.json";

// The sample hotels are built ahead of time; hotels added on the Auditor page are looked up on request.
export function generateStaticParams() {
  return hotels.map((h) => ({ id: h.id }));
}

export default async function HotelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<p className="p-4">Loading hotel…</p>}>
      <HotelDetail id={id} />
    </Suspense>
  );
}

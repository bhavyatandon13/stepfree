import { notFound } from "next/navigation";
import { Suspense } from "react";
import CityHub from "@/components/CityHub";
import { CITIES, cityBySlug } from "@/lib/cities";

export function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = cityBySlug(slug);
  if (!city) notFound();
  return (
    <Suspense fallback={<p className="p-4">Loading {city.name}…</p>}>
      <CityHub city={city.name} />
    </Suspense>
  );
}

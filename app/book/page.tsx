"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import BookingFlow from "@/components/BookingFlow";

function Book() {
  const hotel = useSearchParams().get("hotel");
  if (!hotel) {
    return (
      <main className="mx-auto max-w-3xl space-y-3 p-4 py-10">
        <h1 className="text-2xl font-bold">Choose a hotel first</h1>
        <Link href="/places?category=Hotel" className="underline">See accessible hotels</Link>
      </main>
    );
  }
  return <BookingFlow hotelId={hotel} />;
}

export default function BookPage() {
  return (
    <Suspense fallback={<p className="p-4">Loading…</p>}>
      <Book />
    </Suspense>
  );
}

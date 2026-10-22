"use client";
import AuditForm from "@/components/AuditForm";

export default function Auditor() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4">
      <h1 className="text-2xl font-bold">For auditors</h1>
      <AuditForm onSaved={() => {}} />
    </main>
  );
}

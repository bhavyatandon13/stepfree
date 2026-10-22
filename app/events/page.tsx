import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function Events() {
  return (
    <PageShell title="Events and campaigns" intro="What we are planning as Stepfree grows.">
      <p className="rounded-lg border border-gray-200 bg-tint p-5">
        No events are scheduled yet. This is a hackathon prototype, and we would rather show nothing than invent dates.
      </p>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Ideas we want to run</h2>
        <ul className="list-disc space-y-1 pl-6 text-muted">
          <li>Audit days, where volunteers measure hotels and taxis in one city together.</li>
          <li>Training for auditors, so measurements are comparable between people.</li>
          <li>Talks with schools and offices about planning trips for older family members.</li>
        </ul>
      </section>
      <p>
        Want to help make one happen? <Link href="/volunteer" className="font-semibold text-brand underline">Volunteer</Link> or{" "}
        <Link href="/partner" className="font-semibold text-brand underline">partner with us</Link>.
      </p>
    </PageShell>
  );
}

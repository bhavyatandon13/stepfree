import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function About() {
  return (
    <PageShell title="Our story" intro="Why StepFree exists, and what it promises.">
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">The problem</h2>
        <p className="text-muted">
          Adult children in Indian cities spend hours researching and phoning hotels, taxis and stations before a trip with a parent aged 65 or more
          who uses a wheelchair. A label that says &ldquo;accessible&rdquo; never says whether there is a step-free entrance, a lift that fits a chair,
          or a bathroom door that is wide enough.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">The promise</h2>
        <p className="text-muted">
          Families know before booking which places a wheelchair can actually enter, because each place is checked on site with a tape measure. They plan
          with confidence, avoid surprise stairs, and their parent travels with dignity instead of staying home.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">How the technology helps</h2>
        <p className="text-muted">
          People measure. A fixed rule compares the numbers with your parent&apos;s chair, so the answer can be checked. AI only helps with reading
          messy notes and writing the explanation in plain English or Hindi. It never decides whether a place fits.
        </p>
      </section>
      <p className="text-sm text-muted">Today this is a prototype with placeholder data. See <Link href="/market" className="underline">why it matters</Link>.</p>
    </PageShell>
  );
}

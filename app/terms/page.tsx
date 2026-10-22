import PageShell from "@/components/PageShell";

export default function Terms() {
  return (
    <PageShell title="Terms of use" intro="A plain-language draft for this hackathon prototype. It is not legal advice.">
      <ul className="list-disc space-y-2 pl-6 text-muted">
        <li>Stepfree is a prototype. Every hotel, taxi, photo and measurement shown is a placeholder, not a real audit.</li>
        <li>Do not rely on it to decide whether a real place is safe or accessible. Phone the place and confirm before you travel.</li>
        <li>The rule that decides Fits, Fits with help or Doesn&apos;t fit uses assumed sizes (a door must be 10 cm wider than the chair, for example). They have not been checked by an expert.</li>
        <li>Please do not type names, addresses, phone numbers or health details into any box.</li>
        <li>We may change or remove the site at any time.</li>
      </ul>
    </PageShell>
  );
}

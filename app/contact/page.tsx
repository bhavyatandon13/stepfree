import InterestForm from "@/components/InterestForm";
import PageShell from "@/components/PageShell";

export default function Contact() {
  return (
    <PageShell title="Contact" intro="Questions, ideas or corrections? Write to us.">
      <InterestForm kind="contact" />
    </PageShell>
  );
}

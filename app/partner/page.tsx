import InterestForm from "@/components/InterestForm";
import PageShell from "@/components/PageShell";

export default function Partner() {
  return (
    <PageShell title="Partner with us" intro="Schools, businesses and disability groups can help us measure more places and reach more families.">
      <InterestForm kind="partner" />
    </PageShell>
  );
}

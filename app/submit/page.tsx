import InterestForm from "@/components/InterestForm";
import PageShell from "@/components/PageShell";

export default function Submit() {
  return (
    <PageShell title="Submit a place" intro="Know a hotel or taxi provider with good (or bad) access? Tell us and we will measure it.">
      <InterestForm kind="submit" />
    </PageShell>
  );
}

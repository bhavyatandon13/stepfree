import InterestForm from "@/components/InterestForm";
import PageShell from "@/components/PageShell";

export default function Volunteer() {
  return (
    <PageShell title="Volunteer" intro="StepFree depends on people with a tape measure. Help us check places in your city.">
      <InterestForm kind="volunteer" />
    </PageShell>
  );
}

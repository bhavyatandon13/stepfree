import PageShell from "@/components/PageShell";

export default function Privacy() {
  return (
    <PageShell title="Privacy notice" intro="What this prototype does with your information. A plain-language draft, not legal advice.">
      <ul className="list-disc space-y-2 pl-6 text-muted">
        <li><strong className="text-foreground">Your parent&apos;s details are not saved.</strong> The chair width, steps and help needed stay on the page and disappear when you refresh.</li>
        <li><strong className="text-foreground">AI.</strong> To read your description and write each reason, your text and the numbers behind each answer are sent to Claude through OpenRouter, which has its own data policy. If the AI is unavailable, a simple reader on our server reads your text and keeps nothing.</li>
        <li><strong className="text-foreground">Forms.</strong> The volunteer, submit, partner and contact forms are demos. Nothing you type is sent or stored.</li>
        <li><strong className="text-foreground">In your browser.</strong> If you click Agree, we remember your text size and contrast choice in this browser. If you click Disagree, we remember only that choice. We use no trackers, no adverts and no location.</li>
      </ul>
    </PageShell>
  );
}

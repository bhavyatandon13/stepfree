import PageShell from "@/components/PageShell";

export default function Privacy() {
  return (
    <PageShell title="Privacy notice" intro="What this prototype does with your information. A plain-language draft, not legal advice.">
      <ul className="list-disc space-y-2 pl-6 text-muted">
        <li><strong className="text-foreground">Your parent&apos;s details are not saved on our server.</strong> The chair width, steps and help needed, and your trip dates, stay in this browser tab so every page can use them, and are forgotten when you close the tab.</li>
        <li><strong className="text-foreground">Booking requests.</strong> The lead guest&apos;s name, mobile number and requests stay in your browser. This demo sends them to no hotel and no server. They are kept on this device only if you click Agree (or &ldquo;Keep my trips on this device&rdquo;); otherwise they are gone when you refresh.</li>
        <li><strong className="text-foreground">AI.</strong> To read your description and write each reason, your text and the numbers behind each answer are sent to Claude through OpenRouter, which has its own data policy. If the AI is unavailable, a simple reader on our server reads your text and keeps nothing.</li>
        <li><strong className="text-foreground">Live photos.</strong> Photos you add are made smaller and stamped with the date, time and place, then kept in your browser only (on this device only if you click Agree). In this demo they are not uploaded anywhere.</li>
        <li><strong className="text-foreground">Forms.</strong> The volunteer, submit, partner and contact forms are demos. Nothing you type is sent or stored.</li>
        <li><strong className="text-foreground">In your browser.</strong> If you click Agree, we remember your text size and contrast choice in this browser. If you click Disagree, we remember only that choice. We use no trackers, no adverts and no location.</li>
      </ul>
    </PageShell>
  );
}

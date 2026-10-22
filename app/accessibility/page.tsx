import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function Accessibility() {
  return (
    <PageShell title="Our accessibility commitment" intro="A site about access has to be usable by everyone.">
      <ul className="list-disc space-y-2 pl-6 text-muted">
        <li><strong className="text-foreground">Text size.</strong> Use A−, A and A+ at the top of every page. Your choice is remembered if you agree to storage.</li>
        <li><strong className="text-foreground">High contrast.</strong> One button switches to black text, strong borders and underlined links.</li>
        <li><strong className="text-foreground">Keyboard.</strong> Every link, button and form works with the Tab, Shift+Tab, Enter and Space keys. A visible outline shows where you are, and &ldquo;Skip to content&rdquo; is the first stop on each page.</li>
        <li><strong className="text-foreground">Plain language.</strong> Each answer shows the number measured, the number needed and a short sentence, in English or Hindi.</li>
        <li><strong className="text-foreground">Not colour alone.</strong> Every result has a symbol and a word as well as a colour.</li>
      </ul>
      <p className="text-muted">
        We have not had this reviewed by an accessibility expert yet. If something blocks you, please <Link href="/contact" className="underline">tell us</Link>.
      </p>
    </PageShell>
  );
}

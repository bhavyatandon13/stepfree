import type { ReactNode } from "react";

// A simple page with a title and an intro, used by the content pages.
export default function PageShell({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        {intro && <p className="text-lg text-muted">{intro}</p>}
      </header>
      {children}
    </main>
  );
}

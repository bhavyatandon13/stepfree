import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stepfree: know before you book",
  description: "Measured, on-site checks that show whether a wheelchair can get into a hotel or taxi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-white focus:p-2">
          Skip to content
        </a>
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 p-4">
            <Link href="/" className="text-xl font-bold text-brand">Stepfree</Link>
            <nav aria-label="Main" className="flex items-center gap-4 text-sm font-medium">
              <Link href="/#how" className="hover:text-brand">How it works</Link>
              <Link href="/check" className="rounded-full bg-accent px-4 py-2 font-semibold text-gray-900 hover:brightness-95">
                Check a place
              </Link>
            </nav>
          </div>
        </header>
        <div id="main" className="flex-1">{children}</div>
        <footer className="border-t border-gray-200 bg-tint">
          <div className="mx-auto max-w-5xl space-y-1 p-4 text-sm text-muted">
            <p className="font-semibold text-foreground">Stepfree</p>
            <p>Know before you book whether your parent&apos;s wheelchair can get in.</p>
            <p>Hackathon MVP. All hotels, taxis and photos shown are placeholders, not real audits.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

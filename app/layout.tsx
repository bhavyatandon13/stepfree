import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { AccessibilityToolbar, BackToTop, ConsentBanner } from "@/components/SiteTools";
import { listings } from "@/lib/siteData";
import { countBy } from "@/lib/listings";
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
  title: "Step Free: know before you book",
  description: "Measured, on-site checks that show whether a wheelchair can get into a hotel or taxi.",
};

const NAV = [
  { href: "/", label: "Home" },
  { href: "/places", label: "Explore" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/contact", label: "Contact" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  const cities = countBy(listings, "city").map(([c]) => c);
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2">
          Skip to content
        </a>
        <AccessibilityToolbar />
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 p-4">
            <Link href="/" className="text-xl font-bold text-brand">Step Free</Link>
            <nav aria-label="Main" className="hidden items-center gap-4 text-sm font-medium lg:flex">
              {NAV.map((n) => <Link key={n.href} href={n.href} className="hover:text-brand">{n.label}</Link>)}
            </nav>
            <div className="hidden items-center gap-2 text-sm font-semibold sm:flex">
              <Link href="/submit" className="rounded-full border border-brand px-4 py-2 text-brand hover:bg-tint">Submit a place</Link>
              <Link href="/check" className="rounded-full bg-brand px-4 py-2 text-white hover:bg-brand-dark">Check a place</Link>
            </div>
            <details className="relative lg:hidden">
              <summary className="cursor-pointer list-none rounded border border-gray-300 px-3 py-2 text-sm font-medium">Menu</summary>
              <div className="absolute right-0 z-30 mt-2 flex w-56 flex-col gap-1 rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg">
                {NAV.map((n) => <Link key={n.href} href={n.href} className="rounded px-2 py-1.5 hover:bg-tint">{n.label}</Link>)}
                <Link href="/submit" className="rounded px-2 py-1.5 hover:bg-tint">Submit a place</Link>
                <Link href="/check" className="mt-1 rounded-full bg-brand px-3 py-2 text-center font-semibold text-white">Check a place</Link>
              </div>
            </details>
          </div>
        </header>
        <div id="main" className="flex-1">{children}</div>
        <footer className="border-t border-gray-200 bg-tint">
          <div className="mx-auto grid max-w-5xl gap-6 p-6 text-sm text-muted sm:grid-cols-4">
            <div>
              <p className="font-semibold text-foreground">Step Free</p>
              <p className="mt-1">Know before you book whether your parent&apos;s wheelchair can get in.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Platform</p>
              <ul className="mt-1 space-y-1">
                <li><Link href="/places" className="hover:underline">Explore places</Link></li>
                <li><Link href="/check" className="hover:underline">Check a place</Link></li>
                <li><Link href="/submit" className="hover:underline">Submit a place</Link></li>
                <li><Link href="/events" className="hover:underline">Events</Link></li>
                <li><Link href="/volunteer" className="hover:underline">Volunteer</Link></li>
                <li><Link href="/auditor" className="hover:underline">For auditors</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground">About</p>
              <ul className="mt-1 space-y-1">
                <li><Link href="/about" className="hover:underline">Our story</Link></li>
                <li><Link href="/market" className="hover:underline">Why it matters</Link></li>
                <li><Link href="/terms" className="hover:underline">Terms of use</Link></li>
                <li><Link href="/privacy" className="hover:underline">Privacy notice</Link></li>
                <li><Link href="/accessibility" className="hover:underline">Accessibility</Link></li>
                <li><Link href="/contact" className="hover:underline">Contact</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground">Cities</p>
              <ul className="mt-1 space-y-1">
                {cities.map((c) => <li key={c}><Link href={`/places?city=${encodeURIComponent(c)}`} className="hover:underline">{c}</Link></li>)}
              </ul>
            </div>
          </div>
          <p className="border-t border-gray-200 px-6 py-3 text-center text-xs text-muted">
            Hackathon MVP. All hotels, taxis and photos shown are placeholders, not real audits.
          </p>
        </footer>
        <ConsentBanner />
        <BackToTop />
      </body>
    </html>
  );
}

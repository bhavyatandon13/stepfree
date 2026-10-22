import Link from "next/link";

// The StepFree mark: a ramp in a rounded square, next to the name in the brand font.
export function Mark({ size = 40, tone = "dark" }: { size?: number; tone?: "dark" | "light" }) {
  const box = tone === "light" ? "#ffffff" : "currentColor";
  const ramp = tone === "light" ? "#1d4ed8" : "#ffffff";
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 40 40" className="shrink-0 text-brand">
      <rect width="40" height="40" rx="10" fill={box} />
      <path d="M9 30h22V10L9 30z" fill={ramp} />
    </svg>
  );
}

export function Wordmark({ tone = "dark", className = "text-3xl" }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <span className={`font-brand font-extrabold leading-none tracking-tight ${className} ${tone === "light" ? "text-white" : "text-slate-900"}`}>
      Step<span className={tone === "light" ? "text-sky-200" : "text-brand"}>Free</span>
    </span>
  );
}

export default function Logo({ tone = "dark", size = "text-3xl", markSize = 40 }: { tone?: "dark" | "light"; size?: string; markSize?: number }) {
  return (
    <Link href="/" aria-label="StepFree, home" className="inline-flex items-center gap-2.5">
      <Mark tone={tone} size={markSize} />
      <Wordmark tone={tone} className={size} />
    </Link>
  );
}

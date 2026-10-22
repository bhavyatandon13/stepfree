// A cheerful illustration for the home page: a wheelchair rolling up a ramp to an open door.
// Decorative only, so screen readers skip it.
export default function HeroArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={className} aria-hidden focusable="false">
      {/* floating sparkles */}
      <g className="float">
        <circle cx="40" cy="40" r="6" fill="#fde047" />
        <circle cx="280" cy="30" r="4" fill="#fbcfe8" />
      </g>
      <g className="float-slow">
        <path d="M250 70l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="#fde047" />
        <path d="M70 90l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" fill="#ffffff" opacity="0.8" />
      </g>

      {/* building with an open, wide door */}
      <rect x="215" y="70" width="90" height="110" rx="10" fill="#ffffff" opacity="0.95" />
      <rect x="240" y="110" width="40" height="70" rx="4" fill="#facc15" />
      <rect x="230" y="84" width="60" height="14" rx="7" fill="#6d28d9" />
      <text x="260" y="95" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffffff" fontFamily="sans-serif">STEPFREE</text>

      {/* ground and ramp */}
      <rect x="0" y="200" width="320" height="40" fill="#ffffff" opacity="0.25" />
      <path d="M40 200 L240 180 L240 200 Z" fill="#ffffff" opacity="0.9" />

      {/* wheelchair rolling up the ramp */}
      <g className="roll-up">
        <g transform="translate(120 150) rotate(-6)">
          {/* person */}
          <circle cx="8" cy="-34" r="9" fill="#fde047" />
          <path d="M8 -24 L8 2 L26 2" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M26 2 L30 18" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
          {/* chair frame */}
          <path d="M-6 -20 L-6 6 L30 6" stroke="#4c1d95" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* big wheel, spinning */}
          <g className="spin">
            <circle cx="4" cy="16" r="18" fill="none" stroke="#4c1d95" strokeWidth="4" />
            <path d="M4 -2 V34 M-14 16 H22 M-8 4 L16 28 M16 4 L-8 28" stroke="#4c1d95" strokeWidth="2" />
          </g>
          {/* small front wheel */}
          <circle cx="32" cy="28" r="6" fill="#4c1d95" />
        </g>
      </g>
    </svg>
  );
}

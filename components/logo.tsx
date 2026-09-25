export function Logo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 172 32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="DomusGraph" className={className}>
      <g transform="translate(0 2)">
        <line x1="14" y1="4" x2="4" y2="20" className="stroke-signal" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="14" y1="4" x2="24" y2="20" className="stroke-signal" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="4" y1="20" x2="24" y2="20" className="stroke-signal" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="14" y1="4" x2="14" y2="20" className="stroke-signal" strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
        <circle cx="14" cy="4" r="3.1" className="fill-signal" />
        <circle cx="4" cy="20" r="3.1" className="fill-leaf" />
        <circle cx="24" cy="20" r="3.1" className="fill-leaf" />
        <circle cx="14" cy="20" r="2.3" className="fill-slate" />
      </g>
      <text x="36" y="23" fontFamily="var(--font-sans), Inter, -apple-system, sans-serif" fontWeight="800" fontSize="20" letterSpacing="-0.02em">
        <tspan className="fill-ink">Domus</tspan>
        <tspan className="fill-signal">Graph</tspan>
      </text>
    </svg>
  );
}

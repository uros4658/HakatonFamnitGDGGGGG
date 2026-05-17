export function RouteCompass({ order, exponents }: { order: number; exponents: number[] }) {
  const cx = 60, cy = 60, r = 45;
  const LABELS: Record<number, string[]> = {
    4: ["E", "N", "W", "S"],
    6: ["E", "NE", "NW", "W", "SW", "SE"],
    8: ["E", "NE", "N", "NW", "W", "SW", "S", "SE"],
    12: ["E", "ENE", "NE", "NNE", "N", "NNW", "NW", "WNW", "W", "WSW", "SW", "SSW"],
  };
  const labels = LABELS[order] || [];

  return (
    <svg viewBox="0 0 120 120" className="w-full max-w-[120px]">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#334155" strokeWidth="0.5" />
      {Array.from({ length: order }, (_, k) => {
        const angle = (2 * Math.PI * k) / order - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        const active = exponents.includes(k);
        return (
          <g key={k}>
            <circle cx={x} cy={y} r={active ? 4 : 2} fill={active ? "#14b8a6" : "#475569"} />
            <text x={cx + (r + 10) * Math.cos(angle)} y={cy + (r + 10) * Math.sin(angle)} textAnchor="middle" dominantBaseline="middle" className="text-[6px]" fill="#94a3b8">
              {labels[k] || ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

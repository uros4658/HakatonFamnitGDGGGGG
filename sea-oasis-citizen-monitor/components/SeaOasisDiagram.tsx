export function SeaOasisDiagram({ order, exponents }: { order: number; exponents: number[] }) {
  const cx = 80, cy = 80, r = 60;
  const points = exponents.map(k => {
    const angle = (2 * Math.PI * k) / order - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  return (
    <svg viewBox="0 0 160 160" className="w-full max-w-[160px]">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#334155" strokeWidth="1" />
      {points.map((p, i) => {
        const next = points[(i + 1) % points.length];
        return <line key={i} x1={p.x} y1={p.y} x2={next.x} y2={next.y} stroke="#06b6d4" strokeWidth="1.5" />;
      })}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#14b8a6" />
      ))}
    </svg>
  );
}

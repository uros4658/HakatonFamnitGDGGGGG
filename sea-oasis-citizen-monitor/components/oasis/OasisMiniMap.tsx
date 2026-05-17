export default function OasisMiniMap() {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-100">Approximate Local Map Anchor</h2>
      <div className="relative h-44 overflow-hidden rounded-lg border border-slate-800 bg-sky-950">
        <div className="absolute left-0 top-0 h-full w-1/3 bg-emerald-950/90" />
        <div className="absolute left-[30%] top-0 h-full w-12 bg-cyan-900/60 blur-sm" />
        <div className="absolute left-[60%] top-[46%] h-4 w-4 rounded-full bg-rose-400 shadow-[0_0_24px_rgba(251,113,133,0.9)]" />
        <div className="absolute left-[61%] top-[55%] text-xs font-medium text-rose-100">Sea Oasis Piran</div>
        <div className="absolute bottom-3 left-4 text-xs text-emerald-200">Slovenian coast</div>
        <div className="absolute bottom-3 right-4 text-xs text-cyan-100">Gulf of Piran</div>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 180" aria-hidden="true">
          <path d="M150 90 C210 72 250 78 300 84" stroke="#67e8f9" strokeDasharray="6 6" fill="none" />
          <text x="205" y="67" fill="#a5f3fc" fontSize="11">~1 km offshore</text>
        </svg>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Gulf of Piran, approximately 1 km off the Slovenian coast. Offset coordinates in this module are approximate
        display values, not precision GPS waypoints for real drone navigation.
      </p>
    </section>
  );
}


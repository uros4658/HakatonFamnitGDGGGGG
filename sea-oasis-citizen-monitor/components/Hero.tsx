export function Hero({ title, subtitle, disclaimer }: { title: string; subtitle: string; disclaimer?: string }) {
  return (
    <section className="text-center py-12">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="mt-3 text-lg text-slate-300">{subtitle}</p>
      {disclaimer && (
        <div className="mt-4 inline-block px-3 py-1 rounded-full bg-amber-900/50 text-amber-300 text-xs font-medium">
          {disclaimer}
        </div>
      )}
    </section>
  );
}

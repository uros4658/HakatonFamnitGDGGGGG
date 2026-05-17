import { Pi } from "lucide-react";

export default function MathPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Pi className="text-violet-400" size={28} />
        <h1 className="text-2xl font-bold">Math Explanation</h1>
      </div>

      <div className="p-3 rounded-lg bg-violet-900/20 border border-violet-800 text-xs text-violet-300">
        The roots-of-unity algorithm does not detect marine life. It generates and certifies
        balanced primitive survey routes. The ecological value comes from making observations
        more repeatable and comparable over time.
      </div>

      <Section title="Roots Of Unity">
        <p>
          A root of unity is a complex number whose positive integer power equals 1. We write
          the standard N-th root as zeta_N = exp(2pi i / N). The powers zeta_N^0, zeta_N^1,
          ..., zeta_N^(N-1) are equally spaced points on the unit circle.
        </p>
        <Code>{"zeta_N = exp(2pi i / N)"}</Code>
      </Section>

      <Section title="Vanishing Sums">
        <p>
          A sum of roots of unity vanishes when the terms add exactly to zero. In route terms,
          each root is a direction vector. Sum zero means the route has no net direction and is
          balanced for repeatable surveys.
        </p>
        <Code>{"zeta_N^a1 + zeta_N^a2 + ... + zeta_N^ak = 0"}</Code>
      </Section>

      <Section title="Minimal And Primitive">
        <p>
          A vanishing sum is minimal when no proper nonempty sub-sum also vanishes. The app calls
          these routes primitive because they are not repeated smaller balanced loops.
        </p>
      </Section>

      <Section title="Weight And Directions">
        <p>
          The weight is the number of terms in the sum, which is the number of route steps.
          Supported route resolutions are 4, 6, 8, and 12 directions.
        </p>
        <Code>{"N=8: E=zeta^0, NE=zeta^1, N=zeta^2, NW=zeta^3, W=zeta^4, SW=zeta^5, S=zeta^6, SE=zeta^7"}</Code>
      </Section>

      <Section title="Catalog Dictionary">
        <p>
          The classification dictionary comes from arXiv:2008.11268, Appendix A, Table 2. In
          this project it is sourced from pattern_catalog.py and generated into the app catalog.
          It contributes type names, weights, heights, parities, source metadata, and whether a
          weight range is proved or computationally conjectural.
        </p>
      </Section>

      <Section title="Algorithm Contribution">
        <p>
          The route generator loads precomputed route patterns and uses exact symbolic validation
          for supported cases. It does not use floating point to decide mathematical truth.
          Numeric sums may be shown only as a visual aid.
        </p>
        <Code>{"x^a1 + x^a2 + ... + x^ak == 0 mod Phi_N(x)"}</Code>
      </Section>

      <Section title="Monitoring Value">
        <p>
          Balanced primitive routes help make citizen observations more comparable over time.
          The app still depends on structured photos, careful tags, notes, and expert review for
          ecological interpretation.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
      <div className="text-sm text-slate-400 space-y-2">{children}</div>
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <div className="font-mono text-xs bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-cyan-300 overflow-x-auto">
      {children}
    </div>
  );
}

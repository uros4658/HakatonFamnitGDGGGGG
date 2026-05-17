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

      <Section title="Roots of Unity">
        <p>
          A root of unity is a complex number whose positive integer power equals 1.
          The standard primitive N-th root of unity is:
        </p>
        <Code>{"?_N = e^(2pi/N)"}</Code>
        <p>
          The N-th roots of unity are ?_N^0 = 1, ?_N^1, ?_N^2, ..., ?_N^(N-1) � equally spaced
          points on the unit circle in the complex plane. Each root represents a direction.
          With N=8, the roots correspond to compass directions: E, NE, N, NW, W, SW, S, SE.
        </p>
      </Section>

      <Section title="Sums of Roots of Unity (Sorou)">
        <p>
          Following the paper, a <strong>sum of roots of unity</strong> (sorou) is a finite
          list h = (?1, ?2, ..., ?_n) of roots of unity. Its <strong>value</strong> is the
          complex number val(h) = ?1 + ?2 + ... + ?_n. Two sorou are equivalent
          under <strong>rotation</strong>: multiplying all terms by a common root of unity z.
        </p>
        <p>
          The <strong>weight</strong> of a sorou is the number of terms n. The <strong>height</strong> is
          the maximum multiplicity of any term. The <strong>order</strong> is the LCM of the orders
          of all terms. The <strong>relative order</strong> is the LCM of orders of all ratios ?_i/?_j.
        </p>
      </Section>

      <Section title="Vanishing Sums">
        <p>
          A sorou is <strong>vanishing</strong> if its value is 0:
        </p>
        <Code>{"?1 + ?2 + ... + ?_n = 0"}</Code>
        <p>
          Geometrically, the direction vectors form a closed polygon � they return to the origin.
          For survey routes, this means the route is <strong>balanced</strong>: there is no net
          directional bias.
        </p>
      </Section>

      <Section title="Minimal Vanishing Sums">
        <p>
          A vanishing sorou is <strong>minimal</strong> if no proper, nonempty sub-sum also vanishes.
          Equivalently, you cannot remove any subset of terms and still have a sum equal to zero.
        </p>
        <p>
          Every vanishing sorou can be decomposed into a sum of minimal vanishing sorou (though
          not necessarily uniquely). Minimal vanishing sums produce <strong>primitive</strong> routes
          that cannot be split into smaller balanced sub-routes � the most efficient balanced
          routes of their weight.
        </p>
        <p>
          A key structural property (Lemma 2.1 in the paper): the relative order of a minimal
          vanishing sorou is always a product of <strong>distinct primes</strong> p1 &lt; p2 &lt; ... &lt; p_s.
        </p>
      </Section>

      <Section title="Types: The Classification System">
        <p>
          The paper classifies minimal vanishing sums by their <strong>type</strong>, defined recursively
          (Definition 2.4):
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          <li><strong>R_p</strong> (prime type): The sum of all p-th roots of unity. E.g., R3 = 1 + ?3 + ?3�, R5 = 1 + ?5 + ?5� + ?5� + ?54.</li>
          <li><strong>(R_p : T1, T2, ...)</strong> (composite type): A minimal vanishing sorou decomposed via Proposition 2.3 with top prime p and subsidiary types T1, T2, ...</li>
          <li><strong>T1 ? T2 ? ...</strong>: A non-minimal vanishing sorou that splits into independent minimal vanishing sums of the given types.</li>
        </ul>
        <p>
          Example types: (R5 : R3) has weight 6, (R5 : 2R3) has weight 7, (R7 : R5) has weight 10, (R11 : R3, R5) has weight 16.
        </p>
      </Section>

      <Section title="Proposition 2.3: The Key Structural Theorem">
        <p>
          For a minimal vanishing sorou h with top prime p, after rotation:
        </p>
        <Code>{"h = S_{j=0}^{p-1} ?_p^j � f_j"}</Code>
        <p>
          where f0, f1, ..., f_{"{p-1}"} are subsidiary sorou of lower order. The sorou h vanishes
          iff val(f0) = val(f1) = ... = val(f_{"{p-1}"}). It is minimal vanishing iff additionally:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          <li>val(f0) ? 0</li>
          <li>No f_j has a vanishing proper nonempty subsorou</li>
          <li>There is no complex z such that all f_j share a proper subsorou with value z</li>
        </ul>
        <p>
          The type is then (R_p : f0 : T1, T2, ..., T_n) where T_i is the type of f0 - f_{"{j(i)}"} for each j where f_j ? f0. When f0 = 1 (the most common case), we write simply (R_p : T1, ..., T_n).
        </p>
      </Section>

      <Section title="Parities">
        <p>
          The <strong>parity</strong> of a sorou is the pair (a, b) counting the number of terms of
          odd and even order respectively. Since rotations can swap odd/even, the pair is
          unordered. Parities constrain which concrete sorou can realize a given type.
        </p>
        <p>
          For example, R3 always has parity (3, 0), while (R5 : R3) has parity (4, 2).
        </p>
      </Section>

      <Section title="Height">
        <p>
          Most minimal vanishing sums have <strong>height 1</strong> (each root appears at most once).
          The paper conjectures that the lowest weight at which height &gt; 1 occurs is weight 21
          (Conjecture 4.5). All types in our catalog with weight = 20 have height 1.
        </p>
      </Section>

      <Section title="Weight and Route Length">
        <p>
          The weight equals the number of roots (directions) in the route. Classification results:
        </p>
        <div className="text-xs space-y-1 text-slate-400">
          <div>Weight 2: 1 type (R2)</div>
          <div>Weight 3: 1 type (R3)</div>
          <div>Weight 5: 1 type (R5)</div>
          <div>Weight 6: 1 type (R5:R3)</div>
          <div>Weight 7: 2 types (R7, (R5:2R3))</div>
          <div>Weight 8-10: 2-4 types each</div>
          <div>Weight 11-16: rapidly increasing � 76 types total up to weight 16</div>
          <div>Weight 17-21: computationally enumerated (conjectural)</div>
        </div>
      </Section>

      <Section title="Route Directions as Roots">
        <p>
          We map each possible survey direction to a root of unity:
        </p>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <Code>{"N=4:  E=?�  N=?�  W=?�  S=?�"}</Code>
          <Code>{"N=8:  E=?�  NE=?�  N=?�  NW=?�  W=?4  SW=?5  S=?6  SE=?7"}</Code>
          <Code>{"N=12: E=?�  ENE=?�  NE=?�  NNE=?�  N=?4  NNW=?5  NW=?6  ..."}</Code>
        </div>
        <p>
          A route is a sequence of these directions. The sum-zero condition guarantees the route
          is directionally balanced � walking one unit in each direction returns to the start.
        </p>
      </Section>

      <Section title="Why Sum Zero = Balanced Route">
        <p>
          If you travel one unit step in each direction of the route, a vanishing sum means you
          end up exactly where you started. No direction is over-represented. Repeated surveys
          using balanced routes reduce systematic observational bias over time.
        </p>
      </Section>

      <Section title="Why Minimal = Primitive Route">
        <p>
          If a route contains a sub-route that is itself balanced (a proper vanishing sub-sum),
          it could be split into two smaller surveys. A minimal vanishing sum produces a
          route that cannot be decomposed � the most efficient, irreducible balanced route
          of its weight.
        </p>
      </Section>

      <Section title="The Paper Classification Dictionary (Appendix A, Table 2)">
        <p>
          The classification from arXiv:2008.11268, Appendix A, Table 2 (pages 18-41) catalogs
          all 1019 type-weight-parity combinations for minimal vanishing sums up to weight 21.
          For each weight, the table records:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          <li><strong>Type name</strong>: e.g., (R7 : R5, R3), (R11 : 2R3), (R13 : R3)</li>
          <li><strong>Possible heights</strong>: usually [1]; at weight 21, some have height 2</li>
          <li><strong>Possible parities</strong>: (odd_count, even_count) pairs</li>
          <li><strong>Status</strong>: proved for weight = 16 (Theorem 3.3); conjectural for 17-21 (Section 4)</li>
        </ul>
        <p>
          Our app stores this complete table and uses it to classify generated routes by type.
        </p>
      </Section>

      <Section title="Exact Validation: Cyclotomic Polynomials">
        <p>
          Our implementation does <strong>not</strong> rely on floating-point arithmetic to decide
          whether a sum vanishes. Instead, we use exact algebraic validation:
        </p>
        <Code>{"?_N^a1 + ?_N^a2 + ... + ?_N^a_k = 0  ?  x^a1 + x^a2 + ... + x^a_k = 0 mod F_N(x)"}</Code>
        <p>
          where F_N(x) is the N-th cyclotomic polynomial. We reduce the sum polynomial
          modulo F_N(x) using exact integer polynomial arithmetic. If the remainder is the
          zero polynomial, the sum vanishes � this is an algebraic identity, not a numerical
          approximation. Numeric sums are displayed only as a visual aid.
        </p>
      </Section>

      <Section title="What the Algorithm Contributes">
        <p>
          The algorithm:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          <li>Pre-generates all vanishing sums for supported orders (4, 6, 8, 12)</li>
          <li>Validates each using exact cyclotomic polynomial reduction</li>
          <li>Tests minimality by checking all proper sub-sums</li>
          <li>Links each route to its catalog type from the paper</li>
          <li>Produces a mathematical certificate (e.g., 1 + ?8� + ?84 + ?86 = 0)</li>
          <li>Filters by practical constraints (direction resolution, avoid sector, current, operator)</li>
        </ul>
      </Section>

      <Section title="Practical Value for Marine Monitoring">
        <p>
          Repeatable, balanced routes help citizen scientists and NGOs:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          <li>Cover habitat uniformly without directional bias</li>
          <li>Make month-to-month comparisons valid</li>
          <li>Use the same primitive route repeatedly for consistency</li>
          <li>Know the route is mathematically certified, not ad-hoc</li>
          <li>Ensure different observers on different days survey comparable areas</li>
        </ul>
      </Section>

      <Section title="References">
        <div className="text-xs text-slate-500 space-y-1">
          <p>Christie, Dykema, Klep. &quot;Classifying minimal vanishing sums of roots of unity.&quot; arXiv:2008.11268v2 (2025).</p>
          <p>Poonen, Rubinstein. &quot;The number of intersection points made by the diagonals of a regular polygon.&quot; SIAM J. Discrete Math. 11 (1998), 135-156.</p>
          <p>Mann. &quot;On linear relations between roots of unity.&quot; Mathematika 12 (1965), 107-117.</p>
          <p>Conway, Jones. &quot;Trigonometric diophantine equations.&quot; Acta Arithmetica 30 (1976), 229-240.</p>
        </div>
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

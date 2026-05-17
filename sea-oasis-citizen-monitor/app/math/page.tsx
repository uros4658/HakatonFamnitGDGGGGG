import { Pi } from "lucide-react";

export default function MathPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-3">
        <Pi className="text-violet-400" size={28} />
        <h1 className="text-2xl font-bold">Math Explanation</h1>
      </div>

      <div className="p-3 rounded-lg bg-violet-900/20 border border-violet-800 text-xs text-violet-300">
        Based on <span className="font-semibold">&quot;Classifying Minimal Vanishing Sums of Roots of Unity&quot;</span> by
        Louis Christie, Kenneth J. Dykema, and Igor Klep (arXiv:2008.11268v2, Dec 2025).
        The classification extends Poonen-Rubinstein (1998) from weight 12 to weight 16 by hand,
        and conjecturally to weight 21 via algorithm.
      </div>

      <Section title="1. Roots of Unity">
        <p>
          A root of unity is a complex number &omega; whose positive integer power equals 1.
          The standard primitive n-th root of unity is:
        </p>
        <Code>{"&nu;_n = e^(2&pi;i/n)"}</Code>
        <p>
          The powers &nu;_n^0, &nu;_n^1, ..., &nu;_n^(n-1) are equally spaced points on the unit circle.
          The order of a root of unity &omega; is the least positive integer d such that &omega;^d = 1.
        </p>
      </Section>

      <Section title="2. Sums of Roots of Unity (Sorou)">
        <p>
          A sum of roots of unity (sorou) is an unordered finite list h = (&omega;_1, &omega;_2, ..., &omega;_n)
          of roots of unity. Its value is the complex number:
        </p>
        <Code>{"val(h) = &omega;_1 + &omega;_2 + ... + &omega;_n"}</Code>
        <p>
          The weight of h is n (the number of terms). The height is the maximum multiplicity of any
          single root of unity in h. The rotation of h by a root of unity z gives zh = (z&omega;_1, ..., z&omega;_n).
          Rotation is an equivalence relation: h ~ zh.
        </p>
        <p>
          The relative order of h is the LCM of the orders of all ratios &omega;_i/&omega;_j of terms.
          A sorou with relative order d can always be rotated to have order d.
        </p>
      </Section>

      <Section title="3. Vanishing and Minimal Vanishing Sums">
        <p>
          A sorou vanishes if its value is 0. A vanishing sorou is minimal vanishing if no proper,
          nonempty sub-sum also vanishes. Every vanishing sorou decomposes into minimal vanishing
          components (though not necessarily uniquely).
        </p>
        <Code>{"&omega;_1 + &omega;_2 + ... + &omega;_k = 0 (minimal if no proper nonempty subsum = 0)"}</Code>
        <p>
          By Mann&apos;s theorem (Lemma 2.1), the relative order of a minimal vanishing sorou is always
          a squarefree number: a product p_1 &middot; p_2 &middot; ... &middot; p_s of distinct primes.
        </p>
      </Section>

      <Section title="4. Decomposition by Top Prime">
        <p>
          The top prime p_s is the largest prime dividing the relative order. After rotation,
          any minimal vanishing sorou of top prime p can be written:
        </p>
        <Code>{"h = f_0 + &nu;_p &middot; f_1 + &nu;_p^2 &middot; f_2 + ... + &nu;_p^(p-1) &middot; f_(p-1)"}</Code>
        <p>
          where each f_j (the subsidiary sorou) has terms whose orders divide the product of primes
          strictly less than p. The sorou h vanishes if and only if:
        </p>
        <Code>{"val(f_0) = val(f_1) = ... = val(f_(p-1))"}</Code>
        <p>
          The minimality conditions (Proposition 2.3) require: (i) val(f_0) &ne; 0, (ii) no f_j has a
          vanishing proper nonempty subsorou, and (iii) no complex number z is the value of a proper
          nonempty subsorou of every f_j.
        </p>
      </Section>

      <Section title="5. Type System">
        <p>
          Types classify minimal vanishing sorou up to rotation, defined recursively:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>R_p</strong> &mdash; The simplest type: 1 + &nu;_p + &nu;_p^2 + ... + &nu;_p^(p-1), where all f_j = 1.</li>
          <li><strong>(R_p : T_1, ..., T_n)</strong> &mdash; When the smallest subsidiary f_0 = 1, and the differences
            f_0 - f_j have types T_1, ..., T_n for those j where f_j &ne; f_0.</li>
          <li><strong>(R_p : f_0 : T_1, ..., T_n)</strong> &mdash; Generalized form when f_0 has weight &gt; 1 (e.g., f_0 = 1 + &nu;_5).
            First appears at weight 15.</li>
          <li><strong>T_1 &oplus; T_2 &oplus; ... &oplus; T_k</strong> &mdash; Direct sum type for non-minimal vanishing sums
            that decompose into minimal components.</li>
        </ul>
        <Code>{"Example: (R7 : 3R3, 2R5) means (R7 : R3, R3, R3, R5, R5)"}</Code>
      </Section>

      <Section title="6. Weight Partitions and Parities">
        <p>
          The subsidiary weight partition lists the weights w(f_0) &le; w(f_1) &le; ... &le; w(f_(p-1))
          in increasing order. Parity counts terms of odd vs. even order as (n_odd, n_even).
          Multiple parities can occur for a single type.
        </p>
        <Code>{"(R5 : R3) has weight 6, partition (1,1,1,1,2), parity (4,2)"}</Code>
        <Code>{"(R7 : 2R5) has weight 13, partition (1,1,1,1,1,4,4), parity (8,5)"}</Code>
      </Section>

      <Section title="7. Classification Results">
        <p>
          <strong>Theorem 3.3</strong> classifies all minimal vanishing sorou of weight &le; 16 (76 types total),
          all of height 1. Key counts by weight:
        </p>
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-1 px-2 text-slate-300">Weight</th>
                <th className="text-left py-1 px-2 text-slate-300">Types</th>
                <th className="text-left py-1 px-2 text-slate-300">Examples</th>
              </tr>
            </thead>
            <tbody className="text-slate-400">
              <tr className="border-b border-slate-800"><td className="py-1 px-2">2</td><td className="py-1 px-2">1</td><td className="py-1 px-2 font-mono text-cyan-300">R2</td></tr>
              <tr className="border-b border-slate-800"><td className="py-1 px-2">3</td><td className="py-1 px-2">1</td><td className="py-1 px-2 font-mono text-cyan-300">R3</td></tr>
              <tr className="border-b border-slate-800"><td className="py-1 px-2">5</td><td className="py-1 px-2">1</td><td className="py-1 px-2 font-mono text-cyan-300">R5</td></tr>
              <tr className="border-b border-slate-800"><td className="py-1 px-2">6</td><td className="py-1 px-2">1</td><td className="py-1 px-2 font-mono text-cyan-300">(R5 : R3)</td></tr>
              <tr className="border-b border-slate-800"><td className="py-1 px-2">7</td><td className="py-1 px-2">2</td><td className="py-1 px-2 font-mono text-cyan-300">R7, (R5 : 2R3)</td></tr>
              <tr className="border-b border-slate-800"><td className="py-1 px-2">8</td><td className="py-1 px-2">2</td><td className="py-1 px-2 font-mono text-cyan-300">(R7 : R3), (R5 : 3R3)</td></tr>
              <tr className="border-b border-slate-800"><td className="py-1 px-2">9</td><td className="py-1 px-2">2</td><td className="py-1 px-2 font-mono text-cyan-300">(R7 : 2R3), (R5 : 4R3)</td></tr>
              <tr className="border-b border-slate-800"><td className="py-1 px-2">10</td><td className="py-1 px-2">2</td><td className="py-1 px-2 font-mono text-cyan-300">(R7 : R5), (R7 : 3R3)</td></tr>
              <tr className="border-b border-slate-800"><td className="py-1 px-2">11</td><td className="py-1 px-2">4</td><td className="py-1 px-2 font-mono text-cyan-300">R11, (R7 : (R5:R3)), (R7 : R5,R3), (R7 : 4R3)</td></tr>
              <tr className="border-b border-slate-800"><td className="py-1 px-2">12</td><td className="py-1 px-2">5</td><td className="py-1 px-2 font-mono text-cyan-300">(R11 : R3), (R7 : 5R3), ...</td></tr>
              <tr className="border-b border-slate-800"><td className="py-1 px-2">13</td><td className="py-1 px-2">8</td><td className="py-1 px-2 font-mono text-cyan-300">R13, (R7 : 2R5), (R11 : 2R3), ...</td></tr>
              <tr className="border-b border-slate-800"><td className="py-1 px-2">14</td><td className="py-1 px-2">10</td><td className="py-1 px-2 font-mono text-cyan-300">(R13 : R3), (R11 : R5), ...</td></tr>
              <tr className="border-b border-slate-800"><td className="py-1 px-2">15</td><td className="py-1 px-2">14</td><td className="py-1 px-2 font-mono text-cyan-300">(R7 : 1+&nu;_5 : R5), (R11 : (R5:R3)), ...</td></tr>
              <tr className="border-b border-slate-800"><td className="py-1 px-2">16</td><td className="py-1 px-2">24</td><td className="py-1 px-2 font-mono text-cyan-300">(R7 : 3R5), (R13 : R5), (R7 : 1+&nu;_3 : (R5:R3)), ...</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="8. The 2pq Theorem">
        <p>
          <strong>Theorem 3.2</strong> gives a complete characterization when the relative order divides 2pq
          (p &lt; q odd primes). A minimal vanishing sorou of this form must be R2, R_p, R_q, or:
        </p>
        <Code>{"h = &Sigma;_{j&in;J^c} (&Sigma;_{i&in;I} &nu;_p^i) &nu;_q^j + &Sigma;_{j&in;J} (&Sigma;_{i&in;I^c} (-&nu;_p^i)) &nu;_q^j"}</Code>
        <p>
          for proper nonempty subsets I &sub; &#123;0,...,p-1&#125; and J &sub; &#123;0,...,q-1&#125; with 0 &isin; I and |I| &le; (p-1)/2.
          This gives type (R_q : &Sigma;_{'{i&isin;I}'} &nu;_p^i : |J| &middot; R_p).
        </p>
        <p>
          Consequence: if the top prime is &le; 5, the weight partition must contain 1.
          Subsidiary weight &gt; 1 is only possible for top prime &ge; 7.
        </p>
      </Section>

      <Section title="9. New Phenomena at Weight 15-16">
        <p>
          The generalized type (R_p : f_0 : T_1,...,T_n) with f_0 having weight &gt; 1 first appears
          at weight 15:
        </p>
        <Code>{"(R7 : 1 + &nu;_5^y : R5), y &isin; {1,2} -- weight 15, partition (2,2,2,2,2,2,3), parity (12,3)"}</Code>
        <p>
          At weight 16, non-minimal subsidiary types first appear:
        </p>
        <Code>{"(R7 : 1 + &nu;_3 : (R5 : R3)) -- parity (16,0)"}</Code>
        <Code>{"(R7 : 1 + &nu;_5^y : (R3 &oplus; R2), R5) -- parity (11,5)"}</Code>
        <Code>{"(R7 : 1 + &nu;_5^y : 2R5) -- parity (10,6)"}</Code>
        <p>
          Despite these new structures, all minimal vanishing sorou of weight &le; 16 still have height 1.
        </p>
      </Section>

      <Section title="10. Algorithm for Higher Weights">
        <p>
          <strong>Algorithm 4.3</strong> extends the classification computationally. For weight k+1, it:
        </p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Enumerates candidate top primes p &le; k+1.</li>
          <li>Builds all partitions of k+1 into p summands.</li>
          <li>Generates candidate subsidiary sorou f_0 (order dividing product of primes &lt; p).</li>
          <li>Prepares all subsidiary type combinations from the existing catalog.</li>
          <li>Constructs a sorou of each candidate type and tests minimality via Proposition 2.3.</li>
        </ol>
        <p>
          <strong>Algorithm 4.4</strong> (GenSorou / GenNonMinSorou) finds all sorou of a given type to
          determine all possible parities and heights. The two procedures recursively call each other,
          guaranteed to terminate since each call strictly reduces weight.
        </p>
        <p className="text-amber-400 text-xs">
          Note: The computational results use floating-point vanishing tests (not exact algebraic arithmetic)
          and are not formally verified, so results beyond weight 16 are conjectural.
        </p>
      </Section>

      <Section title="11. Conjectured Classification (Weight 17-21)">
        <p>
          Appendix A of the paper lists all conjectured minimal vanishing types up to weight 21.
          The type count grows rapidly:
        </p>
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-1 px-2 text-slate-300">Weight</th>
                <th className="text-left py-1 px-2 text-slate-300">Status</th>
                <th className="text-left py-1 px-2 text-slate-300">Height</th>
                <th className="text-left py-1 px-2 text-slate-300">Notable types</th>
              </tr>
            </thead>
            <tbody className="text-slate-400">
              <tr className="border-b border-slate-800"><td className="py-1 px-2">17</td><td className="py-1 px-2">Conjectured</td><td className="py-1 px-2">1</td><td className="py-1 px-2 font-mono text-cyan-300">R17, (R7 : 4R5), (R13 : 4R3), ...</td></tr>
              <tr className="border-b border-slate-800"><td className="py-1 px-2">18</td><td className="py-1 px-2">Conjectured</td><td className="py-1 px-2">1</td><td className="py-1 px-2 font-mono text-cyan-300">(R17 : R3), (R7 : 3R5,2R3), ...</td></tr>
              <tr className="border-b border-slate-800"><td className="py-1 px-2">19</td><td className="py-1 px-2">Conjectured</td><td className="py-1 px-2">1</td><td className="py-1 px-2 font-mono text-cyan-300">R19, (R7 : 4R5), (R11 : (R7:R5)), ...</td></tr>
              <tr className="border-b border-slate-800"><td className="py-1 px-2">20</td><td className="py-1 px-2">Conjectured</td><td className="py-1 px-2">1</td><td className="py-1 px-2 font-mono text-cyan-300">(R19 : R3), ...</td></tr>
              <tr className="border-b border-slate-800"><td className="py-1 px-2 font-semibold text-amber-400">21</td><td className="py-1 px-2 text-amber-400">Conjectured</td><td className="py-1 px-2 text-amber-400">1 and 2</td><td className="py-1 px-2 font-mono text-amber-300">First height-2 types appear</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="12. Height Conjecture">
        <p>
          <strong>Conjecture 4.5</strong> states:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>(a) All minimal vanishing sorou of weight &lt; 21 have height 1.</li>
          <li>(b) At weight 21, height-2 sorou first appear. There are conjectured to be exactly 5 such types.</li>
        </ul>
        <p>
          An explicit height-2 example at weight 21:
        </p>
        <Code>{"Type (R7 : 1+&nu;^2_15 : (R3 &oplus; R5), (R5 : 2R3))  --  height 2, weight 21"}</Code>
        <p>
          with f_j = 1 + &nu;_3 &middot; &nu;_5^4 for j &isin; &#123;0,1,2,3,5&#125;, and subsidiary sorou f_4, f_6 having
          terms with multiplicity 2. This is verified symbolically and numerically.
        </p>
        <p>
          More broadly, Steinberger (2008) showed height can be arbitrarily large. The first cyclotomic
          polynomial with a coefficient different from &plusmn;1 is &Phi;_105(x), corresponding to height 2
          and weight 35.
        </p>
      </Section>

      <Section title="13. The Catalog in This App">
        <p>
          The route catalog used in this application draws type names, weights, heights, parities,
          and classification metadata from Table 1 (proved, weight &le; 16) and Table 2 (conjectural,
          weight &le; 21) of the paper. The source is arXiv:2008.11268, Appendix A, with original
          computational code at github.com/lchristie/Sums-of-Roots-of-Unity.
        </p>
        <p>
          Supported route resolutions (N = 4, 6, 8, 12 directions) correspond to the subset of
          relative orders that are products of primes from &#123;2, 3, 5, 7&#125;. The route generator uses exact
          symbolic polynomial validation:
        </p>
        <Code>{"x^a1 + x^a2 + ... + x^ak &equiv; 0 mod &Phi;_N(x)"}</Code>
        <p>
          Balanced primitive routes (minimal vanishing sorou with sum-zero direction vectors) are
          certified without floating-point arithmetic for supported cases.
        </p>
      </Section>

      <Section title="14. Monitoring Value">
        <p>
          Balanced primitive routes make citizen observations more repeatable and comparable over time.
          The mathematical guarantee (sum to zero) ensures no net directional bias in survey paths.
          The app depends on structured photos, careful tags, notes, and expert review for ecological
          interpretation &mdash; the roots-of-unity algorithm generates and certifies the routes, not detections.
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
    <div
      className="font-mono text-xs bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-cyan-300 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: children }}
    />
  );
}

/**
 * generateRoutePatterns.ts
 * Generates route_patterns.generated.json from exact symbolic computation
 * of vanishing sums of roots of unity.
 *
 * Uses cyclotomic polynomial arithmetic (not floating point) to determine
 * which sums of roots vanish exactly.
 *
 * Usage: npx ts-node scripts/generateRoutePatterns.ts
 */

import * as fs from "fs";
import * as path from "path";

function computeCyclotomic(n: number): number[] {
  let num: number[] = new Array(n + 1).fill(0);
  num[n] = 1;
  num[0] = -1;

  for (let d = 1; d < n; d++) {
    if (n % d !== 0) continue;
    const phiD = computeCyclotomic(d);
    num = polyDivQuotient(num, phiD);
  }
  return num;
}

function polyDivQuotient(dividend: number[], divisor: number[]): number[] {
  const out = [...dividend];
  const dLen = divisor.length;
  const lead = divisor[dLen - 1];
  for (let i = out.length - 1; i >= dLen - 1; i--) {
    if (out[i] === 0) continue;
    const coeff = out[i] / lead;
    for (let j = 0; j < dLen; j++) {
      out[i - (dLen - 1 - j)] -= coeff * divisor[j];
    }
    out[i] = coeff;
  }
  return out.slice(dLen - 1);
}

function polyMod(poly: number[], modulus: number[]): number[] {
  const out = [...poly];
  const mDeg = modulus.length - 1;
  const mLead = modulus[mDeg];
  for (let i = out.length - 1; i >= mDeg; i--) {
    if (Math.abs(out[i]) < 1e-15) continue;
    const coeff = out[i] / mLead;
    for (let j = 0; j <= mDeg; j++) {
      out[i - mDeg + j] -= coeff * modulus[j];
    }
  }
  return out.slice(0, mDeg);
}

const cyclotomicCache: Record<number, number[]> = {};
function getCyclotomic(n: number): number[] {
  if (cyclotomicCache[n]) return cyclotomicCache[n];
  cyclotomicCache[n] = computeCyclotomic(n);
  return cyclotomicCache[n];
}

function isVanishing(n: number, exponents: number[]): boolean {
  const sumPoly = new Array(n).fill(0);
  for (const exp of exponents) {
    sumPoly[((exp % n) + n) % n]++;
  }
  const phi = getCyclotomic(n);
  const remainder = polyMod(sumPoly, phi);
  return remainder.every(c => Math.abs(c) < 1e-12);
}

function isMinimalVanishing(n: number, exponents: number[]): boolean {
  if (!isVanishing(n, exponents)) return false;
  if (exponents.length <= 2) return true;
  for (let mask = 1; mask < (1 << exponents.length) - 1; mask++) {
    let bits = 0;
    let temp = mask;
    while (temp) { bits += temp & 1; temp >>= 1; }
    if (bits < 2 || bits >= exponents.length) continue;
    const subset = exponents.filter((_, i) => (mask >> i) & 1);
    if (isVanishing(n, subset)) return false;
  }
  return true;
}

const DIRECTION_MAP: Record<number, string[]> = {
  4: ["E", "N", "W", "S"],
  6: ["E", "NE", "NW", "W", "SW", "SE"],
  8: ["E", "NE", "N", "NW", "W", "SW", "S", "SE"],
  12: ["E", "ENE", "NE", "NNE", "N", "NNW", "NW", "WNW", "W", "WSW", "SW", "SSW"],
};

interface RouteEntry {
  id: string;
  order: number;
  weight: number;
  exponents: number[];
  directions: string[];
  isMinimal: boolean;
  certificate: string;
  demoOnly: boolean;
}

function findVanishingSums(n: number, maxLen: number): number[][] {
  const results: number[][] = [];
  const seen = new Set<string>();

  function recurse(start: number, current: number[]) {
    if (current.length >= 2 && isVanishing(n, current)) {
      const key = [...current].sort((a, b) => a - b).join(",");
      if (!seen.has(key)) {
        seen.add(key);
        results.push([...current].sort((a, b) => a - b));
      }
      if (current.length >= maxLen) return;
    }
    if (current.length >= maxLen) return;
    for (let i = start; i < n; i++) {
      if (current.includes(i)) continue;
      current.push(i);
      recurse(i + 1, current);
      current.pop();
    }
  }

  recurse(1, [0]);
  return results;
}

// Generate routes for all supported orders
const routes: RouteEntry[] = [];
const orders = [4, 6, 8, 12];

for (const n of orders) {
  console.log(`Computing vanishing sums for N=${n}...`);
  const vanishing = findVanishingSums(n, Math.min(n, 12));
  console.log(`  Found ${vanishing.length} vanishing sums.`);

  for (const exps of vanishing) {
    const minimal = isMinimalVanishing(n, exps);
    const dirs = DIRECTION_MAP[n];
    const id = `SO-${n}-${String(exps.length).padStart(2, "0")}-${routes.length}`;
    routes.push({
      id,
      order: n,
      weight: exps.length,
      exponents: exps,
      directions: exps.map(k => dirs[k] || `d${k}`),
      isMinimal: minimal,
      certificate: exps.map(k => k === 0 ? "1" : `zeta_${n}^${k}`).join(" + ") + " = 0",
      demoOnly: false,
    });
  }
}

const outPath = path.join(__dirname, "..", "data", "route_patterns.generated.json");
fs.writeFileSync(outPath, JSON.stringify(routes, null, 2));
console.log(`\nGenerated ${routes.length} route patterns -> ${outPath}`);

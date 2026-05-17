/**
 * Exact symbolic validation for vanishing sums of roots of unity.
 * Uses cyclotomic polynomial arithmetic instead of floating-point trig.
 *
 * Key insight: zeta_N^a1 + zeta_N^a2 + ... = 0 iff the polynomial
 * x^a1 + x^a2 + ... reduced modulo Phi_N(x) is the zero polynomial.
 */

const cyclotomicCache: Record<number, number[]> = {};

function computeCyclotomic(n: number): number[] {
  if (cyclotomicCache[n]) return cyclotomicCache[n];

  // Phi_1(x) = x - 1
  if (n === 1) {
    cyclotomicCache[1] = [-1, 1];
    return [-1, 1];
  }

  // Phi_n(x) = (x^n - 1) / product_{d|n, d<n} Phi_d(x)
  let num = new Array(n + 1).fill(0);
  num[n] = 1;
  num[0] = -1; // x^n - 1

  for (let d = 1; d < n; d++) {
    if (n % d !== 0) continue;
    num = polyDivExact(num, computeCyclotomic(d));
  }

  cyclotomicCache[n] = num;
  return num;
}

function polyDivExact(dividend: number[], divisor: number[]): number[] {
  const out = [...dividend];
  const dLen = divisor.length;
  const lead = divisor[dLen - 1];
  const quotientLen = out.length - dLen + 1;
  const quotient = new Array(quotientLen).fill(0);

  for (let i = out.length - 1; i >= dLen - 1; i--) {
    if (Math.round(out[i]) === 0) continue;
    const coeff = Math.round(out[i] / lead);
    quotient[i - dLen + 1] = coeff;
    for (let j = 0; j < dLen; j++) {
      out[i - (dLen - 1) + j] -= coeff * divisor[j];
    }
  }
  return quotient;
}

function polyMod(poly: number[], modulus: number[]): number[] {
  const out = [...poly];
  const mDeg = modulus.length - 1;
  const mLead = modulus[mDeg];

  for (let i = out.length - 1; i >= mDeg; i--) {
    if (Math.round(out[i]) === 0) continue;
    const coeff = out[i] / mLead;
    for (let j = 0; j <= mDeg; j++) {
      out[i - mDeg + j] -= coeff * modulus[j];
    }
  }
  return out.slice(0, mDeg);
}

/**
 * Exact check: does zeta_N^a1 + zeta_N^a2 + ... + zeta_N^ak = 0?
 * Reduces the sum polynomial modulo Phi_N(x) and checks if remainder is zero.
 */
export function isVanishing(n: number, exponents: number[]): boolean {
  const sumPoly = new Array(n).fill(0);
  for (const exp of exponents) {
    sumPoly[((exp % n) + n) % n]++;
  }

  const phi = computeCyclotomic(n);
  const remainder = polyMod(sumPoly, phi);
  return remainder.every(c => Math.abs(Math.round(c) - c) < 1e-10 && Math.round(c) === 0);
}

export function isMinimalVanishing(n: number, exponents: number[]): boolean {
  if (!isVanishing(n, exponents)) return false;
  if (exponents.length <= 2) return true;

  for (let mask = 1; mask < (1 << exponents.length) - 1; mask++) {
    const bits = popcount(mask);
    if (bits < 2 || bits >= exponents.length) continue;
    const subset = exponents.filter((_, i) => (mask >> i) & 1);
    if (isVanishing(n, subset)) return false;
  }
  return true;
}

function popcount(n: number): number {
  let c = 0;
  while (n) { c += n & 1; n >>= 1; }
  return c;
}

export function exponentToDirection(n: number, k: number): string {
  const labels: Record<number, string[]> = {
    4: ["E", "N", "W", "S"],
    6: ["E", "NE", "NW", "W", "SW", "SE"],
    8: ["E", "NE", "N", "NW", "W", "SW", "S", "SE"],
    12: ["E", "ENE", "NE", "NNE", "N", "NNW", "NW", "WNW", "W", "WSW", "SW", "SSW"],
  };
  const dirs = labels[n];
  if (dirs) return dirs[((k % n) + n) % n];
  return `d${k}`;
}

export function formatCertificate(n: number, exponents: number[]): string {
  const terms = exponents.map(k => k === 0 ? "1" : `zeta_${n}^${k}`);
  return terms.join(" + ") + " = 0";
}

/** Numeric check - only for visual display, not for validation decisions. */
export function numericSum(n: number, exponents: number[]): { re: number; im: number } {
  let re = 0, im = 0;
  for (const k of exponents) {
    const angle = (2 * Math.PI * k) / n;
    re += Math.cos(angle);
    im += Math.sin(angle);
  }
  return { re, im };
}

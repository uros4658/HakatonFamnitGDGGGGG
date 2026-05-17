import { isVanishing, isMinimalVanishing, numericSum } from "./roots";

export type ValidationResult = {
  isValid: boolean;
  isMinimal: boolean;
  residual: number;
  certificate: string | null;
  error?: string;
};

export function validateRoute(order: number, exponents: number[]): ValidationResult {
  if (exponents.length < 2) {
    return { isValid: false, isMinimal: false, residual: Infinity, certificate: null, error: "Need at least 2 directions" };
  }

  const { re, im } = numericSum(order, exponents);
  const residual = Math.sqrt(re * re + im * im);
  const valid = isVanishing(order, exponents);
  const minimal = valid ? isMinimalVanishing(order, exponents) : false;

  return {
    isValid: valid,
    isMinimal: minimal,
    residual,
    certificate: valid ? formatCert(order, exponents) : null,
  };
}

function formatCert(n: number, exps: number[]): string {
  return exps.map(k => k === 0 ? "1" : `zeta_${n}^${k}`).join(" + ") + " = 0";
}

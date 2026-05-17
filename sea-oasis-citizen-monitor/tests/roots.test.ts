import { isVanishing, isMinimalVanishing, exponentToDirection, formatCertificate } from "../lib/roots/roots";

describe("roots of unity", () => {
  describe("isVanishing", () => {
    test("N=4: opposing directions vanish", () => {
      expect(isVanishing(4, [0, 2])).toBe(true); // E + W = 0
    });

    test("N=4: all 4 roots vanish", () => {
      expect(isVanishing(4, [0, 1, 2, 3])).toBe(true);
    });

    test("N=4: adjacent directions do not vanish", () => {
      expect(isVanishing(4, [0, 1])).toBe(false);
    });

    test("N=6: every third root vanishes (R3 inside N=6)", () => {
      expect(isVanishing(6, [0, 2, 4])).toBe(true);
    });

    test("N=8: opposite pairs vanish", () => {
      expect(isVanishing(8, [0, 4])).toBe(true); // E + W
      expect(isVanishing(8, [1, 5])).toBe(true); // NE + SW
    });

    test("N=8: four evenly spaced vanish", () => {
      expect(isVanishing(8, [0, 2, 4, 6])).toBe(true);
    });

    test("N=8: three consecutive do not vanish", () => {
      expect(isVanishing(8, [0, 1, 2])).toBe(false);
    });

    test("N=12: every fourth root vanishes", () => {
      expect(isVanishing(12, [0, 3, 6, 9])).toBe(true);
    });

    test("N=3: all roots vanish (R3)", () => {
      expect(isVanishing(3, [0, 1, 2])).toBe(true);
    });

    test("N=5: all roots vanish (R5)", () => {
      expect(isVanishing(5, [0, 1, 2, 3, 4])).toBe(true);
    });

    test("N=7: all roots vanish (R7)", () => {
      expect(isVanishing(7, [0, 1, 2, 3, 4, 5, 6])).toBe(true);
    });
  });

  describe("isMinimalVanishing", () => {
    test("N=4: [0,2] is minimal (R2)", () => {
      expect(isMinimalVanishing(4, [0, 2])).toBe(true);
    });

    test("N=4: [0,1,2,3] is NOT minimal (contains [0,2] and [1,3])", () => {
      expect(isMinimalVanishing(4, [0, 1, 2, 3])).toBe(false);
    });

    test("N=6: [0,2,4] is minimal (R3 in N=6)", () => {
      expect(isMinimalVanishing(6, [0, 2, 4])).toBe(true);
    });

    test("N=3: [0,1,2] is minimal (R3)", () => {
      expect(isMinimalVanishing(3, [0, 1, 2])).toBe(true);
    });

    test("N=5: [0,1,2,3,4] is minimal (R5)", () => {
      expect(isMinimalVanishing(5, [0, 1, 2, 3, 4])).toBe(true);
    });

    test("N=8: [0,4] is minimal", () => {
      expect(isMinimalVanishing(8, [0, 4])).toBe(true);
    });

    test("N=8: [0,2,4,6] is NOT minimal (contains [0,4] and [2,6])", () => {
      expect(isMinimalVanishing(8, [0, 2, 4, 6])).toBe(false);
    });
  });

  describe("exponentToDirection", () => {
    test("N=8 cardinal directions", () => {
      expect(exponentToDirection(8, 0)).toBe("E");
      expect(exponentToDirection(8, 1)).toBe("NE");
      expect(exponentToDirection(8, 2)).toBe("N");
      expect(exponentToDirection(8, 3)).toBe("NW");
      expect(exponentToDirection(8, 4)).toBe("W");
      expect(exponentToDirection(8, 5)).toBe("SW");
      expect(exponentToDirection(8, 6)).toBe("S");
      expect(exponentToDirection(8, 7)).toBe("SE");
    });

    test("N=4 directions", () => {
      expect(exponentToDirection(4, 0)).toBe("E");
      expect(exponentToDirection(4, 1)).toBe("N");
      expect(exponentToDirection(4, 2)).toBe("W");
      expect(exponentToDirection(4, 3)).toBe("S");
    });
  });

  describe("formatCertificate", () => {
    test("formats correctly", () => {
      expect(formatCertificate(8, [0, 4])).toBe("1 + zeta_8^4 = 0");
      expect(formatCertificate(4, [0, 1, 2, 3])).toBe("1 + zeta_4^1 + zeta_4^2 + zeta_4^3 = 0");
    });
  });
});

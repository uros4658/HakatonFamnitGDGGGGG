import { MINIMAL_VANISHING_TYPE_CATALOG, CATALOG_ENTRY_COUNT } from "../lib/roots/catalog";

describe("SOROU catalog", () => {
  test("has 1019 total entries", () => {
    expect(CATALOG_ENTRY_COUNT).toBe(1019);
  });

  test("covers weights 2 through 21", () => {
    const weights = Object.keys(MINIMAL_VANISHING_TYPE_CATALOG).map(Number).sort((a, b) => a - b);
    expect(weights[0]).toBe(2);
    expect(weights[weights.length - 1]).toBe(21);
  });

  test("weight 2 has R2", () => {
    const entries = MINIMAL_VANISHING_TYPE_CATALOG[2];
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe("R2");
    expect(entries[0].weight).toBe(2);
  });

  test("weight 3 has R3", () => {
    const entries = MINIMAL_VANISHING_TYPE_CATALOG[3];
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe("R3");
  });

  test("weight 5 has R5", () => {
    const entries = MINIMAL_VANISHING_TYPE_CATALOG[5];
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe("R5");
  });

  test("weight 7 has R7", () => {
    const entries = MINIMAL_VANISHING_TYPE_CATALOG[7];
    const r7 = entries.find(e => e.type === "R7");
    expect(r7).toBeDefined();
  });

  test("all entries have unique IDs", () => {
    const allIds = new Set<string>();
    for (const entries of Object.values(MINIMAL_VANISHING_TYPE_CATALOG)) {
      for (const entry of entries) {
        expect(allIds.has(entry.id)).toBe(false);
        allIds.add(entry.id);
      }
    }
  });

  test("entries with weight <= 16 are proved", () => {
    for (const [weightStr, entries] of Object.entries(MINIMAL_VANISHING_TYPE_CATALOG)) {
      const weight = Number(weightStr);
      if (weight <= 16) {
        for (const entry of entries) {
          expect(entry.status).toBe("proved_up_to_weight_16");
        }
      }
    }
  });

  test("entries with weight 17-21 are conjectural", () => {
    for (const [weightStr, entries] of Object.entries(MINIMAL_VANISHING_TYPE_CATALOG)) {
      const weight = Number(weightStr);
      if (weight >= 17 && weight <= 21) {
        for (const entry of entries) {
          expect(entry.status).toBe("computational_conjecture_weight_17_to_21");
        }
      }
    }
  });

  test("all entries have correct source", () => {
    for (const entries of Object.values(MINIMAL_VANISHING_TYPE_CATALOG)) {
      for (const entry of entries) {
        expect(entry.source.paper).toBe("arXiv:2008.11268");
        expect(entry.source.table).toBe("Appendix A Table 2");
        expect(entry.source.pageRange).toBe("18-41");
      }
    }
  });

  test("parities sum to weight", () => {
    for (const entries of Object.values(MINIMAL_VANISHING_TYPE_CATALOG)) {
      for (const entry of entries) {
        for (const parity of entry.parities) {
          expect(parity[0] + parity[1]).toBe(entry.weight);
        }
      }
    }
  });

  test("prime types have correct weight", () => {
    const primeTypes = [
      { weight: 2, type: "R2" },
      { weight: 3, type: "R3" },
      { weight: 5, type: "R5" },
      { weight: 7, type: "R7" },
      { weight: 11, type: "R11" },
      { weight: 13, type: "R13" },
      { weight: 17, type: "R17" },
      { weight: 19, type: "R19" },
    ];
    for (const { weight, type } of primeTypes) {
      const entries = MINIMAL_VANISHING_TYPE_CATALOG[weight];
      if (entries) {
        const found = entries.find(e => e.type === type);
        expect(found).toBeDefined();
        expect(found!.weight).toBe(weight);
      }
    }
  });
});

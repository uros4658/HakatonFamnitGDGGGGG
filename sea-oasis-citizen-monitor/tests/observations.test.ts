import { ObservationSchema, ObservationTagSchema, ALL_TAGS } from "../lib/observations/schema";
import { MOCK_OBSERVATIONS } from "../lib/observations/mockData";
import { computeTagFrequency, computeMonthlyStats, computeRepeatabilityScore } from "../lib/observations/stats";

describe("observation schema", () => {
  test("validates a correct observation", () => {
    const result = ObservationSchema.safeParse({
      id: "test-1",
      observer: "Test User",
      date: "2025-03-15",
      month: "2025-03",
      routeId: "SO-8-04-0",
      locationType: "artificial_reef",
      surveyMethod: "dive",
      visibility: "good",
      seaCondition: "calm",
      disturbanceLevel: "none",
      tags: [{ tag: "fish", abundance: "many", confidence: "high" }],
      growthPlateScore: "2",
      wasteSeverity: "none",
      damageSeverity: "none",
      followUpNeeded: "none",
      ethicsConfirmed: true,
      createdAt: "2025-03-15T10:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid locationType", () => {
    const result = ObservationSchema.safeParse({
      id: "test-2",
      observer: "Test",
      date: "2025-01-01",
      month: "2025-01",
      locationType: "invalid_place",
      surveyMethod: "dive",
      visibility: "good",
      seaCondition: "calm",
      disturbanceLevel: "none",
      tags: [],
      wasteSeverity: "none",
      damageSeverity: "none",
      followUpNeeded: "none",
      ethicsConfirmed: true,
      createdAt: "2025-01-01T00:00:00Z",
    });
    expect(result.success).toBe(false);
  });

  test("tag schema validates correctly", () => {
    expect(ObservationTagSchema.safeParse({ tag: "fish", abundance: "many", confidence: "high" }).success).toBe(true);
    expect(ObservationTagSchema.safeParse({ tag: "algae" }).success).toBe(true);
    expect(ObservationTagSchema.safeParse({ tag: "fish", abundance: "invalid" }).success).toBe(false);
  });

  test("ALL_TAGS contains expected species", () => {
    expect(ALL_TAGS).toContain("fish");
    expect(ALL_TAGS).toContain("algae");
    expect(ALL_TAGS).toContain("bryozoans");
    expect(ALL_TAGS).toContain("polychaetes");
    expect(ALL_TAGS).toContain("seahorse");
    expect(ALL_TAGS).toContain("lobster");
    expect(ALL_TAGS).toContain("waste");
  });
});

describe("mock observations", () => {
  test("all mock observations are valid", () => {
    for (const obs of MOCK_OBSERVATIONS) {
      const result = ObservationSchema.safeParse(obs);
      expect(result.success).toBe(true);
    }
  });

  test("mock data has multiple months", () => {
    const months = new Set(MOCK_OBSERVATIONS.map(o => o.month));
    expect(months.size).toBeGreaterThanOrEqual(2);
  });
});

describe("stats", () => {
  test("computeTagFrequency counts correctly", () => {
    const freq = computeTagFrequency(MOCK_OBSERVATIONS);
    expect(freq["fish"]).toBeGreaterThan(0);
    expect(Object.keys(freq).length).toBeGreaterThan(0);
  });

  test("computeMonthlyStats returns sorted months", () => {
    const stats = computeMonthlyStats(MOCK_OBSERVATIONS);
    expect(stats.length).toBeGreaterThan(0);
    for (let i = 1; i < stats.length; i++) {
      expect(stats[i].month >= stats[i - 1].month).toBe(true);
    }
  });

  test("computeRepeatabilityScore returns 0-100", () => {
    const score = computeRepeatabilityScore(MOCK_OBSERVATIONS);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test("empty observations give 0 repeatability", () => {
    expect(computeRepeatabilityScore([])).toBe(0);
  });
});

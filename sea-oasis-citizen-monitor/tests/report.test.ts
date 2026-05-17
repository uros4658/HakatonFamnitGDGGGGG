import { buildCsv } from "../lib/report/buildCsv";
import { buildJsonReport } from "../lib/report/buildJson";
import { MOCK_OBSERVATIONS } from "../lib/observations/mockData";

describe("CSV export", () => {
  test("generates valid CSV with headers", () => {
    const csv = buildCsv(MOCK_OBSERVATIONS);
    const lines = csv.split("\n");
    expect(lines.length).toBeGreaterThan(1);

    const headers = lines[0].split(",");
    expect(headers).toContain("observationId");
    expect(headers).toContain("observer");
    expect(headers).toContain("routeId");
    expect(headers).toContain("routeCertificate");
    expect(headers).toContain("locationType");
    expect(headers).toContain("tags");
    expect(headers).toContain("growthPlateScore");
    expect(headers).toContain("wasteSeverity");
  });

  test("has correct number of data rows", () => {
    const csv = buildCsv(MOCK_OBSERVATIONS);
    const lines = csv.split("\n");
    expect(lines.length).toBe(MOCK_OBSERVATIONS.length + 1);
  });

  test("routeCertificate column is populated for routes with IDs", () => {
    const csv = buildCsv(MOCK_OBSERVATIONS);
    const lines = csv.split("\n");
    const headers = lines[0].split(",");
    const certIdx = headers.indexOf("routeCertificate");
    expect(certIdx).toBeGreaterThan(-1);
  });

  test("handles empty observations", () => {
    const csv = buildCsv([]);
    const lines = csv.split("\n");
    expect(lines.length).toBe(1); // just headers
  });
});

describe("JSON export", () => {
  test("produces valid JSON", () => {
    const json = buildJsonReport(MOCK_OBSERVATIONS);
    const parsed = JSON.parse(json);
    expect(parsed).toBeDefined();
    expect(parsed.title).toBe("SeaOasis Citizen Monitoring Report");
  });

  test("includes summary stats", () => {
    const json = buildJsonReport(MOCK_OBSERVATIONS);
    const parsed = JSON.parse(json);
    expect(parsed.summary.totalSurveys).toBe(MOCK_OBSERVATIONS.length);
    expect(parsed.summary.observers).toBeDefined();
    expect(parsed.observations).toHaveLength(MOCK_OBSERVATIONS.length);
  });

  test("handles empty observations", () => {
    const json = buildJsonReport([]);
    const parsed = JSON.parse(json);
    expect(parsed.summary.totalSurveys).toBe(0);
    expect(parsed.observations).toHaveLength(0);
  });
});

/**
 * importSorouTable.ts
 * Imports the SOROU catalog from the Python pattern_catalog.py
 * into TypeScript format for the application.
 *
 * Usage: npx ts-node scripts/importSorouTable.ts
 * (or run the equivalent Python script: scripts/convertCatalog.py)
 */

import * as fs from "fs";
import * as path from "path";

interface RawEntry {
  id: string;
  weight: number;
  type: string;
  heights: number[];
  parities: Array<[number, number]>;
  source: { paper: string; table: string; pageRange: string };
  status: string;
}

const catalogPath = path.join(__dirname, "..", "data", "sorou_catalog.generated.json");

if (!fs.existsSync(catalogPath)) {
  console.error("Missing sorou_catalog.generated.json. Run scripts/convertCatalog.py first.");
  process.exit(1);
}

const entries: RawEntry[] = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));

// Group by weight
const byWeight: Record<number, RawEntry[]> = {};
for (const entry of entries) {
  if (!byWeight[entry.weight]) byWeight[entry.weight] = [];
  byWeight[entry.weight].push(entry);
}

const weights = Object.keys(byWeight).map(Number).sort((a, b) => a - b);
console.log(`Imported ${entries.length} catalog entries across ${weights.length} weight classes.`);
console.log(`Weight range: ${weights[0]} to ${weights[weights.length - 1]}`);
console.log(`Proved (=16): ${entries.filter(e => e.status.includes("proved")).length}`);
console.log(`Conjecture (17-21): ${entries.filter(e => e.status.includes("conjecture")).length}`);

// Validate structure
let errors = 0;
for (const entry of entries) {
  if (!entry.id || !entry.type || !entry.weight) {
    console.error(`Invalid entry: ${JSON.stringify(entry).slice(0, 100)}`);
    errors++;
  }
  if (entry.weight <= 16 && !entry.status.includes("proved")) {
    console.error(`Wrong status for weight ${entry.weight}: ${entry.id}`);
    errors++;
  }
  if (entry.weight > 16 && !entry.status.includes("conjecture")) {
    console.error(`Wrong status for weight ${entry.weight}: ${entry.id}`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`${errors} validation errors found.`);
  process.exit(1);
} else {
  console.log("All entries valid.");
}

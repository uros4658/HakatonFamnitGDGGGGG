/**
 * validateSorouCatalog.ts
 * Validates the SOROU catalog entries against known mathematical constraints.
 *
 * Checks:
 * 1. Every entry has required fields.
 * 2. Weight matches the expected range for its status.
 * 3. Parities sum to the correct weight.
 * 4. Prime types R_p have weight = p.
 * 5. No duplicate IDs.
 */

import * as fs from "fs";
import * as path from "path";

interface CatalogEntry {
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
  console.error("sorou_catalog.generated.json not found. Generate it first.");
  process.exit(1);
}

const entries: CatalogEntry[] = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
let errors = 0;
const seenIds = new Set<string>();

for (const entry of entries) {
  // Check for duplicate IDs
  if (seenIds.has(entry.id)) {
    console.error(`Duplicate ID: ${entry.id}`);
    errors++;
  }
  seenIds.add(entry.id);

  // Check required fields
  if (!entry.id || !entry.type || entry.weight === undefined) {
    console.error(`Missing required fields: ${entry.id || "unknown"}`);
    errors++;
    continue;
  }

  // Check status matches weight
  if (entry.weight <= 16 && !entry.status.includes("proved")) {
    console.error(`${entry.id}: weight ${entry.weight} should be proved`);
    errors++;
  }
  if (entry.weight > 16 && entry.weight <= 21 && !entry.status.includes("conjecture")) {
    console.error(`${entry.id}: weight ${entry.weight} should be conjecture`);
    errors++;
  }

  // Check parities sum to weight
  for (const parity of entry.parities) {
    if (parity[0] + parity[1] !== entry.weight) {
      console.error(`${entry.id}: parity (${parity[0]}, ${parity[1]}) does not sum to weight ${entry.weight}`);
      errors++;
    }
  }

  // Check prime types
  const primeMatch = entry.type.match(/^R(\d+)$/);
  if (primeMatch) {
    const p = parseInt(primeMatch[1]);
    if (p !== entry.weight) {
      console.error(`${entry.id}: prime type R${p} but weight is ${entry.weight}`);
      errors++;
    }
  }

  // Check heights are positive
  if (entry.heights.some(h => h < 1)) {
    console.error(`${entry.id}: invalid height values`);
    errors++;
  }

  // Check source
  if (entry.source.paper !== "arXiv:2008.11268") {
    console.error(`${entry.id}: unexpected source paper`);
    errors++;
  }
}

console.log(`Validated ${entries.length} entries.`);
if (errors === 0) {
  console.log("All entries pass validation.");
} else {
  console.error(`${errors} errors found.`);
  process.exit(1);
}

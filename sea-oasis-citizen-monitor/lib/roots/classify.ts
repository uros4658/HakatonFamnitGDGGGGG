import { MINIMAL_VANISHING_TYPE_CATALOG, SorouCatalogEntry } from "./catalog";

export function classifyByWeight(weight: number): SorouCatalogEntry[] {
  return MINIMAL_VANISHING_TYPE_CATALOG[weight] || [];
}

export function getAllTypes(): SorouCatalogEntry[] {
  return Object.values(MINIMAL_VANISHING_TYPE_CATALOG).flat();
}

export function getProvedTypes(): SorouCatalogEntry[] {
  return getAllTypes().filter(e => e.status === "proved_up_to_weight_16");
}

export function getConjecturedTypes(): SorouCatalogEntry[] {
  return getAllTypes().filter(e => e.status === "computational_conjecture_weight_17_to_21");
}

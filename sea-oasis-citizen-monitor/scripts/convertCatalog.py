"""Convert pattern_catalog.py to TypeScript catalog.ts"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from pattern_catalog import PATTERN_CATALOG

lines = []
lines.append('export type SorouCatalogEntry = {')
lines.append('  id: string;')
lines.append('  weight: number;')
lines.append('  type: string;')
lines.append('  heights: number[];')
lines.append('  parities: Array<[number, number]>;')
lines.append('  source: {')
lines.append('    paper: "arXiv:2008.11268";')
lines.append('    table: "Appendix A Table 2";')
lines.append('    pageRange: "18-41";')
lines.append('  };')
lines.append('  status: "proved_up_to_weight_16" | "computational_conjecture_weight_17_to_21";')
lines.append('};')
lines.append('')
lines.append('export type SorouCatalog = Record<number, SorouCatalogEntry[]>;')
lines.append('')
lines.append('const src = {')
lines.append('  paper: "arXiv:2008.11268" as const,')
lines.append('  table: "Appendix A Table 2" as const,')
lines.append('  pageRange: "18-41" as const,')
lines.append('};')
lines.append('')
lines.append('const proved = "proved_up_to_weight_16" as const;')
lines.append('const conj = "computational_conjecture_weight_17_to_21" as const;')
lines.append('')

# Group by weight
by_weight = {}
for i, entry in enumerate(PATTERN_CATALOG):
    w = entry['weight']
    if w not in by_weight:
        by_weight[w] = []
    by_weight[w].append((i, entry))

lines.append('export const MINIMAL_VANISHING_TYPE_CATALOG: SorouCatalog = {')

for weight in sorted(by_weight.keys()):
    entries = by_weight[weight]
    lines.append(f'  {weight}: [')
    for idx, (i, entry) in enumerate(entries):
        name = entry['name'].replace("'", "\\'")
        heights = entry['possible_heights']
        parities = entry['possible_parities']
        status = 'proved' if weight <= 16 else 'conj'
        entry_id = f'w{weight}-{idx+1}'

        heights_str = '[' + ', '.join(str(h) for h in heights) + ']'
        parities_str = '[' + ', '.join(f'[{p[0]}, {p[1]}]' for p in parities) + ']'

        lines.append(f'    {{ id: "{entry_id}", weight: {weight}, type: "{name}", heights: {heights_str}, parities: {parities_str}, source: src, status: {status} }},')
    lines.append('  ],')

lines.append('};')
lines.append('')
lines.append(f'export const CATALOG_ENTRY_COUNT = {len(PATTERN_CATALOG)};')
lines.append('')

output_path = os.path.join(os.path.dirname(__file__), '..', 'lib', 'roots', 'catalog.ts')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines) + '\n')

print(f"Generated catalog.ts with {len(PATTERN_CATALOG)} entries across {len(by_weight)} weight classes.")

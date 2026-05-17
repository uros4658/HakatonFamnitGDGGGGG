"""Generate JSON data files for the data/ directory."""
import json
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from pattern_catalog import PATTERN_CATALOG

data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
os.makedirs(data_dir, exist_ok=True)

# 1. sorou_catalog.generated.json
catalog_json = []
for i, entry in enumerate(PATTERN_CATALOG):
    w = entry['weight']
    catalog_json.append({
        "id": f"w{w}-{i+1}",
        "weight": w,
        "type": entry['name'],
        "heights": entry['possible_heights'],
        "parities": entry['possible_parities'],
        "source": {
            "paper": "arXiv:2008.11268",
            "table": "Appendix A Table 2",
            "pageRange": "18-41"
        },
        "status": "proved_up_to_weight_16" if w <= 16 else "computational_conjecture_weight_17_to_21"
    })

with open(os.path.join(data_dir, 'sorou_catalog.generated.json'), 'w') as f:
    json.dump(catalog_json, f, indent=2)
print(f"sorou_catalog.generated.json: {len(catalog_json)} entries")

# 2. route_patterns.generated.json
import math

def is_vanishing(n, exps):
    real = sum(math.cos(2 * math.pi * k / n) for k in exps)
    imag = sum(math.sin(2 * math.pi * k / n) for k in exps)
    return abs(real) < 1e-9 and abs(imag) < 1e-9

def find_vanishing_sums(n, max_len):
    results = []
    def recurse(start, current):
        if len(current) >= 2 and is_vanishing(n, current):
            results.append(list(current))
        if len(current) >= max_len:
            return
        for i in range(start, n):
            current.append(i)
            recurse(i + 1, current)
            current.pop()
    recurse(1, [0])
    return results

DIRECTION_MAP = {
    4: {0: "E", 1: "N", 2: "W", 3: "S"},
    6: {0: "E", 1: "NNE", 2: "NNW", 3: "W", 4: "SSW", 5: "SSE"},
    8: {0: "E", 1: "NE", 2: "N", 3: "NW", 4: "W", 5: "SW", 6: "S", 7: "SE"},
    12: {0: "E", 1: "ENE", 2: "NNE", 3: "N", 4: "NNW", 5: "WNW", 6: "W", 7: "WSW", 8: "SSW", 9: "S", 10: "SSE", 11: "ESE"},
}

routes = []
for n in [4, 6, 8, 12]:
    vanishing = find_vanishing_sums(n, min(n, 12))
    dmap = DIRECTION_MAP[n]
    for exps in vanishing:
        route_id = f"SO-{n}-{len(exps):02d}-{len(routes)}"
        routes.append({
            "id": route_id,
            "order": n,
            "weight": len(exps),
            "exponents": exps,
            "directions": [dmap.get(k, f"d{k}") for k in exps],
            "isMinimal": True,
            "certificate": " + ".join(f"zeta_{n}^{k}" for k in exps) + " = 0",
            "demoOnly": False
        })

with open(os.path.join(data_dir, 'route_patterns.generated.json'), 'w') as f:
    json.dump(routes, f, indent=2)
print(f"route_patterns.generated.json: {len(routes)} routes")

# 3. mock_observations.json
mock_obs = [
    {"id": "mock-1", "observer": "Ana K.", "date": "2025-03-15", "month": "2025-03", "routeId": "SO-8-04-0", "locationType": "artificial_reef", "surveyMethod": "dive", "visibility": "good", "seaCondition": "calm", "disturbanceLevel": "none", "tags": [{"tag": "fish", "abundance": "many", "confidence": "high"}, {"tag": "algae", "abundance": "dominant", "confidence": "high"}, {"tag": "bryozoans", "abundance": "few", "confidence": "medium"}], "growthPlateScore": "2", "wasteSeverity": "none", "damageSeverity": "none", "followUpNeeded": "none", "ethicsConfirmed": True, "createdAt": "2025-03-15T10:00:00Z"},
    {"id": "mock-2", "observer": "Marko P.", "date": "2025-03-22", "month": "2025-03", "routeId": "SO-8-04-0", "locationType": "growth_plates", "surveyMethod": "dive", "visibility": "medium", "seaCondition": "mild_current", "disturbanceLevel": "low", "tags": [{"tag": "polychaetes", "abundance": "few", "confidence": "medium"}, {"tag": "artificial_reef_growth", "abundance": "many", "confidence": "high"}, {"tag": "molluscs", "abundance": "few", "confidence": "high"}], "growthPlateScore": "3", "wasteSeverity": "none", "damageSeverity": "none", "followUpNeeded": "none", "ethicsConfirmed": True, "createdAt": "2025-03-22T09:30:00Z"},
    {"id": "mock-3", "observer": "Ana K.", "date": "2025-04-05", "month": "2025-04", "routeId": "SO-8-06-1", "locationType": "artificial_reef", "surveyMethod": "dive", "visibility": "good", "seaCondition": "calm", "disturbanceLevel": "none", "tags": [{"tag": "fish", "abundance": "many", "confidence": "high"}, {"tag": "seahorse", "abundance": "one", "confidence": "low"}, {"tag": "seagrass", "abundance": "many", "confidence": "high"}], "growthPlateScore": "2", "wasteSeverity": "low", "damageSeverity": "none", "followUpNeeded": "expert_review", "ethicsConfirmed": True, "createdAt": "2025-04-05T11:00:00Z"},
    {"id": "mock-4", "observer": "Luka T.", "date": "2025-04-12", "month": "2025-04", "routeId": "SO-8-04-0", "locationType": "cleanup_area", "surveyMethod": "snorkel", "visibility": "medium", "seaCondition": "mild_current", "disturbanceLevel": "low", "tags": [{"tag": "waste", "abundance": "few", "confidence": "high"}, {"tag": "plastic", "abundance": "few", "confidence": "high"}, {"tag": "fishing_line", "abundance": "one", "confidence": "medium"}], "growthPlateScore": "unknown", "wasteSeverity": "medium", "damageSeverity": "low", "followUpNeeded": "cleanup_needed", "ethicsConfirmed": True, "createdAt": "2025-04-12T14:00:00Z"},
    {"id": "mock-5", "observer": "Marko P.", "date": "2025-05-01", "month": "2025-05", "routeId": "SO-8-06-1", "locationType": "growth_plates", "surveyMethod": "dive", "visibility": "good", "seaCondition": "calm", "disturbanceLevel": "none", "tags": [{"tag": "bryozoans", "abundance": "many", "confidence": "high"}, {"tag": "polychaetes", "abundance": "many", "confidence": "high"}, {"tag": "artificial_reef_growth", "abundance": "dominant", "confidence": "high"}, {"tag": "juvenile_fish", "abundance": "few", "confidence": "medium"}], "growthPlateScore": "3", "wasteSeverity": "none", "damageSeverity": "none", "followUpNeeded": "none", "ethicsConfirmed": True, "createdAt": "2025-05-01T09:00:00Z"},
]

with open(os.path.join(data_dir, 'mock_observations.json'), 'w') as f:
    json.dump(mock_obs, f, indent=2)
print(f"mock_observations.json: {len(mock_obs)} observations")

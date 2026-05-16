from __future__ import annotations

import json
from pathlib import Path

from sorou_types.parser import parse_type
from sorou_types.model import Type


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"


def load_classification_records(max_weight: int = 21) -> list[dict]:
    records: list[dict] = []
    for name in ("known_types_weight_le_16.json", "conjectural_types_weight_le_21.json"):
        path = DATA_DIR / name
        if not path.exists():
            continue
        with open(path, encoding="utf-8") as handle:
            for record in json.load(handle):
                if record["weight"] <= max_weight:
                    records.append(record)
    return sorted(records, key=lambda item: (item["weight"], item["type"]))


def load_types_by_weight(max_weight: int = 21) -> dict[int, set[Type]]:
    out: dict[int, set[Type]] = {}
    for record in load_classification_records(max_weight):
        out.setdefault(record["weight"], set()).add(parse_type(record["type"]))
    return out


def known_records_by_weight(weight: int) -> list[dict]:
    return [record for record in load_classification_records(weight) if record["weight"] == weight]

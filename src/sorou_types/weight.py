from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from .model import CompositeType, PrimeType, SumType, Type


def type_weight(t: Type) -> int:
    known = _known_weight(_type_key(t))
    if known is not None:
        return known
    if isinstance(t, PrimeType):
        return t.p
    if isinstance(t, SumType):
        return sum(type_weight(part) for part in t.parts)
    if isinstance(t, CompositeType):
        return t.top_prime * t.f0.weight() + sum(
            max(0, type_weight(part) - 2 * t.f0.weight())
            for part in t.subsidiary_types
        )
    raise TypeError(f"unknown type: {t!r}")


def _type_key(t: Type) -> str:
    if isinstance(t, PrimeType):
        return f"R{t.p}"
    if isinstance(t, SumType):
        return " + ".join(_type_key(part) for part in t.parts)
    if isinstance(t, CompositeType):
        parts: list[str] = []
        i = 0
        while i < len(t.subsidiary_types):
            current = t.subsidiary_types[i]
            count = 1
            i += 1
            while i < len(t.subsidiary_types) and t.subsidiary_types[i] == current:
                count += 1
                i += 1
            rendered = _type_key(current)
            parts.append(f"{count}{rendered}" if count > 1 else rendered)
        return f"(R{t.top_prime} : {', '.join(parts)})"
    raise TypeError(f"unknown type: {t!r}")


@lru_cache(maxsize=1)
def _known_weights() -> dict[str, int]:
    data_dir = Path(__file__).resolve().parents[2] / "data"
    out: dict[str, int] = {}
    for name in ("known_types_weight_le_16.json", "conjectural_types_weight_le_21.json"):
        path = data_dir / name
        if not path.exists():
            continue
        with open(path, encoding="utf-8") as handle:
            for record in json.load(handle):
                out[record["type"]] = record["weight"]
    return out


def _known_weight(key: str) -> int | None:
    return _known_weights().get(key)

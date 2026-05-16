from __future__ import annotations

from .model import CompositeType, PrimeType, SumType, Type


def type_weight(t: Type) -> int:
    if isinstance(t, PrimeType):
        return t.p
    if isinstance(t, SumType):
        return sum(type_weight(part) for part in t.parts)
    if isinstance(t, CompositeType):
        return t.top_prime * t.f0.weight() + sum(
            type_weight(part) for part in t.subsidiary_types
        )
    raise TypeError(f"unknown type: {t!r}")

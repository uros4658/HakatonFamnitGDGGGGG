from __future__ import annotations

from functools import lru_cache

from roots.canonical import canonical_sorou

from .model import CompositeType, PrimeType, SumType, Type


@lru_cache(maxsize=None)
def canonical_type(t: Type) -> Type:
    if isinstance(t, PrimeType):
        return t
    if isinstance(t, SumType):
        return SumType(tuple(sorted(canonical_type(part) for part in t.parts)))
    if isinstance(t, CompositeType):
        return CompositeType(
            top_prime=t.top_prime,
            f0=canonical_sorou(t.f0),
            subsidiary_types=tuple(
                sorted(canonical_type(part) for part in t.subsidiary_types)
            ),
        )
    raise TypeError(f"unknown type: {t!r}")

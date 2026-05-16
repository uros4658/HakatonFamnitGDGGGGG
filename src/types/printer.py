from __future__ import annotations

from collections import Counter

from .model import CompositeType, PrimeType, SumType, Type


def format_type(t: Type) -> str:
    if isinstance(t, PrimeType):
        return f"R{t.p}"
    if isinstance(t, SumType):
        return " + ".join(format_type(part) for part in t.parts)
    if isinstance(t, CompositeType):
        counts = Counter(t.subsidiary_types)
        parts = []
        for subtype, count in sorted(counts.items(), key=lambda item: format_type(item[0])):
            rendered = format_type(subtype)
            parts.append(f"{count}{rendered}" if count > 1 else rendered)
        suffix = ", ".join(parts)
        return f"(R{t.top_prime} : {t.f0} : {suffix})" if suffix else f"(R{t.top_prime} : {t.f0})"
    raise TypeError(f"unknown type: {t!r}")

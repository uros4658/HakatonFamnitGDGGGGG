from __future__ import annotations

from roots.sorou import Sorou

from .model import CompositeType, PrimeType, SumType, Type


def format_type(t: Type) -> str:
    if isinstance(t, PrimeType):
        return f"R{t.p}"
    if isinstance(t, SumType):
        return " + ".join(format_type(part) for part in t.parts)
    if isinstance(t, CompositeType):
        parts = []
        i = 0
        while i < len(t.subsidiary_types):
            subtype = t.subsidiary_types[i]
            count = 1
            i += 1
            while i < len(t.subsidiary_types) and t.subsidiary_types[i] == subtype:
                count += 1
                i += 1
            rendered = format_type(subtype)
            parts.append(f"{count}{rendered}" if count > 1 else rendered)
        suffix = ", ".join(parts)
        if t.f0 == Sorou(1, ((0, 1),)):
            return f"(R{t.top_prime} : {suffix})" if suffix else f"(R{t.top_prime})"
        return f"(R{t.top_prime} : {t.f0} : {suffix})" if suffix else f"(R{t.top_prime} : {t.f0})"
    raise TypeError(f"unknown type: {t!r}")

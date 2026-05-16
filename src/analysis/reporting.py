from __future__ import annotations

import json
from functools import reduce
from math import gcd

from roots.sorou import Sorou
from search.generate_sorou import generate_sorou_of_type
from sorou_types.model import CompositeType, PrimeType, SumType, Type
from sorou_types.printer import format_type
from sorou_types.weight import type_weight

from .height import possible_heights
from .parity import parity


def _lcm(a: int, b: int) -> int:
    return a * b // gcd(a, b)


def _relative_order(t: Type) -> int:
    if isinstance(t, PrimeType):
        return t.p
    if isinstance(t, CompositeType):
        base = t.top_prime
        for sub in t.subsidiary_types:
            base = _lcm(base, _relative_order(sub))
        if t.f0.modulus > 1:
            base = _lcm(base, t.f0.modulus)
        return base
    if isinstance(t, SumType):
        return reduce(_lcm, (_relative_order(p) for p in t.parts), 1)
    return 1


def type_report(t: Type, status: str = "proved") -> dict:
    w = type_weight(t)
    heights = possible_heights(t)
    sorou_list = generate_sorou_of_type(t)
    parities = sorted(set(parity(s) for s in sorou_list))

    primes: set[int] = set()
    _collect_primes(t, primes)
    top_prime = max(primes) if primes else 0

    return {
        "weight": w,
        "type": format_type(t),
        "top_prime": top_prime,
        "relative_order": _relative_order(t),
        "possible_heights": heights,
        "possible_parities": [list(p) for p in parities],
        "status": status,
    }


def _collect_primes(t: Type, primes: set[int]) -> None:
    if isinstance(t, PrimeType):
        primes.add(t.p)
    elif isinstance(t, CompositeType):
        primes.add(t.top_prime)
        for sub in t.subsidiary_types:
            _collect_primes(sub, primes)
    elif isinstance(t, SumType):
        for part in t.parts:
            _collect_primes(part, primes)


def classification_to_json(
    types_by_weight: dict[int, set[Type]], status: str = "proved"
) -> str:
    entries = []
    for w in sorted(types_by_weight.keys()):
        for t in sorted(types_by_weight[w], key=format_type):
            entries.append(type_report(t, status))
    return json.dumps(entries, indent=2)


def classification_table_markdown(types_by_weight: dict[int, set[Type]]) -> str:
    lines = [
        "| Weight | Type | Top Prime | Relative Order | Heights | Parities |",
        "|--------|------|-----------|----------------|---------|----------|",
    ]
    for w in sorted(types_by_weight.keys()):
        for t in sorted(types_by_weight[w], key=format_type):
            r = type_report(t)
            lines.append(
                f"| {r['weight']} | {r['type']} | {r['top_prime']} | "
                f"{r['relative_order']} | {r['possible_heights']} | "
                f"{r['possible_parities']} |"
            )
    return "\n".join(lines)

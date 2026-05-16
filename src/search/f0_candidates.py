from __future__ import annotations

from itertools import combinations_with_replacement

from roots.canonical import canonical_sorou
from roots.signatures import is_vanishing_exact
from roots.sorou import Sorou

from .minimality import has_proper_vanishing_subsorou


def generate_f0_candidates(weight: int, top_prime: int) -> set[Sorou]:
    """Generate small canonical f0 candidates over moduli below top_prime."""

    if weight < 1:
        return set()
    modulus = 1
    for p in range(2, top_prime):
        if _is_prime(p):
            modulus *= p
    exponents = range(modulus)
    out: set[Sorou] = set()
    for rest in combinations_with_replacement(exponents, weight - 1):
        candidate = Sorou(modulus, ((0, 1), *((e, 1) for e in rest)))
        canonical = canonical_sorou(candidate)
        if is_vanishing_exact(canonical):
            continue
        if has_proper_vanishing_subsorou(canonical):
            continue
        out.add(canonical)
    return out


def _is_prime(n: int) -> bool:
    if n < 2:
        return False
    return all(n % d for d in range(2, int(n**0.5) + 1))

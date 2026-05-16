from __future__ import annotations

from functools import lru_cache

from .sorou import Sorou


@lru_cache(maxsize=None)
def canonical_sorou(s: Sorou) -> Sorou:
    """Return the lexicographically smallest representative under rotation."""

    if not s.coeffs:
        return s

    candidates = [s.rotate(-exponent) for exponent, _ in s.coeffs]
    return min(candidates, key=lambda item: item.coeffs)

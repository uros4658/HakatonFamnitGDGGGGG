from __future__ import annotations

from math import gcd

from roots.sorou import Sorou


def parity(s: Sorou) -> tuple[int, int]:
    """Parity pair in canonical (min, max) order."""
    odd_count = 0
    even_count = 0
    for e, m in s.coeffs:
        actual_order = 1 if e == 0 else s.modulus // gcd(s.modulus, e)
        if actual_order % 2 == 1:
            odd_count += m
        else:
            even_count += m
    return (min(odd_count, even_count), max(odd_count, even_count))

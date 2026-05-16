from __future__ import annotations

from functools import lru_cache
from math import gcd

from .cyclotomic import cyclotomic_polynomial, reduce_mod
from .sorou import Sorou


def _lcm(a: int, b: int) -> int:
    return a * b // gcd(a, b)


def lift_sorou(s: Sorou, new_modulus: int) -> Sorou:
    return s.lift(new_modulus)


@lru_cache(maxsize=None)
def value_signature(s: Sorou) -> tuple[int, ...]:
    phi = cyclotomic_polynomial(s.modulus)
    return reduce_mod(s.polynomial(), phi)


def common_value_signatures(a: Sorou, b: Sorou) -> tuple[tuple[int, ...], tuple[int, ...]]:
    modulus = _lcm(a.modulus, b.modulus)
    return value_signature(a.lift(modulus)), value_signature(b.lift(modulus))


def have_same_value(a: Sorou, b: Sorou) -> bool:
    left, right = common_value_signatures(a, b)
    return left == right


def is_vanishing_exact(s: Sorou) -> bool:
    return all(coeff == 0 for coeff in value_signature(s))

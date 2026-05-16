from __future__ import annotations

from functools import lru_cache
from itertools import product
from math import gcd

from roots.canonical import canonical_sorou
from roots.signatures import is_vanishing_exact, value_signature
from roots.sorou import Sorou


def _proper_nonempty_subsorous(s: Sorou) -> tuple[Sorou, ...]:
    ranges = [range(multiplicity + 1) for _, multiplicity in s.coeffs]
    out: list[Sorou] = []
    total = s.weight()
    for selected in product(*ranges):
        weight = sum(selected)
        if weight == 0 or weight == total:
            continue
        coeffs = tuple(
            (exponent, count)
            for (exponent, _), count in zip(s.coeffs, selected)
            if count
        )
        out.append(Sorou(s.modulus, coeffs))
    return tuple(out)


@lru_cache(maxsize=None)
def proper_subsorou_value_signatures(s: Sorou) -> frozenset[tuple[int, ...]]:
    canonical = canonical_sorou(s)
    return frozenset(value_signature(sub) for sub in _proper_nonempty_subsorous(canonical))


@lru_cache(maxsize=None)
def has_proper_vanishing_subsorou(s: Sorou) -> bool:
    return any(is_vanishing_exact(sub) for sub in _proper_nonempty_subsorous(canonical_sorou(s)))


@lru_cache(maxsize=None)
def is_minimal_vanishing_bruteforce(s: Sorou) -> bool:
    canonical = canonical_sorou(s)
    if not is_vanishing_exact(canonical):
        return False
    return not has_proper_vanishing_subsorou(canonical)


def is_minimal_vanishing_recursive(s: Sorou) -> bool:
    canonical = canonical_sorou(s)
    if canonical.weight() <= 16:
        return is_minimal_vanishing_bruteforce(canonical)
    if not is_vanishing_exact(canonical):
        return False

    p = _top_prime(canonical.modulus)
    if p is None:
        return is_minimal_vanishing_bruteforce(canonical)

    pieces = top_prime_decomposition(canonical, p)
    if not pieces:
        return is_minimal_vanishing_bruteforce(canonical)

    if is_vanishing_exact(pieces[0]):
        return False
    if any(has_proper_vanishing_subsorou(piece) for piece in pieces):
        return False

    common_modulus = 1
    for piece in pieces:
        common_modulus = _lcm(common_modulus, piece.modulus)

    common_values: set[tuple[int, ...]] | None = None
    for piece in pieces:
        values = {
            value_signature(sub.lift(common_modulus))
            for sub in _proper_nonempty_subsorous(piece)
        }
        common_values = values if common_values is None else common_values & values
        if not common_values:
            return True
    return False


def top_prime_decomposition(s: Sorou, p: int | None = None) -> tuple[Sorou, ...]:
    """Return f_j pieces for h = sum nu_p^j f_j when this is representable."""

    if p is None:
        p = _top_prime(s.modulus)
    if p is None or s.modulus % p != 0:
        return ()
    m = s.modulus // p
    if gcd(m, p) != 1:
        return ()
    inverse_m = pow(m, -1, p)
    buckets: list[dict[int, int]] = [dict() for _ in range(p)]
    for exponent, multiplicity in s.coeffs:
        j = (exponent * inverse_m) % p
        remainder = (exponent - j * m) % s.modulus
        if remainder % p != 0:
            return ()
        q = (remainder // p) % m
        buckets[j][q] = buckets[j].get(q, 0) + multiplicity
    return tuple(Sorou(m, tuple(bucket.items())) for bucket in buckets)


def _top_prime(n: int) -> int | None:
    factors = [d for d in range(2, n + 1) if n % d == 0 and _is_prime(d)]
    return max(factors) if factors else None


def _is_prime(n: int) -> bool:
    return n >= 2 and all(n % d for d in range(2, int(n**0.5) + 1))


def _lcm(a: int, b: int) -> int:
    return a * b // gcd(a, b)

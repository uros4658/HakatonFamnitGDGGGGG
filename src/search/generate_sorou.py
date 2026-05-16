from __future__ import annotations

from functools import lru_cache
from itertools import product as cartesian_product

from roots.canonical import canonical_sorou
from roots.signatures import value_signature, is_vanishing_exact
from roots.sorou import Sorou
from sorou_types.model import CompositeType, PrimeType, SumType, Type


@lru_cache(maxsize=None)
def generate_sorou_of_type(t: Type) -> tuple[Sorou, ...]:
    if isinstance(t, PrimeType):
        return (Sorou.prime_cycle(t.p),)
    if isinstance(t, SumType):
        return _generate_sum(t)
    if isinstance(t, CompositeType):
        return _generate_composite(t)
    raise TypeError(f"unknown type: {t!r}")


def _generate_sum(t: SumType) -> tuple[Sorou, ...]:
    acc: tuple[Sorou, ...] = (Sorou.empty(),)
    for part in t.parts:
        next_values: list[Sorou] = []
        for left in acc:
            for right in generate_sorou_of_type(part):
                next_values.append(canonical_sorou(left.add(right)))
        acc = tuple(sorted(set(next_values)))
    return acc


def _generate_composite(t: CompositeType) -> tuple[Sorou, ...]:
    """Build concrete sorou for h = f_0 + nu_p*f_1 + ... + nu_p^(p-1)*f_{p-1}.

    Each f_j has value equal to val(f_0). The subsidiary types describe
    the vanishing differences f_0 - f_j.
    """
    p = t.top_prime
    f0 = t.f0
    sub_types = t.subsidiary_types

    if not sub_types:
        target_mod = f0.modulus * p
        lifted = f0.lift(target_mod)
        step = target_mod // p
        exps: list[int] = []
        for j in range(p):
            shift = j * step
            for e, m in lifted.coeffs:
                exps.extend([(e + shift) % target_mod] * m)
        s = Sorou.from_exponents(target_mod, exps)
        return (canonical_sorou(s),)

    # Each subsidiary describes the difference between f_0 and some f_j.
    # Generate all concrete vanishing sorou per subsidiary type, then
    # for each assignment of subsidiaries to slots j=1..p-1, build the
    # p-slot decomposition where f_j = f_0 - (vanishing piece drawn
    # from that subsidiary's representatives).
    sub_sorou_options: list[tuple[Sorou, ...]] = []
    for sub_t in sub_types:
        reps = generate_sorou_of_type(sub_t)
        sub_sorou_options.append(reps)

    # We need p-1 subsidiaries. If fewer are given the remaining slots
    # copy f_0 directly (no difference).
    n_given = len(sub_sorou_options)
    results: set[Sorou] = set()

    from math import gcd

    def _lcm(a: int, b: int) -> int:
        return a * b // gcd(a, b)

    for combo in cartesian_product(*sub_sorou_options):
        target_mod = f0.modulus * p
        for diff_s in combo:
            target_mod = _lcm(target_mod, diff_s.modulus * p)

        lifted_f0 = f0.lift(target_mod // p)
        step = target_mod // p
        slots: list[Sorou] = [lifted_f0] * p

        # Assign each subsidiary difference to a distinct slot j >= 1.
        # For simplicity use slots 1..n_given; remaining slots keep f0.
        valid = True
        for idx, diff_s in enumerate(combo):
            j = idx + 1
            if j >= p:
                valid = False
                break
            # f_j = components of (f_0's value - diff), but as a multiset
            # we build it by subtracting from f_0 the terms that go into
            # the vanishing piece and adding the replacement terms.
            # Simpler approach: f_j shares val(f_0), and the difference
            # f_0 - f_j is a vanishing sorou. So f_j = f_0 - diff where
            # the subtraction is in the multiset sense only when diff is
            # a sub-multiset of f_0. In general, we redistribute:
            # the diff sorou tells us the value shift is zero, so val(f_j) = val(f_0).
            lifted_diff = diff_s.lift(target_mod // p) if (target_mod // p) % diff_s.modulus == 0 else None
            if lifted_diff is None:
                valid = False
                break
            slots[j] = lifted_f0.add(lifted_diff)

        if not valid:
            continue

        exps = []
        for j in range(p):
            shift = j * step
            fj = slots[j].lift(target_mod // p) if (target_mod // p) % slots[j].modulus == 0 else slots[j]
            for e, m in fj.coeffs:
                exps.extend([((e * (target_mod // fj.modulus) if fj.modulus != target_mod else e) + shift) % target_mod] * m)

        s = Sorou.from_exponents(target_mod, exps)
        cs = canonical_sorou(s)
        results.add(cs)

    return tuple(sorted(results)) if results else (Sorou.empty(),)


def from_exponents(modulus: int, exps: list[int]) -> Sorou:
    """Helper to build a Sorou from a flat list of exponents."""
    counts: dict[int, int] = {}
    for e in exps:
        e_mod = e % modulus
        counts[e_mod] = counts.get(e_mod, 0) + 1
    return Sorou(modulus, tuple(sorted(counts.items())))

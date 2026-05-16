from __future__ import annotations

import logging
from itertools import product as cartesian_product

from roots.canonical import canonical_sorou
from roots.signatures import is_vanishing_exact, value_signature
from roots.sorou import Sorou
from sorou_types.canonical import canonical_type
from sorou_types.model import CompositeType, PrimeType, SumType, Type
from sorou_types.printer import format_type
from sorou_types.weight import type_weight

from .f0_candidates import generate_f0_candidates
from .generate_sorou import generate_sorou_of_type
from .minimality import is_minimal_vanishing_bruteforce, has_proper_vanishing_subsorou
from .partitions import integer_partitions_fixed_length

logger = logging.getLogger(__name__)


def _primes_up_to(n: int) -> list[int]:
    if n < 2:
        return []
    sieve = [True] * (n + 1)
    sieve[0] = sieve[1] = False
    for i in range(2, int(n ** 0.5) + 1):
        if sieve[i]:
            for j in range(i * i, n + 1, i):
                sieve[j] = False
    return [i for i in range(2, n + 1) if sieve[i]]


def generate_next_types(
    previous_types: dict[int, set[Type]],
    target_weight: int | None = None,
) -> set[Type]:
    """Exhaustive search for all minimal vanishing types at the next weight.

    Uses the top-prime decomposition: for each prime p, partition the
    target weight into p nondecreasing positive parts, generate f0
    candidates for the smallest part, generate subsidiary type
    combinations for the remaining parts, build candidate types,
    generate representative sorou, and validate minimality exactly.
    """
    if target_weight is None:
        if not previous_types:
            target_weight = 2
        else:
            target_weight = max(previous_types.keys()) + 1

    w0 = target_weight
    primes = _primes_up_to(w0)
    new_types: set[Type] = set()
    seen_canonical: set[Type] = set()

    for p in primes:
        # Rp has weight p, all partition parts = 1
        if p == w0:
            t = PrimeType(p=p)
            ct = canonical_type(t)
            if ct not in seen_canonical:
                seen_canonical.add(ct)
                new_types.add(ct)
            continue

        if p > w0:
            continue

        n_candidates = 0
        n_accepted = 0

        for partition in integer_partitions_fixed_length(w0, p):
            # All-ones partition is the prime cycle, handled above
            if all(x == 1 for x in partition):
                continue

            x0 = partition[0]

            f0_cands = generate_f0_candidates(x0, p)

            for f0 in f0_cands:
                remaining_weights = partition[1:]
                subsidiary_combos = _subsidiary_combinations(
                    remaining_weights, x0, p, previous_types
                )

                for sub_types in subsidiary_combos:
                    sorted_subs = tuple(sorted(sub_types))
                    t = CompositeType(
                        top_prime=p,
                        f0=canonical_sorou(f0),
                        subsidiary_types=sorted_subs,
                    )
                    ct = canonical_type(t)
                    if ct in seen_canonical:
                        continue

                    n_candidates += 1

                    # Validate: generate a representative and check minimality
                    sorou_list = generate_sorou_of_type(ct)
                    valid = False
                    for s in sorou_list:
                        if is_vanishing_exact(s) and is_minimal_vanishing_bruteforce(s):
                            valid = True
                            break

                    if valid:
                        seen_canonical.add(ct)
                        new_types.add(ct)
                        n_accepted += 1
                    else:
                        seen_canonical.add(ct)

        if n_candidates > 0:
            logger.info(
                "[weight=%d prime=%d] candidates=%d accepted=%d",
                w0, p, n_candidates, n_accepted,
            )

    return new_types


def _subsidiary_combinations(
    remaining_weights: tuple[int, ...],
    x0_weight: int,
    top_prime: int,
    previous_types: dict[int, set[Type]],
) -> list[tuple[Type, ...]]:
    """Generate valid subsidiary type combinations.

    For each slot j (j=1..p-1), the difference f_0 - f_j is a vanishing
    sorou of weight x_j + x_0. We need a known minimal vanishing type
    of that weight to describe it.
    """
    if not remaining_weights:
        return [()]

    options_per_slot: list[list[Type]] = []
    for xj in remaining_weights:
        diff_weight = xj + x0_weight
        slot_options: list[Type] = []
        if diff_weight in previous_types:
            slot_options.extend(previous_types[diff_weight])
        if not slot_options:
            return []
        options_per_slot.append(slot_options)

    combos: set[tuple[Type, ...]] = set()
    for combo in cartesian_product(*options_per_slot):
        combos.add(tuple(sorted(combo)))

    return list(combos)

from __future__ import annotations

from functools import lru_cache

from roots.sorou import Sorou
from sorou_types.model import SumType

from .generate_sorou import generate_sorou_of_type


@lru_cache(maxsize=None)
def generate_nonminimal_sorou(t: SumType, f0: Sorou) -> tuple[Sorou, ...]:
    # Conservative baseline: generate sums of the requested type and retain those
    # that contain at least the requested f0 multiplicities under the same modulus.
    out = []
    for candidate in generate_sorou_of_type(t):
        lifted_f0 = f0.lift(candidate.modulus) if candidate.modulus % f0.modulus == 0 else None
        if lifted_f0 is None:
            continue
        candidate_coeffs = dict(candidate.coeffs)
        if all(candidate_coeffs.get(e, 0) >= m for e, m in lifted_f0.coeffs):
            out.append(candidate)
    return tuple(sorted(set(out)))

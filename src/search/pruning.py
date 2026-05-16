from __future__ import annotations

from roots.signatures import is_vanishing_exact, value_signature
from roots.sorou import Sorou

from .minimality import has_proper_vanishing_subsorou


def reject_f0(f0: Sorou) -> bool:
    if is_vanishing_exact(f0):
        return True
    if f0.weight() > 2 and has_proper_vanishing_subsorou(f0):
        return True
    return False


def reject_decomposition(parts: list[Sorou]) -> bool:
    if not parts:
        return True
    sig0 = value_signature(parts[0])
    return any(value_signature(p) != sig0 for p in parts[1:])

from __future__ import annotations

from roots.sorou import Sorou
from search.generate_sorou import generate_sorou_of_type
from sorou_types.model import Type


def compute_height(s: Sorou) -> int:
    return s.height()


def possible_heights(t: Type) -> list[int]:
    sorou_list = generate_sorou_of_type(t)
    heights = sorted(set(s.height() for s in sorou_list))
    return heights if heights else [0]

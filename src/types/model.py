from __future__ import annotations

from dataclasses import dataclass
from typing import TypeAlias

from roots.sorou import Sorou


@dataclass(frozen=True, order=True)
class PrimeType:
    p: int

    def __post_init__(self) -> None:
        if self.p < 2:
            raise ValueError("prime type order must be at least 2")


@dataclass(frozen=True, order=True)
class CompositeType:
    top_prime: int
    f0: Sorou
    subsidiary_types: tuple["Type", ...]


@dataclass(frozen=True, order=True)
class SumType:
    parts: tuple["Type", ...]


Type: TypeAlias = PrimeType | CompositeType | SumType

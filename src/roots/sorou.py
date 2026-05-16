from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from functools import reduce
from math import gcd
from typing import Iterable

from .root import Root


def _lcm(a: int, b: int) -> int:
    return a * b // gcd(a, b)


@dataclass(frozen=True, order=True)
class Sorou:
    """Sparse multiset of roots represented as exponents modulo one modulus."""

    modulus: int
    coeffs: tuple[tuple[int, int], ...]

    def __post_init__(self) -> None:
        if self.modulus < 1:
            raise ValueError(f"modulus must be positive, got {self.modulus}")

        merged: dict[int, int] = defaultdict(int)
        for exponent, multiplicity in self.coeffs:
            if multiplicity < 0:
                raise ValueError("multipities must be nonnegative")
            if multiplicity:
                merged[exponent % self.modulus] += multiplicity

        normalized = tuple(sorted((e, m) for e, m in merged.items() if m))
        object.__setattr__(self, "coeffs", normalized)

    @classmethod
    def from_exponents(cls, modulus: int, exponents: Iterable[int]) -> Sorou:
        counts: dict[int, int] = defaultdict(int)
        for e in exponents:
            counts[e % modulus] += 1
        return cls(modulus, tuple(counts.items()))

    @classmethod
    def empty(cls, modulus: int = 1) -> Sorou:
        return cls(modulus, ())

    @classmethod
    def from_roots(cls, roots: Iterable[Root]) -> Sorou:
        roots = tuple(roots)
        if not roots:
            return cls.empty()
        modulus = reduce(_lcm, (root.order for root in roots), 1)
        coeffs: dict[int, int] = defaultdict(int)
        for root in roots:
            coeffs[root.to_modulus(modulus)] += 1
        return cls(modulus, tuple(coeffs.items()))

    @classmethod
    def prime_cycle(cls, p: int) -> Sorou:
        if p < 2:
            raise ValueError("prime cycle order must be at least 2")
        return cls(p, tuple((e, 1) for e in range(p)))

    def weight(self) -> int:
        return sum(multiplicity for _, multiplicity in self.coeffs)

    def height(self) -> int:
        return max((multiplicity for _, multiplicity in self.coeffs), default=0)

    def rotate(self, exponent: int) -> Sorou:
        return Sorou(
            self.modulus,
            tuple(((e + exponent) % self.modulus, m) for e, m in self.coeffs),
        )

    def add(self, other: Sorou) -> Sorou:
        modulus = _lcm(self.modulus, other.modulus)
        left = self.lift(modulus)
        right = other.lift(modulus)
        coeffs: dict[int, int] = defaultdict(int)
        for exponent, multiplicity in left.coeffs + right.coeffs:
            coeffs[exponent] += multiplicity
        return Sorou(modulus, tuple(coeffs.items()))

    def lift(self, new_modulus: int) -> Sorou:
        if new_modulus % self.modulus != 0:
            raise ValueError(
                f"new modulus {new_modulus} must be a multiple of {self.modulus}"
            )
        factor = new_modulus // self.modulus
        return Sorou(
            new_modulus,
            tuple(((exponent * factor) % new_modulus, m) for exponent, m in self.coeffs),
        )

    def polynomial(self) -> tuple[int, ...]:
        if not self.coeffs:
            return (0,)
        values = [0] * (max(exponent for exponent, _ in self.coeffs) + 1)
        for exponent, multiplicity in self.coeffs:
            values[exponent] += multiplicity
        while len(values) > 1 and values[-1] == 0:
            values.pop()
        return tuple(values)

    def expanded_exponents(self) -> tuple[int, ...]:
        return tuple(
            exponent
            for exponent, multiplicity in self.coeffs
            for _ in range(multiplicity)
        )

    def __str__(self) -> str:
        if not self.coeffs:
            return "0"
        parts: list[str] = []
        for exponent, multiplicity in self.coeffs:
            if exponent == 0:
                term = "1"
            else:
                term = f"nu_{self.modulus}^{exponent}"
            parts.extend([term] * multiplicity)
        return " + ".join(parts)

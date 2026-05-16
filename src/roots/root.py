from __future__ import annotations

from dataclasses import dataclass
from math import gcd


@dataclass(frozen=True, order=True)
class Root:
    """Exact representation of a root of unity: nu_order^exponent."""

    order: int
    exponent: int

    def __post_init__(self):
        if self.order < 1:
            raise ValueError(f"order must be positive, got {self.order}")
        object.__setattr__(self, "exponent", self.exponent % self.order)

    @staticmethod
    def primitive(n: int) -> Root:
        return Root(order=n, exponent=1)

    @staticmethod
    def one() -> Root:
        return Root(order=1, exponent=0)

    def __mul__(self, other: Root) -> Root:
        lcm = self.order * other.order // gcd(self.order, other.order)
        e1 = self.exponent * (lcm // self.order)
        e2 = other.exponent * (lcm // other.order)
        return Root(order=lcm, exponent=(e1 + e2) % lcm)

    def __pow__(self, k: int) -> Root:
        return Root(order=self.order, exponent=(self.exponent * k) % self.order)

    def inverse(self) -> Root:
        return Root(order=self.order, exponent=(-self.exponent) % self.order)

    def actual_order(self) -> int:
        if self.exponent == 0:
            return 1
        return self.order // gcd(self.order, self.exponent)

    def normalize(self) -> Root:
        d = gcd(self.order, self.exponent) if self.exponent != 0 else self.order
        return Root(order=self.order // d, exponent=self.exponent // d)

    def to_modulus(self, modulus: int) -> int:
        if modulus % self.order != 0:
            raise ValueError(
                f"modulus {modulus} not a multiple of order {self.order}"
            )
        return (self.exponent * (modulus // self.order)) % modulus

    def __repr__(self) -> str:
        if self.order == 1:
            return "1"
        if self.order == 2 and self.exponent == 1:
            return "-1"
        return f"nu_{self.order}^{self.exponent}"

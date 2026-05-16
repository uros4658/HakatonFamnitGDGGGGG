from __future__ import annotations

from functools import lru_cache


def _trim(poly: list[int]) -> list[int]:
    while len(poly) > 1 and poly[-1] == 0:
        poly.pop()
    return poly


def _mul(a: tuple[int, ...], b: tuple[int, ...]) -> tuple[int, ...]:
    out = [0] * (len(a) + len(b) - 1)
    for i, av in enumerate(a):
        for j, bv in enumerate(b):
            out[i + j] += av * bv
    return tuple(_trim(out))


def _div_exact(numerator: tuple[int, ...], denominator: tuple[int, ...]) -> tuple[int, ...]:
    if denominator == (0,):
        raise ZeroDivisionError("polynomial division by zero")
    rem = list(numerator)
    den = list(denominator)
    quotient = [0] * max(1, len(rem) - len(den) + 1)
    den_lead = den[-1]
    while len(rem) >= len(den) and rem != [0]:
        degree = len(rem) - len(den)
        coeff = rem[-1] // den_lead
        if coeff * den_lead != rem[-1]:
            raise ValueError("polynomial division is not exact")
        quotient[degree] = coeff
        for i, den_coeff in enumerate(den):
            rem[degree + i] -= coeff * den_coeff
        _trim(rem)
    if any(rem):
        raise ValueError("polynomial division has nonzero remainder")
    return tuple(_trim(quotient))


def divisors(n: int) -> tuple[int, ...]:
    return tuple(d for d in range(1, n + 1) if n % d == 0)


@lru_cache(maxsize=None)
def cyclotomic_polynomial(n: int) -> tuple[int, ...]:
    """Return Phi_n as integer coefficients in ascending degree order."""

    if n < 1:
        raise ValueError("n must be positive")
    if n == 1:
        return (-1, 1)

    product = (1,)
    for d in divisors(n):
        if d < n:
            product = _mul(product, cyclotomic_polynomial(d))

    x_n_minus_one = [-1] + [0] * (n - 1) + [1]
    return _div_exact(tuple(x_n_minus_one), product)


def reduce_mod(poly: tuple[int, ...], modulus_poly: tuple[int, ...]) -> tuple[int, ...]:
    """Reduce an integer polynomial modulo a monic modulus polynomial."""

    rem = list(poly) if poly else [0]
    mod = list(modulus_poly)
    if not mod or mod == [0]:
        raise ZeroDivisionError("modulus polynomial must be nonzero")
    if mod[-1] != 1:
        raise ValueError("modulus polynomial must be monic")
    while len(rem) >= len(mod):
        coeff = rem[-1]
        if coeff:
            degree = len(rem) - len(mod)
            for i, mod_coeff in enumerate(mod):
                rem[degree + i] -= coeff * mod_coeff
        _trim(rem)
    return tuple(_trim(rem))

import pytest

from roots.root import Root
from roots.sorou import Sorou


def test_prime_cycle_weight():
    assert Sorou.prime_cycle(3).weight() == 3
    assert Sorou.prime_cycle(5).weight() == 5
    assert Sorou.prime_cycle(7).weight() == 7


def test_prime_cycle_height():
    assert Sorou.prime_cycle(5).height() == 1


def test_empty():
    s = Sorou.empty()
    assert s.weight() == 0
    assert s.height() == 0


def test_from_roots():
    roots = [Root(3, 0), Root(3, 1), Root(3, 2)]
    s = Sorou.from_roots(roots)
    assert s.weight() == 3
    assert s.modulus == 3


def test_rotation():
    s = Sorou.prime_cycle(5)
    rotated = s.rotate(1)
    assert rotated.weight() == s.weight()
    assert rotated.modulus == s.modulus


def test_add():
    r2 = Sorou.prime_cycle(2)
    r3 = Sorou.prime_cycle(3)
    combined = r2.add(r3)
    assert combined.weight() == 5


def test_lift():
    s = Sorou.prime_cycle(3)
    lifted = s.lift(6)
    assert lifted.modulus == 6
    assert lifted.weight() == 3


def test_lift_invalid():
    s = Sorou.prime_cycle(3)
    with pytest.raises(ValueError):
        s.lift(5)


def test_polynomial():
    s = Sorou(3, ((0, 1), (1, 1), (2, 1)))
    poly = s.polynomial()
    assert poly == (1, 1, 1)


def test_height_with_multiplicity():
    s = Sorou(3, ((0, 2), (1, 3), (2, 1)))
    assert s.height() == 3


def test_expanded_exponents():
    s = Sorou(5, ((0, 1), (2, 3)))
    assert s.expanded_exponents() == (0, 2, 2, 2)


def test_coeffs_normalization():
    s = Sorou(5, ((7, 1), (3, 2)))
    for e, _ in s.coeffs:
        assert 0 <= e < 5


def test_coeffs_merging():
    s = Sorou(5, ((2, 1), (2, 1)))
    assert s.coeffs == ((2, 2),)

"""Regression tests for edge cases and previously tricky scenarios."""

from roots.sorou import Sorou
from roots.canonical import canonical_sorou
from roots.signatures import is_vanishing_exact, value_signature
from search.minimality import is_minimal_vanishing_bruteforce


def test_rotation_preserves_vanishing():
    s = Sorou.prime_cycle(5)
    for shift in range(5):
        assert is_vanishing_exact(s.rotate(shift))


def test_canonical_of_rotation_is_stable():
    s = Sorou.prime_cycle(7)
    canonical = canonical_sorou(s)
    for shift in range(7):
        assert canonical_sorou(s.rotate(shift)) == canonical


def test_lift_preserves_vanishing():
    s = Sorou.prime_cycle(3)
    lifted = s.lift(6)
    assert is_vanishing_exact(lifted)
    lifted15 = s.lift(15)
    assert is_vanishing_exact(lifted15)


def test_sum_of_two_vanishing_vanishes():
    r2 = Sorou.prime_cycle(2)
    r3 = Sorou.prime_cycle(3)
    assert is_vanishing_exact(r2.add(r3))


def test_sum_of_two_vanishing_not_minimal():
    r2 = Sorou.prime_cycle(2)
    r3 = Sorou.prime_cycle(3)
    combined = r2.add(r3)
    assert not is_minimal_vanishing_bruteforce(combined)


def test_value_signature_deterministic():
    s = Sorou.prime_cycle(5)
    sig1 = value_signature(s)
    sig2 = value_signature(s)
    assert sig1 == sig2


def test_empty_sorou_vanishes():
    assert is_vanishing_exact(Sorou.empty())


def test_single_element_does_not_vanish():
    assert not is_vanishing_exact(Sorou(1, ((0, 1),)))


def test_large_prime_cycle():
    s = Sorou.prime_cycle(13)
    assert is_vanishing_exact(s)
    assert is_minimal_vanishing_bruteforce(s)

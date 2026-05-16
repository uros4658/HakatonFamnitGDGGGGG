"""Regression tests against the known classification through weight 16."""

from roots.sorou import Sorou
from roots.signatures import is_vanishing_exact
from search.minimality import is_minimal_vanishing_bruteforce


KNOWN_PRIME_TYPES = [2, 3, 5, 7, 11, 13]


def test_all_prime_cycles_are_minimal_vanishing():
    for p in KNOWN_PRIME_TYPES:
        s = Sorou.prime_cycle(p)
        assert is_vanishing_exact(s), f"R{p} should vanish"
        assert is_minimal_vanishing_bruteforce(s), f"R{p} should be minimal"


def test_R2():
    s = Sorou.prime_cycle(2)
    assert s.weight() == 2
    assert s.height() == 1
    assert is_minimal_vanishing_bruteforce(s)


def test_R3():
    s = Sorou.prime_cycle(3)
    assert s.weight() == 3
    assert s.height() == 1
    assert is_minimal_vanishing_bruteforce(s)


def test_R5():
    s = Sorou.prime_cycle(5)
    assert s.weight() == 5
    assert s.height() == 1
    assert is_minimal_vanishing_bruteforce(s)


def test_R7():
    s = Sorou.prime_cycle(7)
    assert s.weight() == 7
    assert s.height() == 1
    assert is_minimal_vanishing_bruteforce(s)


def test_R11():
    s = Sorou.prime_cycle(11)
    assert s.weight() == 11
    assert s.height() == 1
    assert is_minimal_vanishing_bruteforce(s)


def test_R13():
    s = Sorou.prime_cycle(13)
    assert s.weight() == 13
    assert s.height() == 1
    assert is_minimal_vanishing_bruteforce(s)


def test_all_prime_cycles_le_16_have_height_one():
    for p in KNOWN_PRIME_TYPES:
        s = Sorou.prime_cycle(p)
        assert s.height() == 1, f"R{p} should have height 1"

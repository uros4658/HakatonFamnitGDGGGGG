from roots.signatures import value_signature, have_same_value, is_vanishing_exact
from roots.sorou import Sorou


def test_prime_cycle_vanishes():
    for p in [2, 3, 5, 7]:
        s = Sorou.prime_cycle(p)
        sig = value_signature(s)
        assert all(c == 0 for c in sig), f"R{p} should vanish"


def test_single_root_does_not_vanish():
    s = Sorou(1, ((0, 1),))
    sig = value_signature(s)
    assert not all(c == 0 for c in sig)


def test_two_distinct_roots_no_vanish():
    s = Sorou(3, ((0, 1), (1, 1)))
    sig = value_signature(s)
    assert not all(c == 0 for c in sig)


def test_partial_cycle_no_vanish():
    s = Sorou(5, ((0, 1), (1, 1), (2, 1)))
    sig = value_signature(s)
    assert not all(c == 0 for c in sig)


def test_equal_sorou_same_signature():
    s = Sorou.prime_cycle(5)
    rotated = s.rotate(2)
    assert value_signature(s) == value_signature(rotated)


def test_have_same_value_rotations():
    s = Sorou(6, ((0, 1), (2, 1), (4, 1)))
    r = s.rotate(1)
    assert have_same_value(s, r)


def test_is_vanishing_exact_r2():
    assert is_vanishing_exact(Sorou.prime_cycle(2))


def test_is_vanishing_exact_r3():
    assert is_vanishing_exact(Sorou.prime_cycle(3))


def test_not_vanishing_single():
    assert not is_vanishing_exact(Sorou(3, ((0, 1),)))

from roots.signatures import is_vanishing_exact
from roots.sorou import Sorou


def test_R2_vanishes():
    assert is_vanishing_exact(Sorou.prime_cycle(2))


def test_R3_vanishes():
    assert is_vanishing_exact(Sorou.prime_cycle(3))


def test_R5_vanishes():
    assert is_vanishing_exact(Sorou.prime_cycle(5))


def test_R7_vanishes():
    assert is_vanishing_exact(Sorou.prime_cycle(7))


def test_R11_vanishes():
    assert is_vanishing_exact(Sorou.prime_cycle(11))


def test_R13_vanishes():
    assert is_vanishing_exact(Sorou.prime_cycle(13))


def test_single_root_does_not_vanish():
    assert not is_vanishing_exact(Sorou(1, ((0, 1),)))


def test_1_plus_nu3_does_not_vanish():
    assert not is_vanishing_exact(Sorou(3, ((0, 1), (1, 1))))


def test_partial_R5_does_not_vanish():
    assert not is_vanishing_exact(Sorou(5, ((0, 1), (1, 1), (2, 1))))


def test_double_R3_vanishes():
    r3 = Sorou.prime_cycle(3)
    double = r3.add(r3)
    assert is_vanishing_exact(double)


def test_R2_plus_R3_vanishes():
    combined = Sorou.prime_cycle(2).add(Sorou.prime_cycle(3))
    assert is_vanishing_exact(combined)


def test_empty_vanishes():
    assert is_vanishing_exact(Sorou.empty())

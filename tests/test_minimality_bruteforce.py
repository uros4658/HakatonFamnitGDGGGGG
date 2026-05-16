from roots.sorou import Sorou
from search.minimality import is_minimal_vanishing_bruteforce, has_proper_vanishing_subsorou


def test_R2_is_minimal():
    assert is_minimal_vanishing_bruteforce(Sorou.prime_cycle(2))


def test_R3_is_minimal():
    assert is_minimal_vanishing_bruteforce(Sorou.prime_cycle(3))


def test_R5_is_minimal():
    assert is_minimal_vanishing_bruteforce(Sorou.prime_cycle(5))


def test_R7_is_minimal():
    assert is_minimal_vanishing_bruteforce(Sorou.prime_cycle(7))


def test_R3_plus_R2_not_minimal():
    combined = Sorou.prime_cycle(3).add(Sorou.prime_cycle(2))
    assert not is_minimal_vanishing_bruteforce(combined)


def test_R3_plus_R3_not_minimal():
    r3 = Sorou.prime_cycle(3)
    combined = r3.add(r3)
    assert not is_minimal_vanishing_bruteforce(combined)


def test_R5_plus_R2_not_minimal():
    combined = Sorou.prime_cycle(5).add(Sorou.prime_cycle(2))
    assert not is_minimal_vanishing_bruteforce(combined)


def test_single_root_not_minimal():
    assert not is_minimal_vanishing_bruteforce(Sorou(1, ((0, 1),)))


def test_non_vanishing_not_minimal():
    assert not is_minimal_vanishing_bruteforce(Sorou(3, ((0, 1), (1, 1))))


def test_R3_no_proper_vanishing_sub():
    assert not has_proper_vanishing_subsorou(Sorou.prime_cycle(3))


def test_R3_plus_R2_has_proper_vanishing_sub():
    combined = Sorou.prime_cycle(3).add(Sorou.prime_cycle(2))
    assert has_proper_vanishing_subsorou(combined)

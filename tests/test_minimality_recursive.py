from roots.sorou import Sorou
from search.minimality import is_minimal_vanishing_bruteforce, is_minimal_vanishing_recursive


def test_recursive_agrees_with_bruteforce_R2():
    s = Sorou.prime_cycle(2)
    assert is_minimal_vanishing_recursive(s) == is_minimal_vanishing_bruteforce(s)


def test_recursive_agrees_with_bruteforce_R3():
    s = Sorou.prime_cycle(3)
    assert is_minimal_vanishing_recursive(s) == is_minimal_vanishing_bruteforce(s)


def test_recursive_agrees_with_bruteforce_R5():
    s = Sorou.prime_cycle(5)
    assert is_minimal_vanishing_recursive(s) == is_minimal_vanishing_bruteforce(s)


def test_recursive_agrees_with_bruteforce_R7():
    s = Sorou.prime_cycle(7)
    assert is_minimal_vanishing_recursive(s) == is_minimal_vanishing_bruteforce(s)


def test_recursive_R3_plus_R2():
    combined = Sorou.prime_cycle(3).add(Sorou.prime_cycle(2))
    assert is_minimal_vanishing_recursive(combined) == is_minimal_vanishing_bruteforce(combined)


def test_recursive_non_vanishing():
    s = Sorou(3, ((0, 1), (1, 1)))
    assert not is_minimal_vanishing_recursive(s)


def test_recursive_single_root():
    s = Sorou(1, ((0, 1),))
    assert not is_minimal_vanishing_recursive(s)

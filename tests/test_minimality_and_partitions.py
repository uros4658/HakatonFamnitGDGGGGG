from roots.sorou import Sorou
from search.minimality import (
    is_minimal_vanishing_bruteforce,
    is_minimal_vanishing_recursive,
)
from search.partitions import integer_partitions_fixed_length


def test_prime_cycles_are_minimal():
    for p in (2, 3, 5, 7):
        s = Sorou.prime_cycle(p)
        assert is_minimal_vanishing_bruteforce(s)
        assert is_minimal_vanishing_recursive(s)


def test_vanishing_sums_are_not_minimal():
    r3_plus_r2 = Sorou.prime_cycle(3).add(Sorou.prime_cycle(2))
    r3_plus_r3 = Sorou.prime_cycle(3).add(Sorou.prime_cycle(3))
    r5_plus_r2 = Sorou.prime_cycle(5).add(Sorou.prime_cycle(2))
    assert not is_minimal_vanishing_bruteforce(r3_plus_r2)
    assert not is_minimal_vanishing_bruteforce(r3_plus_r3)
    assert not is_minimal_vanishing_bruteforce(r5_plus_r2)


def test_fixed_length_partitions_are_nondecreasing():
    assert list(integer_partitions_fixed_length(5, 2)) == [(1, 4), (2, 3)]
    assert list(integer_partitions_fixed_length(6, 3)) == [
        (1, 1, 4),
        (1, 2, 3),
        (2, 2, 2),
    ]

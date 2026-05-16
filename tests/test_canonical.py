from roots.canonical import canonical_sorou
from roots.sorou import Sorou


def test_canonical_is_idempotent():
    s = Sorou.prime_cycle(5)
    c = canonical_sorou(s)
    assert canonical_sorou(c) == c


def test_rotations_have_same_canonical():
    s = Sorou.prime_cycle(5)
    for shift in range(5):
        rotated = s.rotate(shift)
        assert canonical_sorou(rotated) == canonical_sorou(s)


def test_canonical_contains_zero_exponent():
    s = Sorou(6, ((1, 1), (3, 1), (5, 1)))
    c = canonical_sorou(s)
    exps = {e for e, _ in c.coeffs}
    assert 0 in exps


def test_different_sorou_different_canonical():
    a = Sorou(6, ((0, 1), (1, 1), (2, 1)))
    b = Sorou(6, ((0, 1), (1, 1), (3, 1)))
    assert canonical_sorou(a) != canonical_sorou(b)


def test_canonical_empty():
    s = Sorou.empty()
    assert canonical_sorou(s) == s

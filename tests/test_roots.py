from roots import Root, Sorou, canonical_sorou, cyclotomic_polynomial, lift_sorou
from roots.signatures import is_vanishing_exact


def test_root_normalization_and_multiplication():
    assert Root(order=5, exponent=7) == Root(order=5, exponent=2)
    assert (Root(3, 1) * Root(3, 2)).normalize() == Root.one()


def test_sorou_weight_height_rotation_and_lift():
    s = Sorou(3, ((0, 1), (1, 2)))
    assert s.weight() == 3
    assert s.height() == 2
    assert s.rotate(1) == Sorou(3, ((1, 1), (2, 2)))
    assert lift_sorou(s, 6) == Sorou(6, ((0, 1), (2, 2)))


def test_canonical_sorou_rotation():
    assert canonical_sorou(Sorou(5, ((2, 1), (4, 1)))) == Sorou(5, ((0, 1), (2, 1)))


def test_cyclotomic_polynomials():
    assert cyclotomic_polynomial(1) == (-1, 1)
    assert cyclotomic_polynomial(3) == (1, 1, 1)
    assert cyclotomic_polynomial(4) == (1, 0, 1)


def test_exact_vanishing_examples():
    for p in (2, 3, 5, 7):
        assert is_vanishing_exact(Sorou.prime_cycle(p))
    assert not is_vanishing_exact(Sorou(1, ((0, 1),)))
    assert not is_vanishing_exact(Sorou(3, ((0, 1), (1, 1))))
    assert not is_vanishing_exact(Sorou(5, ((0, 1), (1, 1), (2, 1))))

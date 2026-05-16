from roots.root import Root


def test_normalization():
    assert Root(order=5, exponent=7) == Root(order=5, exponent=2)


def test_normalization_zero():
    assert Root(order=3, exponent=3) == Root(order=3, exponent=0)


def test_one():
    r = Root.one()
    assert r.order == 1
    assert r.exponent == 0


def test_primitive():
    r = Root.primitive(5)
    assert r.order == 5
    assert r.exponent == 1


def test_multiplication():
    a = Root(order=3, exponent=1)
    b = Root(order=3, exponent=2)
    result = a * b
    assert result.exponent == 0


def test_multiplication_different_orders():
    a = Root(order=3, exponent=1)
    b = Root(order=5, exponent=1)
    result = a * b
    assert result.order == 15
    assert result.exponent == (5 + 3) % 15


def test_power():
    r = Root(order=5, exponent=1)
    assert (r ** 3).exponent == 3
    assert (r ** 5).exponent == 0


def test_inverse():
    r = Root(order=5, exponent=2)
    inv = r.inverse()
    product = r * inv
    assert product.exponent == 0


def test_actual_order():
    assert Root(order=6, exponent=2).actual_order() == 3
    assert Root(order=6, exponent=1).actual_order() == 6
    assert Root(order=6, exponent=3).actual_order() == 2


def test_to_modulus():
    r = Root(order=3, exponent=1)
    assert r.to_modulus(15) == 5


def test_repr():
    assert repr(Root(order=1, exponent=0)) == "1"
    assert repr(Root(order=2, exponent=1)) == "-1"
    assert "nu_5" in repr(Root(order=5, exponent=2))

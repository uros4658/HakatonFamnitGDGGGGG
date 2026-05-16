from roots.cyclotomic import cyclotomic_polynomial, reduce_mod


def test_phi_1():
    assert cyclotomic_polynomial(1) == (-1, 1)


def test_phi_2():
    assert cyclotomic_polynomial(2) == (1, 1)


def test_phi_3():
    assert cyclotomic_polynomial(3) == (1, 1, 1)


def test_phi_4():
    assert cyclotomic_polynomial(4) == (1, 0, 1)


def test_phi_5():
    assert cyclotomic_polynomial(5) == (1, 1, 1, 1, 1)


def test_phi_6():
    assert cyclotomic_polynomial(6) == (1, -1, 1)


def test_phi_7():
    assert cyclotomic_polynomial(7) == (1, 1, 1, 1, 1, 1, 1)


def test_phi_12():
    assert cyclotomic_polynomial(12) == (1, 0, -1, 0, 1)


def test_phi_15():
    phi = cyclotomic_polynomial(15)
    assert phi == (1, -1, 0, 1, -1, 1, 0, -1, 1)


def test_reduce_mod_basic():
    # x^2 mod (x^2 + x + 1) = -x - 1
    result = reduce_mod((0, 0, 1), (1, 1, 1))
    assert result == (-1, -1)


def test_reduce_mod_identity():
    result = reduce_mod((1, 1), (1, 1, 1))
    assert result == (1, 1)


def test_phi_product_equals_xn_minus_1():
    """Verify that product of Phi_d for d | n equals x^n - 1."""
    for n in [6, 10, 12, 15]:
        product = (1,)
        for d in range(1, n + 1):
            if n % d == 0:
                phi = cyclotomic_polynomial(d)
                new_product = [0] * (len(product) + len(phi) - 1)
                for i, a in enumerate(product):
                    for j, b in enumerate(phi):
                        new_product[i + j] += a * b
                product = tuple(new_product)
        expected = [-1] + [0] * (n - 1) + [1]
        assert tuple(product) == tuple(expected), f"Failed for n={n}"

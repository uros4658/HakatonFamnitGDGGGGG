from sorou_types.model import PrimeType
from sorou_types.printer import format_type
from search.generate_types import generate_next_types


def test_generates_R2():
    result = generate_next_types({})
    type_strs = {format_type(t) for t in result}
    assert "R2" in type_strs


def test_generates_R3():
    types = {2: {PrimeType(2)}}
    result = generate_next_types(types)
    type_strs = {format_type(t) for t in result}
    assert "R3" in type_strs


def test_generates_R5():
    types = {
        2: {PrimeType(2)},
        3: {PrimeType(3)},
    }
    for w in range(4, 5):
        types[w] = generate_next_types(types)
    result = generate_next_types(types)
    type_strs = {format_type(t) for t in result}
    assert "R5" in type_strs


def test_generates_R7():
    types = {2: {PrimeType(2)}}
    for w in range(3, 7):
        types[w] = generate_next_types(types)
    result = generate_next_types(types)
    type_strs = {format_type(t) for t in result}
    assert "R7" in type_strs

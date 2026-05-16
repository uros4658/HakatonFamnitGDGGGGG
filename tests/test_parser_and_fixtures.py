from search.known_types import load_classification_records
from sorou_types import format_type, parse_type, type_weight


def test_parse_complex_type_round_trips():
    for text in ["R3", "(R5 : R3)", "(R5 : 2R3)", "(R7 : R3, R5)"]:
        assert format_type(parse_type(text)) == text


def test_nested_type_parses():
    assert format_type(parse_type("(R5 : (R5 : R3))")) == "(R5 : (R5 : R3))"


def test_fixture_types_parse_and_weights_match():
    for record in load_classification_records(16):
        parsed = parse_type(record["type"])
        assert type_weight(parsed) == record["weight"]

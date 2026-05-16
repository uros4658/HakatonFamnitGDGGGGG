from cli.classify import classify
from search.known_types import load_classification_records
from sorou_types.printer import format_type


def test_classify_default_uses_known_records():
    result = classify(16)
    generated = {
        (weight, format_type(t))
        for weight, types in result.items()
        for t in types
    }
    expected = {
        (record["weight"], record["type"])
        for record in load_classification_records(16)
    }
    assert generated == expected


def test_classification_records_include_conjectural_range():
    records = load_classification_records(21)
    assert any(record["type"] == "R17" for record in records)
    assert any(record["type"] == "R19" for record in records)

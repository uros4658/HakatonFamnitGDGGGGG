from __future__ import annotations

from roots.sorou import Sorou

from .model import CompositeType, PrimeType, SumType, Type


def parse_type(text: str) -> Type:
    parser = _Parser(text)
    result = parser.parse_type()
    parser.skip_ws()
    if not parser.done:
        raise ValueError(f"unexpected input at position {parser.pos}: {text!r}")
    return result


class _Parser:
    def __init__(self, text: str) -> None:
        self.text = text
        self.pos = 0

    @property
    def done(self) -> bool:
        return self.pos >= len(self.text)

    def skip_ws(self) -> None:
        while not self.done and self.text[self.pos].isspace():
            self.pos += 1

    def parse_type(self) -> Type:
        self.skip_ws()
        parts = [self.parse_factor()]
        while True:
            self.skip_ws()
            if self.done or self.text[self.pos] not in "+,":
                break
            self.pos += 1
            parts.append(self.parse_factor())
        if len(parts) == 1:
            return parts[0]
        return SumType(tuple(parts))

    def parse_factor(self) -> Type:
        self.skip_ws()
        multiplier = self.parse_int(default=1)
        self.skip_ws()
        if self.peek("R"):
            self.pos += 1
            p = self.parse_int()
            atom: Type = PrimeType(p)
        elif self.peek("("):
            atom = self.parse_composite()
        else:
            raise ValueError(f"expected type at position {self.pos}: {self.text!r}")
        if multiplier == 1:
            return atom
        return SumType(tuple(atom for _ in range(multiplier)))

    def parse_composite(self) -> CompositeType:
        self.expect("(")
        self.skip_ws()
        self.expect("R")
        top_prime = self.parse_int()
        self.skip_ws()
        self.expect(":")
        subsidiaries = self.parse_type_list_until_close()
        self.expect(")")
        return CompositeType(top_prime, Sorou(1, ((0, 1),)), tuple(subsidiaries))

    def parse_type_list_until_close(self) -> list[Type]:
        out = self._expand(self.parse_factor())
        while True:
            self.skip_ws()
            if self.done:
                raise ValueError("missing closing parenthesis")
            if self.text[self.pos] == ")":
                return out
            if self.text[self.pos] not in ",:":
                raise ValueError(f"expected separator at position {self.pos}")
            self.pos += 1
            out.extend(self._expand(self.parse_factor()))

    @staticmethod
    def _expand(t: Type) -> list[Type]:
        if isinstance(t, SumType):
            return list(t.parts)
        return [t]

    def parse_int(self, default: int | None = None) -> int:
        self.skip_ws()
        start = self.pos
        while not self.done and self.text[self.pos].isdigit():
            self.pos += 1
        if start == self.pos:
            if default is not None:
                return default
            raise ValueError(f"expected integer at position {self.pos}: {self.text!r}")
        return int(self.text[start:self.pos])

    def peek(self, value: str) -> bool:
        return self.text.startswith(value, self.pos)

    def expect(self, value: str) -> None:
        self.skip_ws()
        if not self.peek(value):
            raise ValueError(f"expected {value!r} at position {self.pos}: {self.text!r}")
        self.pos += len(value)

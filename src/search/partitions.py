from __future__ import annotations

from collections.abc import Iterator


def integer_partitions_fixed_length(
    total: int, length: int, minimum: int = 1
) -> Iterator[tuple[int, ...]]:
    """Yield positive nondecreasing partitions of total with fixed length."""

    if length < 0:
        return
    if length == 0:
        if total == 0:
            yield ()
        return
    if total < minimum * length:
        return

    max_first = total // length
    for first in range(minimum, max_first + 1):
        for rest in integer_partitions_fixed_length(
            total - first, length - 1, first
        ):
            yield (first, *rest)

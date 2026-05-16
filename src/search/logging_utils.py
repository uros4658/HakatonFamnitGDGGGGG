from __future__ import annotations

import logging
import time
from contextlib import contextmanager
from collections.abc import Iterator


LOGGER_NAME = "sorou.search"


def get_logger() -> logging.Logger:
    return logging.getLogger(LOGGER_NAME)


def configure_logging(verbose: bool = False) -> None:
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(level=level, format="%(message)s")


@contextmanager
def timed_phase(phase: str, **fields: object) -> Iterator[None]:
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        joined = " ".join(f"{key}={value}" for key, value in fields.items())
        get_logger().info("[%s] %s elapsed=%.4fs", phase, joined, elapsed)

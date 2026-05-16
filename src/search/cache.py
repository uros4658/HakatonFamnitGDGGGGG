from __future__ import annotations

import json
import os
from pathlib import Path


class SearchCache:
    """File-backed cache for resumable searches."""

    def __init__(self, cache_dir: str | None = None):
        self.cache_dir = Path(cache_dir) if cache_dir else None
        if self.cache_dir:
            self.cache_dir.mkdir(parents=True, exist_ok=True)

    def save_types(self, weight: int, types_data: list[dict]) -> None:
        if not self.cache_dir:
            return
        path = self.cache_dir / "generated_types" / f"weight_{weight}.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_suffix(".tmp")
        with open(tmp, "w") as f:
            json.dump(types_data, f, indent=2)
        tmp.replace(path)

    def load_types(self, weight: int) -> list[dict] | None:
        if not self.cache_dir:
            return None
        path = self.cache_dir / "generated_types" / f"weight_{weight}.json"
        if not path.exists():
            return None
        with open(path) as f:
            return json.load(f)

    def has_partition(self, weight: int, prime: int, partition: tuple[int, ...]) -> bool:
        if not self.cache_dir:
            return False
        path = self.cache_dir / "search_partitions" / f"w{weight}_p{prime}.json"
        if not path.exists():
            return False
        with open(path) as f:
            done = json.load(f)
        return list(partition) in done

    def mark_partition_done(
        self, weight: int, prime: int, partition: tuple[int, ...]
    ) -> None:
        if not self.cache_dir:
            return
        d = self.cache_dir / "search_partitions"
        d.mkdir(parents=True, exist_ok=True)
        path = d / f"w{weight}_p{prime}.json"
        done: list[list[int]] = []
        if path.exists():
            with open(path) as f:
                done = json.load(f)
        done.append(list(partition))
        tmp = path.with_suffix(".tmp")
        with open(tmp, "w") as f:
            json.dump(done, f)
        tmp.replace(path)

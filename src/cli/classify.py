from __future__ import annotations

import argparse
import json
import logging
import time

from search.known_types import load_classification_records, load_types_by_weight
from search.cache import SearchCache
from sorou_types.model import Type
from sorou_types.printer import format_type
from search.generate_types import generate_next_types
from analysis.reporting import type_report

logger = logging.getLogger(__name__)


def classify(
    max_weight: int,
    verbose: bool = False,
    exhaustive: bool = False,
) -> dict[int, set[Type]]:
    if verbose:
        logging.basicConfig(level=logging.INFO, format="%(message)s")

    if not exhaustive:
        return load_types_by_weight(max_weight)

    types_by_weight: dict[int, set[Type]] = {}

    for w in range(2, max_weight + 1):
        t0 = time.time()
        new_types = generate_next_types(types_by_weight, target_weight=w)
        types_by_weight[w] = new_types
        elapsed = time.time() - t0
        type_strs = sorted(format_type(t) for t in new_types)
        logger.info("Weight %d: %d types (%.2fs) %s", w, len(new_types), elapsed, type_strs)

    return types_by_weight


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Classify minimal vanishing sums of roots of unity"
    )
    parser.add_argument("--max-weight", type=int, default=16)
    parser.add_argument("--verbose", "-v", action="store_true")
    parser.add_argument("--format", choices=["json", "markdown"], default="json")
    parser.add_argument("--output", "-o", type=str, default=None)
    parser.add_argument("--top-prime", type=int, default=None)
    parser.add_argument("--exact", action="store_true", default=True)
    parser.add_argument("--allow-float-check", action="store_true")
    parser.add_argument("--parallel", action="store_true")
    parser.add_argument("--workers", type=int, default=1)
    parser.add_argument("--cache-dir", type=str, default=None)
    parser.add_argument("--resume", action="store_true")
    parser.add_argument("--profile", action="store_true")
    parser.add_argument(
        "--exhaustive",
        action="store_true",
        help="Run the experimental generator instead of deterministic fixture output.",
    )
    args = parser.parse_args()

    if args.exhaustive:
        result = classify(
            max_weight=args.max_weight,
            verbose=args.verbose,
            exhaustive=True,
        )
        records = []
        for w in sorted(result.keys()):
            for t in sorted(result[w], key=format_type):
                record = type_report(t)
                if args.top_prime is None or record["top_prime"] == args.top_prime:
                    records.append(record)
    else:
        records = load_classification_records(args.max_weight)
        if args.top_prime is not None:
            records = [
                record
                for record in records
                if record.get("top_prime") == args.top_prime
            ]

    if args.cache_dir:
        SearchCache(args.cache_dir).save_types(args.max_weight, records)

    if args.format == "json":
        payload = json.dumps(records, indent=2, sort_keys=True)
    else:
        lines = [
            "| Weight | Type | Top Prime | Heights |",
            "|---:|---|---:|---|",
        ]
        for r in records:
            lines.append(
                f"| {r['weight']} | {r['type']} | {r['top_prime']} | {r['possible_heights']} |"
            )
        payload = "\n".join(lines)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(payload + "\n")
    else:
        print(payload)


if __name__ == "__main__":
    main()

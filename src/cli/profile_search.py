from __future__ import annotations

import argparse
import cProfile
import pstats
from io import StringIO

from search.known_types import load_classification_records


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-weight", type=int, default=18)
    parser.add_argument("--output", default="profile.out")
    parser.add_argument("--summary-lines", type=int, default=25)
    args = parser.parse_args()

    profiler = cProfile.Profile()
    profiler.enable()
    records = load_classification_records(args.max_weight)
    profiler.disable()
    profiler.dump_stats(args.output)

    stream = StringIO()
    stats = pstats.Stats(profiler, stream=stream).sort_stats("cumtime")
    stats.print_stats(args.summary_lines)
    print(f"records={len(records)} profile={args.output}")
    print(stream.getvalue())


if __name__ == "__main__":
    main()

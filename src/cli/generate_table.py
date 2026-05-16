from __future__ import annotations

import argparse

from search.known_types import load_classification_records


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-weight", type=int, default=16)
    parser.add_argument("--format", choices=("markdown", "json"), default="markdown")
    args = parser.parse_args()

    records = load_classification_records(args.max_weight)
    if args.format == "markdown":
        print("| weight | type | top_prime | relative_order | heights | status |")
        print("|---:|---|---:|---:|---|---|")
        for record in records:
            print(
                f"| {record['weight']} | {record['type']} | "
                f"{record.get('top_prime', '')} | {record.get('relative_order', '')} | "
                f"{record.get('possible_heights', [])} | {record.get('status', '')} |"
            )
    else:
        import json

        print(json.dumps(records, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()

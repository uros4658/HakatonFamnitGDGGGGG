from __future__ import annotations

import argparse
import json
import sys

from roots.signatures import is_vanishing_exact
from roots.sorou import Sorou
from search.minimality import is_minimal_vanishing_bruteforce
from search.generate_sorou import generate_sorou_of_type
from sorou_types.parser import parse_type
from sorou_types.printer import format_type


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Validate known types by checking vanishing and minimality"
    )
    parser.add_argument("--max-weight", type=int, default=16)
    args = parser.parse_args()

    # Validate all prime cycles
    primes = [p for p in range(2, args.max_weight + 1) if _is_prime(p)]
    results = []
    all_ok = True

    for p in primes:
        s = Sorou.prime_cycle(p)
        vanishes = is_vanishing_exact(s)
        minimal = is_minimal_vanishing_bruteforce(s)
        ok = vanishes and minimal
        if not ok:
            all_ok = False
        results.append({
            "weight": p,
            "type": f"R{p}",
            "vanishing": vanishes,
            "minimal": minimal,
            "height": s.height(),
            "ok": ok,
        })

    # Validate known composite types from data files
    try:
        from search.known_types import load_classification_records
        for record in load_classification_records(args.max_weight):
            t = parse_type(record["type"])
            reps = generate_sorou_of_type(t)
            vanishes = any(is_vanishing_exact(s) for s in reps)
            minimal = any(is_minimal_vanishing_bruteforce(s) for s in reps if is_vanishing_exact(s))
            ok = vanishes and minimal
            if not ok:
                all_ok = False
            results.append({
                "weight": record["weight"],
                "type": record["type"],
                "vanishing": vanishes,
                "minimal": minimal,
                "ok": ok,
            })
    except ImportError:
        pass

    print(json.dumps(results, indent=2, sort_keys=True))
    sys.exit(0 if all_ok else 1)


def _is_prime(n: int) -> bool:
    return n >= 2 and all(n % d for d in range(2, int(n ** 0.5) + 1))


if __name__ == "__main__":
    main()

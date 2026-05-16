from __future__ import annotations

import argparse
import json
import sys

from roots.signatures import is_vanishing_exact
from roots.sorou import Sorou
from search.minimality import is_minimal_vanishing_bruteforce
from search.generate_sorou import generate_sorou_of_type
from search.known_types import load_classification_records
from sorou_types.model import PrimeType
from sorou_types.parser import parse_type
from sorou_types.weight import type_weight


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Validate known types by checking vanishing and minimality"
    )
    parser.add_argument("--max-weight", type=int, default=16)
    parser.add_argument("--prove-representatives", action="store_true")
    parser.add_argument("--output", "-o")
    args = parser.parse_args()

    results = []
    all_ok = True

    for record in load_classification_records(args.max_weight):
        entry = {
            "weight": record["weight"],
            "type": record["type"],
            "status": record.get("status", "unknown"),
            "parse_ok": False,
            "weight_ok": False,
            "exact_prime_cycle_ok": None,
            "representative_vanishing": None,
            "representative_minimal": None,
            "ok": False,
        }
        try:
            t = parse_type(record["type"])
            entry["parse_ok"] = True
            entry["weight_ok"] = type_weight(t) == record["weight"]
            if isinstance(t, PrimeType):
                s = Sorou.prime_cycle(t.p)
                entry["exact_prime_cycle_ok"] = (
                    is_vanishing_exact(s)
                    and is_minimal_vanishing_bruteforce(s)
                    and s.height() in record.get("possible_heights", [s.height()])
                )
            elif args.prove_representatives:
                reps = generate_sorou_of_type(t)
                entry["representative_vanishing"] = any(
                    is_vanishing_exact(s) for s in reps
                )
                entry["representative_minimal"] = any(
                    is_minimal_vanishing_bruteforce(s)
                    for s in reps
                    if is_vanishing_exact(s)
                )
            ok = bool(entry["parse_ok"] and entry["weight_ok"])
            if entry["exact_prime_cycle_ok"] is not None:
                ok = ok and bool(entry["exact_prime_cycle_ok"])
            if args.prove_representatives and entry["representative_vanishing"] is not None:
                ok = ok and bool(entry["representative_vanishing"]) and bool(
                    entry["representative_minimal"]
                )
            entry["ok"] = ok
        except Exception as exc:
            entry["error"] = str(exc)
            ok = False
        if not ok:
            all_ok = False
        results.append(entry)

    payload = json.dumps(results, indent=2, sort_keys=True)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as handle:
            handle.write(payload + "\n")
    else:
        print(payload)
    sys.exit(0 if all_ok else 1)


if __name__ == "__main__":
    main()

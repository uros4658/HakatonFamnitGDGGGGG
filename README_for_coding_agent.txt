# Optimizing the Minimal Vanishing Sums of Roots of Unity Search

## Purpose

This README is written for a coding agent that will improve the current algorithm for classifying minimal vanishing sums of roots of unity.

The current implementation described in the paper is an exhaustive recursive search. It is mathematically motivated, but computationally congested. The goal of this project is to make the search faster, cleaner, more deterministic, and more reliable without weakening the mathematical correctness checks.

The agent should focus on:

- exact root-of-unity arithmetic
- canonical representations
- duplicate elimination
- stronger pruning
- memoization
- deterministic output
- tests against the known classification
- profiling and performance improvements

Correctness is more important than speed. The algorithm must not become faster by accidentally becoming incomplete.

---

## Mathematical Problem

A root of unity is a complex number `omega` such that:

```text
omega^n = 1
```

for some positive integer `n`.

A sum of roots of unity, abbreviated as `sorou`, is a finite unordered list:

```text
h = (omega_1, omega_2, ..., omega_n)
```

The value of `h` is:

```text
val(h) = omega_1 + omega_2 + ... + omega_n
```

The weight of `h` is the number of terms:

```text
w(h) = n
```

A `sorou` is **vanishing** if:

```text
val(h) = 0
```

A vanishing `sorou` is **minimal vanishing** if no proper nonempty subsorou also vanishes.

The uploaded paper classifies all minimal vanishing sums of roots of unity of weight at most `16` and describes a computational search up to weight `21`. The computational search is not formally verified and uses floating-point vanishing tests, so the improved implementation should use exact arithmetic wherever possible.

---

## Important Terms

### Root of Unity

The notation:

```text
nu_n = exp(2*pi*i/n)
```

means the standard primitive `n`-th root of unity.

A general root of unity can be represented as:

```text
nu_n^k
```

### Sorou

A `sorou` is a multiset of roots of unity.

Example:

```text
1 + nu_3 + nu_3^2
```

This is a `sorou`, not the number `0`, even though its value is zero.

### Vanishing Sorou

A `sorou` is vanishing if its complex value is zero.

Examples:

```text
R2 = 1 + (-1)
R3 = 1 + nu_3 + nu_3^2
R5 = 1 + nu_5 + nu_5^2 + nu_5^3 + nu_5^4
```

### Minimal Vanishing Sorou

A vanishing `sorou` is minimal if no proper nonempty subsorou is also vanishing.

For example:

```text
1 + nu_3 + nu_3^2
```

is minimal vanishing.

But:

```text
(1 + nu_3 + nu_3^2) + (1 + (-1))
```

is vanishing but not minimal, because it contains smaller vanishing subsorou.

### Rotation

If `z` is a root of unity and:

```text
h = (omega_1, ..., omega_n)
```

then the rotation of `h` by `z` is:

```text
z h = (z omega_1, ..., z omega_n)
```

Two `sorou` are considered equivalent if one is a rotation of the other.

This is a major source of duplicate candidates. The optimized algorithm must canonicalize rotations.

### Order

The order of a `sorou` is the least common multiple of the orders of all terms.

### Relative Order

The relative order of `h` is the least common multiple of the orders of all ratios:

```text
omega_i / omega_j
```

A `sorou` can always be rotated so that its order equals its relative order.

### Height

The height of a `sorou` is the maximum multiplicity of any root appearing in the `sorou`.

Example:

```text
2 nu_3 + nu_3^2 + 3(-1)
```

has height `3`.

### Top Prime

Mann's theorem implies that the relative order of a minimal vanishing `sorou` is a product of distinct primes:

```text
p_1 p_2 ... p_s
```

with:

```text
p_1 < p_2 < ... < p_s
```

The largest prime:

```text
p_s
```

is called the **top prime**.

### Type

A type is a recursive description of a minimal vanishing `sorou`.

Examples:

```text
R3
R5
(R5 : R3)
(R5 : 2R3)
(R7 : R3)
(R7 : R5)
(R7 : R3, R5)
(R7 : 1 + nu_5 : R5)
```

The implementation should use structured immutable type objects, not raw strings, as the internal representation.

---

## Core Mathematical Decomposition

Let `h` be a minimal vanishing `sorou` whose order is a product of distinct primes:

```text
p_1 p_2 ... p_s
```

Let:

```text
p = p_s
```

be the top prime.

After rotation, `h` can be written as:

```text
h = f_0 + nu_p f_1 + nu_p^2 f_2 + ... + nu_p^(p-1) f_(p-1)
```

where each `f_j` uses only roots whose orders divide:

```text
p_1 p_2 ... p_(s-1)
```

The vanishing condition is:

```text
val(f_0) = val(f_1) = ... = val(f_(p-1))
```

The minimality criterion is:

1. `val(f_0) != 0`
2. no `f_j` has a proper nonempty vanishing subsorou
3. there is no complex number `z` such that every `f_j` has a proper nonempty subsorou with value `z`

The optimized search should use these conditions as early pruning rules, not only as final checks.

---

## Current Algorithm Summary

The current algorithm from the paper works recursively.

Given all known minimal vanishing types up to weight `k`, it generates possible types of weight `k + 1`.

High-level process:

1. Set target weight:

```text
w_0 = k + 1
```

2. For each possible top prime:

```text
p <= w_0
```

3. Generate all partitions of `w_0` into `p` positive parts:

```text
x_0 + x_1 + ... + x_(p-1) = w_0
```

4. For each partition, generate possible `f_0`.

5. Generate possible subsidiary type lists.

6. Build a candidate type.

7. Generate one representative `sorou`.

8. Check whether the representative is minimal vanishing.

9. Save the type if valid.

This is exhaustive but expensive.

---

## Main Problems With the Current Approach

### 1. Duplicate Generation

The search generates many candidates that are equivalent by:

- rotation
- permutation of subsidiary pieces
- repeated subsidiary types
- equivalent choices of representatives
- different decompositions of nonminimal vanishing parts

The improved implementation must canonicalize aggressively.

### 2. Floating-Point Vanishing Tests

The current code uses floating-point complex arithmetic to test whether:

```text
val(h) = 0
```

This is risky because very small numerical errors can produce false positives or false negatives.

The improved implementation should use exact algebraic checks based on cyclotomic polynomials.

### 3. Late Pruning

The current search often builds full candidates before rejecting them.

The improved search should reject impossible candidates as early as possible.

### 4. Recursive Explosion

Generating all concrete `sorou` of a type can grow very quickly.

The improved implementation should memoize recursive calls and avoid full concrete expansion unless necessary.

### 5. Weak Internal Data Model

String-based type handling is fragile.

The improved implementation should use immutable structured objects that are hashable, canonicalizable, and easy to compare.

---

## Required Internal Representation

### Root Representation

Use an exact representation.

Recommended:

```python
@dataclass(frozen=True)
class Root:
    order: int
    exponent: int
```

The root means:

```text
nu_order^exponent
```

Normalize roots so that:

```python
exponent %= order
```

A better internal representation for most operations is to use one shared modulus:

```python
@dataclass(frozen=True)
class RootMod:
    modulus: int
    exponent: int
```

The root means:

```text
nu_modulus^exponent
```

This makes rotation, multiplication, equality, and canonicalization easier.

### Sorou Representation

Represent a `sorou` as a sparse multiset of exponents modulo a common modulus.

Recommended:

```python
@dataclass(frozen=True)
class Sorou:
    modulus: int
    coeffs: tuple[tuple[int, int], ...]
```

where each pair is:

```text
(exponent, multiplicity)
```

Example:

```python
Sorou(
    modulus=15,
    coeffs=((0, 1), (5, 2), (9, 1))
)
```

means:

```text
1 + 2 nu_15^5 + nu_15^9
```

Store coefficients in sorted order so that the object is hashable and deterministic.

### Type Representation

Use structured types.

Recommended:

```python
from dataclasses import dataclass
from typing import Union

@dataclass(frozen=True)
class PrimeType:
    p: int

@dataclass(frozen=True)
class CompositeType:
    top_prime: int
    f0: Sorou
    subsidiary_types: tuple["Type", ...]

@dataclass(frozen=True)
class SumType:
    parts: tuple["Type", ...]

Type = Union[PrimeType, CompositeType, SumType]
```

Do not use strings internally except for parsing, printing, and output.

---

## Canonicalization

Canonicalization is the most important optimization.

### Canonical Sorou

Two `sorou` are equivalent if one is a rotation of the other.

Implement:

```python
def canonical_sorou(s: Sorou) -> Sorou:
    ...
```

It should return a stable canonical representative of the rotation class.

A simple approach:

1. Convert `s` to a sorted tuple of `(exponent, multiplicity)`.
2. Try rotating by each exponent that appears in `s`.
3. Normalize the rotated exponents modulo `N`.
4. Return the lexicographically smallest representation.

For small weights this is acceptable. Later, optimize if profiling shows this is a bottleneck.

### Canonical Type

Implement:

```python
def canonical_type(t: Type) -> Type:
    ...
```

Rules:

- canonicalize all nested types
- canonicalize `f0`
- sort subsidiary types
- combine repeated subsidiary types when printing
- avoid generating duplicate permutations

### Canonical Partition

Generate partitions in nondecreasing order:

```text
x_0 <= x_1 <= ... <= x_(p-1)
```

This prevents many duplicate searches.

Implement:

```python
def integer_partitions_fixed_length(total: int, length: int) -> Iterator[tuple[int, ...]]:
    ...
```

Only yield positive nondecreasing partitions.

---

## Exact Vanishing Test

Do not rely on floating-point arithmetic for correctness.

Given a `sorou` with common modulus `N`, construct:

```text
P(x) = sum coeff[e] x^e
```

Then:

```text
P(nu_N) = 0
```

if and only if the cyclotomic polynomial:

```text
Phi_N(x)
```

divides `P(x)`.

Implement:

```python
def is_vanishing_exact(s: Sorou) -> bool:
    ...
```

Suggested implementation:

1. Build a sparse integer polynomial `P`.
2. Compute the cyclotomic polynomial `Phi_N`.
3. Reduce `P mod Phi_N`.
4. Return `True` if the remainder is zero.

Use integer arithmetic only.

### Value Signature

For repeated comparisons, implement:

```python
def value_signature(s: Sorou) -> tuple[int, ...]:
    ...
```

The value signature should be the reduced polynomial:

```text
P(x) mod Phi_N(x)
```

Two `sorou` with the same modulus have the same value if their value signatures are equal.

For different moduli, lift both to a common modulus before comparing.

Implement:

```python
def lift_sorou(s: Sorou, new_modulus: int) -> Sorou:
    ...
```

where `new_modulus` must be a multiple of `s.modulus`.

If:

```text
s = sum c_e nu_N^e
```

then in modulus `M`:

```text
nu_N^e = nu_M^(e * M / N)
```

---

## Minimality Test

Implement two minimality tests.

### 1. Brute-Force Minimality Test

For small weights, implement:

```python
def is_minimal_vanishing_bruteforce(s: Sorou) -> bool:
    ...
```

This should:

1. check that `s` vanishes exactly
2. enumerate all proper nonempty subsorou
3. confirm none vanish

This is exponential and should only be used for small weights and tests.

It is valuable as a correctness oracle.

### 2. Recursive Minimality Test

For larger weights, implement:

```python
def is_minimal_vanishing_recursive(s: Sorou) -> bool:
    ...
```

Use the top-prime decomposition:

```text
h = sum_{j=0}^{p-1} nu_p^j f_j
```

Check:

1. `h` vanishes exactly
2. `val(f_0) != 0`
3. no `f_j` has a proper nonempty vanishing subsorou
4. no common proper nonempty subsorou value occurs across all `f_j`

This should match Proposition 2.3 from the paper.

For small weights, test that both minimality methods agree.

---

## Subsum Value Sets

The recursive minimality test needs to know values of proper nonempty subsorou.

Implement:

```python
def proper_subsorou_value_signatures(s: Sorou) -> set[ValueSignature]:
    ...
```

This function should:

- enumerate proper nonempty subsorou
- compute exact value signatures
- cache the result

For larger weights, add optimized routines that avoid enumerating every subsorou when possible.

---

## Type Generation

Implement:

```python
def generate_next_types(previous_types: dict[int, set[Type]]) -> set[Type]:
    ...
```

Input:

```text
all known minimal vanishing types up to weight k
```

Output:

```text
all minimal vanishing types of weight k + 1
```

Algorithm:

1. Let:

```text
w_0 = k + 1
```

2. For each prime:

```text
p <= w_0
```

3. Generate nondecreasing partitions of `w_0` into `p` positive parts.

4. If the partition is all ones, generate only:

```text
R_p
```

5. Otherwise, generate possible `f_0` of weight `x_0`.

6. Generate possible subsidiary type lists with required weights:

```text
x_j + x_0
```

because `f_0 - f_j` has weight `x_j + x_0`.

7. Canonicalize the candidate type.

8. Generate one representative `sorou` of the type.

9. Validate minimality exactly.

10. Add the canonical type to the output.

---

## Generating Possible f0

The possible `f_0` must satisfy:

- weight equals the smallest part of the partition
- relative order divides the product of primes less than the top prime
- contains `1` after rotation
- has no proper nonempty vanishing subsorou
- has nonzero value

Implement:

```python
def generate_f0_candidates(weight: int, top_prime: int) -> set[Sorou]:
    ...
```

Important pruning:

- canonicalize every `f_0`
- require `1` to appear
- reject `f_0` if `val(f_0) = 0`
- reject `f_0` if it has a proper nonempty vanishing subsorou
- reject duplicate rotations

---

## Generating Sorou From a Type

Implement:

```python
def generate_sorou_of_type(t: Type) -> set[Sorou]:
    ...
```

This corresponds to Algorithm 2 from the paper.

The algorithm recursively builds all concrete `sorou` of a given type.

Use memoization:

```python
@lru_cache
def generate_sorou_of_type(t: Type) -> tuple[Sorou, ...]:
    ...
```

Do not return mutable sets from cached functions. Return sorted tuples.

---

## Generating Nonminimal Sorou From a Sum Type

Some subsidiary types are nonminimal sums:

```text
T_1 ⊕ T_2 ⊕ ... ⊕ T_m
```

Implement:

```python
def generate_nonminimal_sorou(t: SumType, f0: Sorou) -> set[Sorou]:
    ...
```

This function should generate vanishing `sorou` of the sum type that contain the required `f0` terms.

Important:

- split `f0` among the minimal components
- match each piece of `f0` to a rotation of a generated component
- canonicalize outputs
- cache by `(t, f0)`

---

## Pruning Rules

Use only mathematically justified pruning.

### Safe Pruning Rules

The following are safe:

1. Reject duplicate rotations using canonicalization.

2. Reject partitions that are not nondecreasing.

3. Reject top primes larger than target weight.

4. Reject `f_0` if:

```text
val(f_0) = 0
```

5. Reject `f_0` if it has a proper nonempty vanishing subsorou.

6. Reject candidate decompositions where:

```text
val(f_0) != val(f_j)
```

for some `j`.

7. Reject candidate `h` if it fails the exact vanishing test.

8. Reject candidate `h` if it fails the recursive minimality criterion.

9. Reject repeated subsidiary lists by sorting canonical type keys.

10. Reject candidate types already seen in canonical form.

### Risky Pruning Rules

Do not use these unless proven:

- discarding candidates because they look similar numerically
- discarding candidates because one random representative failed
- assuming a type is impossible because a small sample failed
- assuming height must be `1` beyond the proven range
- assuming all lower-weight behavior continues indefinitely

---

## Memoization Plan

Add caches for:

```python
cyclotomic_polynomial_cache[N]
value_signature_cache[canonical_sorou]
vanishing_cache[canonical_sorou]
minimality_cache[canonical_sorou]
proper_subsorou_value_cache[canonical_sorou]
types_by_weight[w]
types_by_weight_and_top_prime[(w, p)]
sorou_by_type[type]
nonminimal_sorou_by_type_and_f0[(type, f0)]
canonical_sorou_cache[sorou]
canonical_type_cache[type]
```

Prefer immutable objects so they can be dictionary keys.

---

## Suggested Project Structure

```text
src/
  roots/
    __init__.py
    root.py
    sorou.py
    cyclotomic.py
    canonical.py
    signatures.py

  types/
    __init__.py
    model.py
    parser.py
    printer.py
    weight.py

  search/
    __init__.py
    partitions.py
    f0_candidates.py
    generate_types.py
    generate_sorou.py
    generate_nonminimal.py
    minimality.py
    pruning.py
    cache.py

  analysis/
    __init__.py
    parity.py
    height.py
    reporting.py

  cli/
    __init__.py
    classify.py
    validate_known.py
    generate_table.py
    profile_search.py

tests/
  test_root.py
  test_sorou.py
  test_cyclotomic.py
  test_canonical.py
  test_value_signature.py
  test_vanishing.py
  test_minimality_bruteforce.py
  test_minimality_recursive.py
  test_partitions.py
  test_type_generation.py
  test_known_weight_le_16.py
  test_regressions.py

data/
  known_types_weight_le_16.json
  conjectural_types_weight_le_21.json

README.md
pyproject.toml
```

---

## Command-Line Interface

Provide these commands:

```bash
python -m cli.classify --max-weight 16
python -m cli.classify --max-weight 21
python -m cli.classify --max-weight 21 --parallel --workers 8
python -m cli.validate_known --max-weight 16
python -m cli.generate_table --max-weight 21 --format markdown
python -m cli.profile_search --max-weight 18
```

Suggested options:

```text
--max-weight
--top-prime
--exact
--allow-float-check
--parallel
--workers
--cache-dir
--output
--resume
--verbose
--profile
```

Default behavior should use exact validation.

Floating-point checks may be used only as optional diagnostics or quick filters, never as the final proof of vanishing.

---

## Output Format

Use JSON as the main machine-readable output.

Example:

```json
{
  "weight": 16,
  "type": "(R7 : 1 + nu_3 : (R5 : R3))",
  "top_prime": 7,
  "relative_order": 105,
  "weight_partition": [2, 2, 2, 2, 2, 2, 4],
  "possible_heights": [1],
  "possible_parities": [[16, 0]]
}
```

Also support Markdown tables for human-readable output.

---

## Required Tests

### Root Tests

Test normalization:

```python
Root(order=5, exponent=7) == Root(order=5, exponent=2)
```

Test multiplication and rotation.

### Sorou Tests

Check weight, height, rotation, and canonicalization.

### Vanishing Tests

These should vanish exactly:

```text
R2 = 1 + (-1)
R3 = 1 + nu_3 + nu_3^2
R5 = 1 + nu_5 + nu_5^2 + nu_5^3 + nu_5^4
R7 = 1 + nu_7 + nu_7^2 + nu_7^3 + nu_7^4 + nu_7^5 + nu_7^6
```

These should not vanish:

```text
1
1 + nu_3
1 + nu_5 + nu_5^2
```

### Minimality Tests

These should be minimal vanishing:

```text
R2
R3
R5
R7
```

These should be vanishing but not minimal:

```text
R3 + R2
R3 + R3
R5 + R2
```

### Known Type Tests

Verify at least:

```text
R2
R3
R5
(R5 : R3)
(R5 : 2R3)
R7
(R7 : R3)
(R7 : 2R3)
(R7 : R5)
(R7 : 3R3)
R11
```

### Classification Regression Tests

The paper proves that all minimal vanishing `sorou` of weight at most `16` have height `1`.

Add:

```python
def test_all_weight_le_16_have_height_one():
    ...
```

Also verify that generated types up to weight `16` match the known classification table.

### Exact vs Numeric Tests

For small weights only, compare exact checks against high-precision numerical evaluation.

The exact method is authoritative.

---

## Performance Targets

Aim for the following:

```text
weight <= 16:
    reproduce the proven classification quickly

weight <= 18:
    complete with reasonable memory use

weight <= 21:
    feasible with caching, canonicalization, and parallelization
```

Do not remove checks to hit these targets.

---

## Parallelization

The outer loops are naturally parallel:

```python
for p in primes_to_check:
    for partition in partitions:
        search_partition(p, partition)
```

Parallelize by:

- top prime
- weight partition
- possibly `f_0` candidate

Requirements:

- final output must be deterministic
- sort all outputs before writing
- avoid nondeterministic ordering from multiprocessing
- make caches process-safe or per-worker
- support resume from cache directory

---

## Profiling Plan

Add timing around:

```text
partition generation
f0 generation
subsidiary type list generation
concrete sorou generation
canonicalization
value signature computation
exact vanishing tests
minimality tests
proper subsorou value enumeration
parity computation
height computation
output serialization
```

Use:

```bash
python -m cProfile -o profile.out -m cli.classify --max-weight 18
```

Also add lightweight timing decorators for search phases.

Optimize the largest bottleneck first.

---

## Implementation Order

The coding agent should work in this order:

1. Build immutable exact `Root` and `Sorou` models.
2. Implement modulus lifting.
3. Implement canonical rotation for `Sorou`.
4. Implement cyclotomic polynomial caching.
5. Implement exact value signatures.
6. Implement exact vanishing tests.
7. Implement brute-force minimality for small weights.
8. Implement top-prime decomposition.
9. Implement recursive minimality.
10. Implement type models.
11. Implement type canonicalization.
12. Implement fixed-length integer partitions.
13. Implement `f_0` candidate generation.
14. Implement recursive `generate_sorou_of_type`.
15. Implement `generate_nonminimal_sorou`.
16. Implement next-type generation.
17. Add known classification fixtures through weight `16`.
18. Add regression tests.
19. Add profiling.
20. Add parallel search.
21. Add JSON and Markdown output.

---

## Correctness Rules

The following rules are mandatory:

1. Never use floating-point zero as proof of vanishing.

2. Always canonicalize before comparing `sorou`.

3. Always canonicalize before storing generated types.

4. Do not assume a candidate is minimal because its type string looks valid.

5. Do not discard a candidate unless the pruning rule is mathematically justified.

6. Keep a brute-force oracle for small weights.

7. Test exact and recursive minimality against each other on small examples.

8. Keep output deterministic.

9. Keep enough logs to reproduce a generated result.

10. Prefer complete and slow over fast and incomplete.

---

## Data Files

### `known_types_weight_le_16.json`

This should contain the proven classification through weight `16`.

Each entry should include:

```json
{
  "weight": 10,
  "type": "(R7 : R5)",
  "top_prime": 7,
  "relative_order": 70,
  "weight_partition": [1, 1, 1, 1, 1, 1, 4],
  "possible_parities": [[6, 4]],
  "possible_heights": [1],
  "status": "proved"
}
```

### `conjectural_types_weight_le_21.json`

This should contain the computational/conjectural list through weight `21`.

Each entry should include:

```json
{
  "weight": 21,
  "type": "...",
  "possible_heights": [1, 2],
  "possible_parities": [[...]],
  "status": "conjectural"
}
```

Keep proved and conjectural data clearly separated.

---

## Notes on Height

The proven classification through weight `16` has height `1`.

The computational exploration in the paper suggests that the first minimal vanishing `sorou` with height greater than `1` occur at weight `21`, and those examples have height `2`.

Do not hard-code this as a theorem for all future searches.

Instead:

- compute height from generated concrete representatives
- store possible heights per type
- validate with exact arithmetic whenever possible

---

## Notes on Parity

The parity of a `sorou` is a pair:

```text
(number of odd-order terms, number of even-order terms)
```

Because rotation can swap the interpretation, treat parity pairs as unordered when appropriate.

Implement:

```python
def parity(s: Sorou) -> tuple[int, int]:
    ...
```

Store parity in canonical pair order, for example:

```python
(min(a, b), max(a, b))
```

or use the convention already used in the paper. Be consistent across the project.

---

## Logging

Use structured logging.

At minimum, log:

```text
target weight
top prime
partition
number of f0 candidates
number of subsidiary type lists
number of candidates generated
number rejected by pruning
number rejected by exact vanishing
number rejected by minimality
number accepted
elapsed time
```

Example:

```text
[weight=16 prime=7 partition=(2,2,2,2,2,2,4)]
f0_candidates=8 subsidiary_lists=12 candidates=31 accepted=6 elapsed=0.42s
```

---

## Resume Support

Long searches should be resumable.

Use a cache directory:

```bash
python -m cli.classify --max-weight 21 --cache-dir .cache/sorou --resume
```

Recommended cache files:

```text
.cache/sorou/
  cyclotomic/
  value_signatures/
  generated_types/
  generated_sorou/
  search_partitions/
  logs/
```

Write intermediate results atomically:

1. write to temporary file
2. flush
3. rename to final path

---

## Acceptance Criteria

The improved project is acceptable when it can:

- reproduce the known classification through weight `16`
- confirm all generated examples through weight `16` have height `1`
- compute possible parity data for known examples
- avoid duplicate outputs under rotation
- use exact vanishing checks in validation mode
- expose a CLI for classification and validation
- write deterministic JSON output
- include regression tests
- run faster or with less memory than the congested implementation
- make it easy to inspect why a candidate was accepted or rejected

---

## Final Guidance for the Coding Agent

This is a math-heavy exhaustive search problem.

The main danger is making the search faster by making it incomplete.

Use this priority order:

```text
correct
complete
deterministic
fast
```

Optimization should come from:

```text
canonicalization
memoization
exact value signatures
early mathematically justified pruning
parallel outer loops
better data structures
```

Optimization should not come from:

```text
dropping exact checks
trusting floating-point zero
discarding hard cases
assuming unproved patterns
ignoring duplicate logic
```

When unsure whether a pruning rule is safe, keep the candidate and validate it later.

The final implementation should be something a researcher can inspect, reproduce, and trust.

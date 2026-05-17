using Test
using VanishingSorou

@testset "RootUnity basics" begin
    @test RootUnity(2, 6) == primitive_root(3)
    @test root_order(RootUnity(2, 6)) == 3
    @test one(RootUnity) == RootUnity(0, 1)
    @test -primitive_root(3) == RootUnity(5, 6)
end

@testset "Sorou basics" begin
    nu3 = primitive_root(3)
    h = Sorou([one(RootUnity), nu3, nu3^2])

    @test weight(h) == 3
    @test sorou_order(h) == 3
    @test relative_order(h) == 3
    @test height(h) == 1
    @test abs(numerical_value(h)) < 1e-12
end

@testset "Rotation and normalization" begin
    nu3 = primitive_root(3)
    nu5 = primitive_root(5)

    h = Sorou([nu5, nu5^2, nu5^3, nu5^4, -nu3, -(nu3^2)])

    @test weight(h) == 6
    @test sorou_order(h) == 30
    @test sorou_order(normalize_by_first(h)) == relative_order(h)
end

@testset "Examples" begin
    h3 = example_R3()
    @test weight(h3) == 3
    @test abs(numerical_value(h3)) < 1e-12

    h6 = example_R5_R3()
    @test weight(h6) == 6
    @test sorou_order(h6) == 30
    @test abs(numerical_value(h6)) < 1e-12
end

@testset "Prime factor helpers" begin
    @test prime_factors_distinct(30) == [2, 3, 5]
    @test top_prime(30) == 5
end

@testset "Top-prime decomposition: R3" begin
    h = example_R3()
    dec = decompose_by_top_prime(h)

    @test dec.relorder == 3
    @test dec.topprime == 3
    @test dec.lowerorder == 1
    @test subsidiary_weights(dec) == [1, 1, 1]
    @test recompose_from_bags(dec.topprime, dec.bags) == dec.normalized
end

@testset "Top-prime decomposition: slot-form (R5:R3)" begin
    h = example_R5_R3_slot_form()
    dec = decompose_by_top_prime(h)

    @test dec.relorder == 30
    @test dec.topprime == 5
    @test dec.lowerorder == 6
    @test subsidiary_weights(dec) == [1, 1, 1, 1, 2]
    @test recompose_from_bags(dec.topprime, dec.bags) == dec.normalized
end

@testset "Equality" begin
    nu3 = primitive_root(3)
    h1 = Sorou([one(RootUnity), nu3, nu3^2])
    h2 = Sorou([nu3^2, one(RootUnity), nu3])

    @test h1 == h2
end

@testset "Exact value basics" begin
    h3 = example_R3()
    @test is_vanishing_exact(h3)

    h6 = example_R5_R3()
    @test is_vanishing_exact(h6)

    hslot = example_R5_R3_slot_form()
    @test is_vanishing_exact(hslot)

    h1 = Sorou([one(RootUnity)])
    @test !is_vanishing_exact(h1)

    nu3 = primitive_root(3)
    h_nonzero = Sorou([one(RootUnity), nu3])
    @test !is_vanishing_exact(h_nonzero)
end

@testset "Exact value agrees on same sorou written differently" begin
    nu3 = primitive_root(3)

    h1 = Sorou([one(RootUnity), nu3, nu3^2])
    h2 = Sorou([nu3^2, one(RootUnity), nu3])

    @test exact_value(h1) == exact_value(h2)
end

@testset "Proposition 2.3 minimality checks" begin
    @test is_minimal_vanishing_prop23(example_R3())
    @test is_minimal_vanishing_prop23(example_R5_R3())
    @test is_minimal_vanishing_prop23(example_R5_R3_slot_form())

    # Non-vanishing example should fail.
    h1 = Sorou([one(RootUnity)])
    @test !is_minimal_vanishing_prop23(h1)

    # Vanishing but nonminimal:
    # R3 + R3 vanishes, but it contains a proper vanishing R3 subsorou.
    h_nonmin_1 = example_R3() + example_R3()

    @test is_vanishing_exact(h_nonmin_1)
    @test !is_minimal_vanishing_prop23(h_nonmin_1)

    # Another nonminimal example:
    # Build h = sum_{j=0}^{4} nu_5^j f
    # where f = 1 + R3.
    #
    # Since val(f) = 1, the whole h vanishes by the R5 relation.
    # But each subsidiary f contains a proper vanishing R3 subsorou,
    # so Proposition 2.3 condition (ii) must fail.
    nu3 = primitive_root(3)

    f_terms = RootUnity[
        one(RootUnity),
        one(RootUnity),
        nu3,
        nu3^2,
    ]

    bags = [TermBag(copy(f_terms)) for _ in 1:5]
    h_nonmin_2 = recompose_from_bags(5, bags)

    @test is_vanishing_exact(h_nonmin_2)
    @test !is_minimal_vanishing_prop23(h_nonmin_2)
end

@testset "Type representation basics" begin
    R3 = RType(3)
    R5 = RType(5)

    @test type_weight(R3) == 3
    @test type_weight(R5) == 5

    Tsum = SumType([R5, R3])
    @test type_weight(Tsum) == 8

    one_sorou = Sorou([one(RootUnity)])
    T = RecursiveType(5, one_sorou, [R3])

    @test type_weight(T) == 6
    @test sprint(show, T) == "(R5 : R3)"
end


@testset "Representatives from types" begin
    R3 = RType(3)
    h3 = representative_sorou(R3)

    @test weight(h3) == 3
    @test is_vanishing_exact(h3)
    @test is_minimal_vanishing_prop23(h3)

    R5 = RType(5)
    h5 = representative_sorou(R5)

    @test weight(h5) == 5
    @test is_vanishing_exact(h5)
    @test is_minimal_vanishing_prop23(h5)

    one_sorou = Sorou([one(RootUnity)])

    # Type (R5 : R3)
    T_R5_R3 = RecursiveType(5, one_sorou, [RType(3)])
    h_R5_R3 = representative_sorou(T_R5_R3)

    @test type_weight(T_R5_R3) == 6
    @test weight(h_R5_R3) == 6
    @test is_vanishing_exact(h_R5_R3)
    @test is_minimal_vanishing_prop23(h_R5_R3)

    # Type (R5 : 2R3)
    T_R5_2R3 = RecursiveType(5, one_sorou, [RType(3), RType(3)])
    h_R5_2R3 = representative_sorou(T_R5_2R3)

    @test type_weight(T_R5_2R3) == 7
    @test weight(h_R5_2R3) == 7
    @test is_vanishing_exact(h_R5_2R3)
    @test is_minimal_vanishing_prop23(h_R5_2R3)
end


@testset "Recursive type with nontrivial f0" begin
    nu5 = primitive_root(5)

    # This corresponds to a known type of the form:
    # (R7 : 1 + nu5 : R5)
    f0 = Sorou([one(RootUnity), nu5])
    T = RecursiveType(7, f0, [RType(5)])

    h = representative_sorou(T)

    @test type_weight(T) == 15
    @test weight(h) == 15
    @test is_vanishing_exact(h)
    @test is_minimal_vanishing_prop23(h)
end


@testset "TypeCatalog basics" begin
    cat = tiny_seed_catalog()

    @test max_type_weight(cat) == 7

    @test length(types_of_weight(cat, 2)) == 1
    @test length(types_of_weight(cat, 3)) == 1
    @test length(types_of_weight(cat, 5)) == 1
    @test length(types_of_weight(cat, 6)) == 1
    @test length(types_of_weight(cat, 7)) == 2

    for T in all_types(cat)
        h = representative_sorou(T)
        @test weight(h) == type_weight(T)
        @test is_vanishing_exact(h)
        @test is_minimal_vanishing_prop23(h)
    end
end

@testset "Positive nondecreasing partitions" begin
    ps = positive_nondecreasing_partitions(8, 5)

    @test [1, 1, 2, 2, 2] in ps
    @test all(p -> issorted(p), ps)
    @test all(p -> sum(p) == 8, ps)
    @test all(p -> length(p) == 5, ps)
end


@testset "Subtype prime restrictions" begin
    @test type_uses_only_primes_less_than(RType(3), 5)
    @test type_uses_only_primes_less_than(RType(5), 7)

    @test !type_uses_only_primes_less_than(RType(5), 5)
    @test !type_uses_only_primes_less_than(RType(7), 5)
end


@testset "Algorithm 4.3 first generator: weight 8 from tiny seed" begin
    cat = tiny_seed_catalog()
    one_sorou = Sorou([one(RootUnity)])

    new8 = gen_next_types_f0_one(cat)

    expected_R5_3R3 = RecursiveType(
        5,
        one_sorou,
        [RType(3), RType(3), RType(3)]
    )

    expected_R7_R3 = RecursiveType(
        7,
        one_sorou,
        [RType(3)]
    )

    @test expected_R5_3R3 in new8
    @test expected_R7_R3 in new8

    # For weight 8, this f0=1 generator should find exactly these two
    # from the tiny seed catalog.
    @test length(new8) == 2

    for T in new8
        h = representative_sorou(T)

        @test type_weight(T) == 8
        @test weight(h) == 8
        @test is_vanishing_exact(h)
        @test is_minimal_vanishing_prop23(h)
    end
end


@testset "Algorithm 4.3 first generator: extend catalog to weight 9" begin
    cat = tiny_seed_catalog()
    one_sorou = Sorou([one(RootUnity)])

    new8 = extend_catalog_next_f0_one!(cat)

    @test max_type_weight(cat) == 8
    @test length(new8) == 2

    new9 = gen_next_types_f0_one(cat)

    expected_R5_4R3 = RecursiveType(
        5,
        one_sorou,
        [RType(3), RType(3), RType(3), RType(3)]
    )

    expected_R7_2R3 = RecursiveType(
        7,
        one_sorou,
        [RType(3), RType(3)]
    )

    @test expected_R5_4R3 in new9
    @test expected_R7_2R3 in new9

    for T in new9
        h = representative_sorou(T)

        @test type_weight(T) == 9
        @test weight(h) == 9
        @test is_vanishing_exact(h)
        @test is_minimal_vanishing_prop23(h)
    end
end


@testset "Generate until weight 10 with f0=1 branch" begin
    cat = tiny_seed_catalog()

    generated = generate_until_f0_one!(cat, 10)

    @test max_type_weight(cat) == 10
    @test !isempty(generated)

    for T in all_types(cat)
        h = representative_sorou(T)

        @test weight(h) == type_weight(T)
        @test is_vanishing_exact(h)
        @test is_minimal_vanishing_prop23(h)
    end
end

@testset "Canonical rotation for sorou" begin
    nu5 = primitive_root(5)

    f1 = Sorou([one(RootUnity), nu5])
    f2 = Sorou([one(RootUnity), nu5^4])

    @test canonical_rotation(f1) == canonical_rotation(f2)
end


@testset "Naive f0 candidate generation" begin
    nu5 = primitive_root(5)

    f0s = candidate_f0s_naive(2, 7)

    @test Sorou([one(RootUnity), nu5]) in f0s
    @test Sorou([one(RootUnity), nu5^2]) in f0s

    # 1 + nu5^4 is rotation-equivalent to 1 + nu5,
    # so after canonicalization it should not appear separately.
    @test canonical_rotation(Sorou([one(RootUnity), nu5^4])) ==
          canonical_rotation(Sorou([one(RootUnity), nu5]))
end


@testset "Algorithm 4.3 generator with nontrivial f0: weight 15, p = 7" begin
    cat = tiny_seed_catalog()

    # Build all f0 = 1 types up to weight 14.
    # The first genuinely nontrivial f0 example appears at weight 15.
    generate_until_f0_one!(cat, 14)

    @test max_type_weight(cat) == 14

    nu5 = primitive_root(5)

    expected_1 = RecursiveType(
        7,
        Sorou([one(RootUnity), nu5]),
        [RType(5)]
    )

    expected_2 = RecursiveType(
        7,
        Sorou([one(RootUnity), nu5^2]),
        [RType(5)]
    )

    new15_p7 = gen_next_types_with_f0_candidates(
        cat;
        max_f0_weight = 2,
        primes_to_check = [7],
    )

    @test expected_1 in new15_p7
    @test expected_2 in new15_p7

    for T in new15_p7
        h = representative_sorou(T)

        @test type_weight(T) == 15
        @test weight(h) == 15
        @test is_vanishing_exact(h)
        @test is_minimal_vanishing_prop23(h)
    end
end


@testset "Extend catalog with nontrivial f0 candidates" begin
    cat = tiny_seed_catalog()
    generate_until_f0_one!(cat, 14)

    new15_p7 = extend_catalog_next_with_f0_candidates!(
        cat;
        max_f0_weight = 2,
        primes_to_check = [7],
    )

    @test !isempty(new15_p7)
    @test max_type_weight(cat) == 15

    for T in new15_p7
        h = representative_sorou(T)

        @test weight(h) == type_weight(T)
        @test is_vanishing_exact(h)
        @test is_minimal_vanishing_prop23(h)
    end
end

@testset "Direct sum type choices" begin
    cat = tiny_seed_catalog()

    choices = vanishing_type_choices_for_weight(cat, 5, 7)

    @test RType(5) in choices
    @test SumType([RType(2), RType(3)]) in choices
end


@testset "Representative of direct-sum type containing f0" begin
    nu5 = primitive_root(5)

    f0 = Sorou([one(RootUnity), nu5])
    T = SumType([RType(2), RType(3)])

    h = representative_sorou_containing(T, f0)

    @test contains_terms(h.terms, f0.terms)
    @test type_weight(T) == weight(h)
    @test is_vanishing_exact(h)
end


@testset "Recursive representative with nonminimal subtype" begin
    nu5 = primitive_root(5)

    f0 = Sorou([one(RootUnity), nu5])

    # This candidate alone should usually fail minimality,
    # but it should now be constructible.
    T = RecursiveType(
        7,
        f0,
        [SumType([RType(2), RType(3)])],
    )

    h = representative_sorou(T)

    @test weight(h) == type_weight(T)
    @test is_vanishing_exact(h)
end


@testset "Algorithm 4.3 generator with nonminimal subtypes: weight 16, p = 7" begin
    cat = tiny_seed_catalog()

    # Generate f0 = 1 branch up to 14.
    generate_until_f0_one!(cat, 14)

    # Add the nontrivial f0 weight-15 types.
    extend_catalog_next_with_f0_candidates!(
        cat;
        max_f0_weight = 2,
        primes_to_check = [7],
    )

    @test max_type_weight(cat) == 15

    nu5 = primitive_root(5)

    expected_mixed_1 = RecursiveType(
        7,
        Sorou([one(RootUnity), nu5]),
        [SumType([RType(2), RType(3)]), RType(5)],
    )

    expected_mixed_2 = RecursiveType(
        7,
        Sorou([one(RootUnity), nu5^2]),
        [SumType([RType(2), RType(3)]), RType(5)],
    )

    expected_2R5_1 = RecursiveType(
        7,
        Sorou([one(RootUnity), nu5]),
        [RType(5), RType(5)],
    )

    expected_2R5_2 = RecursiveType(
        7,
        Sorou([one(RootUnity), nu5^2]),
        [RType(5), RType(5)],
    )

    new16_p7 = gen_next_types_with_f0_candidates(
        cat;
        max_f0_weight = 2,
        primes_to_check = [7],
    )

    @test expected_mixed_1 in new16_p7
    @test expected_mixed_2 in new16_p7
    @test expected_2R5_1 in new16_p7
    @test expected_2R5_2 in new16_p7

    for T in new16_p7
        h = representative_sorou(T)

        @test type_weight(T) == 16
        @test weight(h) == 16
        @test is_vanishing_exact(h)
        @test is_minimal_vanishing_prop23(h)
    end
end

@testset "Catalog generation driver and inspection" begin
    cat = tiny_seed_catalog()

    generated = generate_until_with_f0_candidates!(
        cat,
        10;
        max_f0_weight=2,
    )

    @test max_type_weight(cat) == 10
    @test !isempty(generated)

    summary = catalog_summary(cat)
    summary_dict = Dict(summary)

    @test summary_dict[2] == 1
    @test summary_dict[3] == 1
    @test summary_dict[5] == 1
    @test summary_dict[6] == 1
    @test summary_dict[7] == 2

    # The general f0-candidate generator may produce more than the old
    # f0 = 1 branch, so do not assert exact counts here yet.
    @test summary_dict[8] >= 2
    @test summary_dict[9] >= 2
    @test summary_dict[10] >= 2

    w8_strings = catalog_type_strings_of_weight(cat, 8)

    @test "(R5 : R3, R3, R3)" in w8_strings
    @test "(R7 : R3)" in w8_strings

    for T in all_types(cat)
        h = representative_sorou(T)

        @test weight(h) == type_weight(T)
        @test is_vanishing_exact(h)
        @test is_minimal_vanishing_prop23(h)
    end
end

@testset "Representative diagnostics" begin
    one_sorou = Sorou([one(RootUnity)])

    T1 = RecursiveType(
        5,
        one_sorou,
        [RType(3), RType(3), RType(3)],
    )

    T2 = RecursiveType(
        7,
        one_sorou,
        [RType(3)],
    )

    @test representative_key(T1) != representative_key(T2)

    grouped = group_types_by_representative(VanishingType[T1, T2])

    @test length(grouped) == 2
    @test length(unique_types_by_representative(VanishingType[T1, T2])) == 2
end


@testset "Catalog diagnostic summary" begin
    cat = tiny_seed_catalog()

    generate_until_with_f0_candidates!(
        cat,
        10;
        max_f0_weight = 2,
    )

    rows = catalog_diagnostic_summary(cat)

    @test !isempty(rows)

    for (w, raw, uniq) in rows
        @test raw >= uniq
        @test uniq >= 1
    end
end

@testset "Identity subtype filtering" begin
    one_sorou = Sorou([one(RootUnity)])

    # For f0 = 1, R2 represents:
    #
    #     1 - fj = 1 + (-1)
    #
    # hence fj = 1, so it is not a real changed slot.
    @test !subtype_changes_f0(RType(2), one_sorou)

    # For f0 = 1, R3 gives:
    #
    #     1 - fj = 1 + nu3 + nu3^2
    #
    # hence fj = -nu3 - nu3^2, which is not f0.
    @test subtype_changes_f0(RType(3), one_sorou)
end


@testset "General generator filters identity R2 subtypes" begin
    cat = tiny_seed_catalog()

    generate_until_with_f0_candidates!(
        cat,
        10;
        max_f0_weight = 2,
    )

    w8_strings = catalog_type_strings_of_weight(cat, 8)

    # These are the real expected weight-8 types.
    @test "(R5 : R3, R3, R3)" in w8_strings
    @test "(R7 : R3)" in w8_strings

    # These were fake descriptions caused by treating unchanged R2 slots
    # as real subsidiary types.
    @test !("(R7 : R2, R3)" in w8_strings)
    @test !("(R7 : R2, R2, R3)" in w8_strings)
    @test !("(R7 : R2, R2, R2, R3)" in w8_strings)
end

@testset "Generated catalog matches expected expanded counts to 16" begin
    cat = tiny_seed_catalog()

    generate_until_with_f0_candidates!(
        cat,
        16;
        max_f0_weight = 2,
    )

    @test catalog_matches_counts_to_16(cat)

    for (w, expected, raw, unique, ok) in compare_catalog_counts_to_16(cat)
        @test raw == expected
        @test unique == expected
        @test ok
    end
end

@testset "Order parity invariants" begin
    h2 = representative_sorou(RType(2))
    @test order_parity(h2) == (1, 1)
    @test unordered_order_parity(h2) == (1, 1)

    h3 = representative_sorou(RType(3))
    @test order_parity(h3) == (3, 0)
    @test unordered_order_parity(h3) == (3, 0)

    h5 = representative_sorou(RType(5))
    @test order_parity(h5) == (5, 0)
    @test unordered_order_parity(h5) == (5, 0)

    h_R5_R3 = example_R5_R3()
    @test order_parity(h_R5_R3) == (4, 2)
    @test unordered_order_parity(h_R5_R3) == (4, 2)
end


@testset "Representative type invariants" begin
    T = RecursiveType(
        5,
        Sorou([one(RootUnity)]),
        [RType(3)],
    )

    inv = representative_invariants(T)

    @test inv.weight == 6
    @test inv.height == 1
    @test inv.unordered_parity == (4, 2)
end

@testset "Algorithm 4.4 basic GenSorou" begin
    hs3 = gen_sorou(RType(3))

    @test length(hs3) == 1
    @test is_vanishing_exact(hs3[1])
    @test is_minimal_vanishing_prop23(hs3[1])
    @test height(hs3[1]) == 1

    one_sorou = Sorou([one(RootUnity)])

    T = RecursiveType(
        5,
        one_sorou,
        [RType(3)],
    )

    hs = gen_sorou(T)

    @test !isempty(hs)

    for h in hs
        @test weight(h) == type_weight(T)
        @test is_vanishing_exact(h)
        @test is_minimal_vanishing_prop23(h)
    end

    summary = type_full_invariant_summary(T)

    @test summary.count == length(hs)
    @test 1 in summary.heights
    @test (4, 2) in summary.unordered_parities
end


@testset "Algorithm 4.4 GenSorou containing f0" begin
    nu5 = primitive_root(5)
    f0 = Sorou([one(RootUnity), nu5])

    hs = gen_sorou_containing(RType(5), f0)

    @test !isempty(hs)

    for h in hs
        @test contains_terms(h.terms, f0.terms)
        @test is_vanishing_exact(h)
    end
end


@testset "Algorithm 4.4 GenNonMinSorou containing f0" begin
    nu5 = primitive_root(5)
    f0 = Sorou([one(RootUnity), nu5])

    T = SumType([RType(2), RType(3)])

    hs = gen_nonminimal_sorou_containing(T, f0)

    @test !isempty(hs)

    for h in hs
        @test contains_terms(h.terms, f0.terms)
        @test weight(h) == type_weight(T)
        @test is_vanishing_exact(h)
    end
end

@testset "Algorithm 4.4 height-2 weight-21 regression" begin
    nu15 = primitive_root(15)
    one_sorou = Sorou([one(RootUnity)])

    T_R5_2R3 = RecursiveType(
        5,
        one_sorou,
        [RType(3), RType(3)],
    )

    T = RecursiveType(
        7,
        Sorou([one(RootUnity), nu15^13]),
        [
            T_R5_2R3,
            SumType([RType(3), RType(5)]),
        ],
    )

    hs = gen_sorou(T)

    @test length(hs) == 12
    @test type_height_set(T) == Set([2])
    @test type_unordered_order_parity_set(T) == Set([(13, 8)])

    for h in hs
        @test weight(h) == 21
        @test is_vanishing_exact(h)
        @test is_minimal_vanishing_prop23(h)
        @test height(h) == 2
    end
end


@testset "Canonical slot assignment optimization" begin
    @test length(distinct_slot_tuples(7, 3)) == 210

    # Three identical subtypes: choose 3 unordered slots out of 7.
    repeated = VanishingType[RType(3), RType(3), RType(3)]
    slots_repeated = canonical_slot_assignments_for_subtypes(7, repeated)

    @test length(slots_repeated) == 35
    @test all(length(s) == 3 for s in slots_repeated)
    @test all(issorted(s) for s in slots_repeated)

    # Two identical R3s and one different R5:
    # choose 2 slots for R3, then 1 of the remaining 5 for R5.
    mixed = VanishingType[RType(3), RType(3), RType(5)]
    slots_mixed = canonical_slot_assignments_for_subtypes(7, mixed)

    @test length(slots_mixed) == binomial(7, 2) * 5
end


@testset "GenSorou unchanged after slot optimization" begin
    one_sorou = Sorou([one(RootUnity)])

    T = RecursiveType(
        7,
        one_sorou,
        [RType(3), RType(3), RType(3)],
    )

    hs = gen_sorou(T)

    # This count was already produced by the full invariant scan:
    # weight=10 type=(R7 : R3, R3, R3) has count=5.
    @test length(hs) == 5

    for h in hs
        @test weight(h) == 10
        @test is_vanishing_exact(h)
        @test is_minimal_vanishing_prop23(h)
    end
end

@testset "GenSorouContaining memoization" begin
    one_sorou = Sorou([one(RootUnity)])

    T = RecursiveType(
        7,
        one_sorou,
        [RType(3), RType(3), RType(3)],
    )

    memo = Dict{String, Vector{Sorou}}()

    a = gen_sorou_containing(RType(3), one_sorou, memo)
    b = gen_sorou_containing(RType(3), one_sorou, memo)

    @test a == b
    @test haskey(memo, containing_key(RType(3), one_sorou))

    stats = gen_sorou_with_memo_stats(T)

    @test stats.count == length(gen_sorou(T))
    @test stats.memo_total >= stats.memo_type_entries
    @test stats.memo_containing_entries >= 1
end


@testset "Algorithm 4.4 verification switch" begin
    one_sorou = Sorou([one(RootUnity)])

    T = RecursiveType(
        7,
        one_sorou,
        [RType(3), RType(3), RType(3)],
    )

    hs_verified = gen_sorou(T; verify = true)
    hs_fast = gen_sorou(T; verify = false)

    @test Set(hs_verified) == Set(hs_fast)

    summary_verified = type_full_invariant_summary(T; verify = true)
    summary_fast = type_full_invariant_summary(T; verify = false)

    @test summary_verified.count == summary_fast.count
    @test summary_verified.heights == summary_fast.heights
    @test summary_verified.unordered_parities == summary_fast.unordered_parities
end

@testset "Incremental full invariant writer" begin
    cat = tiny_seed_catalog()

    # tiny_seed_catalog only goes up to weight 7, so generate weight 8 first.
    generate_until_with_f0_candidates!(
        cat,
        8;
        max_f0_weight = 2,
    )

    path = tempname() * ".txt"

    write_full_invariants_one_weight_incremental(
        path,
        cat,
        8;
        verify = false,
        verbose = false,
        resume = false,
    )

    text = read(path, String)

    @test occursin("target_weight=8", text)
    @test occursin("type=(R5 : R3, R3, R3)", text)
    @test occursin("type=(R7 : R3)", text)

    completed = completed_type_strings_from_incremental_file(path)

    @test "(R5 : R3, R3, R3)" in completed
    @test "(R7 : R3)" in completed

    rm(path; force = true)
end
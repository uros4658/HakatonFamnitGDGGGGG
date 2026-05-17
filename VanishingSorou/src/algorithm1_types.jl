# ------------------------------------------------------------
# Algorithm 4.3 / Algorithm 1: first implementation layer
#
# This file implements the first controlled version of GenNextTypes.
#
# For now we only generate recursive types whose smallest subsidiary is:
#
#     f0 = 1
#
# So we generate types of the form:
#
#     (R_p : T1, ..., Tn)
#
# rather than the fully general:
#
#     (R_p : f0 : T1, ..., Tn)
#
# This covers the early recursive families such as:
#
#     (R5 : R3)
#     (R5 : 2R3)
#     (R5 : 3R3)
#     (R7 : R3)
#     (R7 : R5)
#     etc.
#
# Later we will extend this file to generate f0 with weight > 1.
# ------------------------------------------------------------


# ------------------------------------------------------------
# Partitions
#
# Generate all positive nondecreasing partitions of total into exactly
# parts pieces.
#
# Example:
#
#     positive_nondecreasing_partitions(8, 5)
#
# gives:
#
#     [1,1,2,2,2]
#
# among others, and this partition corresponds to the candidate
# top-prime decomposition for a weight-8 type with p = 5.
# ------------------------------------------------------------

function positive_nondecreasing_partitions(total::Integer, parts::Integer)
    total = Int(total)
    parts = Int(parts)

    total <= 0 && throw(ArgumentError("total must be positive"))
    parts <= 0 && throw(ArgumentError("parts must be positive"))

    out = Vector{Vector{Int}}()

    if total < parts
        return out
    end

    prefix = Int[]

    function rec(minval::Int, remaining::Int, slots::Int)
        if slots == 0
            if remaining == 0
                push!(out, copy(prefix))
            end
            return
        end

        # We need future entries to be >= current entry.
        # So current x can be at most floor(remaining / slots).
        maxval = div(remaining, slots)

        for x in minval:maxval
            push!(prefix, x)
            rec(x, remaining - x, slots - 1)
            pop!(prefix)
        end
    end

    rec(1, total, parts)
    return out
end


# ------------------------------------------------------------
# Subtype admissibility
#
# If the new top prime is p, subsidiary types must live in the lower
# cyclotomic field using only primes < p.
#
# Naive but reliable first version:
# build one representative sorou of the type and check its relative order.
#
# Later, we can store relative-order metadata directly in the type.
# ------------------------------------------------------------

function type_uses_only_primes_less_than(T::VanishingType, p::Integer)
    p = Int(p)

    local h
    try
        h = representative_sorou(T)
    catch
        return false
    end

    d = relative_order(h)

    for q in prime_factors_distinct(d)
        if q >= p
            return false
        end
    end

    return true
end


function subtype_choices_for_weight(cat::TypeCatalog, subtype_weight::Integer, p::Integer)
    choices = VanishingType[]

    for T in types_of_weight(cat, subtype_weight)
        if type_uses_only_primes_less_than(T, p)
            push!(choices, T)
        end
    end

    sort!(choices, by = type_key)
    return choices
end


# ------------------------------------------------------------
# Cartesian product for subtype choices
#
# Input:
#
#     choice_lists = [
#         [R3],
#         [R3],
#         [R3, R5],
#     ]
#
# Output:
#
#     all lists choosing one type from each slot.
# ------------------------------------------------------------

function subtype_choice_products(choice_lists::Vector{Vector{VanishingType}})
    if isempty(choice_lists)
        return [VanishingType[]]
    end

    out = Vector{Vector{VanishingType}}()
    acc = VanishingType[]

    function rec(i::Int)
        if i > length(choice_lists)
            push!(out, copy(acc))
            return
        end

        for T in choice_lists[i]
            push!(acc, T)
            rec(i + 1)
            pop!(acc)
        end
    end

    rec(1)
    return out
end


# ------------------------------------------------------------
# Candidate verification
#
# Given a candidate type T:
#
#   1. build one representative sorou;
#   2. check its weight agrees with the type weight;
#   3. check minimal vanishing exactly using Proposition 2.3.
#
# This replaces the floating-point vanishing test from the paper's
# preliminary Python implementation.
# ------------------------------------------------------------

function candidate_type_survives_prop23(T::VanishingType)
    local h

    try
        h = representative_sorou(T)
    catch
        return false
    end

    weight(h) == type_weight(T) || return false
    return is_minimal_vanishing_prop23(h)
end


# ------------------------------------------------------------
# GenNextTypes, first version: f0 = 1 only
#
# Given a catalog containing all known types up to weight k,
# generate new candidate minimal types of weight k + 1
# in the branch where the smallest subsidiary f0 is exactly 1.
#
# This implements the clean part of Algorithm 4.3:
#
#   - top prime p <= w0
#   - partitions x0 <= x1 <= ... <= x_{p-1}
#   - here require x0 = 1
#   - for every slot with xj > 1, choose subtype weight xj + 1
#   - build T = (R_p : T1, ..., Tn)
#   - test one representative by Proposition 2.3
# ------------------------------------------------------------

function gen_next_types_f0_one(cat::TypeCatalog)
    previous_weight = max_type_weight(cat)
    w0 = previous_weight + 1

    one_sorou = Sorou([one(RootUnity)])
    output = Set{VanishingType}()

    for p in primes_upto(w0)
        for x in positive_nondecreasing_partitions(w0, p)

            # Prime type:
            #
            # If the partition is all ones, then the type is R_p.
            #
            # Important: the paper pseudocode says "return R_p",
            # but for implementation this should mean "add R_p and continue".
            if all(xi -> xi == 1, x)
                if p == w0
                    T = RType(p)

                    if candidate_type_survives_prop23(T)
                        push!(output, T)
                    end
                end

                continue
            end

            # This first version only handles f0 = 1.
            # Since x is sorted, that means x[1] must be 1.
            x[1] == 1 || continue

            # For every subsidiary slot with weight xj > 1:
            #
            #     subtype = f0 - fj
            #
            # Since weight(f0) = 1:
            #
            #     weight(subtype) = 1 + xj
            #
            subtype_weights = Int[]

            for xj in x[2:end]
                if xj > 1
                    push!(subtype_weights, xj + 1)
                end
            end

            choice_lists = Vector{Vector{VanishingType}}()
            possible = true

            for sw in subtype_weights
                choices = subtype_choices_for_weight(cat, sw, p)

                if isempty(choices)
                    possible = false
                    break
                end

                push!(choice_lists, choices)
            end

            possible || continue

            for subtypes in subtype_choice_products(choice_lists)
                T = RecursiveType(p, one_sorou, subtypes)

                type_weight(T) == w0 || continue

                if candidate_type_survives_prop23(T)
                    push!(output, T)
                end
            end
        end
    end

    out = collect(output)
    sort!(out, by = type_key)
    return out
end


function extend_catalog_next_f0_one!(cat::TypeCatalog)
    new_types = gen_next_types_f0_one(cat)

    for T in new_types
        add_type!(cat, T)
    end

    return new_types
end


function generate_until_f0_one!(cat::TypeCatalog, target_weight::Integer)
    target_weight = Int(target_weight)
    generated = VanishingType[]

    while max_type_weight(cat) < target_weight
        new_types = extend_catalog_next_f0_one!(cat)

        # Avoid infinite loops if this partial generator reaches a weight
        # where it cannot produce anything.
        isempty(new_types) && break

        append!(generated, new_types)
    end

    return generated
end

# ------------------------------------------------------------
# General f0 candidate generation
#
# Algorithm 4.3 requires candidate smallest subsidiary sorou f0
# satisfying:
#
#   weight(f0) = x0
#   relative_order(f0) divides product of primes < p
#   1 is a term of f0 after normalization
#
# This is still a naive generator, but it is mathematically correct
# for small weights and enough to reach the first nontrivial f0 cases.
# ------------------------------------------------------------

function lower_prime_product(p::Integer)
    p = Int(p)
    p <= 1 && throw(ArgumentError("p must be positive"))

    m = 1

    for q in primes_upto(p - 1)
        m *= q
    end

    return m
end


function roots_with_order_dividing(m::Integer)
    m = Int(m)
    m <= 0 && throw(ArgumentError("m must be positive"))

    roots = RootUnity[RootUnity(a, m) for a in 0:(m - 1)]
    sort!(roots)
    return roots
end


function candidate_f0s_naive(
    x0::Integer,
    p::Integer;
    require_no_vanishing_subbag::Bool = true,
)
    x0 = Int(x0)
    p = Int(p)

    x0 <= 0 && throw(ArgumentError("x0 must be positive"))
    is_prime_number(p) || throw(ArgumentError("p must be prime"))

    # f0 = 1 case.
    if x0 == 1
        return Sorou[Sorou([one(RootUnity)])]
    end

    lower_order = lower_prime_product(p)
    roots = roots_with_order_dividing(lower_order)

    seen = Set{Sorou}()
    prefix = RootUnity[one(RootUnity)]

    # We enumerate multisets of size x0 - 1 from roots_with_order_dividing(lower_order),
    # then add the fixed term 1.
    function rec(start_idx::Int, remaining::Int)
        if remaining == 0
            f = Sorou(copy(prefix))
            fcanon = canonical_rotation(f)

            # Keep only f0s with no proper vanishing subbag.
            #
            # This is not strictly needed because the final Proposition 2.3
            # checker will reject bad candidates anyway, but filtering here
            # greatly reduces the search space.
            if require_no_vanishing_subbag
                b = TermBag(copy(fcanon.terms))

                if has_vanishing_proper_nonempty_subbag(b, lower_order)
                    return
                end
            end

            push!(seen, fcanon)
            return
        end

        for i in start_idx:length(roots)
            push!(prefix, roots[i])
            rec(i, remaining - 1)
            pop!(prefix)
        end
    end

    rec(1, x0 - 1)

    out = collect(seen)
    sort!(out, by = sorou_key)
    return out
end


# ------------------------------------------------------------
# Slot choices for general f0
#
# Suppose the partition has:
#
#   x0 = weight(f0)
#   xj = weight(fj)
#
# If fj = f0, then this slot contributes no subtype.
# This is possible only when xj = x0.
#
# If fj != f0, then f0 - fj is a vanishing sorou of weight:
#
#   weight(f0 - fj) = x0 + xj
#
# so its type must come from the previous catalog at weight x0 + xj.
# ------------------------------------------------------------

const SlotChoice = Union{Nothing, VanishingType}

# ------------------------------------------------------------
# Nonminimal vanishing type choices
#
# For Algorithm 4.3, a subsidiary type f0 - fj may be nonminimal,
# especially when weight(f0) > 1.
#
# So for a requested weight m, we allow:
#
#   - known minimal/recursive types of weight m from the catalog;
#   - direct sums of known types whose total weight is m.
#
# Example:
#
#   weight 5 choices below top prime 7 include:
#
#       R5
#       R2 ⊕ R3
# ------------------------------------------------------------

function direct_sum_types_of_weight(
    cat::TypeCatalog,
    target_weight::Integer,
    p::Integer;
    max_parts::Union{Nothing, Int} = nothing,
)
    target_weight = Int(target_weight)
    p = Int(p)

    target_weight <= 0 && throw(ArgumentError("target_weight must be positive"))

    base = VanishingType[]

    for T in all_types(cat)
        # Avoid using already nonminimal direct sums as atomic pieces here.
        # SumType will flatten anyway, but excluding them reduces duplicates.
        T isa SumType && continue

        w = type_weight(T)

        if w < target_weight && type_uses_only_primes_less_than(T, p)
            push!(base, T)
        end
    end

    sort!(base, by = type_key)

    if max_parts === nothing
        max_parts = target_weight
    end

    out = Set{VanishingType}()
    acc = VanishingType[]

    function rec(start_idx::Int, remaining::Int)
        if remaining == 0
            if length(acc) >= 2
                push!(out, SumType(copy(acc)))
            end
            return
        end

        length(acc) >= max_parts && return

        for i in start_idx:length(base)
            T = base[i]
            w = type_weight(T)

            w <= remaining || continue

            push!(acc, T)

            # i, not i+1, because repeated summands are allowed:
            # e.g. R3 ⊕ R3.
            rec(i, remaining - w)

            pop!(acc)
        end
    end

    rec(1, target_weight)

    result = collect(out)
    sort!(result, by = type_key)
    return result
end


function vanishing_type_choices_for_weight(
    cat::TypeCatalog,
    target_weight::Integer,
    p::Integer;
    include_direct_sums::Bool = true,
)
    choices = Set{VanishingType}()

    for T in subtype_choices_for_weight(cat, target_weight, p)
        push!(choices, T)
    end

    if include_direct_sums
        for T in direct_sum_types_of_weight(cat, target_weight, p)
            push!(choices, T)
        end
    end

    result = collect(choices)
    sort!(result, by = type_key)
    return result
end
function subtype_options_for_slot(
    cat::TypeCatalog,
    f0::Sorou,
    x0::Integer,
    xj::Integer,
    p::Integer,
)
    x0 = Int(x0)
    xj = Int(xj)

    opts = SlotChoice[]

    # Option 1:
    # The slot is unchanged: fj = f0.
    if xj == x0
        push!(opts, nothing)
    end

    # Option 2:
    # The slot is changed using a vanishing subtype of weight x0 + xj.
    #
    # But we only keep the subtype if it really produces fj != f0.
    subtype_weight = x0 + xj

    for T in vanishing_type_choices_for_weight(cat, subtype_weight, p)
        if subtype_changes_f0(T, f0)
            push!(opts, T)
        end
    end

    return opts
end


function slot_choice_products(choice_lists::Vector{Vector{SlotChoice}})
    if isempty(choice_lists)
        return Vector{SlotChoice}[SlotChoice[]]
    end

    out = Vector{Vector{SlotChoice}}()
    acc = SlotChoice[]

    function rec(i::Int)
        if i > length(choice_lists)
            push!(out, copy(acc))
            return
        end

        for choice in choice_lists[i]
            push!(acc, choice)
            rec(i + 1)
            pop!(acc)
        end
    end

    rec(1)
    return out
end


function subtypes_from_slot_choices(choices::Vector{SlotChoice})
    subtypes = VanishingType[]

    for c in choices
        if c !== nothing
            push!(subtypes, c)
        end
    end

    return subtypes
end


# ------------------------------------------------------------
# General GenNextTypes candidate generator
#
# This extends gen_next_types_f0_one by allowing f0 of weight > 1.
#
# It is still intentionally conservative:
#
#   - candidate f0s are generated naively;
#   - final acceptance is still decided by exact Proposition 2.3 checking;
#   - we add keyword controls so tests can focus on p = 7 and x0 <= 2.
# ------------------------------------------------------------

function gen_next_types_with_f0_candidates(
    cat::TypeCatalog;
    max_f0_weight::Union{Nothing, Int} = nothing,
    primes_to_check = nothing,
)
    previous_weight = max_type_weight(cat)
    w0 = previous_weight + 1

    primes = if primes_to_check === nothing
        primes_upto(w0)
    else
        Int[q for q in primes_to_check]
    end

    output = Set{VanishingType}()

    for p in primes
        p <= w0 || continue
        is_prime_number(p) || continue

        for x in positive_nondecreasing_partitions(w0, p)
            x0 = x[1]

            if max_f0_weight !== nothing && x0 > max_f0_weight
                continue
            end

            # Pure prime type R_p.
            #
            # The paper pseudocode says "return R_p"; in actual code this
            # must mean "add R_p and keep searching".
            if all(xi -> xi == 1, x)
                if p == w0
                    T = RType(p)

                    if candidate_type_survives_prop23(T)
                        push!(output, T)
                    end
                end

                continue
            end

            f0_candidates = candidate_f0s_naive(x0, p)

            for f0 in f0_candidates
                choice_lists = Vector{Vector{SlotChoice}}()
                possible = true

                # We fixed the first slot to be f0.
                # Now choose what happens in slots 2, ..., p.
                for xj in x[2:end]
                    opts = subtype_options_for_slot(cat, f0, x0, xj, p)

                    if isempty(opts)
                        possible = false
                        break
                    end

                    push!(choice_lists, opts)
                end

                possible || continue

                for choices in slot_choice_products(choice_lists)
                    subtypes = subtypes_from_slot_choices(choices)

                    # If all slots are f0, this is not minimal unless x0 = 1
                    # and the prime type case already handled it.
                    isempty(subtypes) && continue

                    T = RecursiveType(p, f0, subtypes)

                    type_weight(T) == w0 || continue

                    if candidate_type_survives_prop23(T)
                        push!(output, T)
                    end
                end
            end
        end
    end

    out = collect(output)
    sort!(out, by = type_key)
    return out
end


function extend_catalog_next_with_f0_candidates!(
    cat::TypeCatalog;
    max_f0_weight::Union{Nothing, Int} = nothing,
    primes_to_check = nothing,
)
    new_types = gen_next_types_with_f0_candidates(
        cat;
        max_f0_weight = max_f0_weight,
        primes_to_check = primes_to_check,
    )

    for T in new_types
        add_type!(cat, T)
    end

    return new_types
end

# ------------------------------------------------------------
# Generation driver and catalog inspection
#
# These helpers let us repeatedly apply the current generator and
# inspect what the catalog contains by weight.
#
# This is not a new mathematical idea; it is just infrastructure so
# we can compare our generated output with the known table in the paper.
# ------------------------------------------------------------

function generate_until_with_f0_candidates!(
    cat::TypeCatalog,
    target_weight::Integer;
    max_f0_weight::Union{Nothing, Int} = nothing,
    primes_to_check = nothing,
    verbose::Bool = false,
)
    target_weight = Int(target_weight)
    generated = VanishingType[]

    while max_type_weight(cat) < target_weight
        next_weight = max_type_weight(cat) + 1

        new_types = extend_catalog_next_with_f0_candidates!(
            cat;
            max_f0_weight = max_f0_weight,
            primes_to_check = primes_to_check,
        )

        verbose && println(
            "Generated weight ",
            next_weight,
            ": ",
            length(new_types),
            " type(s)"
        )

        if isempty(new_types)
            verbose && println("Stopping: no new types generated at weight ", next_weight)
            break
        end

        append!(generated, new_types)
    end

    return generated
end


function type_strings(types::AbstractVector{<:VanishingType})
    return [sprint(show, T) for T in types]
end


function catalog_types_of_weight(cat::TypeCatalog, w::Integer)
    types = types_of_weight(cat, w)
    sort!(types, by = type_key)
    return types
end


function catalog_type_strings_of_weight(cat::TypeCatalog, w::Integer)
    return type_strings(catalog_types_of_weight(cat, w))
end


function catalog_summary(cat::TypeCatalog)
    rows = Tuple{Int, Int}[]

    for w in sort(collect(keys(cat.by_weight)))
        push!(rows, (w, length(types_of_weight(cat, w))))
    end

    return rows
end


function print_catalog_summary(cat::TypeCatalog)
    println("Weight | Number of types")
    println("------------------------")

    for (w, n) in catalog_summary(cat)
        println(rpad(string(w), 6), " | ", n)
    end

    return nothing
end


function print_catalog_by_weight(cat::TypeCatalog, w::Integer)
    w = Int(w)

    println("Types of weight ", w)
    println("----------------")

    for T in catalog_types_of_weight(cat, w)
        println(T)
    end

    return nothing
end

# ------------------------------------------------------------
# Representative-based diagnostics
#
# These helpers detect when two different type descriptions produce
# the same representative sorou up to rotation.
#
# This is important because the recursive type definition is not
# automatically unique. The paper also notes that a given vanishing
# sorou may have more than one type.
# ------------------------------------------------------------

function representative_key(T::VanishingType)
    h = representative_sorou(T)
    return canonical_sorou_key(h)
end


function group_types_by_representative(types::AbstractVector{<:VanishingType})
    groups = Dict{String, Vector{VanishingType}}()

    for T in types
        key = representative_key(T)
        push!(get!(groups, key, VanishingType[]), T)
    end

    for key in keys(groups)
        sort!(groups[key], by = type_key)
    end

    return groups
end


function duplicate_representative_groups(types::AbstractVector{<:VanishingType})
    groups = group_types_by_representative(types)

    duplicates = Dict{String, Vector{VanishingType}}()

    for (key, group) in groups
        if length(group) > 1
            duplicates[key] = group
        end
    end

    return duplicates
end


function unique_types_by_representative(types::AbstractVector{<:VanishingType})
    groups = group_types_by_representative(types)
    out = VanishingType[]

    for key in sort(collect(keys(groups)))
        group = groups[key]
        sort!(group, by = type_key)

        # Keep the first type_key representative for now.
        # Later we can define a smarter preferred canonical type.
        push!(out, group[1])
    end

    sort!(out, by = type_key)
    return out
end


function print_duplicate_representative_groups(types::AbstractVector{<:VanishingType})
    duplicates = duplicate_representative_groups(types)

    if isempty(duplicates)
        println("No duplicate representative groups.")
        return nothing
    end

    println("Duplicate representative groups:")
    println("-------------------------------")

    for key in sort(collect(keys(duplicates)))
        group = duplicates[key]

        println()
        println("Representative key:")
        println(key)
        println("Types:")

        for T in group
            println("  ", T)
        end
    end

    return nothing
end


function catalog_unique_type_count_by_representative(cat::TypeCatalog, w::Integer)
    types = types_of_weight(cat, w)
    return length(unique_types_by_representative(types))
end


function catalog_diagnostic_summary(cat::TypeCatalog)
    rows = Tuple{Int, Int, Int}[]

    for w in sort(collect(keys(cat.by_weight)))
        raw_count = length(types_of_weight(cat, w))
        unique_count = catalog_unique_type_count_by_representative(cat, w)

        push!(rows, (w, raw_count, unique_count))
    end

    return rows
end


function print_catalog_diagnostic_summary(cat::TypeCatalog)
    println("Weight | Raw types | Unique representatives")
    println("------------------------------------------")

    for (w, raw, uniq) in catalog_diagnostic_summary(cat)
        println(
            rpad(string(w), 6),
            " | ",
            rpad(string(raw), 9),
            " | ",
            uniq,
        )
    end

    return nothing
end


function print_catalog_duplicates_by_weight(cat::TypeCatalog, w::Integer)
    types = types_of_weight(cat, w)
    print_duplicate_representative_groups(types)
    return nothing
end

function write_catalog_by_weight(path::AbstractString, cat::TypeCatalog)
    open(path, "w") do io
        println(io, "VanishingSorou generated catalog")
        println(io, "===============================")
        println(io)

        println(io, "Diagnostic summary")
        println(io, "------------------")
        println(io, "Weight | Raw types | Unique representatives")
        println(io, "------------------------------------------")

        for (w, raw, uniq) in catalog_diagnostic_summary(cat)
            println(
                io,
                rpad(string(w), 6),
                " | ",
                rpad(string(raw), 9),
                " | ",
                uniq,
            )
        end

        println(io)
        println(io, "Types by weight")
        println(io, "---------------")

        for w in sort(collect(keys(cat.by_weight)))
            println(io)
            println(io, "Weight ", w)
            println(io, repeat("-", 8 + length(string(w))))

            for T in catalog_types_of_weight(cat, w)
                println(io, T)
            end
        end
    end

    return path
end

# ------------------------------------------------------------
# Regression helpers for the generated low-weight catalog
#
# These counts are in our expanded notation convention.
# For example, the paper may write 3R3, while our internal type
# currently stores [R3, R3, R3].
# ------------------------------------------------------------

function expected_counts_to_16_expanded()
    return Dict(
        2  => 1,
        3  => 1,
        5  => 1,
        6  => 1,
        7  => 2,
        8  => 2,
        9  => 2,
        10 => 2,
        11 => 4,
        12 => 5,
        13 => 8,
        14 => 10,
        15 => 15,
        16 => 29,
    )
end


function catalog_count_dict(cat::TypeCatalog)
    return Dict(w => length(types_of_weight(cat, w)) for w in keys(cat.by_weight))
end


function catalog_unique_count_dict(cat::TypeCatalog)
    return Dict(
        w => catalog_unique_type_count_by_representative(cat, w)
        for w in keys(cat.by_weight)
    )
end


function compare_catalog_counts_to_16(cat::TypeCatalog)
    expected = expected_counts_to_16_expanded()
    raw = catalog_count_dict(cat)
    unique = catalog_unique_count_dict(cat)

    rows = Tuple{Int, Int, Int, Int, Bool}[]

    for w in sort(collect(keys(expected)))
        exp = expected[w]
        raw_count = get(raw, w, 0)
        uniq_count = get(unique, w, 0)

        push!(rows, (w, exp, raw_count, uniq_count, exp == raw_count == uniq_count))
    end

    return rows
end


function print_compare_catalog_counts_to_16(cat::TypeCatalog)
    println("Weight | Expected | Raw | Unique | OK")
    println("-------------------------------------")

    for (w, exp, raw, uniq, ok) in compare_catalog_counts_to_16(cat)
        println(
            rpad(string(w), 6),
            " | ",
            rpad(string(exp), 8),
            " | ",
            rpad(string(raw), 3),
            " | ",
            rpad(string(uniq), 6),
            " | ",
            ok,
        )
    end

    return nothing
end


function catalog_matches_counts_to_16(cat::TypeCatalog)
    return all(row -> row[5], compare_catalog_counts_to_16(cat))
end

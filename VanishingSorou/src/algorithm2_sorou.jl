# ------------------------------------------------------------
# Algorithm 4.4 / Algorithm 2
#
# Goal:
#   For a fixed vanishing type T, generate sorou representatives
#   of that type, up to rotation.
#
# This is the first exact Julia version of the paper's GenSorou /
# GenNonMinSorou layer.
#
# Important:
#   This is correctness-first, not optimized.
# ------------------------------------------------------------


# ------------------------------------------------------------
# Small collection helpers
# ------------------------------------------------------------

function gen_sorou_with_memo_stats(T::VanishingType; verify::Bool = true)
    memo = Dict{String, Vector{Sorou}}()
    hs = gen_sorou(T, memo; verify = verify)

    plain_keys = [k for k in keys(memo) if !startswith(k, "CONTAIN|")]
    contain_keys = [k for k in keys(memo) if startswith(k, "CONTAIN|")]

    return (
        sorou=hs,
        count=length(hs),
        memo_total=length(memo),
        memo_type_entries=length(plain_keys),
        memo_containing_entries=length(contain_keys),
    )
end

function sorted_sorou_vector(xs::Set{Sorou}; canonical::Bool=true)
    out = collect(xs)

    if canonical
        sort!(out, by=canonical_sorou_key)
    else
        sort!(out, by=sorou_key)
    end

    return out
end


function cartesian_products_sorou(lists::Vector{Vector{Sorou}})
    if isempty(lists)
        return Vector{Sorou}[Sorou[]]
    end

    out = Vector{Vector{Sorou}}()
    acc = Sorou[]

    function rec(i::Int)
        if i > length(lists)
            push!(out, copy(acc))
            return
        end

        for h in lists[i]
            push!(acc, h)
            rec(i + 1)
            pop!(acc)
        end
    end

    rec(1)
    return out
end


function distinct_slot_tuples(p::Int, n::Int)
    n < 0 && throw(ArgumentError("n must be nonnegative"))
    n > p && return Vector{Vector{Int}}()

    out = Vector{Vector{Int}}()
    acc = Int[]
    used = falses(p)

    function rec(k::Int)
        if k > n
            push!(out, copy(acc))
            return
        end

        for slot in 0:(p-1)
            idx = slot + 1

            if !used[idx]
                used[idx] = true
                push!(acc, slot)

                rec(k + 1)

                pop!(acc)
                used[idx] = false
            end
        end
    end

    rec(1)
    return out
end

# ------------------------------------------------------------
# Canonical slot assignments for repeated subtypes
#
# distinct_slot_tuples(p, n) treats all n subtype slots as labeled.
# That is wasteful when subtypes repeat.
#
# Example:
#
#     (R7 : R3, R3, R3)
#
# The old method tries:
#
#     7 * 6 * 5 = 210
#
# ordered assignments.
#
# But the three R3 subtypes are identical, so we only need:
#
#     binomial(7, 3) = 35
#
# unordered choices of slots for that repeated block.
#
# For mixed subtypes:
#
#     (R7 : R3, R3, R5)
#
# we choose an unordered 2-subset for the R3 block, then an ordered
# remaining slot for R5.
# ------------------------------------------------------------

function consecutive_equal_subtype_ranges(subtypes::Vector{VanishingType})
    ranges = UnitRange{Int}[]

    isempty(subtypes) && return ranges

    i = 1

    while i <= length(subtypes)
        j = i

        while j < length(subtypes) && subtypes[j+1] == subtypes[i]
            j += 1
        end

        push!(ranges, i:j)
        i = j + 1
    end

    return ranges
end


function choose_k_from_available(available::Vector{Int}, k::Int)
    k < 0 && throw(ArgumentError("k must be nonnegative"))

    if k == 0
        return [Int[]]
    end

    if k > length(available)
        return Vector{Vector{Int}}()
    end

    out = Vector{Vector{Int}}()
    acc = Int[]

    function rec(start_idx::Int, remaining::Int)
        if remaining == 0
            push!(out, copy(acc))
            return
        end

        max_start = length(available) - remaining + 1

        for i in start_idx:max_start
            push!(acc, available[i])
            rec(i + 1, remaining - 1)
            pop!(acc)
        end
    end

    rec(1, k)
    return out
end


function remove_chosen_slots(available::Vector{Int}, chosen::Vector{Int})
    chosen_set = Set(chosen)
    return [x for x in available if !(x in chosen_set)]
end


function canonical_slot_assignments_for_subtypes(
    p::Int,
    subtypes::Vector{VanishingType},
)
    n = length(subtypes)
    n > p && return Vector{Vector{Int}}()

    groups = consecutive_equal_subtype_ranges(subtypes)

    assignments = Vector{Vector{Int}}()
    current = fill(-1, n)

    function rec(group_idx::Int, available::Vector{Int})
        if group_idx > length(groups)
            push!(assignments, copy(current))
            return
        end

        r = groups[group_idx]
        k = length(r)

        for chosen in choose_k_from_available(available, k)
            # The chosen slots are increasing. Assign them in order to
            # the repeated subtype block. This removes permutations among
            # identical subtype positions.
            for (offset, pos) in enumerate(r)
                current[pos] = chosen[offset]
            end

            remaining_slots = remove_chosen_slots(available, chosen)
            rec(group_idx + 1, remaining_slots)

            for pos in r
                current[pos] = -1
            end
        end
    end

    rec(1, collect(0:(p-1)))

    return assignments
end

# ------------------------------------------------------------
# Rotations that contain a prescribed f0
#
# Given h and f0, find all rotations z*h such that f0 is a
# sub-multiset of z*h.
# ------------------------------------------------------------

function rotations_containing(h::Sorou, f0::Sorou)
    candidates = Set{RootUnity}()

    for a in f0.terms
        for b in h.terms
            push!(candidates, a / b)
        end
    end

    out = Set{Sorou}()

    for z in candidates
        hz = rotate(h, z)

        if contains_terms(hz.terms, f0.terms)
            push!(out, hz)
        end
    end

    return sorted_sorou_vector(out; canonical=false)
end


# ------------------------------------------------------------
# Convert subtype g = f0 - fj into the replacement subsidiary fj.
#
# Here g must contain f0 as a subbag:
#
#     g = f0 + (-fj)
#
# Therefore:
#
#     -fj = g \ f0
#      fj = -(g \ f0)
# ------------------------------------------------------------

function subsidiary_from_subtype_containing_f0(g::Sorou, f0::Sorou)
    contains_terms(g.terms, f0.terms) || throw(ArgumentError(
        "Subtype representative does not contain f0."
    ))

    negative_fj_terms = remove_terms(g.terms, f0.terms)

    fj_terms = RootUnity[-t for t in negative_fj_terms]
    sort!(fj_terms)

    return TermBag(fj_terms)
end


# ------------------------------------------------------------
# Public GenSorou entry point
# ------------------------------------------------------------

function gen_sorou(T::VanishingType; verify::Bool=true)
    memo = Dict{String,Vector{Sorou}}()
    return gen_sorou(T, memo; verify=verify)
end


function gen_sorou(T::RType, memo::Dict{String,Vector{Sorou}}; verify::Bool=true)
    key = type_key(T)

    if haskey(memo, key)
        return memo[key]
    end

    h = canonical_rotation(representative_sorou(T))
    memo[key] = Sorou[h]

    return memo[key]
end


function gen_sorou(T::SumType, memo::Dict{String,Vector{Sorou}}; verify::Bool=true)
    key = type_key(T)

    if haskey(memo, key)
        return memo[key]
    end

    part_lists = Vector{Vector{Sorou}}()

    for part in T.parts
        push!(part_lists, gen_sorou(part, memo; verify=verify))
    end

    out = Set{Sorou}()

    for choice in cartesian_products_sorou(part_lists)
        terms = RootUnity[]

        for h in choice
            append!(terms, h.terms)
        end

        push!(out, canonical_rotation(Sorou(terms)))
    end

    memo[key] = sorted_sorou_vector(out)

    return memo[key]
end


function gen_sorou(T::RecursiveType, memo::Dict{String,Vector{Sorou}}; verify::Bool=true)
    key = type_key(T)

    if haskey(memo, key)
        return memo[key]
    end

    p = T.p
    f0 = T.f0
    n = length(T.subtypes)

    # For every subtype Ti, generate all oriented representatives
    # of Ti that contain f0.
    subtype_options = Vector{Vector{Sorou}}()

    for S in T.subtypes
        opts = gen_sorou_containing(S, f0, memo; verify=verify)

        if isempty(opts)
            memo[key] = Sorou[]
            return memo[key]
        end

        push!(subtype_options, opts)
    end

    out = Set{Sorou}()

    out = Set{Sorou}()

    slot_assignments = canonical_slot_assignments_for_subtypes(p, T.subtypes)

    # Base decomposition:
    #
    #   all p subsidiary slots are f0
    #
    # Then some slots are replaced by fj, where f0 - fj has the
    # chosen subtype.
    for slots in slot_assignments
        for chosen_subtypes in cartesian_products_sorou(subtype_options)
            bags = [TermBag(copy(f0.terms)) for _ in 1:p]

            for k in 1:n
                slot = slots[k]
                g = chosen_subtypes[k]

                bags[slot+1] = subsidiary_from_subtype_containing_f0(g, f0)
            end

            h = recompose_from_bags(p, bags)

            if !verify || is_minimal_vanishing_prop23(h)
                push!(out, canonical_rotation(h))
            end
        end
    end

    memo[key] = sorted_sorou_vector(out)

    return memo[key]
end


# ------------------------------------------------------------
# GenSorouContaining
#
# Generate oriented representatives of T that contain f0.
#
# This is needed because a subtype represents f0 - fj, so we must
# orient/rotate the subtype representative so f0 is literally present
# as a subbag.
# ------------------------------------------------------------



function gen_sorou_containing(
    T::VanishingType,
    f0::Sorou;
    verify::Bool=true,
)
    memo = Dict{String,Vector{Sorou}}()
    return gen_sorou_containing(T, f0, memo; verify=verify)
end

# ------------------------------------------------------------
# Memo key for oriented representatives containing f0
#
# gen_sorou(T, memo) is cached by type_key(T).
# gen_sorou_containing(T, f0, memo) needs a different namespace
# because it depends both on T and on the literal f0 terms.
# ------------------------------------------------------------

function containing_key(T::VanishingType, f0::Sorou)
    return "CONTAIN|" * type_key(T) * "|" * sorou_key(f0)
end
function gen_sorou_containing(
    T::VanishingType,
    f0::Sorou,
    memo::Dict{String,Vector{Sorou}};
    verify::Bool=true,
)
    key = containing_key(T, f0)

    if haskey(memo, key)
        return memo[key]
    end

    result = if T isa SumType
        gen_nonminimal_sorou_containing(T, f0, memo; verify=verify)
    else
        out = Set{Sorou}()

        for h in gen_sorou(T, memo; verify=verify)
            for hz in rotations_containing(h, f0)
                push!(out, hz)
            end
        end

        sorted_sorou_vector(out; canonical=false)
    end

    memo[key] = result
    return result
end


# ------------------------------------------------------------
# GenNonMinSorou
#
# T = T1 ⊕ ... ⊕ Tm.
#
# We partition f0 into m nonempty pieces and try to place each piece
# inside a representative of the corresponding summand.
# ------------------------------------------------------------

function gen_nonminimal_sorou_containing(
    T::SumType,
    f0::Sorou;
    verify::Bool = true,
)
    memo = Dict{String, Vector{Sorou}}()
    return gen_nonminimal_sorou_containing(T, f0, memo; verify = verify)
end


function gen_nonminimal_sorou_containing(
    T::SumType,
    f0::Sorou,
    memo::Dict{String, Vector{Sorou}};
    verify::Bool = true,
)
    parts = T.parts
    m = length(parts)

    m <= weight(f0) || return Sorou[]

    partitions = ordered_nonempty_term_partitions(f0.terms, m)
    out = Set{Sorou}()

    for partition in partitions
        option_lists = Vector{Vector{Sorou}}()
        possible = true

        for i in 1:m
            piece = Sorou(partition[i])
            opts = gen_sorou_containing(parts[i], piece, memo; verify = verify)

            if isempty(opts)
                possible = false
                break
            end

            push!(option_lists, opts)
        end

        possible || continue

        for choice in cartesian_products_sorou(option_lists)
            terms = RootUnity[]

            for h in choice
                append!(terms, h.terms)
            end

            candidate = Sorou(terms)

            if contains_terms(candidate.terms, f0.terms)
                push!(out, candidate)
            end
        end
    end

    return sorted_sorou_vector(out; canonical=false)
end


# ------------------------------------------------------------
# Invariant sets from all generated sorou of a type
# ------------------------------------------------------------

function type_height_set(T::VanishingType)
    return Set(height(h) for h in gen_sorou(T))
end


function type_order_parity_set(T::VanishingType)
    return Set(order_parity(h) for h in gen_sorou(T))
end


function type_unordered_order_parity_set(T::VanishingType)
    return Set(unordered_order_parity(h) for h in gen_sorou(T))
end


function type_full_invariant_summary(T::VanishingType; verify::Bool = true)
    hs = gen_sorou(T; verify = verify)

    return (
        type=sprint(show, T),
        count=length(hs),
        heights=sort(collect(Set(height(h) for h in hs))),
        parities=sort(collect(Set(order_parity(h) for h in hs))),
        unordered_parities=sort(collect(Set(unordered_order_parity(h) for h in hs))),
    )
end

function type_full_invariant_summary(
    T::VanishingType,
    memo::Dict{String, Vector{Sorou}};
    verify::Bool = true,
)
    hs = gen_sorou(T, memo; verify = verify)

    return (
        type=sprint(show, T),
        count=length(hs),
        heights=sort(collect(Set(height(h) for h in hs))),
        parities=sort(collect(Set(order_parity(h) for h in hs))),
        unordered_parities=sort(collect(Set(unordered_order_parity(h) for h in hs))),
    )
end


function print_type_full_invariant_summary(T::VanishingType)
    s = type_full_invariant_summary(T)

    println("Type: ", s.type)
    println("Generated sorou representatives: ", s.count)
    println("Heights: ", s.heights)
    println("Parities: ", s.parities)
    println("Unordered parities: ", s.unordered_parities)

    return nothing
end

# ------------------------------------------------------------
# Full invariant scan over a catalog
#
# This uses Algorithm 4.4 / gen_sorou(T), not just one representative.
# ------------------------------------------------------------

function catalog_full_invariant_rows(
    cat::TypeCatalog;
    weights = nothing,
    verbose::Bool = false,
    verify::Bool = true,
)
    selected_weights = if weights === nothing
        sort(collect(keys(cat.by_weight)))
    else
        sort(Int[w for w in weights])
    end

    rows = NamedTuple[]

    # Critical optimization:
    # one shared memo for the whole catalog scan.
    memo = Dict{String,Vector{Sorou}}()

    for w in selected_weights
        types = catalog_types_of_weight(cat, w)

        for (i, T) in enumerate(types)
            if verbose
                println(
                    "Full invariants weight ",
                    w,
                    ", type ",
                    i,
                    "/",
                    length(types),
                    ": ",
                    T,
                )
            end

            summary = type_full_invariant_summary(T, memo; verify = verify)

            push!(rows, (
                weight=w,
                type=summary.type,
                count=summary.count,
                heights=summary.heights,
                parities=summary.parities,
                unordered_parities=summary.unordered_parities,
            ))
        end
    end

    return rows
end


function max_height_by_weight(cat::TypeCatalog; weights=nothing)
    rows = catalog_full_invariant_rows(cat; weights=weights)

    out = Dict{Int,Int}()

    for row in rows
        hmax = maximum(row.heights)
        out[row.weight] = max(get(out, row.weight, 0), hmax)
    end

    return out
end


function height_distribution_by_weight(cat::TypeCatalog; weights=nothing)
    rows = catalog_full_invariant_rows(cat; weights=weights)

    out = Dict{Int,Dict{Int,Int}}()

    for row in rows
        d = get!(out, row.weight, Dict{Int,Int}())

        for h in row.heights
            d[h] = get(d, h, 0) + 1
        end
    end

    return out
end


function rows_with_height_at_least(cat::TypeCatalog, min_height::Integer; weights=nothing)
    min_height = Int(min_height)

    return [
        row for row in catalog_full_invariant_rows(cat; weights=weights)
        if maximum(row.heights) >= min_height
    ]
end


function print_full_invariant_summary_by_weight(cat::TypeCatalog; weights=nothing)
    rows = catalog_full_invariant_rows(cat; weights=weights)

    grouped = Dict{Int,Vector{NamedTuple}}()

    for row in rows
        push!(get!(grouped, row.weight, NamedTuple[]), row)
    end

    println("Weight | Types | Max height | Height distribution")
    println("------------------------------------------------")

    for w in sort(collect(keys(grouped)))
        type_count = length(grouped[w])
        maxh = maximum(maximum(row.heights) for row in grouped[w])

        dist = Dict{Int,Int}()

        for row in grouped[w]
            for h in row.heights
                dist[h] = get(dist, h, 0) + 1
            end
        end

        println(
            rpad(string(w), 6),
            " | ",
            rpad(string(type_count), 5),
            " | ",
            rpad(string(maxh), 10),
            " | ",
            sort(collect(dist)),
        )
    end

    return nothing
end


function write_catalog_full_invariants(path::AbstractString, cat::TypeCatalog; weights=nothing)
    rows = catalog_full_invariant_rows(cat; weights=weights)

    open(path, "w") do io
        println(io, "VanishingSorou full Algorithm 4.4 invariants")
        println(io, "===========================================")
        println(io)

        println(io, "Compact summary by weight")
        println(io, "-------------------------")

        grouped = Dict{Int,Vector{NamedTuple}}()

        for row in rows
            push!(get!(grouped, row.weight, NamedTuple[]), row)
        end

        println(io, "Weight | Types | Max height | Height distribution")
        println(io, "------------------------------------------------")

        for w in sort(collect(keys(grouped)))
            type_count = length(grouped[w])
            maxh = maximum(maximum(row.heights) for row in grouped[w])

            dist = Dict{Int,Int}()

            for row in grouped[w]
                for h in row.heights
                    dist[h] = get(dist, h, 0) + 1
                end
            end

            println(
                io,
                rpad(string(w), 6),
                " | ",
                rpad(string(type_count), 5),
                " | ",
                rpad(string(maxh), 10),
                " | ",
                sort(collect(dist)),
            )
        end

        println(io)
        println(io, "Types with height at least 2")
        println(io, "---------------------------")

        high_rows = [row for row in rows if maximum(row.heights) >= 2]

        if isempty(high_rows)
            println(io, "None")
        else
            for row in high_rows
                println(
                    io,
                    "weight=",
                    row.weight,
                    " count=",
                    row.count,
                    " heights=",
                    row.heights,
                    " unordered_parities=",
                    row.unordered_parities,
                    " type=",
                    row.type,
                )
            end
        end

        println(io)
        println(io, "All type rows")
        println(io, "-------------")

        for row in rows
            println(
                io,
                "weight=",
                row.weight,
                " count=",
                row.count,
                " heights=",
                row.heights,
                " unordered_parities=",
                row.unordered_parities,
                " type=",
                row.type,
            )
        end
    end

    return path
end


function print_full_invariant_rows_summary(rows)
    grouped = Dict{Int,Vector{NamedTuple}}()

    for row in rows
        push!(get!(grouped, row.weight, NamedTuple[]), row)
    end

    println("Weight | Types | Max height | Height distribution")
    println("------------------------------------------------")

    for w in sort(collect(keys(grouped)))
        type_count = length(grouped[w])
        maxh = maximum(maximum(row.heights) for row in grouped[w])

        dist = Dict{Int,Int}()

        for row in grouped[w]
            for h in row.heights
                dist[h] = get(dist, h, 0) + 1
            end
        end

        println(
            rpad(string(w), 6),
            " | ",
            rpad(string(type_count), 5),
            " | ",
            rpad(string(maxh), 10),
            " | ",
            sort(collect(dist)),
        )
    end

    return nothing
end


function filter_rows_with_height_at_least(rows, min_height::Integer)
    min_height = Int(min_height)

    return [
        row for row in rows
        if maximum(row.heights) >= min_height
    ]
end


function write_full_invariant_rows(path::AbstractString, rows)
    open(path, "w") do io
        println(io, "VanishingSorou full Algorithm 4.4 invariants")
        println(io, "===========================================")
        println(io)

        println(io, "Compact summary by weight")
        println(io, "-------------------------")

        grouped = Dict{Int,Vector{NamedTuple}}()

        for row in rows
            push!(get!(grouped, row.weight, NamedTuple[]), row)
        end

        println(io, "Weight | Types | Max height | Height distribution")
        println(io, "------------------------------------------------")

        for w in sort(collect(keys(grouped)))
            type_count = length(grouped[w])
            maxh = maximum(maximum(row.heights) for row in grouped[w])

            dist = Dict{Int,Int}()

            for row in grouped[w]
                for h in row.heights
                    dist[h] = get(dist, h, 0) + 1
                end
            end

            println(
                io,
                rpad(string(w), 6),
                " | ",
                rpad(string(type_count), 5),
                " | ",
                rpad(string(maxh), 10),
                " | ",
                sort(collect(dist)),
            )
        end

        println(io)
        println(io, "Types with height at least 2")
        println(io, "---------------------------")

        high_rows = filter_rows_with_height_at_least(rows, 2)

        if isempty(high_rows)
            println(io, "None")
        else
            for row in high_rows
                println(
                    io,
                    "weight=",
                    row.weight,
                    " count=",
                    row.count,
                    " heights=",
                    row.heights,
                    " unordered_parities=",
                    row.unordered_parities,
                    " type=",
                    row.type,
                )
            end
        end

        println(io)
        println(io, "All type rows")
        println(io, "-------------")

        for row in rows
            println(
                io,
                "weight=",
                row.weight,
                " count=",
                row.count,
                " heights=",
                row.heights,
                " unordered_parities=",
                row.unordered_parities,
                " type=",
                row.type,
            )
        end
    end

    return path
end

# ------------------------------------------------------------
# Incremental full-invariant writer
#
# For expensive weights, write one row immediately after each type.
# This avoids losing work if the run is interrupted.
# ------------------------------------------------------------

function completed_type_strings_from_incremental_file(path::AbstractString)
    completed = Set{String}()

    if !isfile(path)
        return completed
    end

    for line in eachline(path)
        marker = " type="

        if occursin(marker, line)
            parts = split(line, marker; limit = 2)

            if length(parts) == 2
                push!(completed, parts[2])
            end
        end
    end

    return completed
end


function write_full_invariants_one_weight_incremental(
    path::AbstractString,
    cat::TypeCatalog,
    target_weight::Integer;
    verify::Bool = false,
    verbose::Bool = true,
    resume::Bool = true,
)
    target_weight = Int(target_weight)

    types = catalog_types_of_weight(cat, target_weight)

    completed = resume ? completed_type_strings_from_incremental_file(path) : Set{String}()

    mode = resume && isfile(path) ? "a" : "w"

    # Shared memo across all types in this weight.
    memo = Dict{String, Vector{Sorou}}()

    open(path, mode) do io
        if mode == "w"
            println(io, "VanishingSorou incremental full invariants")
            println(io, "=========================================")
            println(io)
            println(io, "target_weight=", target_weight)
            println(io, "verify=", verify)
            println(io)
            println(io, "Rows")
            println(io, "----")
            flush(io)
        end

        for (i, T) in enumerate(types)
            type_string = sprint(show, T)

            if type_string in completed
                verbose && println(
                    "Skipping already completed ",
                    i,
                    "/",
                    length(types),
                    ": ",
                    type_string,
                )
                continue
            end

            verbose && println(
                "Computing weight ",
                target_weight,
                ", type ",
                i,
                "/",
                length(types),
                ": ",
                type_string,
            )

            started = time()

            summary = type_full_invariant_summary(
                T,
                memo;
                verify = verify,
            )

            elapsed = round(time() - started; digits = 3)

            println(
                io,
                "weight=",
                target_weight,
                " count=",
                summary.count,
                " heights=",
                summary.heights,
                " unordered_parities=",
                summary.unordered_parities,
                " seconds=",
                elapsed,
                " type=",
                summary.type,
            )

            flush(io)

            verbose && println(
                "  done in ",
                elapsed,
                "s; count=",
                summary.count,
                "; heights=",
                summary.heights,
                "; unordered=",
                summary.unordered_parities,
            )
        end
    end

    return path
end
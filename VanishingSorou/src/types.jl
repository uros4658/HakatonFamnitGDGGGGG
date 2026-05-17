# ------------------------------------------------------------
# Type representation for vanishing sorou
#
# This is the data layer needed before implementing Algorithm 4.3.
#
# Types:
#
#   RType(p)
#       The prime type R_p = 1 + nu_p + ... + nu_p^(p-1)
#
#   SumType([T1, ..., Tk])
#       A nonminimal direct-sum type T1 ⊕ ... ⊕ Tk
#
#   RecursiveType(p, f0, subtypes)
#       A minimal recursive type
#
#           (R_p : f0 : T1, ..., Tn)
#
#       where each Ti is the type of f0 - f_j.
# ------------------------------------------------------------


abstract type VanishingType end


# ------------------------------------------------------------
# Small primality helper
# ------------------------------------------------------------

function is_prime_number(n::Integer)
    n = Int(n)
    n <= 1 && return false
    n == 2 && return true
    iseven(n) && return false

    d = 3
    while d * d <= n
        if n % d == 0
            return false
        end
        d += 2
    end

    return true
end


function primes_upto(n::Integer)
    return Int[p for p in 2:Int(n) if is_prime_number(p)]
end


# ------------------------------------------------------------
# Type structs
# ------------------------------------------------------------

struct RType <: VanishingType
    p::Int

    function RType(p::Integer)
        p = Int(p)
        is_prime_number(p) || throw(ArgumentError("RType expects a prime p; got $p"))
        return new(p)
    end
end


struct SumType <: VanishingType
    parts::Vector{VanishingType}

    function SumType(parts::AbstractVector{<:VanishingType})
        isempty(parts) && throw(ArgumentError("SumType must have at least one part."))

        # Flatten nested direct sums.
        flat = VanishingType[]
        for T in parts
            if T isa SumType
                append!(flat, T.parts)
            else
                push!(flat, T)
            end
        end

        sort!(flat, by = type_key)
        return new(flat)
    end
end


struct RecursiveType <: VanishingType
    p::Int
    f0::Sorou
    subtypes::Vector{VanishingType}

    function RecursiveType(p::Integer, f0::Sorou, subtypes::AbstractVector{<:VanishingType})
        p = Int(p)
        is_prime_number(p) || throw(ArgumentError("RecursiveType expects a prime p; got $p"))

        length(subtypes) <= p - 1 || throw(ArgumentError(
            "A recursive type with top prime $p can have at most $(p - 1) nontrivial subsidiary types."
        ))

        normalized_f0 = canonical_rotation(f0)

        subs = VanishingType[T for T in subtypes]
        sort!(subs, by = type_key)

        return new(p, normalized_f0, subs)
    end
end


# ------------------------------------------------------------
# Type keys, equality, hashing
# ------------------------------------------------------------

function type_key(T::VanishingType)
    if T isa RType
        return "R$(T.p)"
    elseif T isa SumType
        return "S(" * join(type_key.(T.parts), ",") * ")"
    elseif T isa RecursiveType
        return "C($(T.p);$(sprint(show, T.f0));" * join(type_key.(T.subtypes), ",") * ")"
    else
        error("Unknown VanishingType")
    end
end


Base.:(==)(A::RType, B::RType) = A.p == B.p
Base.:(==)(A::SumType, B::SumType) = A.parts == B.parts
Base.:(==)(A::RecursiveType, B::RecursiveType) =
    A.p == B.p && A.f0 == B.f0 && A.subtypes == B.subtypes

Base.hash(T::RType, h::UInt) = hash((:RType, T.p), h)
Base.hash(T::SumType, h::UInt) = hash((:SumType, T.parts), h)
Base.hash(T::RecursiveType, h::UInt) = hash((:RecursiveType, T.p, T.f0, T.subtypes), h)


# ------------------------------------------------------------
# Pretty printing
# ------------------------------------------------------------

function Base.show(io::IO, T::RType)
    print(io, "R", T.p)
end


function Base.show(io::IO, T::SumType)
    print(io, join([sprint(show, S) for S in T.parts], " ⊕ "))
end


function Base.show(io::IO, T::RecursiveType)
    print(io, "(R", T.p)

    if weight(T.f0) == 1 && T.f0.terms[1] == one(RootUnity)
        # Standard shorthand: (Rp : T1, ..., Tn)
        if !isempty(T.subtypes)
            print(io, " : ")
            print(io, join([sprint(show, S) for S in T.subtypes], ", "))
        end
    else
        # Full notation: (Rp : f0 : T1, ..., Tn)
        print(io, " : ")
        show(io, T.f0)

        if !isempty(T.subtypes)
            print(io, " : ")
            print(io, join([sprint(show, S) for S in T.subtypes], ", "))
        end
    end

    print(io, ")")
end


# ------------------------------------------------------------
# Type weight
# ------------------------------------------------------------

type_weight(T::RType) = T.p

function type_weight(T::SumType)
    return sum(type_weight(S) for S in T.parts)
end


function type_weight(T::RecursiveType)
    x0 = weight(T.f0)
    n = length(T.subtypes)

    # Start with p copies of f0.
    total = T.p * x0

    # If subtype S_i is f0 - f_j, then:
    #
    #     weight(S_i) = weight(f0) + weight(f_j)
    #
    # so:
    #
    #     weight(f_j) = weight(S_i) - weight(f0)
    #
    # Replacing one base f0 slot by f_j changes the total by:
    #
    #     weight(f_j) - weight(f0)
    #       = type_weight(S_i) - 2weight(f0)
    #
    for S in T.subtypes
        total += type_weight(S) - 2x0
    end

    return total
end


# Also allow weight(T) for types.
weight(T::VanishingType) = type_weight(T)


# ------------------------------------------------------------
# Multiset helpers for roots
# ------------------------------------------------------------

function contains_terms(whole::Vector{RootUnity}, part::Vector{RootUnity})
    counts = Dict{RootUnity, Int}()

    for t in whole
        counts[t] = get(counts, t, 0) + 1
    end

    for t in part
        c = get(counts, t, 0)
        c == 0 && return false
        counts[t] = c - 1
    end

    return true
end


function remove_terms(whole::Vector{RootUnity}, part::Vector{RootUnity})
    contains_terms(whole, part) || throw(ArgumentError("part is not a sub-multiset of whole"))

    to_remove = Dict{RootUnity, Int}()

    for t in part
        to_remove[t] = get(to_remove, t, 0) + 1
    end

    rest = RootUnity[]

    for t in whole
        c = get(to_remove, t, 0)

        if c > 0
            to_remove[t] = c - 1
        else
            push!(rest, t)
        end
    end

    sort!(rest)
    return rest
end


# Try to rotate h so that f0 is a subsorou of the rotated h.
function rotate_to_contain(h::Sorou, f0::Sorou)
    candidates = Set{RootUnity}()

    for a in f0.terms
        for b in h.terms
            push!(candidates, a / b)
        end
    end

    for z in candidates
        hz = rotate(h, z)

        if contains_terms(hz.terms, f0.terms)
            return hz
        end
    end

    throw(ArgumentError(
        "Could not rotate subtype representative so that it contains f0. " *
        "This case probably needs the full Algorithm 4.4 / GenNonMinSorou layer."
    ))
end


# ------------------------------------------------------------
# Build one witness sorou from a type
#
# This is not yet full Algorithm 4.4.
# It is just enough for Algorithm 4.3 to build one test candidate.
# ------------------------------------------------------------

function representative_sorou(T::RType)
    ν = primitive_root(T.p)
    return Sorou([ν^j for j in 0:(T.p - 1)])
end


function representative_sorou(T::SumType)
    terms = RootUnity[]

    for S in T.parts
        append!(terms, representative_sorou(S).terms)
    end

    return Sorou(terms)
end


# ------------------------------------------------------------
# Build one representative of a type that contains a prescribed f0
#
# This is the first piece of Algorithm 4.4 / GenNonMinSorou
# that we need for Algorithm 4.3.
#
# If T is minimal, we rotate one representative so that it contains f0.
#
# If T is a direct sum T1 ⊕ ... ⊕ Tk, then we split f0 into k
# nonempty pieces, rotate a representative of each Ti so that it
# contains the corresponding piece, and concatenate.
# ------------------------------------------------------------

function ordered_nonempty_term_partitions(terms::Vector{RootUnity}, k::Int)
    k <= 0 && throw(ArgumentError("k must be positive"))

    n = length(terms)

    if k > n
        return Vector{Vector{Vector{RootUnity}}}()
    end

    buckets = [RootUnity[] for _ in 1:k]
    out = Vector{Vector{Vector{RootUnity}}}()

    function rec(i::Int)
        if i > n
            if all(!isempty, buckets)
                push!(out, [copy(b) for b in buckets])
            end
            return
        end

        for j in 1:k
            push!(buckets[j], terms[i])
            rec(i + 1)
            pop!(buckets[j])
        end
    end

    rec(1)

    # Canonicalize each bucket internally and remove duplicate ordered partitions.
    seen = Set{String}()
    unique_out = Vector{Vector{Vector{RootUnity}}}()

    for partition in out
        for bucket in partition
            sort!(bucket)
        end

        key = join(
            [join(["$(t.num)/$(t.den)" for t in bucket], ";") for bucket in partition],
            "|",
        )

        if !(key in seen)
            push!(seen, key)
            push!(unique_out, partition)
        end
    end

    return unique_out
end


function representative_sorou_containing(T::VanishingType, f0::Sorou)
    if T isa SumType
        parts = T.parts

        length(parts) <= weight(f0) || throw(ArgumentError(
            "Cannot force $(length(parts)) direct-sum components to each contain " *
            "a nonempty piece of f0 of weight $(weight(f0))."
        ))

        partitions = ordered_nonempty_term_partitions(f0.terms, length(parts))

        for partition in partitions
            terms = RootUnity[]
            possible = true

            for i in eachindex(parts)
                piece = Sorou(partition[i])

                local rep_piece
                try
                    rep_piece = representative_sorou_containing(parts[i], piece)
                catch
                    possible = false
                    break
                end

                append!(terms, rep_piece.terms)
            end

            if possible
                return Sorou(terms)
            end
        end

        throw(ArgumentError("Could not build representative of direct-sum type containing f0."))
    else
        return rotate_to_contain(representative_sorou(T), f0)
    end
end


function representative_sorou(T::RecursiveType)
    f0_terms = T.f0.terms

    # Start with all p subsidiary slots equal to f0.
    bags = [TermBag(copy(f0_terms)) for _ in 1:T.p]

    # For each subtype S_i = type(f0 - f_j), build one representative
    # of S_i that actually contains f0, then solve for f_j.
    for (idx, S) in enumerate(T.subtypes)
        sub_with_f0 = representative_sorou_containing(S, T.f0)

        # sub_with_f0 = f0 + (-f_j)
        negative_fj_terms = remove_terms(sub_with_f0.terms, f0_terms)

        # Therefore f_j is obtained by multiplying those remaining terms by -1.
        fj_terms = RootUnity[-t for t in negative_fj_terms]
        sort!(fj_terms)

        # Slot 1 is f0. Put nontrivial subsidiaries into slots 2, 3, ...
        bags[idx + 1] = TermBag(fj_terms)
    end

    return recompose_from_bags(T.p, bags)
end


# ------------------------------------------------------------
# Type catalog
#
# Algorithm 4.3 works with "previousTypes", grouped by weight.
# This small catalog is the convenient data structure for that.
# ------------------------------------------------------------

mutable struct TypeCatalog
    by_weight::Dict{Int, Vector{VanishingType}}

    function TypeCatalog(types::AbstractVector{<:VanishingType} = VanishingType[])
        cat = new(Dict{Int, Vector{VanishingType}}())

        for T in types
            add_type!(cat, T)
        end

        return cat
    end
end


function add_type!(cat::TypeCatalog, T::VanishingType)
    w = type_weight(T)
    list = get!(cat.by_weight, w, VanishingType[])

    if !(T in list)
        push!(list, T)
        sort!(list, by = type_key)
    end

    return cat
end


function types_of_weight(cat::TypeCatalog, w::Integer)
    return get(cat.by_weight, Int(w), VanishingType[])
end


function all_types(cat::TypeCatalog)
    out = VanishingType[]

    for w in sort(collect(keys(cat.by_weight)))
        append!(out, cat.by_weight[w])
    end

    return out
end


function max_type_weight(cat::TypeCatalog)
    isempty(cat.by_weight) && return 0
    return maximum(keys(cat.by_weight))
end


# A tiny seed catalog for smoke tests.
# This is NOT yet the full Table 1 seed catalog.
function tiny_seed_catalog()
    one_sorou = Sorou([one(RootUnity)])

    return TypeCatalog(VanishingType[
        RType(2),
        RType(3),
        RType(5),
        RecursiveType(5, one_sorou, [RType(3)]),           # (R5 : R3), weight 6
        RecursiveType(5, one_sorou, [RType(3), RType(3)]), # (R5 : 2R3), weight 7
        RType(7),
    ])
end

# ------------------------------------------------------------
# Does a subtype really change f0?
#
# A subtype S represents:
#
#     f0 - fj
#
# But sometimes this vanishing subtype only encodes fj = f0.
#
# Example:
#
#     f0 = 1
#     S = R2 = 1 + (-1)
#
# Then:
#
#     f0 - fj = 1 + (-1)
#
# so:
#
#     -fj = -1
#      fj = 1 = f0
#
# Such a subtype should NOT be recorded in the recursive type,
# because Definition 2.4 only records indices where fj != f0.
# ------------------------------------------------------------

function subtype_changes_f0(S::VanishingType, f0::Sorou)
    local sub_with_f0

    try
        sub_with_f0 = representative_sorou_containing(S, f0)
    catch
        return false
    end

    negative_fj_terms = remove_terms(sub_with_f0.terms, f0.terms)

    if isempty(negative_fj_terms)
        return false
    end

    fj_terms = RootUnity[-t for t in negative_fj_terms]
    fj = Sorou(fj_terms)

    return canonical_rotation(fj) != canonical_rotation(f0)
end

# ------------------------------------------------------------
# Paper-style type string normalization
#
# Our internal show prints:
#
#     (R7 : R3, R3, R3)
#
# The paper often writes:
#
#     (R7 : 3R3)
#
# This helper compresses repeated subsidiary types so comparisons with
# the paper are easier.
# ------------------------------------------------------------

function multiplicity_prefix(n::Int, s::String)
    n == 1 && return s

    # Avoid ambiguous/broken strings like:
    #
    #     2 * "2R3"  -> "22R3"
    #
    # Instead write:
    #
    #     2(2R3)
    #
    # Also parenthesize composite expressions.
    needs_parens =
        startswith(s, "(") ||
        occursin("⊕", s) ||
        occursin(",", s) ||
        occursin(":", s) ||
        occursin(r"^\d", s)

    if needs_parens
        return string(n, "(", s, ")")
    else
        return string(n, s)
    end
end


function paper_type_string(T::VanishingType)
    if T isa RType
        return "R$(T.p)"
    elseif T isa SumType
        parts = [paper_type_string(S) for S in T.parts]
        sort!(parts)

        grouped = String[]
        i = 1

        while i <= length(parts)
            j = i
            while j < length(parts) && parts[j + 1] == parts[i]
                j += 1
            end

            push!(grouped, multiplicity_prefix(j - i + 1, parts[i]))
            i = j + 1
        end

        return join(grouped, " ⊕ ")
    elseif T isa RecursiveType
        subs = [paper_type_string(S) for S in T.subtypes]
        sort!(subs)

        grouped = String[]
        i = 1

        while i <= length(subs)
            j = i
            while j < length(subs) && subs[j + 1] == subs[i]
                j += 1
            end

            push!(grouped, multiplicity_prefix(j - i + 1, subs[i]))
            i = j + 1
        end

        f0_is_one = weight(T.f0) == 1 && T.f0.terms[1] == one(RootUnity)

        if f0_is_one
            if isempty(grouped)
                return "(R$(T.p))"
            else
                return "(R$(T.p) : " * join(grouped, ", ") * ")"
            end
        else
            if isempty(grouped)
                return "(R$(T.p) : $(T.f0))"
            else
                return "(R$(T.p) : $(T.f0) : " * join(grouped, ", ") * ")"
            end
        end
    else
        error("Unknown VanishingType")
    end
end


function catalog_paper_type_strings_of_weight(cat::TypeCatalog, w::Integer)
    out = [paper_type_string(T) for T in catalog_types_of_weight(cat, w)]
    sort!(out)
    return out
end


function write_catalog_paper_type_strings(path::AbstractString, cat::TypeCatalog; weights = nothing)
    selected_weights = if weights === nothing
        sort(collect(keys(cat.by_weight)))
    else
        sort(Int[w for w in weights])
    end

    open(path, "w") do io
        println(io, "VanishingSorou paper-style type strings")
        println(io, "======================================")
        println(io)

        for w in selected_weights
            types = catalog_paper_type_strings_of_weight(cat, w)
            isempty(types) && continue

            println(io, "Weight ", w)
            println(io, repeat("-", 8 + length(string(w))))

            for s in types
                println(io, s)
            end

            println(io)
        end
    end

    return path
end
# ------------------------------------------------------------
# Proposition 2.3 minimality checks
#
# Given a sorou h with squarefree relative order, decompose it as
#
#     h = sum_{j=0}^{p-1} nu_p^j f_j
#
# Then h vanishes iff all val(f_j) are equal.
#
# If h vanishes, Proposition 2.3 says h is minimal vanishing iff:
#
#   (i)   val(f_0) != 0
#   (ii)  no f_j has a proper nonempty vanishing subsorou
#   (iii) there is no z such that every f_j has a proper nonempty
#         subsorou with value z
# ------------------------------------------------------------


# ------------------------------------------------------------
# Exact values in a fixed ambient lower order
#
# Important:
# Do NOT compare exact_value(subbag) directly for arbitrary subbags.
#
# The same algebraic number can be represented differently if computed
# in different smaller cyclotomic fields.
#
# Example:
#   1
# and
#   nu_6 + nu_6^5
#
# are equal as complex numbers, but if we compute their signatures in
# their own minimal fields, they may not look syntactically equal.
#
# So inside Proposition 2.3, every subsidiary subbag is evaluated in
# the common lower-order field coming from the top-prime decomposition.
# ------------------------------------------------------------

function exact_value_in_ambient(b::TermBag, ambient_order::Int)
    ambient_order <= 0 && throw(ArgumentError("ambient_order must be positive"))
    is_squarefree(ambient_order) || throw(ArgumentError("ambient_order must be squarefree"))

    return exact_value_terms_at_order(b.terms, ambient_order)
end


function subsidiary_values(dec)
    return ExactValueSig[
        exact_value_in_ambient(b, dec.lowerorder) for b in dec.bags
    ]
end


function subsidiary_values_are_equal(dec)
    vals = subsidiary_values(dec)
    isempty(vals) && return false

    first_val = vals[1]
    return all(v -> v == first_val, vals)
end


# ------------------------------------------------------------
# Proper nonempty subbags
#
# First naive version:
# We enumerate subsets of positions.
#
# This is exponential, but that is okay for the next testing phase.
# Later we will replace this with memoized subset-value DP.
# ------------------------------------------------------------

function proper_nonempty_subbags(b::TermBag)
    n = length(b)

    if n <= 1
        return TermBag[]
    end

    n >= Sys.WORD_SIZE && throw(ArgumentError(
        "Bag too large for naive bit-mask subset enumeration"
    ))

    seen = Set{TermBag}()

    # Masks:
    #   0              = empty subset, excluded
    #   (1 << n) - 1  = full subset, excluded
    lastmask = (1 << n) - 2

    for mask in 1:lastmask
        terms = RootUnity[]

        for i in 1:n
            if ((mask >> (i - 1)) & 1) == 1
                push!(terms, b[i])
            end
        end

        # b.terms is already sorted, and we select in order,
        # so terms is sorted too.
        push!(seen, TermBag(terms))
    end

    return collect(seen)
end


function has_vanishing_proper_nonempty_subbag(b::TermBag, ambient_order::Int)
    for sub in proper_nonempty_subbags(b)
        if iszero(exact_value_in_ambient(sub, ambient_order))
            return true
        end
    end

    return false
end


function proper_nonempty_subbag_values(b::TermBag, ambient_order::Int)
    vals = Set{ExactValueSig}()

    for sub in proper_nonempty_subbags(b)
        push!(vals, exact_value_in_ambient(sub, ambient_order))
    end

    return vals
end


# ------------------------------------------------------------
# Proposition 2.3 condition checks
# ------------------------------------------------------------

function prop23_condition_i(dec)
    vals = subsidiary_values(dec)
    isempty(vals) && return false

    # Since h vanishes, all subsidiary values should be equal.
    # So checking the first one is enough once equality has been checked.
    return !iszero(vals[1])
end


function prop23_condition_ii(dec)
    for b in dec.bags
        if has_vanishing_proper_nonempty_subbag(b, dec.lowerorder)
            return false
        end
    end

    return true
end


function prop23_condition_iii(dec)
    common_values::Union{Nothing, Set{ExactValueSig}} = nothing

    for b in dec.bags
        vals = proper_nonempty_subbag_values(b, dec.lowerorder)

        # If one subsidiary has no proper nonempty subbags,
        # then there cannot be a common value z appearing in all subsidiaries.
        if isempty(vals)
            return true
        end

        if common_values === nothing
            common_values = vals
        else
            intersect!(common_values, vals)

            if isempty(common_values)
                return true
            end
        end
    end

    # If intersection is nonempty, then there exists a common z,
    # so condition (iii) fails.
    return common_values === nothing || isempty(common_values)
end


function is_minimal_vanishing_prop23(h::Sorou)
    d = relative_order(h)

    # A nonempty sorou of relative order 1 is just repeated 1's,
    # so it cannot vanish.
    d == 1 && return false

    # By Lemma 2.1, minimal vanishing sorou have squarefree relative order.
    # If it is not squarefree, it is definitely not minimal.
    is_squarefree(d) || return false

    dec = decompose_by_top_prime(h)

    # Vanishing criterion from Proposition 2.3:
    # h vanishes iff all subsidiary values are equal.
    subsidiary_values_are_equal(dec) || return false

    # Minimality criteria from Proposition 2.3.
    prop23_condition_i(dec) || return false
    prop23_condition_ii(dec) || return false
    prop23_condition_iii(dec) || return false

    return true
end
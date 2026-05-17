# ------------------------------------------------------------
# Exact recursive value signatures for squarefree-order sorou.
#
# Idea:
# If d = m*p with top prime p, and
#     h = sum_{j=0}^{p-1} ν_p^j f_j,
# then in the basis 1, ν_p, ..., ν_p^(p-2),
# the value is determined by the coefficients
#     val(f_j) - val(f_{p-1}),   j = 0, ..., p-2.
#
# So we recursively store those coefficients as exact lower-order values.
# ------------------------------------------------------------

abstract type ExactValueSig end

struct EVInt <: ExactValueSig
    n::Int
end

struct EVNode <: ExactValueSig
    p::Int
    coeffs::Vector{ExactValueSig}   # length p-1
end

Base.:(==)(a::EVInt, b::EVInt) = a.n == b.n
Base.:(==)(a::EVNode, b::EVNode) = (a.p == b.p && a.coeffs == b.coeffs)
Base.hash(v::EVInt, h::UInt) = hash(v.n, h)
Base.hash(v::EVNode, h::UInt) = hash((v.p, v.coeffs), h)

Base.iszero(v::EVInt) = (v.n == 0)
Base.iszero(v::EVNode) = all(iszero, v.coeffs)

function Base.show(io::IO, v::EVInt)
    print(io, "EVInt(", v.n, ")")
end

function Base.show(io::IO, v::EVNode)
    print(io, "EVNode(p=", v.p, ", coeffs=")
    show(io, v.coeffs)
    print(io, ")")
end

# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------

function terms_order(terms::Vector{RootUnity})
    o = 1
    for t in terms
        o = lcm(o, root_order(t))
    end
    return o
end

zero_like(::EVInt) = EVInt(0)
zero_like(v::EVNode) = EVNode(v.p, [zero_like(c) for c in v.coeffs])

# Normalize: if all coefficients are zero, collapse to EVInt(0)
function normalize_value(v::ExactValueSig)
    if v isa EVInt
        return v
    elseif v isa EVNode
        nv = EVNode(v.p, [normalize_value(c) for c in v.coeffs])
        return iszero(nv) ? EVInt(0) : nv
    else
        error("Unknown ExactValueSig subtype")
    end
end

# Recursive subtraction of exact values in the same lower-order field.
function subtract_values(a::ExactValueSig, b::ExactValueSig)
    if a isa EVInt && b isa EVInt
        return EVInt(a.n - b.n)
    end

    # allow zero to embed into any shape
    if a isa EVInt && iszero(a) && b isa EVNode
        return subtract_values(zero_like(b), b)
    elseif b isa EVInt && iszero(b) && a isa EVNode
        return subtract_values(a, zero_like(a))
    end

    if a isa EVNode && b isa EVNode
        a.p == b.p || throw(ArgumentError("Incompatible exact-value signatures"))
        length(a.coeffs) == length(b.coeffs) || throw(ArgumentError("Incompatible exact-value signatures"))
        out = ExactValueSig[
            subtract_values(a.coeffs[i], b.coeffs[i]) for i in eachindex(a.coeffs)
        ]
        return normalize_value(EVNode(a.p, out))
    end

    throw(ArgumentError("Cannot subtract incompatible exact-value signatures"))
end

# ------------------------------------------------------------
# Main exact value recursion
# ------------------------------------------------------------

function exact_value(h::Sorou)
    return exact_value_terms(h.terms)
end

function exact_value(b::TermBag)
    return exact_value_terms(b.terms)
end

function exact_value_terms(terms::Vector{RootUnity})
    isempty(terms) && return EVInt(0)

    d = terms_order(terms)
    is_squarefree(d) || throw(ArgumentError("Exact recursion currently expects squarefree order; got $d"))

    return exact_value_terms_at_order(terms, d)
end

function exact_value_terms_at_order(terms::Vector{RootUnity}, d::Int)
    isempty(terms) && return EVInt(0)

    # If all terms have order dividing 1, they are all equal to 1.
    if d == 1
        return EVInt(length(terms))
    end

    is_squarefree(d) || throw(ArgumentError("Exact recursion currently expects squarefree order; got $d"))

    p = top_prime(d)
    m = d ÷ p

    # group terms as exp(2πi * (j/p + b/m))
    bags = [RootUnity[] for _ in 1:p]

    inv_m_mod_p = invmod(mod(m, p), p)
    inv_p_mod_m = (m == 1 ? 0 : invmod(mod(p, m), m))

    for t in terms
        d % root_order(t) == 0 || throw(ArgumentError("Term order does not divide ambient order"))

        A = exponent_mod(t, d)

        # Solve A ≡ j*m + b*p mod d
        j = mod(A * inv_m_mod_p, p)
        b = (m == 1 ? 0 : mod(A * inv_p_mod_m, m))

        push!(bags[j + 1], RootUnity(b, max(m, 1)))
    end

    for bag in bags
        sort!(bag)
    end

    lower_vals = [exact_value_terms_at_order(bag, m) for bag in bags]
    ref = lower_vals[end]

    coeffs = ExactValueSig[
        subtract_values(lower_vals[j], ref) for j in 1:(p - 1)
    ]

    return normalize_value(EVNode(p, coeffs))
end

is_vanishing_exact(h::Sorou) = iszero(exact_value(h))
is_vanishing_exact(b::TermBag) = iszero(exact_value(b))
# ------------------------------------------------------------
# Internal bag type: like a sorou, but may be empty.
# Useful for subsidiary slots in Proposition 2.3 decompositions.
# ------------------------------------------------------------

struct TermBag
    terms::Vector{RootUnity}
end

TermBag() = TermBag(RootUnity[])

# Add mathematical equality.

Base.:(==)(a::TermBag, b::TermBag) = a.terms == b.terms
Base.hash(b::TermBag, x::UInt) = hash(b.terms, x)
Base.length(b::TermBag) = length(b.terms)
Base.isempty(b::TermBag) = isempty(b.terms)
Base.iterate(b::TermBag, state...) = iterate(b.terms, state...)
Base.getindex(b::TermBag, i::Int) = b.terms[i]

function Base.show(io::IO, b::TermBag)
    if isempty(b)
        print(io, "∅")
        return
    end

    parts = String[]
    i = 1
    while i <= length(b.terms)
        t = b.terms[i]
        c = 1
        j = i + 1

        while j <= length(b.terms) && b.terms[j] == t
            c += 1
            j += 1
        end

        ts = sprint(show, t)
        push!(parts, c == 1 ? ts : string(c, "*", ts))
        i = j
    end

    print(io, join(parts, " + "))
end

# ------------------------------------------------------------
# Number theory helpers
# ------------------------------------------------------------

function prime_factors_distinct(n::Integer)
    n <= 0 && throw(ArgumentError("n must be positive."))
    x = Int(n)
    fac = Int[]

    d = 2
    while d * d <= x
        if x % d == 0
            push!(fac, d)
            while x % d == 0
                x ÷= d
            end
        end
        d += (d == 2 ? 1 : 2)   # test 2, then odd numbers only
    end

    if x > 1
        push!(fac, x)
    end

    return fac
end

top_prime(n::Integer) = last(prime_factors_distinct(n))

function is_squarefree(n::Integer)
    n <= 0 && throw(ArgumentError("n must be positive."))
    x = Int(n)

    d = 2
    while d * d <= x
        c = 0
        while x % d == 0
            x ÷= d
            c += 1
            c >= 2 && return false
        end
        d += (d == 2 ? 1 : 2)
    end

    return true
end

# Put a root onto a common denominator d.
# Returns A in {0, ..., d-1} such that z = exp(2πi * A/d).
function exponent_mod(z::RootUnity, d::Integer)
    d % z.den == 0 || throw(ArgumentError("root denominator does not divide d"))
    return mod(z.num * (d ÷ z.den), d)
end

# ------------------------------------------------------------
# Proposition 2.3 decomposition
#
# If h has squarefree relative order d and top prime p, then after
# normalization we decompose h as
#     h = sum_{j=0}^{p-1} ν_p^j f_j
# where the terms of each f_j only use primes < p.
# ------------------------------------------------------------

function decompose_by_top_prime(h::Sorou)
    hn = normalize_by_first(h)
    d = relative_order(hn)

    d == 1 && throw(ArgumentError("relative order 1 has no top prime decomposition"))
    is_squarefree(d) || throw(ArgumentError("relative order $d is not squarefree"))

    p = top_prime(d)
    m = d ÷ p

    bags = [TermBag() for _ in 1:p]

    # Since gcd(m, p) = 1, invmod exists.
    inv_m_mod_p = invmod(mod(m, p), p)

    # If m = 1, the lower-level term is always 1.
    inv_p_mod_m = (m == 1 ? 0 : invmod(mod(p, m), m))

    for t in hn.terms
        A = exponent_mod(t, d)

        # Solve A ≡ j*m + b*p (mod p*m)
        j = mod(A * inv_m_mod_p, p)
        b = (m == 1 ? 0 : mod(A * inv_p_mod_m, m))

        push!(bags[j + 1].terms, RootUnity(b, max(m, 1)))
    end

    for bag in bags
        sort!(bag.terms)
    end

    return (
        normalized = hn,
        relorder = d,
        topprime = p,
        lowerorder = m,
        bags = bags,
    )
end

subsidiary_weights(dec) = sort(length.(dec.bags))

# Rebuild a normalized sorou from p subsidiary bags.
function recompose_from_bags(p::Int, bags::Vector{TermBag})
    length(bags) == p || throw(ArgumentError("need exactly p bags"))

    terms = RootUnity[]
    νp = primitive_root(p)

    for j in 0:(p - 1)
        zj = νp^j
        for t in bags[j + 1]
            push!(terms, zj * t)
        end
    end

    return Sorou(terms)
end
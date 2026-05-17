# ------------------------------------------------------------
# Root of unity: exp(2πi * num/den), stored in canonical form.
# Example:
#   RootUnity(1, 3) == ν_3
#   RootUnity(2, 6) is reduced to ν_3
# ------------------------------------------------------------

struct RootUnity
    num::Int
    den::Int

    function RootUnity(num::Integer, den::Integer)
        den == 0 && throw(ArgumentError("Denominator cannot be zero."))

        if den < 0
            num = -num
            den = -den
        end

        num = mod(num, den)

        if num == 0
            return new(0, 1)
        end

        g = gcd(num, den)
        return new(div(num, g), div(den, g))
    end
end

const ONE_ROOT = RootUnity(0, 1)
const NEG_ONE  = RootUnity(1, 2)

primitive_root(n::Integer) =
    n > 0 ? RootUnity(1, n) : throw(ArgumentError("n must be positive."))

root_order(z::RootUnity) = z.den

Base.one(::Type{RootUnity}) = ONE_ROOT
Base.inv(z::RootUnity) = RootUnity(-z.num, z.den)
Base.:-(z::RootUnity) = NEG_ONE * z

function Base.:*(a::RootUnity, b::RootUnity)
    l = lcm(a.den, b.den)
    n = a.num * (l ÷ a.den) + b.num * (l ÷ b.den)
    return RootUnity(n, l)
end

Base.:/(a::RootUnity, b::RootUnity) = a * inv(b)
Base.:^(z::RootUnity, n::Integer) = RootUnity(z.num * n, z.den)

Base.:(==)(a::RootUnity, b::RootUnity) = (a.num == b.num && a.den == b.den)
Base.hash(z::RootUnity, h::UInt) = hash((z.num, z.den), h)

# Sort by angle in [0, 1)
Base.isless(a::RootUnity, b::RootUnity) = a.num * b.den < b.num * a.den

function Base.show(io::IO, z::RootUnity)
    if z.den == 1
        print(io, "1")
    elseif z.num == 1
        print(io, "nu_", z.den)
    else
        print(io, "nu_", z.den, "^", z.num)
    end
end


# Sorou = unordered finite nonempty list of roots of unity.
# Stored canonically as a sorted vector.

struct Sorou
    terms::Vector{RootUnity}

    function Sorou(terms::AbstractVector{<:RootUnity})
        isempty(terms) && throw(ArgumentError("Sorou must be nonempty."))
        v = RootUnity[t for t in terms]
        sort!(v)
        return new(v)
    end
end

# Julia uses object identity so we have to add mathematical identity.

Base.:(==)(a::Sorou, b::Sorou) = a.terms == b.terms
Base.hash(h::Sorou, x::UInt) = hash(h.terms, x)

weight(h::Sorou) = length(h.terms)

function sorou_order(h::Sorou)
    o = 1
    for t in h.terms
        o = lcm(o, root_order(t))
    end
    return o
end

# Equivalent to lcm of all pairwise ratio orders, but faster.
function relative_order(h::Sorou)
    ref = h.terms[1]
    r = 1
    for t in h.terms
        r = lcm(r, root_order(t / ref))
    end
    return r
end

function height(h::Sorou)
    maxmult = 1
    current = 1

    for i in 2:length(h.terms)
        if h.terms[i] == h.terms[i - 1]
            current += 1
            maxmult = max(maxmult, current)
        else
            current = 1
        end
    end

    return maxmult
end

rotate(h::Sorou, z::RootUnity) = Sorou([z * t for t in h.terms])

# Rotate so the first term becomes 1
normalize_by_first(h::Sorou) = rotate(h, inv(h.terms[1]))

function sorou_key(h::Sorou)
    return join(["$(t.num)/$(t.den)" for t in h.terms], ";")
end

function canonical_rotation(h::Sorou)
    best = normalize_by_first(h)
    best_key = sorou_key(best)

    for t in h.terms
        candidate = rotate(h, inv(t))
        candidate_key = sorou_key(candidate)

        if candidate_key < best_key
            best = candidate
            best_key = candidate_key
        end
    end

    return best
end
function canonical_sorou_key(h::Sorou)
    return sorou_key(canonical_rotation(h))
end

Base.:+(a::Sorou, b::Sorou) = Sorou(vcat(a.terms, b.terms))
Base.:-(h::Sorou) = rotate(h, NEG_ONE)
Base.:-(a::Sorou, b::Sorou) = a + (-b)

# Debugging only. Do not use this for final correctness.
function numerical_value(h::Sorou)
    s = 0.0 + 0.0im
    for t in h.terms
        s += cis(2π * t.num / t.den)
    end
    return s
end

function Base.show(io::IO, h::Sorou)
    parts = String[]
    i = 1

    while i <= length(h.terms)
        t = h.terms[i]
        c = 1
        j = i + 1

        while j <= length(h.terms) && h.terms[j] == t
            c += 1
            j += 1
        end

        ts = sprint(show, t)
        push!(parts, c == 1 ? ts : string(c, "*", ts))
        i = j
    end

    print(io, join(parts, " + "))
    
end

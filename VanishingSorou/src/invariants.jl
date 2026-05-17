# ------------------------------------------------------------
# Basic invariants of sorou and type representatives
#
# These are needed before implementing full Algorithm 4.4.
#
# height(h) already exists in core.jl.
#
# Here we add order parity:
#
#     order_parity(h) = (number of odd-order terms,
#                        number of even-order terms)
#
# Since the paper treats the parity pair as unordered up to rotation,
# we also provide unordered_order_parity(h).
# ------------------------------------------------------------


function order_parity(h::Sorou)
    odd_count = 0
    even_count = 0

    for t in h.terms
        if isodd(root_order(t))
            odd_count += 1
        else
            even_count += 1
        end
    end

    return (odd_count, even_count)
end


function unordered_order_parity(h::Sorou)
    a, b = order_parity(h)
    return a >= b ? (a, b) : (b, a)
end


function representative_height(T::VanishingType)
    return height(representative_sorou(T))
end


function representative_order_parity(T::VanishingType)
    return order_parity(representative_sorou(T))
end


function representative_unordered_order_parity(T::VanishingType)
    return unordered_order_parity(representative_sorou(T))
end


function representative_invariants(T::VanishingType)
    h = representative_sorou(T)

    return (
        weight = weight(h),
        height = height(h),
        parity = order_parity(h),
        unordered_parity = unordered_order_parity(h),
    )
end


function catalog_representative_invariant_rows(cat::TypeCatalog)
    rows = NamedTuple[]

    for w in sort(collect(keys(cat.by_weight)))
        for T in catalog_types_of_weight(cat, w)
            inv = representative_invariants(T)

            push!(rows, (
                weight = w,
                type = sprint(show, T),
                height = inv.height,
                parity = inv.parity,
                unordered_parity = inv.unordered_parity,
            ))
        end
    end

    return rows
end


function print_catalog_representative_invariants(cat::TypeCatalog)
    println("Representative invariants")
    println("=========================")

    for row in catalog_representative_invariant_rows(cat)
        println(
            "weight=",
            row.weight,
            " height=",
            row.height,
            " parity=",
            row.parity,
            " unordered=",
            row.unordered_parity,
            " type=",
            row.type,
        )
    end

    return nothing
end


function write_catalog_representative_invariants(path::AbstractString, cat::TypeCatalog)
    open(path, "w") do io
        println(io, "VanishingSorou representative invariants")
        println(io, "=======================================")
        println(io)

        for row in catalog_representative_invariant_rows(cat)
            println(
                io,
                "weight=",
                row.weight,
                " height=",
                row.height,
                " parity=",
                row.parity,
                " unordered=",
                row.unordered_parity,
                " type=",
                row.type,
            )
        end
    end

    return path
end
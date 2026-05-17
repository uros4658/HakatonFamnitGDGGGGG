export example_R3, example_R5_R3, example_R5_R3_slot_form

function example_R3()
    nu3 = primitive_root(3)
    return Sorou([one(RootUnity), nu3, nu3^2])
end

function example_R5_R3()
    nu3 = primitive_root(3)
    nu5 = primitive_root(5)
    return Sorou([nu5, nu5^2, nu5^3, nu5^4, -nu3, -(nu3^2)])
end

# This is already in “slot form” for the decomposition:
# f0=f1=f2=f3=1, f4=nu6 + nu6^5
function example_R5_R3_slot_form()
    nu5 = primitive_root(5)
    nu6 = primitive_root(6)
    return Sorou([
        one(RootUnity),
        nu5,
        nu5^2,
        nu5^3,
        (nu5^4) * nu6,
        (nu5^4) * (nu6^5),
    ])
end
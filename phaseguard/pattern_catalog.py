"""Temporary root-of-unity cancellation pattern catalog.

Based on the classified minimal vanishing types from
"Classifying Minimal Vanishing Sums of Roots of Unity" (pages 18-41).

Each template stores phase_fractions: positions on the unit circle where
the complex vectors sum to zero.  For example R3 has fractions [0, 1/3, 2/3]
because 1 + e^{2πi/3} + e^{4πi/3} = 0.

This module will later be replaced by Vasilije's Julia algorithm output.
"""

PATTERN_CATALOG = [
    # --- prime cycles ---
    {
        "name": "R2",
        "weight": 2,
        "height": 1,
        "phase_fractions": [0.0, 1 / 2],
        "description": "Two opposite roots of unity (1 + (-1) = 0).",
    },
    {
        "name": "R3",
        "weight": 3,
        "height": 1,
        "phase_fractions": [0.0, 1 / 3, 2 / 3],
        "description": "Three equally spaced roots of unity.",
    },
    {
        "name": "R5",
        "weight": 5,
        "height": 1,
        "phase_fractions": [0.0, 1 / 5, 2 / 5, 3 / 5, 4 / 5],
        "description": "Five equally spaced roots of unity.",
    },
    {
        "name": "R7",
        "weight": 7,
        "height": 1,
        "phase_fractions": [0.0, 1 / 7, 2 / 7, 3 / 7, 4 / 7, 5 / 7, 6 / 7],
        "description": "Seven equally spaced roots of unity.",
    },
    # --- composite types ---
    {
        "name": "(R5 : R3)",
        "weight": 7,
        "height": 1,
        "phase_fractions": [0.0, 1 / 5, 2 / 5, 3 / 5, 4 / 5, 1 / 3, 2 / 3],
        "description": (
            "Minimal vanishing pattern combining R5 and R3 structures. "
            "Based on nu5 + nu5^2 + nu5^3 + nu5^4 + 1 + nu3 + nu3^2 = 0."
        ),
    },
    {
        "name": "(R5 : 2R3)",
        "weight": 9,
        "height": 1,
        "phase_fractions": [
            0.0, 1 / 5, 2 / 5, 3 / 5, 4 / 5,
            1 / 3, 2 / 3,
            1 / 15, 11 / 15,
        ],
        "description": "Composite type with R5 base and two R3 subsidiaries.",
    },
    {
        "name": "(R7 : R3)",
        "weight": 9,
        "height": 1,
        "phase_fractions": [
            0.0, 1 / 7, 2 / 7, 3 / 7, 4 / 7, 5 / 7, 6 / 7,
            1 / 3, 2 / 3,
        ],
        "description": "Composite type with R7 base and one R3 subsidiary.",
    },
    {
        "name": "(R7 : R5)",
        "weight": 11,
        "height": 1,
        "phase_fractions": [
            0.0, 1 / 7, 2 / 7, 3 / 7, 4 / 7, 5 / 7, 6 / 7,
            1 / 5, 2 / 5, 3 / 5, 4 / 5,
        ],
        "description": "Composite type with R7 base and one R5 subsidiary.",
    },
]

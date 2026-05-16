"""Phase quantization and pattern matching against the root-of-unity catalog.

Phases are quantized to N=210 (= 2*3*5*7) so that R2, R3, R5, R7, and mixed
patterns all land on exact grid points.

For each catalog template we try every rotation r=0..N-1, find the closest
dominant component for each template slot, and score the match.
"""
from __future__ import annotations

import numpy as np

from pattern_catalog import PATTERN_CATALOG

N_ROOTS: int = 210


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def circular_distance(a: int, b: int, n: int = N_ROOTS) -> int:
    diff = abs(a - b) % n
    return min(diff, n - diff)


def quantize_phase_fraction(phase_fraction: float, n: int = N_ROOTS) -> int:
    return round(phase_fraction * n) % n


# ---------------------------------------------------------------------------
# Main matcher
# ---------------------------------------------------------------------------

def match_patterns(
    components: list[dict],
    catalog: list[dict] | None = None,
    n: int = N_ROOTS,
    tolerance: int = 3,
    max_results: int = 3,
) -> list[dict]:
    """Match dominant components against the catalog of vanishing-sum templates.

    Returns up to *max_results* detected patterns sorted by confidence.
    """
    if catalog is None:
        catalog = PATTERN_CATALOG
    if not components:
        return []

    # Quantize every component once
    for comp in components:
        comp["root_index"] = quantize_phase_fraction(comp["phase_fraction"], n)

    results: list[dict] = []

    for template in catalog:
        template_indices = [
            round(frac * n) % n for frac in template["phase_fractions"]
        ]
        best = _best_rotation_match(components, template_indices, n, tolerance)
        if best is None:
            continue

        matched_comps, rotation, phase_error = best

        # Compute residual: |sum of matched unit vectors|
        angles = [2 * np.pi * c["root_index"] / n for c in matched_comps]
        vec_sum = np.array([np.cos(angles), np.sin(angles)]).sum(axis=1)
        residual = float(np.linalg.norm(vec_sum)) / len(matched_comps)

        amp_score = float(np.mean([c["amplitude"] for c in matched_comps]))

        # Confidence: high when phase_error is low, residual is low, amplitude is high
        confidence = max(0.0, amp_score * (1.0 - phase_error / tolerance) * (1.0 - residual))
        confidence = round(min(confidence, 1.0), 3)

        results.append({
            "type": template["name"],
            "weight": template["weight"],
            "height": template["height"],
            "description": template["description"],
            "matched_components": matched_comps,
            "template_root_indices": template_indices,
            "rotation": rotation,
            "phase_error": round(phase_error, 4),
            "residual": round(residual, 4),
            "confidence": confidence,
        })

    results.sort(key=lambda r: r["confidence"], reverse=True)
    return results[:max_results]


def _best_rotation_match(
    components: list[dict],
    template_indices: list[int],
    n: int,
    tolerance: int,
) -> tuple[list[dict], int, float] | None:
    """Try every rotation and return the best full match, or None."""
    best_score: float | None = None
    best_result: tuple[list[dict], int, float] | None = None

    for r in range(n):
        rotated = [(idx + r) % n for idx in template_indices]
        matched, total_dist = _greedy_assign(components, rotated, n, tolerance)
        if matched is None:
            continue
        avg_dist = total_dist / len(rotated)
        amp = float(np.mean([c["amplitude"] for c in matched]))
        score = amp * (1.0 - avg_dist / (tolerance + 1))
        if best_score is None or score > best_score:
            best_score = score
            best_result = (matched, r, avg_dist)

    return best_result


def _greedy_assign(
    components: list[dict],
    targets: list[int],
    n: int,
    tolerance: int,
) -> tuple[list[dict] | None, float]:
    """Greedily assign one component per target slot. No reuse."""
    used: set[int] = set()
    matched: list[dict] = []
    total_dist = 0.0

    for target in targets:
        best_comp = None
        best_dist = tolerance + 1
        for i, comp in enumerate(components):
            if i in used:
                continue
            d = circular_distance(comp["root_index"], target, n)
            if d < best_dist:
                best_dist = d
                best_comp = i
        if best_comp is None:
            return None, 0.0
        used.add(best_comp)
        matched.append(components[best_comp])
        total_dist += best_dist

    return matched, total_dist


# ---------------------------------------------------------------------------
# Top-level convenience (for future Julia replacement)
# ---------------------------------------------------------------------------

def run_phaseguard_algorithm(
    signal: np.ndarray,
    sample_rate: int,
    mode: str = "temporary",
) -> list[dict]:
    """Dispatch to the appropriate analysis backend.

    mode="temporary"  →  hardcoded pattern catalog (this module)
    mode="julia"      →  future Julia engine (not yet implemented)
    """
    if mode == "julia":
        raise NotImplementedError(
            "Julia engine integration not yet available. "
            "Use mode='temporary' for the MVP."
        )

    from audio_processing import compute_fft, extract_dominant_components

    fft = compute_fft(signal, sample_rate)
    components = extract_dominant_components(
        fft["frequencies"], fft["magnitudes"], fft["phases"],
    )
    return match_patterns(components)

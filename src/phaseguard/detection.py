from __future__ import annotations

from itertools import combinations

import numpy as np


def fft_components(samples: np.ndarray, sample_rate: int) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    window = np.hanning(len(samples)) if len(samples) > 1 else np.ones(len(samples))
    spectrum = np.fft.rfft(samples * window)
    frequencies = np.fft.rfftfreq(len(samples), d=1.0 / sample_rate)
    amplitudes = np.abs(spectrum)
    phases = np.angle(spectrum) % (2 * np.pi)
    return frequencies, amplitudes, phases, spectrum


def dominant_components(
    frequencies: np.ndarray,
    amplitudes: np.ndarray,
    phases: np.ndarray,
    max_components: int = 36,
    root_count: int = 64,
    min_frequency: float = 20.0,
) -> list[dict]:
    if len(frequencies) == 0:
        return []
    mask = frequencies >= min_frequency
    indices = np.where(mask)[0]
    if indices.size == 0:
        return []
    ranked = indices[np.argsort(amplitudes[indices])[-max_components:]][::-1]
    peak = float(np.max(amplitudes[ranked])) if ranked.size else 1.0
    if peak <= 0:
        peak = 1.0
    return [
        {
            "index": int(idx),
            "frequency": round(float(frequencies[idx]), 3),
            "amplitude": round(float(amplitudes[idx] / peak), 6),
            "phase": round(float(phases[idx]), 6),
            "root_index": int(round((float(phases[idx]) % (2 * np.pi)) / (2 * np.pi) * root_count)) % root_count,
        }
        for idx in ranked
    ]


def detect_near_vanishing_groups(
    components: list[dict],
    max_groups: int = 3,
    tolerance: float = 0.42,
) -> list[dict]:
    groups: list[dict] = []
    for combo in combinations(components[:24], 3):
        phases = np.array([item["phase"] for item in combo], dtype=np.float64)
        vectors = np.exp(1j * phases)
        residual = float(abs(np.sum(vectors)) / len(combo))
        harmonic_score = _harmonic_score([item["frequency"] for item in combo])
        if residual <= tolerance or harmonic_score >= 0.92:
            score = max(0.0, 1.0 - residual) * (0.7 + 0.3 * harmonic_score)
            groups.append(_group_from_combo(len(groups) + 1, combo, residual, score))

    groups.sort(key=lambda item: (-item["confidence"], item["residual"]))
    deduped: list[dict] = []
    seen: set[tuple[int, ...]] = set()
    for group in groups:
        key = tuple(group["component_indices"])
        if key not in seen:
            seen.add(key)
            deduped.append(group)
        if len(deduped) >= max_groups:
            break
    if deduped:
        return _renumber_groups(deduped)

    fallback = components[:3]
    if len(fallback) == 3:
        phases = np.array([item["phase"] for item in fallback], dtype=np.float64)
        residual = float(abs(np.sum(np.exp(1j * phases))) / len(fallback))
        return [_group_from_combo(1, tuple(fallback), residual, max(0.1, 1.0 - residual))]
    return []


def unit_circle_points(components: list[dict], groups: list[dict]) -> list[dict]:
    detected: dict[int, int] = {}
    for group in groups:
        for idx in group["component_indices"]:
            detected[idx] = group["group_id"]
    points = []
    for item in components:
        phase = float(item["phase"])
        idx = int(item["index"])
        points.append(
            {
                "x": round(float(np.cos(phase)), 6),
                "y": round(float(np.sin(phase)), 6),
                "phase": round(phase, 6),
                "frequency": item["frequency"],
                "group_id": detected.get(idx),
                "detected": idx in detected,
            }
        )
    return points


def spectrum_points(
    frequencies: np.ndarray,
    amplitudes: np.ndarray,
    groups: list[dict],
    max_points: int = 1200,
) -> list[dict]:
    detected_freqs = {
        round(float(freq), 3)
        for group in groups
        for freq in group.get("frequencies", [])
    }
    step = max(1, int(np.ceil(len(frequencies) / max_points)))
    peak = float(np.max(amplitudes)) if amplitudes.size else 1.0
    if peak <= 0:
        peak = 1.0
    points = []
    for idx in range(0, len(frequencies), step):
        frequency = round(float(frequencies[idx]), 3)
        points.append(
            {
                "frequency": frequency,
                "amplitude": round(float(amplitudes[idx] / peak), 6),
                "detected": any(abs(frequency - detected) <= max(1.0, frequency * 0.002) for detected in detected_freqs),
            }
        )
    return points


def _group_from_combo(group_id: int, combo: tuple[dict, ...], residual: float, confidence: float) -> dict:
    combo_sorted = tuple(sorted(combo, key=lambda item: item["frequency"]))
    return {
        "group_id": group_id,
        "component_indices": [int(item["index"]) for item in combo_sorted],
        "frequencies": [float(item["frequency"]) for item in combo_sorted],
        "phases": [float(item["phase"]) for item in combo_sorted],
        "root_indices": [int(item["root_index"]) for item in combo_sorted],
        "residual": round(float(residual), 6),
        "confidence": round(float(max(0.0, min(1.0, confidence))), 6),
    }


def _renumber_groups(groups: list[dict]) -> list[dict]:
    out = []
    for group_id, group in enumerate(groups, start=1):
        updated = dict(group)
        updated["group_id"] = group_id
        out.append(updated)
    return out


def _harmonic_score(frequencies: list[float]) -> float:
    freqs = sorted(float(f) for f in frequencies if f > 0)
    if len(freqs) != 3:
        return 0.0
    base = freqs[0]
    expected = [base, 2 * base, 3 * base]
    errors = [abs(a - b) / max(b, 1.0) for a, b in zip(freqs, expected)]
    return max(0.0, 1.0 - float(np.mean(errors)) * 6.0)

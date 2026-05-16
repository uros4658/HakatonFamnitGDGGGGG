"""Audio loading, FFT analysis, dominant component extraction, and reconstruction."""
from __future__ import annotations

from pathlib import Path

import numpy as np
import soundfile as sf


# ---------------------------------------------------------------------------
# I/O
# ---------------------------------------------------------------------------

def load_audio(
    file_or_path,
    max_duration: float = 10.0,
) -> tuple[np.ndarray, int]:
    """Load audio, convert to mono, normalize, and trim to *max_duration* seconds."""
    data, sr = sf.read(file_or_path, dtype="float64")
    if data.ndim > 1:
        data = data.mean(axis=1)
    max_samples = int(sr * max_duration)
    if len(data) > max_samples:
        data = data[:max_samples]
    peak = np.max(np.abs(data))
    if peak > 0:
        data = data / peak
    return data, sr


def save_audio(path: str | Path, signal: np.ndarray, sr: int) -> None:
    sf.write(str(path), signal, sr)


# ---------------------------------------------------------------------------
# FFT helpers
# ---------------------------------------------------------------------------

def compute_fft(
    signal: np.ndarray,
    sample_rate: int,
) -> dict:
    """Return spectrum, frequencies, magnitudes, and phases."""
    spectrum = np.fft.rfft(signal)
    frequencies = np.fft.rfftfreq(len(signal), d=1.0 / sample_rate)
    magnitudes = np.abs(spectrum)
    phases = np.angle(spectrum)
    return {
        "spectrum": spectrum,
        "frequencies": frequencies,
        "magnitudes": magnitudes,
        "phases": phases,
    }


def extract_dominant_components(
    frequencies: np.ndarray,
    magnitudes: np.ndarray,
    phases: np.ndarray,
    top_k: int = 30,
    min_freq: float = 20.0,
    max_freq: float = 8000.0,
) -> list[dict]:
    """Return the *top_k* strongest frequency components in [min_freq, max_freq]."""
    mask = (frequencies >= min_freq) & (frequencies <= max_freq)
    indices = np.where(mask)[0]
    if len(indices) == 0:
        return []

    order = np.argsort(magnitudes[indices])[::-1][:top_k]
    selected = indices[order]

    amp_max = magnitudes[selected].max() if len(selected) else 1.0
    if amp_max == 0:
        amp_max = 1.0

    components = []
    for idx in selected:
        phase = float(phases[idx])
        phase_fraction = (phase % (2 * np.pi)) / (2 * np.pi)
        components.append({
            "bin_index": int(idx),
            "frequency": round(float(frequencies[idx]), 2),
            "amplitude": round(float(magnitudes[idx]) / amp_max, 6),
            "phase": round(phase, 4),
            "phase_fraction": round(phase_fraction, 6),
        })
    return components


# ---------------------------------------------------------------------------
# Attenuation & reconstruction
# ---------------------------------------------------------------------------

def attenuate_detected_components(
    signal: np.ndarray,
    sample_rate: int,
    detected_patterns: list[dict],
    attenuation_factor: float = 0.15,
    bandwidth_bins: int = 2,
) -> np.ndarray:
    """Zero-in on matched FFT bins, attenuate them, and reconstruct."""
    spectrum = np.fft.rfft(signal)

    for pattern in detected_patterns:
        for comp in pattern.get("matched_components", []):
            center = comp["bin_index"]
            lo = max(0, center - bandwidth_bins)
            hi = min(len(spectrum), center + bandwidth_bins + 1)
            spectrum[lo:hi] *= attenuation_factor

    cleaned = np.fft.irfft(spectrum, n=len(signal))
    peak = np.max(np.abs(cleaned))
    if peak > 1.0:
        cleaned = cleaned / peak
    return cleaned


# ---------------------------------------------------------------------------
# Synthetic demo audio
# ---------------------------------------------------------------------------

def generate_demo_audio(
    sample_rate: int = 44100,
    duration: float = 5.0,
) -> tuple[np.ndarray, int]:
    """Generate a controlled demo: weak chirp + structured engine hum + noise."""
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)

    # Weak biological-like chirp sweeping 700 → 1200 Hz
    chirp_freq = 700 + 100 * t
    weak_signal = 0.15 * np.sin(2 * np.pi * chirp_freq * t)

    # Structured engine noise at 80/160/240 Hz with R3-like phase offsets
    engine = (
        0.45 * np.sin(2 * np.pi * 80 * t)
        + 0.30 * np.sin(2 * np.pi * 160 * t + 2 * np.pi / 3)
        + 0.20 * np.sin(2 * np.pi * 240 * t + 4 * np.pi / 3)
    )

    noise = 0.03 * np.random.default_rng(42).standard_normal(len(t))

    signal = weak_signal + engine + noise
    peak = np.max(np.abs(signal))
    if peak > 0:
        signal = signal / peak
    return signal, sample_rate

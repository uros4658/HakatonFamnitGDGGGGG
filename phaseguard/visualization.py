"""Visualization helpers for the Streamlit UI."""
from __future__ import annotations

import numpy as np
import matplotlib.pyplot as plt
import matplotlib

matplotlib.use("Agg")


def plot_waveform(
    signal: np.ndarray,
    sample_rate: int,
    title: str = "Waveform",
    max_points: int = 5000,
) -> plt.Figure:
    n = len(signal)
    if n > max_points:
        step = n // max_points
        indices = np.arange(0, n, step)
    else:
        indices = np.arange(n)
    times = indices / sample_rate

    fig, ax = plt.subplots(figsize=(10, 2.5))
    ax.plot(times, signal[indices], linewidth=0.4, color="#1a5276")
    ax.set_xlabel("Time (s)")
    ax.set_ylabel("Amplitude")
    ax.set_title(title)
    ax.set_xlim(times[0], times[-1])
    ax.set_ylim(-1.05, 1.05)
    fig.tight_layout()
    return fig


def plot_spectrum(
    frequencies: np.ndarray,
    magnitudes: np.ndarray,
    detected_bins: set[int] | None = None,
    max_freq: float = 5000.0,
) -> plt.Figure:
    mask = (frequencies > 0) & (frequencies <= max_freq)
    freqs = frequencies[mask]
    mags = magnitudes[mask]
    indices = np.where(mask)[0]

    fig, ax = plt.subplots(figsize=(10, 3))
    ax.plot(freqs, mags, linewidth=0.5, color="#2c3e50", alpha=0.7)

    if detected_bins:
        det_mask = np.isin(indices, list(detected_bins))
        if det_mask.any():
            ax.scatter(
                freqs[det_mask], mags[det_mask],
                color="#e74c3c", s=40, zorder=5, label="Detected interference",
            )
            ax.legend(fontsize=8)

    ax.set_xlabel("Frequency (Hz)")
    ax.set_ylabel("Magnitude")
    ax.set_title("Frequency Spectrum")
    ax.set_xlim(0, max_freq)
    fig.tight_layout()
    return fig


def plot_unit_circle(
    components: list[dict],
    detected_pattern: dict | None = None,
) -> plt.Figure:
    fig, ax = plt.subplots(figsize=(5, 5))

    # Draw unit circle
    theta = np.linspace(0, 2 * np.pi, 200)
    ax.plot(np.cos(theta), np.sin(theta), color="#bdc3c7", linewidth=1)
    ax.axhline(0, color="#ecf0f1", linewidth=0.5)
    ax.axvline(0, color="#ecf0f1", linewidth=0.5)

    # Plot all dominant phase points
    for comp in components:
        angle = comp["phase_fraction"] * 2 * np.pi
        x, y = np.cos(angle), np.sin(angle)
        ax.plot(x, y, "o", color="#95a5a6", markersize=4, alpha=0.5)

    # Highlight matched pattern
    if detected_pattern and detected_pattern.get("matched_components"):
        matched = detected_pattern["matched_components"]
        sum_x, sum_y = 0.0, 0.0
        for comp in matched:
            angle = comp["phase_fraction"] * 2 * np.pi
            x, y = np.cos(angle), np.sin(angle)
            ax.annotate(
                "",
                xy=(x, y), xytext=(0, 0),
                arrowprops=dict(arrowstyle="->", color="#e74c3c", lw=1.8),
            )
            ax.plot(x, y, "o", color="#e74c3c", markersize=7, zorder=5)
            ax.annotate(
                f"{comp['frequency']:.0f} Hz",
                xy=(x, y), fontsize=7,
                xytext=(5, 5), textcoords="offset points",
                color="#c0392b",
            )
            sum_x += x
            sum_y += y

        # Draw residual sum vector
        ax.annotate(
            "",
            xy=(sum_x / len(matched), sum_y / len(matched)),
            xytext=(0, 0),
            arrowprops=dict(arrowstyle="-|>", color="#2ecc71", lw=2.2),
        )
        residual = np.sqrt(sum_x ** 2 + sum_y ** 2) / len(matched)
        ax.set_title(
            f"Detected: {detected_pattern['type']}  |  "
            f"residual = {residual:.3f}",
            fontsize=10,
        )
    else:
        ax.set_title("Phase Components on the Unit Circle", fontsize=10)

    ax.set_xlim(-1.4, 1.4)
    ax.set_ylim(-1.4, 1.4)
    ax.set_aspect("equal")
    ax.grid(True, alpha=0.15)
    fig.tight_layout()
    return fig

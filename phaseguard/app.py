"""
PhaseGuard — Streamlit MVP
==========================
Unsupervised detection and attenuation of structured underwater acoustic
interference using roots-of-unity cancellation patterns.

Run with:  streamlit run app.py
"""
from __future__ import annotations

import io
import tempfile
from pathlib import Path

import numpy as np
import streamlit as st

from audio_processing import (
    load_audio,
    save_audio,
    compute_fft,
    extract_dominant_components,
    attenuate_detected_components,
    generate_demo_audio,
)
from pattern_matching import match_patterns, run_phaseguard_algorithm
from visualization import plot_waveform, plot_spectrum, plot_unit_circle

OUTPUT_DIR = Path(__file__).parent / "outputs"
OUTPUT_DIR.mkdir(exist_ok=True)

# ── Page config ──────────────────────────────────────────────────────────
st.set_page_config(page_title="PhaseGuard", layout="wide")
st.title("PhaseGuard")
st.markdown(
    "**Unsupervised detection and attenuation of structured underwater "
    "acoustic interference.**"
)
st.caption(
    "PhaseGuard transforms audio into frequency and phase components, "
    "matches phase structures against known roots-of-unity cancellation "
    "patterns, attenuates matched components, and reconstructs cleaner audio."
)

st.divider()

# ── Input section ────────────────────────────────────────────────────────
st.header("1 — Input")

col_upload, col_demo = st.columns(2)

with col_upload:
    uploaded = st.file_uploader("Upload a WAV file", type=["wav"])

with col_demo:
    run_demo = st.button("Run controlled demo", use_container_width=True)

# Resolve signal source
signal: np.ndarray | None = None
sample_rate: int = 44100

if uploaded is not None:
    signal, sample_rate = load_audio(uploaded)
    st.success(f"Loaded uploaded audio — {len(signal)/sample_rate:.2f}s @ {sample_rate} Hz")
elif run_demo:
    signal, sample_rate = generate_demo_audio()
    st.success("Generated controlled demo audio (engine hum + weak chirp + noise).")

if signal is None:
    st.info("Upload a WAV file or click **Run controlled demo** to begin.")
    st.stop()

# ── Original audio ───────────────────────────────────────────────────────
st.header("2 — Original Audio")

col_player, col_meta = st.columns([3, 1])
with col_player:
    st.audio(signal, sample_rate=sample_rate)
with col_meta:
    st.metric("Sample rate", f"{sample_rate} Hz")
    st.metric("Duration", f"{len(signal)/sample_rate:.2f} s")

st.pyplot(plot_waveform(signal, sample_rate, title="Original waveform"))

# ── FFT & dominant components ────────────────────────────────────────────
st.header("3 — Frequency Spectrum")

fft_data = compute_fft(signal, sample_rate)
components = extract_dominant_components(
    fft_data["frequencies"], fft_data["magnitudes"], fft_data["phases"],
)

# ── Pattern matching ─────────────────────────────────────────────────────
st.header("4 — Detected Patterns")

detected = match_patterns(components)

if detected:
    for pat in detected:
        with st.expander(
            f"**{pat['type']}**  —  confidence {pat['confidence']:.0%}",
            expanded=True,
        ):
            c1, c2 = st.columns(2)
            c1.markdown(f"**Weight:** {pat['weight']}")
            c1.markdown(f"**Height:** {pat['height']}")
            c2.markdown(f"**Residual:** {pat['residual']:.4f}")
            c2.markdown(f"**Phase error:** {pat['phase_error']:.4f}")

            freqs = ", ".join(
                f"{c['frequency']:.0f} Hz" for c in pat["matched_components"]
            )
            st.markdown(f"**Matched frequencies:** {freqs}")
            st.caption(pat["description"])
else:
    st.warning("No strong structured cancellation pattern detected.")

# Collect detected bin indices for spectrum highlighting
detected_bins: set[int] = set()
for pat in detected:
    for comp in pat.get("matched_components", []):
        detected_bins.add(comp["bin_index"])

st.pyplot(
    plot_spectrum(
        fft_data["frequencies"],
        fft_data["magnitudes"],
        detected_bins=detected_bins if detected_bins else None,
    )
)

# ── Unit circle ──────────────────────────────────────────────────────────
st.header("5 — Unit Circle Visualization")
st.caption(
    "Dominant phase components mapped to the unit circle. "
    "Highlighted vectors form a near-vanishing phase pattern."
)

best_pattern = detected[0] if detected else None
st.pyplot(plot_unit_circle(components, detected_pattern=best_pattern))

# ── Cleaned audio ────────────────────────────────────────────────────────
st.header("6 — Cleaned Audio")

if detected:
    cleaned = attenuate_detected_components(signal, sample_rate, detected)
    st.audio(cleaned, sample_rate=sample_rate)
    st.pyplot(plot_waveform(cleaned, sample_rate, title="Cleaned waveform"))

    # Cleaned spectrum
    fft_clean = compute_fft(cleaned, sample_rate)
    st.pyplot(
        plot_spectrum(
            fft_clean["frequencies"],
            fft_clean["magnitudes"],
            max_freq=5000.0,
        )
    )

    # Download button
    out_path = OUTPUT_DIR / "cleaned_audio.wav"
    save_audio(out_path, cleaned, sample_rate)
    with open(out_path, "rb") as f:
        st.download_button(
            "Download cleaned audio",
            data=f.read(),
            file_name="cleaned_audio.wav",
            mime="audio/wav",
        )

    st.divider()
    st.markdown(
        "The detected components form a known near-vanishing roots-of-unity "
        "pattern. These components were treated as structured periodic "
        "interference candidates and attenuated before reconstructing the audio."
    )
else:
    st.info(
        "No pattern was detected, so no attenuation was applied. "
        "The signal may not contain a clear periodic interference pattern."
    )

# ── Footer ───────────────────────────────────────────────────────────────
st.divider()
st.caption(
    "PhaseGuard uses a temporary subset of classified minimal vanishing "
    "roots-of-unity patterns as templates. "
    "The real algorithm will replace this module."
)

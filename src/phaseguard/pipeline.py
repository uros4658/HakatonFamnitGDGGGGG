from __future__ import annotations

import json
import os
from pathlib import Path
from uuid import uuid4

from .algorithm import run_julia_algorithm
from .audio import AudioData, downsample_waveform, load_wav, make_sample_audio, write_wav
from .detection import (
    detect_near_vanishing_groups,
    dominant_components,
    fft_components,
    spectrum_points,
    unit_circle_points,
)
from .paths import OUTPUT_DIR, SAMPLE_DIR, ensure_runtime_dirs
from .reconstruction import attenuate_detected_components


def analyze_audio_file(path: str | Path, use_julia: bool = True) -> dict:
    ensure_runtime_dirs()
    input_path = Path(path)
    audio = load_wav(input_path)
    frequencies, amplitudes, phases, _ = fft_components(audio.samples, audio.sample_rate)
    components = dominant_components(frequencies, amplitudes, phases)

    analysis = None
    if use_julia:
        analysis = run_julia_algorithm(
            os.environ.get("PHASEGUARD_JULIA_SCRIPT"),
            input_path,
            OUTPUT_DIR / f"{input_path.stem}_analysis.json",
        )
    if not analysis:
        groups = detect_near_vanishing_groups(components)
        analysis = {
            "sample_rate": audio.sample_rate,
            "duration_seconds": round(audio.duration_seconds, 6),
            "dominant_components": components,
            "detected_groups": groups,
            "mode": "python-fallback",
        }
    else:
        analysis.setdefault("dominant_components", components)
        analysis.setdefault("detected_groups", [])
        analysis.setdefault("mode", "julia")

    cleaned = attenuate_detected_components(audio, analysis.get("detected_groups", []))
    run_id = uuid4().hex[:12]
    original_out = OUTPUT_DIR / f"{run_id}_original.wav"
    cleaned_out = OUTPUT_DIR / f"{run_id}_cleaned.wav"
    write_wav(original_out, audio)
    write_wav(cleaned_out, cleaned)

    response = {
        "status": "success",
        "analysis": analysis,
        "original_audio_url": f"/outputs/{original_out.name}",
        "cleaned_audio_url": f"/outputs/{cleaned_out.name}",
        "spectrum": spectrum_points(frequencies, amplitudes, analysis.get("detected_groups", [])),
        "waveform_original": downsample_waveform(audio.samples, audio.sample_rate),
        "waveform_cleaned": downsample_waveform(cleaned.samples, cleaned.sample_rate),
        "unit_circle": unit_circle_points(analysis.get("dominant_components", []), analysis.get("detected_groups", [])),
    }
    _write_analysis_json(OUTPUT_DIR / f"{run_id}_response.json", response)
    return response


def run_sample_demo() -> dict:
    ensure_runtime_dirs()
    sample_path = SAMPLE_DIR / "phaseguard_sample.wav"
    if not sample_path.exists():
        make_sample_audio(sample_path)
    fallback_json = SAMPLE_DIR / "phaseguard_sample_analysis.json"
    response = analyze_audio_file(sample_path, use_julia=False)
    _write_analysis_json(fallback_json, response["analysis"])
    return response


def _write_analysis_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    with open(tmp, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, sort_keys=True)
    tmp.replace(path)

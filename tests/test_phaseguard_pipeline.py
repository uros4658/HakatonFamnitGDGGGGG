from pathlib import Path

import numpy as np

from phaseguard.audio import AudioData, make_sample_audio, write_wav, load_wav
from phaseguard.detection import detect_near_vanishing_groups, dominant_components, fft_components
from phaseguard.pipeline import analyze_audio_file, run_sample_demo
from phaseguard.reconstruction import attenuate_detected_components


def test_sample_demo_returns_frontend_payload():
    result = run_sample_demo()
    assert result["status"] == "success"
    assert result["analysis"]["detected_groups"]
    assert result["cleaned_audio_url"].endswith(".wav")
    assert result["waveform_original"]
    assert result["waveform_cleaned"]
    assert result["spectrum"]
    assert result["unit_circle"]


def test_analyze_audio_file_from_wav(tmp_path: Path):
    wav_path = make_sample_audio(tmp_path / "sample.wav", duration_seconds=0.5, sample_rate=8000)
    result = analyze_audio_file(wav_path, use_julia=False)
    assert result["analysis"]["sample_rate"] == 8000
    assert result["analysis"]["detected_groups"]
    assert result["original_audio_url"].startswith("/outputs/")


def test_fft_detection_finds_group_for_structured_phases(tmp_path: Path):
    wav_path = make_sample_audio(tmp_path / "structured.wav", duration_seconds=1.0, sample_rate=8000)
    audio = load_wav(wav_path)
    frequencies, amplitudes, phases, _ = fft_components(audio.samples, audio.sample_rate)
    components = dominant_components(frequencies, amplitudes, phases, max_components=12)
    groups = detect_near_vanishing_groups(components)
    assert groups
    assert len(groups[0]["frequencies"]) == 3


def test_attenuation_changes_signal_energy():
    sample_rate = 8000
    t = np.linspace(0, 1, sample_rate, endpoint=False)
    samples = np.sin(2 * np.pi * 120 * t)
    audio = AudioData(sample_rate=sample_rate, samples=samples)
    cleaned = attenuate_detected_components(
        audio,
        [{"frequencies": [120.0]}],
        attenuation=0.1,
        bandwidth_hz=2.0,
    )
    assert np.mean(cleaned.samples**2) < np.mean(audio.samples**2)


def test_write_and_load_wav_round_trip(tmp_path: Path):
    path = tmp_path / "roundtrip.wav"
    audio = AudioData(sample_rate=4000, samples=np.array([0.0, 0.5, -0.5]))
    write_wav(path, audio)
    loaded = load_wav(path)
    assert loaded.sample_rate == 4000
    assert loaded.samples.size == 3

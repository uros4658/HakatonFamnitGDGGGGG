from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import numpy as np
from scipy.io import wavfile


@dataclass(frozen=True)
class AudioData:
    sample_rate: int
    samples: np.ndarray

    @property
    def duration_seconds(self) -> float:
        return float(len(self.samples) / self.sample_rate) if self.sample_rate else 0.0


def load_wav(path: str | Path) -> AudioData:
    path = Path(path)
    if path.suffix.lower() != ".wav":
        raise ValueError("Could not process the audio file. Please use a WAV file.")
    sample_rate, data = wavfile.read(path)
    samples = _to_float_mono(data)
    samples = normalize(samples)
    return AudioData(sample_rate=int(sample_rate), samples=samples)


def write_wav(path: str | Path, audio: AudioData) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    clipped = np.clip(audio.samples, -1.0, 1.0)
    wavfile.write(path, audio.sample_rate, (clipped * 32767).astype(np.int16))


def normalize(samples: np.ndarray) -> np.ndarray:
    samples = np.asarray(samples, dtype=np.float64)
    peak = float(np.max(np.abs(samples))) if samples.size else 0.0
    if peak <= 0:
        return samples.astype(np.float64)
    return (samples / peak).astype(np.float64)


def _to_float_mono(data: np.ndarray) -> np.ndarray:
    data = np.asarray(data)
    if data.ndim == 2:
        data = data.mean(axis=1)
    if np.issubdtype(data.dtype, np.integer):
        max_abs = max(abs(np.iinfo(data.dtype).min), np.iinfo(data.dtype).max)
        return data.astype(np.float64) / max_abs
    return data.astype(np.float64)


def downsample_waveform(samples: np.ndarray, sample_rate: int, max_points: int = 2000) -> list[dict]:
    if samples.size == 0:
        return []
    step = max(1, int(np.ceil(samples.size / max_points)))
    reduced = samples[::step]
    return [
        {"time": round(float(i * step / sample_rate), 6), "value": round(float(value), 6)}
        for i, value in enumerate(reduced)
    ]


def make_sample_audio(path: str | Path, duration_seconds: float = 3.0, sample_rate: int = 44100) -> Path:
    path = Path(path)
    t = np.linspace(0.0, duration_seconds, int(sample_rate * duration_seconds), endpoint=False)
    structured = (
        0.42 * np.sin(2 * np.pi * 120 * t + 0.0)
        + 0.34 * np.sin(2 * np.pi * 240 * t + 2 * np.pi / 3)
        + 0.28 * np.sin(2 * np.pi * 360 * t + 4 * np.pi / 3)
    )
    weak_signal = 0.12 * np.sin(2 * np.pi * 735 * t + 0.4)
    slow = 0.05 * np.sin(2 * np.pi * 38 * t)
    samples = normalize(structured + weak_signal + slow)
    write_wav(path, AudioData(sample_rate=sample_rate, samples=samples))
    return path

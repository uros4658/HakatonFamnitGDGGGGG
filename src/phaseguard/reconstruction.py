from __future__ import annotations

import numpy as np

from .audio import AudioData, normalize


def attenuate_detected_components(
    audio: AudioData,
    groups: list[dict],
    attenuation: float = 0.2,
    bandwidth_hz: float = 4.0,
) -> AudioData:
    if audio.samples.size == 0 or not groups:
        return audio
    spectrum = np.fft.rfft(audio.samples)
    frequencies = np.fft.rfftfreq(len(audio.samples), d=1.0 / audio.sample_rate)
    detected = [float(freq) for group in groups for freq in group.get("frequencies", [])]
    for target in detected:
        mask = np.abs(frequencies - target) <= bandwidth_hz
        spectrum[mask] *= attenuation
    cleaned = np.fft.irfft(spectrum, n=len(audio.samples))
    return AudioData(sample_rate=audio.sample_rate, samples=normalize(cleaned))

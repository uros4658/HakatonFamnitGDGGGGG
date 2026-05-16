Below is a **copy-paste instruction prompt** you can give to Codex/Claude/another AI coding model.

It is written as a development command, not as a team plan.

The idea is: **build the whole app before Vasilije’s real algorithm is ready**, using a temporary pattern-matching module based on the paper’s classified minimal vanishing root-of-unity types from pages 18–41. The paper’s Appendix A lists minimal vanishing types up to weight 21, with weight, type, height, and parity metadata. We should use this as a temporary pattern catalog, not as a finished audio algorithm. 

````md
# DEVELOPMENT INSTRUCTIONS FOR PHASEGUARD MVP

You are building a hackathon MVP called PhaseGuard.

The goal is to create an end-to-end demo for underwater audio preprocessing.

The app must:

1. Accept an input audio file.
2. Analyze it in the Fourier domain.
3. Use a temporary root-of-unity cancellation pattern catalog based on the paper "Classifying Minimal Vanishing Sums of Roots of Unity".
4. Detect structured phase-cancellation patterns.
5. Attenuate the corresponding frequency components.
6. Reconstruct and return a cleaned audio file.
7. Show visualizations and a simple explanation.

Do NOT build a neural network.
Do NOT train anything.
Do NOT claim species detection.
Do NOT claim perfect source separation.
The correct claim is: structured periodic interference is detected and attenuated.

---

# 1. Core Product Goal

Build a working prototype with this pipeline:

Raw audio
→ FFT
→ extract dominant frequency/phase components
→ quantize phases to roots of unity
→ match phases against known minimal vanishing root-of-unity patterns
→ mark matched frequency components as structured interference candidates
→ attenuate those FFT bins
→ inverse FFT
→ cleaned audio output

The MVP should work even before the real Julia algorithm is finished.

For now, implement a placeholder "pattern engine" using hardcoded small patterns from the mathematical classification.

---

# 2. Recommended Technology

Use Python.

Recommended stack:

- streamlit for the UI
- numpy
- scipy
- soundfile
- matplotlib
- json
- tempfile
- pathlib

Use Streamlit because it is fastest for a hackathon demo.

The app should be runnable with:

```bash
streamlit run app.py
````

---

# 3. File Structure

Create this structure:

```text
phaseguard/
│
├── app.py
├── audio_processing.py
├── pattern_catalog.py
├── pattern_matching.py
├── visualization.py
├── requirements.txt
│
├── samples/
│   └── optional_sample.wav
│
└── outputs/
    └── cleaned_audio.wav
```

If time is very short, it is acceptable to combine everything into `app.py`, but a modular structure is preferred.

---

# 4. Pattern Catalog

Create a file called `pattern_catalog.py`.

This file contains temporary root-of-unity cancellation templates.

Each template should have:

* name
* weight
* height
* phase fractions
* description

Phase fractions represent positions on the unit circle.

For example:

A phase fraction of `0` means angle `0`.
A phase fraction of `1/3` means angle `2π/3`.
A phase fraction of `2/3` means angle `4π/3`.

Implement at least these templates:

```python
PATTERN_CATALOG = [
    {
        "name": "R3",
        "weight": 3,
        "height": 1,
        "phase_fractions": [0.0, 1/3, 2/3],
        "description": "Three equally spaced roots of unity. Basic cancellation pattern."
    },
    {
        "name": "R5",
        "weight": 5,
        "height": 1,
        "phase_fractions": [0.0, 1/5, 2/5, 3/5, 4/5],
        "description": "Five equally spaced roots of unity."
    },
    {
        "name": "R7",
        "weight": 7,
        "height": 1,
        "phase_fractions": [0.0, 1/7, 2/7, 3/7, 4/7, 5/7, 6/7],
        "description": "Seven equally spaced roots of unity."
    },
    {
        "name": "(R5 : R3)",
        "weight": 6,
        "height": 1,
        "phase_fractions": [1/5, 2/5, 3/5, 4/5, 1/6, 5/6],
        "description": "Minimal vanishing pattern combining an R5-type structure with an R3-type correction."
    }
]
```

Explanation of `(R5 : R3)`:

It is based on the identity:

```text
ν5 + ν5^2 + ν5^3 + ν5^4 - ν3 - ν3^2 = 0
```

The negative R3 terms can be represented as phase fractions `1/6` and `5/6`.

For the MVP, do not implement all patterns up to weight 21.
Only use small patterns because they are easier to match and visualize.

The UI may mention:

"We use a small subset of known minimal vanishing roots-of-unity patterns as temporary templates."

---

# 5. Audio Loading

Create `audio_processing.py`.

Implement a function:

```python
load_audio(file) -> tuple[np.ndarray, int]
```

It should:

* read WAV audio,
* convert stereo to mono,
* normalize amplitude to [-1, 1],
* return signal and sample rate.

If the file is too long, trim to the first 10 seconds for demo speed.

Also implement:

```python
save_audio(path, signal, sample_rate)
```

---

# 6. FFT Analysis

Implement:

```python
compute_fft(signal, sample_rate)
```

It should return:

* rfft complex spectrum
* frequency bins
* magnitudes
* phases

Use:

```python
spectrum = np.fft.rfft(signal)
frequencies = np.fft.rfftfreq(len(signal), d=1/sample_rate)
magnitudes = np.abs(spectrum)
phases = np.angle(spectrum)
```

Ignore DC component.

Ignore very low frequencies below 20 Hz.

Optionally ignore frequencies above 8000 Hz for readability.

---

# 7. Dominant Component Extraction

Implement:

```python
extract_dominant_components(frequencies, magnitudes, phases, top_k=30)
```

Return a list of components:

```json
[
  {
    "bin_index": 123,
    "frequency": 120.0,
    "amplitude": 0.91,
    "phase": 2.10,
    "phase_fraction": 0.334
  }
]
```

The phase fraction is:

```python
phase_fraction = (phase % (2*np.pi)) / (2*np.pi)
```

Normalize amplitudes by the max amplitude.

Only return the top `top_k` strongest bins.

---

# 8. Phase Quantization

Create `pattern_matching.py`.

Implement:

```python
quantize_phase_fraction(phase_fraction, N=210)
```

This maps a phase fraction to the nearest root-of-unity index.

For example:

```python
root_index = round(phase_fraction * N) % N
```

Use `N = 210` because it supports denominators 2, 3, 5, and 7:

```text
210 = 2 * 3 * 5 * 7
```

This allows R3, R5, R7, and mixed patterns to be represented well.

For each component, add:

```json
"root_index": ...
```

---

# 9. Pattern Matching Logic

Implement:

```python
match_patterns(components, pattern_catalog, N=210, tolerance=2)
```

The purpose is to detect whether the dominant phase components contain a rotated version of a known cancellation pattern.

Important: roots-of-unity sums are equivalent up to global rotation.

So for each template:

1. Convert template phase fractions to root indices:

```python
template_indices = [round(frac * N) % N for frac in phase_fractions]
```

2. Try all possible rotations `r` from 0 to N-1:

```python
rotated_template = [(idx + r) % N for idx in template_indices]
```

3. For each rotated template index, find the closest component root index.

4. A component matches if circular distance is <= tolerance.

5. Avoid using the same component twice in one pattern.

6. Compute a score.

Circular distance:

```python
def circular_distance(a, b, N):
    diff = abs(a - b) % N
    return min(diff, N - diff)
```

Scoring idea:

```python
phase_error = average circular distance
amplitude_score = average normalized amplitude of matched components
residual = absolute value of sum of matched complex roots
confidence = combination of low phase_error, low residual, high amplitude_score
```

Return detected patterns:

```json
[
  {
    "type": "R3",
    "weight": 3,
    "height": 1,
    "matched_components": [...],
    "template_root_indices": [...],
    "rotation": 14,
    "phase_error": 0.03,
    "residual": 0.08,
    "confidence": 0.91
  }
]
```

Keep only the top 1–3 strongest detected patterns.

If nothing is detected, return an empty list but do not crash.

---

# 10. Attenuation / Noise Reduction

Implement:

```python
attenuate_detected_components(signal, sample_rate, detected_patterns, attenuation_factor=0.2, bandwidth_bins=2)
```

Process:

1. Compute FFT of the original signal.
2. Collect all FFT bin indices from the matched components.
3. For each matched bin, reduce nearby bins:

```python
spectrum[bin_index - bandwidth_bins : bin_index + bandwidth_bins + 1] *= attenuation_factor
```

4. Apply inverse FFT:

```python
cleaned = np.fft.irfft(spectrum, n=len(signal))
```

5. Normalize cleaned audio to avoid clipping.

Important:

Use attenuation, not full deletion.

Recommended:

```python
attenuation_factor = 0.15 or 0.2
bandwidth_bins = 2
```

This creates a simple noise-reduction effect without too many artifacts.

---

# 11. Demo Mode With Synthetic Audio

Add a fallback/sample demo.

If no file is uploaded, the app should be able to generate a controlled demo signal:

```text
weak biological-like chirp + structured engine hum + random noise
```

Implement:

```python
generate_demo_audio(sample_rate=44100, duration=5)
```

Example:

* weak chirp or sine sweep around 700–1200 Hz,
* engine noise at 80 Hz + 160 Hz + 240 Hz,
* small random noise.

Pseudo-code:

```python
t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)

weak_signal = 0.15 * np.sin(2*np.pi*(700 + 80*t)*t)

engine_noise = (
    0.45 * np.sin(2*np.pi*80*t) +
    0.30 * np.sin(2*np.pi*160*t + 2*np.pi/3) +
    0.20 * np.sin(2*np.pi*240*t + 4*np.pi/3)
)

random_noise = 0.03 * np.random.randn(len(t))

signal = weak_signal + engine_noise + random_noise
```

This is useful because the demo must work reliably.

The UI should have a button:

```text
Run controlled demo
```

---

# 12. Streamlit UI

Create `app.py`.

The UI should have these sections:

## Header

Title:

```text
PhaseGuard
```

Subtitle:

```text
Unsupervised detection and attenuation of structured underwater acoustic interference.
```

Short explanation:

```text
PhaseGuard transforms audio into frequency and phase components, matches phase structures against known roots-of-unity cancellation patterns, attenuates matched components, and reconstructs cleaner audio.
```

## Input

Provide:

* file uploader for WAV files,
* button for controlled demo.

## Original Audio

Show:

* audio player,
* waveform plot,
* basic metadata:

  * sample rate,
  * duration.

## Frequency Spectrum

Show:

* top frequency components,
* highlighted matched frequencies.

## Detected Patterns

Display cards like:

```text
Detected pattern: R3
Weight: 3
Height: 1
Confidence: 0.91
Residual: 0.08
Matched frequencies: 80 Hz, 160 Hz, 240 Hz
```

If no pattern:

```text
No strong structured cancellation pattern detected.
```

## Unit Circle Visualization

Plot:

* unit circle,
* all dominant phase points,
* matched points highlighted,
* arrows from origin,
* optional sum vector.

This is the most important visualization.

## Cleaned Audio

Show:

* cleaned audio player,
* cleaned waveform,
* cleaned spectrum,
* download button for cleaned WAV.

## Explanation

Show a short result explanation:

```text
The detected components form a known near-vanishing roots-of-unity pattern. These components were treated as structured periodic interference candidates and attenuated before reconstructing the audio.
```

---

# 13. Visualization Functions

Create `visualization.py`.

Implement:

```python
plot_waveform(signal, sample_rate, title)
```

Downsample if needed.

Implement:

```python
plot_spectrum(frequencies, magnitudes, detected_bins=None)
```

Show only readable range, for example 0–5000 Hz.

Implement:

```python
plot_unit_circle(components, detected_pattern=None)
```

Draw:

* unit circle,
* points for dominant phases,
* highlighted points for matched pattern,
* arrows from origin to matched points,
* optional resulting vector sum.

Do not overload the plot.
Make it understandable.

---

# 14. JSON-Like Internal Result Object

The app should internally produce a result like this:

```json
{
  "status": "success",
  "sample_rate": 44100,
  "duration_seconds": 5.0,
  "detected_patterns": [
    {
      "type": "R3",
      "weight": 3,
      "height": 1,
      "confidence": 0.91,
      "residual": 0.08,
      "matched_components": [
        {
          "frequency": 80.0,
          "amplitude": 0.95,
          "phase_fraction": 0.02,
          "root_index": 4,
          "bin_index": 9
        }
      ]
    }
  ],
  "cleaned_audio_path": "outputs/cleaned_audio.wav"
}
```

This will later be easy to replace with Vasilije’s real Julia algorithm output.

---

# 15. Prepare for Future Julia Algorithm Integration

Even though the real algorithm is not ready, design the code so that the temporary pattern matcher can later be replaced.

Create a function:

```python
run_phaseguard_algorithm(signal, sample_rate, mode="temporary")
```

For now:

```python
mode="temporary"
```

uses the hardcoded pattern catalog.

Later:

```python
mode="julia"
```

can call Vasilije’s Julia script.

Expected future interface:

```bash
julia phaseguard_engine.jl input.wav output.json
```

So keep the output format similar to the JSON object above.

---

# 16. Acceptance Criteria

The MVP is successful if:

1. The app runs with `streamlit run app.py`.
2. User can upload a WAV file or run a controlled demo.
3. Original audio is shown and playable.
4. FFT spectrum is shown.
5. Dominant phase components are extracted.
6. At least one pattern such as `R3`, `R5`, or `(R5 : R3)` can be detected on controlled demo data.
7. Detected frequencies are attenuated.
8. Cleaned audio is reconstructed and playable.
9. Unit-circle visualization is shown.
10. The app does not crash if no pattern is detected.
11. The cleaned audio can be downloaded.

---

# 17. Important Scientific Wording

Use this wording in the app:

Correct:

```text
Detected structured phase-cancellation pattern.
```

Correct:

```text
Matched roots-of-unity cancellation template.
```

Correct:

```text
Attenuated candidate periodic interference components.
```

Correct:

```text
Reconstructed cleaned audio using inverse FFT.
```

Avoid:

```text
Detected fish.
```

Avoid:

```text
Detected whales.
```

Avoid:

```text
Perfectly removed noise.
```

Avoid:

```text
AI classified marine species.
```

---

# 18. Final User Story

The demo should tell this story:

1. Underwater audio contains weak useful sounds plus strong structured mechanical noise.
2. Periodic noise has structure in the Fourier phase domain.
3. Minimal vanishing sums of roots of unity give known cancellation templates.
4. PhaseGuard matches dominant audio phase components against these templates.
5. Matched components are treated as structured interference candidates.
6. The system attenuates them and reconstructs cleaner audio.
7. The result is easier to inspect.

---

# 19. Final Output

The final deliverable should be a working Streamlit app with:

* upload input,
* controlled demo input,
* original audio player,
* cleaned audio player,
* waveform plots,
* spectrum plots,
* unit-circle plot,
* detected pattern cards,
* download cleaned audio button.

Prioritize end-to-end functionality over mathematical completeness.

Do not implement the full paper classification.
Use only a small hardcoded subset of patterns for the MVP.

The real algorithm can replace this temporary module later.

```

The key idea is that this temporary version should **simulate the role of Vasilije’s algorithm**. Later, when his Julia implementation is ready, you only replace the `pattern_matching.py` part with his real output, while the rest of the system stays the same.
```

# PhaseGuard

Unsupervised detection and attenuation of structured underwater acoustic interference using roots-of-unity cancellation patterns.

Hackathon MVP built with Streamlit.

## Quick start

```bash
pip install -r requirements.txt
python -m streamlit run app.py --server.headless true
```

App runs at `http://localhost:8501`. Upload a WAV file or click "Run controlled demo".

## Project structure

All source lives in the repo root (no `src/` directory):

| File | Purpose |
|---|---|
| `app.py` | Streamlit UI — 6-section pipeline from input to cleaned audio |
| `audio_processing.py` | WAV I/O, FFT, dominant component extraction, attenuation, demo audio generation |
| `pattern_matching.py` | Phase quantization (N=210), rotation-invariant template matching, greedy assignment |
| `pattern_catalog.py` | Hardcoded vanishing-sum templates (R2, R3, R5, R7, composites) |
| `visualization.py` | Matplotlib plots — waveform, spectrum, unit circle |
| `outputs/` | Generated cleaned audio files |

## Pipeline

1. Load audio (mono, normalize, trim to 10s)
2. FFT -> extract top 30 dominant components in 20-8000 Hz
3. Quantize phases to N=210 grid (lcm of 2,3,5,7)
4. For each catalog template, try all 210 rotations, greedily assign components within tolerance=3
5. Score: `amplitude * (1 - phase_error/tolerance) * (1 - residual)`
6. Attenuate matched FFT bins (factor=0.15, bandwidth=+/-2 bins)
7. Inverse FFT -> normalized cleaned audio

## Key conventions

- **Absolute imports only** — `from pattern_catalog import PATTERN_CATALOG`, not relative imports. Scripts run directly from the repo root.
- **N_ROOTS = 210** — Phase quantization grid size. Chosen so R2, R3, R5, R7 patterns all land on exact grid points.
- **matplotlib.use("Agg")** — Headless rendering for Streamlit. Set in `visualization.py`.
- **soundfile** — Used for WAV I/O (not scipy.io.wavfile).

## Pattern catalog

Templates from "Classifying Minimal Vanishing Sums of Roots of Unity":

- **R2**: 2 roots, weight 2, height 1 (half-wave cancellation)
- **R3**: 3 roots, weight 3, height 1 (120-degree spacing)
- **R5**: 5 roots, weight 5, height 1 (72-degree spacing)
- **R7**: 7 roots, weight 7, height 1 (51.4-degree spacing)
- **(R5:R3)**, **(R5:2R3)**, **(R7:R3)**, **(R7:R5)**: Composite patterns with height 2

## Future integration

`run_phaseguard_algorithm(signal, sr, mode="julia")` is a stub for Vasilije's Julia-based algorithm. Currently raises `NotImplementedError`. The temporary Python implementation (`mode="temporary"`) is the active path.

## Team

- **Vasilije** — Algorithm / Julia engine
- **Uros** — Backend / integration
- **Rastko** — Frontend
- **Natalija** — Product / pitch

## Testing

Run the demo to verify the pipeline end-to-end:
- Demo generates engine hum at 80/160/240 Hz with R3 phase offsets + weak chirp at 700 Hz
- Expected: R3 pattern detected with high confidence
- Engine frequencies should be attenuated to ~15%, chirp should be preserved

## Common tasks

- **Add a new pattern**: Add a dict to `PATTERN_CATALOG` in `pattern_catalog.py` with `name`, `weight`, `height`, `phase_fractions` (list of floats 0-1), `description`
- **Tune sensitivity**: Adjust `tolerance` (default 3) in `match_patterns()`, or `attenuation_factor` (default 0.15) in `attenuate_detected_components()`
- **Change component count**: Adjust `top_k` (default 30) in `extract_dominant_components()`

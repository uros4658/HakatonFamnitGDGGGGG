from __future__ import annotations

from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"
SAMPLE_DIR = DATA_DIR / "phaseguard_samples"
OUTPUT_DIR = PROJECT_ROOT / "outputs" / "phaseguard"


def ensure_runtime_dirs() -> None:
    SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

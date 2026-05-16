from __future__ import annotations

import json
import subprocess
from pathlib import Path


def run_julia_algorithm(
    script_path: str | Path | None,
    input_audio_path: str | Path,
    output_json_path: str | Path,
    timeout_seconds: int = 20,
) -> dict | None:
    if not script_path:
        return None
    script = Path(script_path)
    if not script.exists():
        return None
    output_path = Path(output_json_path)
    try:
        completed = subprocess.run(
            ["julia", str(script), str(input_audio_path), str(output_path)],
            check=False,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    if completed.returncode != 0 or not output_path.exists():
        return None
    try:
        with open(output_path, encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, json.JSONDecodeError):
        return None

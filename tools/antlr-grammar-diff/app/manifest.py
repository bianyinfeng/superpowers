from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict


def load_manifest(manifest_path: str) -> Dict[str, Any]:
    path = Path(manifest_path)
    if not path.is_file():
        raise FileNotFoundError(f"Manifest not found: {manifest_path}")
    data = json.loads(path.read_text(encoding="utf-8"))
    if "sources" not in data or not isinstance(data["sources"], list):
        raise ValueError("Manifest must contain a 'sources' array")
    return data

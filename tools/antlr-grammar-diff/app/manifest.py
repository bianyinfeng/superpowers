from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict

BASE_DIR = Path(__file__).resolve().parents[1]


def _resolve_under_root(path: str, root: Path) -> Path:
    resolved = Path(path).expanduser().resolve()
    root_resolved = root.resolve()
    try:
        resolved.relative_to(root_resolved)
    except ValueError as exc:
        raise ValueError(f"Path must be under {root_resolved}: {resolved}") from exc
    return resolved


def load_manifest(manifest_path: str, allowed_root: Path = BASE_DIR) -> Dict[str, Any]:
    path = _resolve_under_root(manifest_path, allowed_root)
    if not path.is_file():
        raise FileNotFoundError(f"Manifest not found: {manifest_path}")
    data = json.loads(path.read_text(encoding="utf-8"))
    if "sources" not in data or not isinstance(data["sources"], list):
        raise ValueError("Manifest must contain a 'sources' array")
    return data

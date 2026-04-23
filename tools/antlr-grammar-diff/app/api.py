from __future__ import annotations

from pathlib import Path, PurePosixPath
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .diff_engine import diff_grammars
from .fetcher import sync_from_manifest

BASE_DIR = Path(__file__).resolve().parents[1]
DEFAULT_MANIFEST = BASE_DIR / "sources.manifest.json"
DEFAULT_ARCHIVE_DIR = BASE_DIR / "data" / "archive"
DEFAULT_REPOS_DIR = BASE_DIR / "data" / "repos"
APP_STATIC_DIR = BASE_DIR / "app" / "static"

app = FastAPI(title="ANTLR Grammar Diff Visualizer", version="0.1.0")
app.mount("/static", StaticFiles(directory=str(APP_STATIC_DIR)), name="static")


def _resolve_archive_file(relative_path: str) -> Path:
    rel = PurePosixPath(relative_path)
    if rel.is_absolute() or ".." in rel.parts:
        raise HTTPException(status_code=400, detail="Invalid archive file path")

    resolved = (DEFAULT_ARCHIVE_DIR / rel).resolve()
    try:
        resolved.relative_to(DEFAULT_ARCHIVE_DIR.resolve())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Path must be under archive directory") from exc

    if resolved.suffix not in {".g4", ".g"}:
        raise HTTPException(status_code=400, detail="Only .g4/.g files are supported")
    return resolved


class SyncRequest(BaseModel):
    mode: str = Field(default="branch_latest")


class DiffRequest(BaseModel):
    file_a: str
    file_b: str
    max_text_diff_lines: int = Field(default=400, ge=1, le=5000)


@app.get("/")
def index() -> FileResponse:
    return FileResponse(str(APP_STATIC_DIR / "index.html"))


@app.get("/api/health")
def health() -> Dict[str, Any]:
    return {"status": "ok"}


@app.get("/api/archive-files")
def archive_files() -> Dict[str, List[str]]:
    root = DEFAULT_ARCHIVE_DIR.resolve()
    if not root.exists():
        return {"files": []}
    files = [str(path.resolve().relative_to(root)) for path in root.rglob("*") if path.suffix in {".g4", ".g"}]
    return {"files": sorted(files)}


@app.post("/api/sync")
def sync(req: SyncRequest) -> Dict[str, Any]:
    try:
        return sync_from_manifest(
            manifest_path=str(DEFAULT_MANIFEST.resolve()),
            archive_dir=str(DEFAULT_ARCHIVE_DIR.resolve()),
            repos_cache_dir=str(DEFAULT_REPOS_DIR.resolve()),
            mode=req.mode,
        )
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/diff")
def diff(req: DiffRequest) -> Dict[str, Any]:
    path_a = _resolve_archive_file(req.file_a)
    path_b = _resolve_archive_file(req.file_b)
    if not path_a.is_file() or not path_b.is_file():
        raise HTTPException(status_code=400, detail="Both file_a and file_b must exist")

    text_a = path_a.read_text(encoding="utf-8", errors="ignore")
    text_b = path_b.read_text(encoding="utf-8", errors="ignore")
    return diff_grammars(text_a, text_b, req.max_text_diff_lines)

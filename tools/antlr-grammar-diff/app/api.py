from __future__ import annotations

from pathlib import Path
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


def _list_archive_file_paths() -> List[Path]:
    root = DEFAULT_ARCHIVE_DIR.resolve()
    if not root.exists():
        return []
    return sorted(path.resolve() for path in root.rglob("*") if path.suffix in {".g4", ".g"})


class SyncRequest(BaseModel):
    mode: str = Field(default="branch_latest")


class DiffRequest(BaseModel):
    file_a_id: int = Field(ge=0)
    file_b_id: int = Field(ge=0)
    max_text_diff_lines: int = Field(default=400, ge=1, le=5000)


@app.get("/")
def index() -> FileResponse:
    return FileResponse(str(APP_STATIC_DIR / "index.html"))


@app.get("/api/health")
def health() -> Dict[str, Any]:
    return {"status": "ok"}


@app.get("/api/archive-files")
def archive_files() -> Dict[str, Any]:
    root = DEFAULT_ARCHIVE_DIR.resolve()
    files = [
        {"id": idx, "path": str(path.relative_to(root))}
        for idx, path in enumerate(_list_archive_file_paths())
    ]
    return {"files": files}


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
    files = _list_archive_file_paths()
    if req.file_a_id >= len(files) or req.file_b_id >= len(files):
        raise HTTPException(status_code=400, detail="Invalid file id")

    path_a = files[req.file_a_id]
    path_b = files[req.file_b_id]
    if not path_a.is_file() or not path_b.is_file():
        raise HTTPException(status_code=400, detail="Both file_a and file_b must exist")

    text_a = path_a.read_text(encoding="utf-8", errors="ignore")
    text_b = path_b.read_text(encoding="utf-8", errors="ignore")
    return diff_grammars(text_a, text_b, req.max_text_diff_lines)

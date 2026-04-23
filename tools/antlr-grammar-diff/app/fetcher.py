from __future__ import annotations

import json
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from .manifest import load_manifest


class FetchError(RuntimeError):
    pass


def _run(cmd: List[str], cwd: Path | None = None) -> str:
    result = subprocess.run(
        cmd,
        cwd=str(cwd) if cwd else None,
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise FetchError(f"Command failed: {' '.join(cmd)}\n{result.stderr.strip()}")
    return result.stdout.strip()


def _ensure_repo(repo_url: str, repo_dir: Path) -> None:
    if not repo_dir.exists():
        repo_dir.parent.mkdir(parents=True, exist_ok=True)
        _run(["git", "clone", repo_url, str(repo_dir)])


def _checkout_ref(repo_dir: Path, mode: str, refs: Dict[str, Any]) -> Dict[str, str]:
    _run(["git", "fetch", "--tags", "origin"], cwd=repo_dir)

    if mode == "tag_fixed":
        tag = refs.get("tag_fixed")
        if not tag:
            raise FetchError("mode=tag_fixed requires refs.tag_fixed in manifest")
        _run(["git", "checkout", "--force", "--detach", tag], cwd=repo_dir)
        sha = _run(["git", "rev-parse", "HEAD"], cwd=repo_dir)
        return {"mode": mode, "ref": tag, "commit_sha": sha, "version": tag}

    branch = refs.get("branch_latest", "main")
    _run(["git", "fetch", "origin", branch], cwd=repo_dir)
    _run(["git", "checkout", "--force", "--detach", "FETCH_HEAD"], cwd=repo_dir)
    sha = _run(["git", "rev-parse", "HEAD"], cwd=repo_dir)
    short_sha = sha[:12]
    return {
        "mode": mode,
        "ref": branch,
        "commit_sha": sha,
        "version": f"{branch}-{short_sha}",
    }


def sync_from_manifest(
    manifest_path: str,
    archive_dir: str,
    repos_cache_dir: str,
    mode: str = "branch_latest",
) -> Dict[str, Any]:
    if mode not in {"branch_latest", "tag_fixed"}:
        raise ValueError("mode must be one of: branch_latest, tag_fixed")

    manifest = load_manifest(manifest_path)
    archive_root = Path(archive_dir)
    repos_root = Path(repos_cache_dir)
    archive_root.mkdir(parents=True, exist_ok=True)
    repos_root.mkdir(parents=True, exist_ok=True)

    report: Dict[str, Any] = {
        "manifest": str(Path(manifest_path).resolve()),
        "mode": mode,
        "synced_at": datetime.now(timezone.utc).isoformat(),
        "sources": [],
    }

    for source in manifest["sources"]:
        engine = source["engine"]
        repo_url = source["repo_url"]
        refs = source.get("refs", {})
        grammars = source.get("grammars", [])
        license_name = source.get("license")

        repo_dir = repos_root / engine
        _ensure_repo(repo_url, repo_dir)
        ref_meta = _checkout_ref(repo_dir, mode, refs)

        version = ref_meta["version"]
        engine_report: Dict[str, Any] = {
            "engine": engine,
            "repo_url": repo_url,
            "license": license_name,
            "mode": ref_meta["mode"],
            "ref": ref_meta["ref"],
            "commit_sha": ref_meta["commit_sha"],
            "version": version,
            "copied": [],
            "warnings": [],
        }

        for grammar in grammars:
            rel_path = grammar["path"]
            grammar_type = grammar.get("type")
            src = repo_dir / rel_path
            if not src.exists():
                engine_report["warnings"].append(f"Missing grammar path: {rel_path}")
                continue
            if src.suffix not in {".g4", ".g"}:
                engine_report["warnings"].append(f"Skip non grammar file: {rel_path}")
                continue

            inferred_type = grammar_type
            if not inferred_type:
                lowered = src.name.lower()
                inferred_type = "lexer" if "lexer" in lowered else "parser"

            dest_dir = archive_root / engine / version / inferred_type
            dest_dir.mkdir(parents=True, exist_ok=True)
            dest = dest_dir / src.name
            shutil.copy2(src, dest)

            engine_report["copied"].append(
                {
                    "source": rel_path,
                    "dest": str(dest.resolve()),
                    "type": inferred_type,
                }
            )

        metadata_path = archive_root / engine / version / "_metadata.json"
        metadata_path.write_text(
            json.dumps(
                {
                    "engine": engine,
                    "repo_url": repo_url,
                    "license": license_name,
                    "mode": ref_meta["mode"],
                    "ref": ref_meta["ref"],
                    "commit_sha": ref_meta["commit_sha"],
                    "version": version,
                    "synced_at": datetime.now(timezone.utc).isoformat(),
                    "files": engine_report["copied"],
                    "warnings": engine_report["warnings"],
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )

        report["sources"].append(engine_report)

    return report

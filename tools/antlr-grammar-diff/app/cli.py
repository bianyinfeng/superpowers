from __future__ import annotations

import argparse
import json
from pathlib import Path

import uvicorn

from .api import DEFAULT_ARCHIVE_DIR, DEFAULT_MANIFEST, DEFAULT_REPOS_DIR
from .diff_engine import diff_grammars
from .fetcher import sync_from_manifest


def cmd_sync(args: argparse.Namespace) -> int:
    report = sync_from_manifest(
        manifest_path=args.manifest,
        archive_dir=args.archive_dir,
        repos_cache_dir=args.repos_cache_dir,
        mode=args.mode,
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


def cmd_diff(args: argparse.Namespace) -> int:
    path_a = Path(args.file_a)
    path_b = Path(args.file_b)
    text_a = path_a.read_text(encoding="utf-8", errors="ignore")
    text_b = path_b.read_text(encoding="utf-8", errors="ignore")
    report = diff_grammars(text_a, text_b, max_text_diff_lines=args.max_text_diff_lines)

    if args.output_json:
        Path(args.output_json).write_text(
            json.dumps(report, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    else:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


def cmd_serve(args: argparse.Namespace) -> int:
    uvicorn.run("app.api:app", host=args.host, port=args.port, reload=False)
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="ANTLR grammar diff visualizer")
    sub = parser.add_subparsers(dest="command", required=True)

    sync_parser = sub.add_parser("sync", help="Sync grammar files from manifest")
    sync_parser.add_argument("--manifest", default=str(DEFAULT_MANIFEST.resolve()))
    sync_parser.add_argument("--archive-dir", default=str(DEFAULT_ARCHIVE_DIR.resolve()))
    sync_parser.add_argument("--repos-cache-dir", default=str(DEFAULT_REPOS_DIR.resolve()))
    sync_parser.add_argument("--mode", choices=["branch_latest", "tag_fixed"], default="branch_latest")
    sync_parser.set_defaults(func=cmd_sync)

    diff_parser = sub.add_parser("diff", help="Diff two grammar files")
    diff_parser.add_argument("--file-a", required=True)
    diff_parser.add_argument("--file-b", required=True)
    diff_parser.add_argument("--output-json")
    diff_parser.add_argument("--max-text-diff-lines", type=int, default=400)
    diff_parser.set_defaults(func=cmd_diff)

    serve_parser = sub.add_parser("serve", help="Start FastAPI web server")
    serve_parser.add_argument("--host", default="127.0.0.1")
    serve_parser.add_argument("--port", type=int, default=8000)
    serve_parser.set_defaults(func=cmd_serve)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())

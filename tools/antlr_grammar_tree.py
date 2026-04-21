#!/usr/bin/env python3
"""
Visualize ANTLR grammar files (.g4/.g) as tree structures.
"""

import argparse
import re
import sys
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path


GRAMMAR_HEADER_RE = re.compile(r"^\s*(lexer|parser)?\s*grammar\s+([A-Za-z_]\w*)\s*;", re.MULTILINE)
IMPORT_RE = re.compile(r"^\s*import\s+([^;]+);", re.MULTILINE)
TOKEN_VOCAB_RE = re.compile(r"tokenVocab\s*=\s*([A-Za-z_]\w*)")


@dataclass
class GrammarFile:
    path: Path
    relative_path: Path
    grammar_name: str
    grammar_type: str
    dependencies: list[str]


def _detect_type(header_type: str | None, filename: str) -> str:
    if header_type in {"lexer", "parser"}:
        return header_type
    lower_name = filename.lower()
    if "lexer" in lower_name:
        return "lexer"
    if "parser" in lower_name:
        return "parser"
    return "combined"


def parse_grammar_file(path: Path, root: Path) -> GrammarFile:
    text = path.read_text(encoding="utf-8", errors="ignore")

    header_match = GRAMMAR_HEADER_RE.search(text)
    header_type = header_match.group(1) if header_match else None
    grammar_name = header_match.group(2) if header_match else path.stem
    grammar_type = _detect_type(header_type, path.name)

    dependencies: list[str] = []
    for match in IMPORT_RE.finditer(text):
        imports = [item.strip() for item in match.group(1).split(",")]
        dependencies.extend([item for item in imports if item])
    dependencies.extend(TOKEN_VOCAB_RE.findall(text))

    deduped_dependencies: list[str] = []
    for dep in dependencies:
        if dep not in deduped_dependencies:
            deduped_dependencies.append(dep)

    return GrammarFile(
        path=path,
        relative_path=path.relative_to(root),
        grammar_name=grammar_name,
        grammar_type=grammar_type,
        dependencies=deduped_dependencies,
    )


def scan_grammar_files(root: Path) -> list[GrammarFile]:
    grammar_paths = sorted(
        [
            path
            for path in root.rglob("*")
            if path.is_file() and path.suffix.lower() in {".g4", ".g"}
        ]
    )
    return [parse_grammar_file(path, root) for path in grammar_paths]


def _print_tree_node(name: str, prefix: str, is_last: bool) -> str:
    branch = "└── " if is_last else "├── "
    return f"{prefix}{branch}{name}"


def render_file_tree(root: Path, grammars: list[GrammarFile]) -> str:
    children_by_dir: dict[Path, set[Path]] = defaultdict(set)
    files_by_dir: dict[Path, list[GrammarFile]] = defaultdict(list)

    for grammar in grammars:
        parent = grammar.relative_path.parent
        files_by_dir[parent].append(grammar)

        current = parent
        while current != Path("."):
            parent_dir = current.parent
            children_by_dir[parent_dir].add(current)
            current = parent_dir

    for directory_files in files_by_dir.values():
        directory_files.sort(key=lambda item: item.relative_path.name.lower())

    lines = [str(root)]

    def walk_dir(directory: Path, prefix: str) -> None:
        child_dirs = sorted(children_by_dir.get(directory, set()), key=lambda p: p.name.lower())
        child_files = files_by_dir.get(directory, [])
        total = len(child_dirs) + len(child_files)

        index = 0
        for child_dir in child_dirs:
            is_last = index == total - 1
            lines.append(_print_tree_node(child_dir.name, prefix, is_last and not child_files))
            walk_dir(child_dir, prefix + ("    " if is_last and not child_files else "│   "))
            index += 1

        for file_index, grammar in enumerate(child_files):
            is_last = index + file_index == total - 1
            label = f"{grammar.relative_path.name} [{grammar.grammar_type}] ({grammar.grammar_name})"
            lines.append(_print_tree_node(label, prefix, is_last))

    walk_dir(Path("."), "")
    return "\n".join(lines)


def render_dependency_tree(grammars: list[GrammarFile]) -> str:
    if not grammars:
        return "No ANTLR grammar files found."

    by_name = {grammar.grammar_name: grammar for grammar in grammars}
    incoming_edges = defaultdict(int)
    for grammar in grammars:
        for dep in grammar.dependencies:
            if dep in by_name:
                incoming_edges[dep] += 1

    roots = sorted(
        [grammar for grammar in grammars if incoming_edges[grammar.grammar_name] == 0],
        key=lambda item: item.grammar_name.lower(),
    )
    if not roots:
        roots = sorted(grammars, key=lambda item: item.grammar_name.lower())

    lines: list[str] = []

    def walk(grammar: GrammarFile, prefix: str, active_path: set[str]) -> None:
        if grammar.grammar_name in active_path:
            lines.append(f"{prefix}↳ {grammar.grammar_name} (cycle)")
            return

        active_path.add(grammar.grammar_name)
        known_children = [dep for dep in grammar.dependencies if dep in by_name]
        missing_children = [dep for dep in grammar.dependencies if dep not in by_name]
        children = known_children + missing_children

        for index, child in enumerate(children):
            is_last = index == len(children) - 1
            line_prefix = "└── " if is_last else "├── "
            next_prefix = prefix + ("    " if is_last else "│   ")

            if child in by_name:
                child_grammar = by_name[child]
                lines.append(
                    f"{prefix}{line_prefix}{child_grammar.grammar_name} "
                    f"[{child_grammar.grammar_type}] ({child_grammar.relative_path})"
                )
                walk(child_grammar, next_prefix, set(active_path))
            else:
                lines.append(f"{prefix}{line_prefix}{child} [missing]")

    for root_index, root in enumerate(roots):
        if root_index > 0:
            lines.append("")
        lines.append(f"{root.grammar_name} [{root.grammar_type}] ({root.relative_path})")
        walk(root, "", set())

    return "\n".join(lines)


def print_implementation_plan() -> str:
    return "\n".join(
        [
            "ANTLR 语法树状可视化工具实现规划：",
            "1. 先做 CLI MVP：递归扫描 .g4/.g，输出目录树 + 依赖树。",
            "2. 增加语法解析：识别 lexer/parser/combined，提取 grammar 名称、import、tokenVocab。",
            "3. 增加质量保障：为解析和树渲染写单元测试，覆盖缺失依赖与循环依赖。",
            "4. 增强可用性：支持 --mode files|deps|both、--plan、非 UTF-8 容错读取。",
            "5. 可选增强：导出 Graphviz/DOT、按目录过滤、监听文件变化自动刷新。",
        ]
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Show ANTLR .g4/.g files as file/dependency trees for debugging."
    )
    parser.add_argument("path", nargs="?", default=".", help="Root directory to scan")
    parser.add_argument(
        "--mode",
        choices=["files", "deps", "both"],
        default="both",
        help="Tree mode to render (default: both)",
    )
    parser.add_argument(
        "--plan",
        action="store_true",
        help="Print an implementation roadmap for evolving this tool",
    )
    args = parser.parse_args()

    root = Path(args.path).resolve()
    if not root.exists():
        print(f"Error: path does not exist: {root}", file=sys.stderr)
        return 1

    if args.plan:
        print(print_implementation_plan())
        print()

    grammars = scan_grammar_files(root)
    if not grammars:
        print(f"No ANTLR grammar files (.g4/.g) found under: {root}")
        return 0

    if args.mode in {"files", "both"}:
        print("File Tree")
        print("=========")
        print(render_file_tree(root, grammars))
        print()

    if args.mode in {"deps", "both"}:
        print("Dependency Tree")
        print("===============")
        print(render_dependency_tree(grammars))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

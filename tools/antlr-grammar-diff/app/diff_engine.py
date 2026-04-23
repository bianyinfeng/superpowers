from __future__ import annotations

import difflib
import re
from collections import Counter
from typing import Any, Dict, List, Set, Tuple

from .grammar_ir import build_edges, parse_grammar_to_ir

SQL_KEYWORDS = {
    "SELECT",
    "FROM",
    "WHERE",
    "GROUP",
    "BY",
    "ORDER",
    "JOIN",
    "LEFT",
    "RIGHT",
    "FULL",
    "INNER",
    "OUTER",
    "INSERT",
    "UPDATE",
    "DELETE",
    "CREATE",
    "DROP",
    "ALTER",
    "TABLE",
    "VIEW",
    "FUNCTION",
    "WITH",
    "UNION",
    "LIMIT",
    "HAVING",
}


def _keyword_counts(text: str) -> Dict[str, int]:
    tokens = re.findall(r"\b[A-Za-z_][A-Za-z0-9_]*\b", text.upper())
    counter = Counter(tok for tok in tokens if tok in SQL_KEYWORDS)
    return dict(sorted(counter.items()))


def _find_rename_candidates(
    removed: List[str],
    added: List[str],
    before_map: Dict[str, str],
    after_map: Dict[str, str],
    threshold: float = 0.80,
) -> List[Dict[str, Any]]:
    candidates: List[Dict[str, Any]] = []
    for old_name in removed:
        for new_name in added:
            ratio = difflib.SequenceMatcher(
                None, before_map[old_name], after_map[new_name]
            ).ratio()
            if ratio >= threshold:
                candidates.append(
                    {
                        "from": old_name,
                        "to": new_name,
                        "similarity": round(ratio, 4),
                    }
                )
    return sorted(candidates, key=lambda x: x["similarity"], reverse=True)


def _subgraph_for_changes(
    changed_nodes: Set[str],
    edges_a: Set[Tuple[str, str]],
    edges_b: Set[Tuple[str, str]],
) -> Dict[str, Any]:
    all_edges = edges_a | edges_b
    neighbor_nodes: Set[str] = set(changed_nodes)

    for src, dst in all_edges:
        if src in changed_nodes or dst in changed_nodes:
            neighbor_nodes.add(src)
            neighbor_nodes.add(dst)

    graph_edges = [
        {"source": src, "target": dst}
        for src, dst in sorted(all_edges)
        if src in neighbor_nodes and dst in neighbor_nodes
    ]

    graph_nodes = [{"id": name, "changed": name in changed_nodes} for name in sorted(neighbor_nodes)]
    return {"nodes": graph_nodes, "edges": graph_edges}


def diff_grammars(text_a: str, text_b: str, max_text_diff_lines: int = 400) -> Dict[str, Any]:
    ir_a = parse_grammar_to_ir(text_a)
    ir_b = parse_grammar_to_ir(text_b)

    names_a = set(ir_a.rules.keys())
    names_b = set(ir_b.rules.keys())

    added = sorted(names_b - names_a)
    removed = sorted(names_a - names_b)

    changed: List[str] = []
    unchanged: List[str] = []

    common = sorted(names_a & names_b)
    for name in common:
        if ir_a.rules[name].normalized_body != ir_b.rules[name].normalized_body:
            changed.append(name)
        else:
            unchanged.append(name)

    changed_details = [
        {
            "rule": name,
            "before": ir_a.rules[name].body,
            "after": ir_b.rules[name].body,
            "type": ir_b.rules[name].rule_type,
        }
        for name in changed
    ]

    before_map = {n: ir_a.rules[n].normalized_body for n in removed}
    after_map = {n: ir_b.rules[n].normalized_body for n in added}
    rename_candidates = _find_rename_candidates(removed, added, before_map, after_map)

    edges_a = build_edges(ir_a)
    edges_b = build_edges(ir_b)

    added_edges = sorted(list(edges_b - edges_a))
    removed_edges = sorted(list(edges_a - edges_b))

    changed_nodes = set(added) | set(removed) | set(changed)

    text_diff = list(
        difflib.unified_diff(
            text_a.splitlines(),
            text_b.splitlines(),
            fromfile="grammar_a",
            tofile="grammar_b",
            lineterm="",
        )
    )

    keyword_a = _keyword_counts(text_a)
    keyword_b = _keyword_counts(text_b)

    return {
        "summary": {
            "rules_before": len(names_a),
            "rules_after": len(names_b),
            "added_rules": len(added),
            "removed_rules": len(removed),
            "changed_rules": len(changed),
            "unchanged_rules": len(unchanged),
            "added_edges": len(added_edges),
            "removed_edges": len(removed_edges),
            "breaking_change_hint": bool(removed or removed_edges),
        },
        "rules": {
            "added": added,
            "removed": removed,
            "changed": changed,
            "changed_details": changed_details,
            "rename_candidates": rename_candidates,
        },
        "structure": {
            "added_edges": [{"source": s, "target": t} for s, t in added_edges],
            "removed_edges": [{"source": s, "target": t} for s, t in removed_edges],
            "changed_subgraph": _subgraph_for_changes(changed_nodes, edges_a, edges_b),
        },
        "text_diff": text_diff[:max_text_diff_lines],
        "keyword_diff": {
            "before": keyword_a,
            "after": keyword_b,
        },
    }

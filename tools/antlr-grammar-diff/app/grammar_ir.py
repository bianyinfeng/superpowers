from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict, Set, Tuple


@dataclass(frozen=True)
class Rule:
    name: str
    body: str
    normalized_body: str
    rule_type: str
    references: Tuple[str, ...]


@dataclass(frozen=True)
class GrammarIR:
    rules: Dict[str, Rule]


def _strip_comments(text: str) -> str:
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    text = re.sub(r"//.*?$", "", text, flags=re.M)
    return text


def _normalize_body(body: str) -> str:
    return re.sub(r"\s+", " ", body).strip()


def parse_grammar_to_ir(text: str) -> GrammarIR:
    content = _strip_comments(text)
    raw_rules: Dict[str, str] = {}
    rule_pattern = re.compile(
        r"(?ms)^\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?:\r?\n\s*)?:\s*(.*?)\s*;"
    )
    for match in rule_pattern.finditer(content):
        raw_rules[match.group(1)] = match.group(2).strip()

    names = set(raw_rules.keys())
    token_pattern = re.compile(r"\b([A-Za-z_][A-Za-z0-9_]*)\b")
    rules: Dict[str, Rule] = {}

    for name, body in raw_rules.items():
        normalized = _normalize_body(body)
        refs = {
            tok
            for tok in token_pattern.findall(body)
            if tok in names and tok != name
        }
        rule_type = "parser" if name[:1].islower() else "lexer"
        rules[name] = Rule(
            name=name,
            body=body,
            normalized_body=normalized,
            rule_type=rule_type,
            references=tuple(sorted(refs)),
        )

    return GrammarIR(rules=rules)


def build_edges(ir: GrammarIR) -> Set[Tuple[str, str]]:
    edges: Set[Tuple[str, str]] = set()
    for rule in ir.rules.values():
        for ref in rule.references:
            edges.add((rule.name, ref))
    return edges

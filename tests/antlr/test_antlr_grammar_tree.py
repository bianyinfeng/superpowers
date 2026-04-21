#!/usr/bin/env python3

import importlib.util
import tempfile
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).resolve().parents[2] / "tools" / "antlr_grammar_tree.py"
SPEC = importlib.util.spec_from_file_location("antlr_grammar_tree", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)  # type: ignore[attr-defined]


class AntlrGrammarTreeTests(unittest.TestCase):
    def test_scan_and_parse_grammar_files(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            (root / "grammars").mkdir()
            (root / "grammars" / "ExprLexer.g4").write_text(
                "lexer grammar ExprLexer;\nA: 'a';\n", encoding="utf-8"
            )
            (root / "grammars" / "ExprParser.g4").write_text(
                "parser grammar ExprParser;\noptions { tokenVocab=ExprLexer; }\n",
                encoding="utf-8",
            )

            grammars = MODULE.scan_grammar_files(root)
            self.assertEqual(len(grammars), 2)

            by_name = {g.grammar_name: g for g in grammars}
            self.assertEqual(by_name["ExprLexer"].grammar_type, "lexer")
            self.assertEqual(by_name["ExprParser"].grammar_type, "parser")
            self.assertIn("ExprLexer", by_name["ExprParser"].dependencies)

    def test_dependency_tree_marks_missing_dependencies(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            (root / "A.g4").write_text("grammar A;\nimport B;\n", encoding="utf-8")

            grammars = MODULE.scan_grammar_files(root)
            output = MODULE.render_dependency_tree(grammars)

            self.assertIn("A [combined]", output)
            self.assertIn("B [missing]", output)


if __name__ == "__main__":
    unittest.main()

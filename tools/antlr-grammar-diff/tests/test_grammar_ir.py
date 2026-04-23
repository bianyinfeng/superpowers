import unittest

from app.grammar_ir import build_edges, parse_grammar_to_ir


GRAMMAR = """
grammar Demo;

query: selectStmt EOF;
selectStmt
  : SELECT columnList FROM tableName
  ;
columnList: IDENTIFIER (',' IDENTIFIER)*;
tableName: IDENTIFIER;

SELECT: 'SELECT';
FROM: 'FROM';
IDENTIFIER: [a-zA-Z_]+;
WS: [ \t\r\n]+ -> skip;
"""


class GrammarIRTest(unittest.TestCase):
    def test_parse_rules_and_edges(self) -> None:
        ir = parse_grammar_to_ir(GRAMMAR)
        self.assertIn("query", ir.rules)
        self.assertIn("selectStmt", ir.rules)
        self.assertIn("SELECT", ir.rules)

        self.assertEqual(ir.rules["query"].rule_type, "parser")
        self.assertEqual(ir.rules["SELECT"].rule_type, "lexer")

        edges = build_edges(ir)
        self.assertIn(("query", "selectStmt"), edges)
        self.assertIn(("selectStmt", "columnList"), edges)


if __name__ == "__main__":
    unittest.main()

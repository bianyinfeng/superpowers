import unittest

from app.diff_engine import diff_grammars


A = """
grammar A;
query: selectStmt EOF;
selectStmt: SELECT col FROM tbl;
col: IDENTIFIER;
tbl: IDENTIFIER;
SELECT: 'SELECT';
FROM: 'FROM';
IDENTIFIER: [a-zA-Z_]+;
"""

B = """
grammar B;
query: selectStmt EOF;
selectStmt: SELECT columnExpr FROM tableExpr WHERE cond;
columnExpr: IDENTIFIER;
tableExpr: IDENTIFIER;
cond: IDENTIFIER;
SELECT: 'SELECT';
FROM: 'FROM';
WHERE: 'WHERE';
IDENTIFIER: [a-zA-Z_]+;
"""


class DiffEngineTest(unittest.TestCase):
    def test_diff_outputs_expected_sections(self) -> None:
        report = diff_grammars(A, B)
        self.assertIn("summary", report)
        self.assertIn("rules", report)
        self.assertIn("structure", report)
        self.assertIn("text_diff", report)

        self.assertIn("col", report["rules"]["removed"])
        self.assertIn("columnExpr", report["rules"]["added"])
        self.assertIn("selectStmt", report["rules"]["changed"])
        self.assertGreaterEqual(report["summary"]["added_rules"], 1)


if __name__ == "__main__":
    unittest.main()

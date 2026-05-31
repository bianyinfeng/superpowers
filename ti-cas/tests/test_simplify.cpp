#include "simplify.h"
#include "parser.h"
#include <cassert>
#include <iostream>

using namespace ti_cas;

void test_constant_folding() {
    auto e = Parser::parse_string("2 + 3");
    auto s = Simplifier::simplify(e);
    assert(s->to_string() == "5");

    e = Parser::parse_string("2 * 3 + 1");
    s = Simplifier::simplify(e);
    assert(s->to_string() == "7");

    std::cout << "  [PASS] constant folding\n";
}

void test_identity_rules() {
    auto e = Parser::parse_string("x + 0");
    auto s = Simplifier::simplify(e);
    assert(s->to_string() == "x");

    e = Parser::parse_string("0 + x");
    s = Simplifier::simplify(e);
    assert(s->to_string() == "x");

    e = Parser::parse_string("x * 1");
    s = Simplifier::simplify(e);
    assert(s->to_string() == "x");

    e = Parser::parse_string("1 * x");
    s = Simplifier::simplify(e);
    assert(s->to_string() == "x");

    e = Parser::parse_string("x * 0");
    s = Simplifier::simplify(e);
    assert(s->to_string() == "0");

    std::cout << "  [PASS] identity rules\n";
}

void test_power_rules() {
    auto e = Parser::parse_string("x ^ 0");
    auto s = Simplifier::simplify(e);
    assert(s->to_string() == "1");

    e = Parser::parse_string("x ^ 1");
    s = Simplifier::simplify(e);
    assert(s->to_string() == "x");

    std::cout << "  [PASS] power rules\n";
}

void test_cancellation() {
    auto e = Parser::parse_string("x - x");
    auto s = Simplifier::simplify(e);
    assert(s->to_string() == "0");

    e = Parser::parse_string("x / x");
    s = Simplifier::simplify(e);
    assert(s->to_string() == "1");

    std::cout << "  [PASS] cancellation\n";
}

void test_function_eval() {
    auto e = Parser::parse_string("sin(0)");
    auto s = Simplifier::simplify(e);
    assert(s->type() == ExprType::Number);
    auto n = std::static_pointer_cast<NumberExpr>(s);
    assert(std::abs(n->value) < 1e-10);

    e = Parser::parse_string("cos(0)");
    s = Simplifier::simplify(e);
    assert(s->type() == ExprType::Number);
    n = std::static_pointer_cast<NumberExpr>(s);
    assert(std::abs(n->value - 1.0) < 1e-10);

    std::cout << "  [PASS] function evaluation\n";
}

int main() {
    std::cout << "Simplification tests:\n";
    test_constant_folding();
    test_identity_rules();
    test_power_rules();
    test_cancellation();
    test_function_eval();
    std::cout << "All simplification tests passed!\n";
    return 0;
}

#include "parser.h"
#include <cassert>
#include <iostream>

using namespace ti_cas;

void test_numbers() {
    auto e = Parser::parse_string("42");
    assert(e->type() == ExprType::Number);
    assert(e->to_string() == "42");

    e = Parser::parse_string("3.14");
    assert(e->type() == ExprType::Number);

    std::cout << "  [PASS] numbers\n";
}

void test_variables() {
    auto e = Parser::parse_string("x");
    assert(e->type() == ExprType::Variable);
    assert(e->to_string() == "x");

    std::cout << "  [PASS] variables\n";
}

void test_binary_ops() {
    auto e = Parser::parse_string("x + 1");
    assert(e->type() == ExprType::BinaryOp);
    assert(e->to_string() == "x + 1");

    e = Parser::parse_string("2 * x");
    assert(e->to_string() == "2*x");

    e = Parser::parse_string("x ^ 2");
    assert(e->to_string() == "x^2");

    std::cout << "  [PASS] binary operations\n";
}

void test_precedence() {
    auto e = Parser::parse_string("2 + 3 * x");
    assert(e->to_string() == "2 + 3*x");

    e = Parser::parse_string("(2 + 3) * x");
    assert(e->to_string() == "(2 + 3)*x");

    std::cout << "  [PASS] precedence\n";
}

void test_functions() {
    auto e = Parser::parse_string("sin(x)");
    assert(e->type() == ExprType::Function);
    assert(e->to_string() == "sin(x)");

    e = Parser::parse_string("cos(2*x + 1)");
    assert(e->to_string() == "cos(2*x + 1)");

    std::cout << "  [PASS] functions\n";
}

void test_complex_expr() {
    auto e = Parser::parse_string("x^2 + 2*x + 1");
    assert(e->to_string() == "x^2 + 2*x + 1");

    e = Parser::parse_string("sin(x)^2 + cos(x)^2");
    assert(e->to_string() == "sin(x)^2 + cos(x)^2");

    std::cout << "  [PASS] complex expressions\n";
}

void test_negative() {
    auto e = Parser::parse_string("-x");
    assert(e->to_string() == "-1*x");

    e = Parser::parse_string("-3");
    assert(e->to_string() == "-3");

    std::cout << "  [PASS] negative values\n";
}

int main() {
    std::cout << "Parser tests:\n";
    test_numbers();
    test_variables();
    test_binary_ops();
    test_precedence();
    test_functions();
    test_complex_expr();
    test_negative();
    std::cout << "All parser tests passed!\n";
    return 0;
}

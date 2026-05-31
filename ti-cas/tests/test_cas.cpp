#include "cas.h"
#include <cassert>
#include <iostream>
#include <cmath>

using namespace ti_cas;

void test_parse_and_simplify() {
    auto r = CAS::simplify("(x + 0) * (1 + 0)");
    assert(r->to_string() == "x");

    r = CAS::simplify("x^2 - x^2");
    assert(r->to_string() == "0");

    std::cout << "  [PASS] parse and simplify\n";
}

void test_evaluate() {
    auto expr = CAS::parse("x^2 + 2*x + 1");
    double val = CAS::evaluate(expr, "x", 3.0);
    assert(std::abs(val - 16.0) < 1e-10); // (3+1)^2 = 16

    expr = CAS::parse("sin(x)^2 + cos(x)^2");
    val = CAS::evaluate(expr, "x", 1.5);
    assert(std::abs(val - 1.0) < 1e-10);

    std::cout << "  [PASS] numerical evaluation\n";
}

void test_nth_derivative() {
    // d^2/dx^2 (x^3) = 6*x
    auto r = CAS::nth_diff("x^3", 2);
    double val = CAS::evaluate(r, "x", 2.0);
    assert(std::abs(val - 12.0) < 1e-10);

    // d^3/dx^3 (x^4) = 24*x
    r = CAS::nth_diff("x^4", 3);
    val = CAS::evaluate(r, "x", 1.0);
    assert(std::abs(val - 24.0) < 1e-10);

    std::cout << "  [PASS] nth derivative\n";
}

void test_substitute() {
    auto expr = CAS::parse("x^2 + y");
    auto result = CAS::substitute(expr, "x", num(3));
    auto simplified = CAS::simplify(result);
    // Should be 9 + y
    auto final_val = CAS::evaluate(simplified, "y", 1.0);
    assert(std::abs(final_val - 10.0) < 1e-10);

    std::cout << "  [PASS] substitution\n";
}

void test_diff_then_integrate() {
    // Differentiating then integrating x^3 should give back x^3
    // (up to constant factor verification via evaluation)
    auto deriv = CAS::diff("x^3"); // 3x^2
    auto integral = CAS::integrate(deriv); // should be x^3

    double val1 = CAS::evaluate(integral, "x", 2.0);
    assert(std::abs(val1 - 8.0) < 1e-10); // 2^3 = 8

    std::cout << "  [PASS] diff then integrate roundtrip\n";
}

void test_multivar() {
    // d/dy (x*y^2) = 2*x*y
    auto r = CAS::diff("x*y^2", "y");
    // Evaluate at x=3, y=2: should be 2*3*2 = 12
    auto sub1 = CAS::substitute(r, "x", num(3));
    double val = CAS::evaluate(sub1, "y", 2.0);
    assert(std::abs(val - 12.0) < 1e-10);

    std::cout << "  [PASS] multivariate differentiation\n";
}

int main() {
    std::cout << "CAS integration tests:\n";
    test_parse_and_simplify();
    test_evaluate();
    test_nth_derivative();
    test_substitute();
    test_diff_then_integrate();
    test_multivar();
    std::cout << "All CAS tests passed!\n";
    return 0;
}

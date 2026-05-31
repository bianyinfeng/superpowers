#include "cas.h"
#include <cassert>
#include <iostream>
#include <cmath>

using namespace ti_cas;

void test_basic_diff() {
    // d/dx (x) = 1
    auto r = CAS::diff("x");
    assert(r->to_string() == "1");

    // d/dx (x^2) = 2*x
    r = CAS::diff("x^2");
    assert(r->to_string() == "2*x");

    // d/dx (x^3) = 3*x^2
    r = CAS::diff("x^3");
    assert(r->to_string() == "3*x^2");

    std::cout << "  [PASS] basic differentiation\n";
}

void test_polynomial_diff() {
    // d/dx (3*x^2 + 2*x + 1) = 6*x + 2
    auto r = CAS::diff("3*x^2 + 2*x + 1");
    std::string result = r->to_string();
    // Verify numerically at x=2
    auto expr = CAS::parse(result);
    double val = CAS::evaluate(expr, "x", 2.0);
    assert(std::abs(val - 14.0) < 1e-10); // 6*2 + 2 = 14

    std::cout << "  [PASS] polynomial differentiation\n";
}

void test_trig_diff() {
    // d/dx sin(x) = cos(x)
    auto r = CAS::diff("sin(x)");
    assert(r->to_string() == "cos(x)");

    // d/dx cos(x) = -sin(x)
    r = CAS::diff("cos(x)");
    // Should simplify to -1*sin(x) or -sin(x)
    auto expr = r;
    double val = CAS::evaluate(expr, "x", 1.0);
    assert(std::abs(val - (-std::sin(1.0))) < 1e-10);

    std::cout << "  [PASS] trigonometric differentiation\n";
}

void test_chain_rule() {
    // d/dx sin(2*x) = 2*cos(2*x)
    auto r = CAS::diff("sin(2*x)");
    double val = CAS::evaluate(r, "x", 1.0);
    assert(std::abs(val - 2.0 * std::cos(2.0)) < 1e-10);

    // d/dx exp(x^2) = 2*x*exp(x^2)
    r = CAS::diff("exp(x^2)");
    val = CAS::evaluate(r, "x", 1.0);
    assert(std::abs(val - 2.0 * std::exp(1.0)) < 1e-10);

    std::cout << "  [PASS] chain rule\n";
}

void test_product_rule() {
    // d/dx (x * sin(x)) = sin(x) + x*cos(x)
    auto r = CAS::diff("x * sin(x)");
    double val = CAS::evaluate(r, "x", 1.0);
    double expected = std::sin(1.0) + 1.0 * std::cos(1.0);
    assert(std::abs(val - expected) < 1e-10);

    std::cout << "  [PASS] product rule\n";
}

void test_quotient_rule() {
    // d/dx (x / (x + 1)) = 1/(x+1)^2
    auto r = CAS::diff("x / (x + 1)");
    double val = CAS::evaluate(r, "x", 2.0);
    double expected = 1.0 / (3.0 * 3.0);
    assert(std::abs(val - expected) < 1e-10);

    std::cout << "  [PASS] quotient rule\n";
}

void test_exp_log_diff() {
    // d/dx exp(x) = exp(x)
    auto r = CAS::diff("exp(x)");
    assert(r->to_string() == "exp(x)");

    // d/dx ln(x) = 1/x
    r = CAS::diff("ln(x)");
    double val = CAS::evaluate(r, "x", 2.0);
    assert(std::abs(val - 0.5) < 1e-10);

    std::cout << "  [PASS] exp/log differentiation\n";
}

int main() {
    std::cout << "Differentiation tests:\n";
    test_basic_diff();
    test_polynomial_diff();
    test_trig_diff();
    test_chain_rule();
    test_product_rule();
    test_quotient_rule();
    test_exp_log_diff();
    std::cout << "All differentiation tests passed!\n";
    return 0;
}

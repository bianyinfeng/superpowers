#include "cas.h"
#include <cassert>
#include <iostream>
#include <cmath>

using namespace ti_cas;

void test_constant_integral() {
    // ∫5 dx = 5*x
    auto r = CAS::integrate("5");
    assert(r->to_string() == "5*x");

    std::cout << "  [PASS] constant integral\n";
}

void test_power_integral() {
    // ∫x dx = x^2/2
    auto r = CAS::integrate("x");
    double val = CAS::evaluate(r, "x", 4.0);
    assert(std::abs(val - 8.0) < 1e-10);

    // ∫x^2 dx = x^3/3
    r = CAS::integrate("x^2");
    val = CAS::evaluate(r, "x", 3.0);
    assert(std::abs(val - 9.0) < 1e-10);

    // ∫x^(-1) dx = ln|x|
    r = CAS::integrate("x^(-1)");
    val = CAS::evaluate(r, "x", M_E);
    assert(std::abs(val - 1.0) < 1e-10);

    std::cout << "  [PASS] power integral\n";
}

void test_trig_integral() {
    // ∫sin(x) dx = -cos(x)
    auto r = CAS::integrate("sin(x)");
    double val1 = CAS::evaluate(r, "x", M_PI);
    double val2 = CAS::evaluate(r, "x", 0.0);
    // definite integral sin from 0 to pi = 2
    assert(std::abs((val1 - val2) - 2.0) < 1e-10);

    // ∫cos(x) dx = sin(x)
    r = CAS::integrate("cos(x)");
    val1 = CAS::evaluate(r, "x", M_PI / 2);
    val2 = CAS::evaluate(r, "x", 0.0);
    assert(std::abs((val1 - val2) - 1.0) < 1e-10);

    std::cout << "  [PASS] trig integral\n";
}

void test_exp_integral() {
    // ∫exp(x) dx = exp(x)
    auto r = CAS::integrate("exp(x)");
    double val = CAS::evaluate(r, "x", 1.0);
    assert(std::abs(val - M_E) < 1e-10);

    std::cout << "  [PASS] exp integral\n";
}

void test_linear_substitution() {
    // ∫sin(2*x) dx = -cos(2*x)/2
    auto r = CAS::integrate("sin(2*x)");
    double val1 = CAS::evaluate(r, "x", M_PI / 2);
    double val2 = CAS::evaluate(r, "x", 0.0);
    // definite integral of sin(2x) from 0 to pi/2 = 1
    assert(std::abs((val1 - val2) - 1.0) < 1e-10);

    std::cout << "  [PASS] linear substitution\n";
}

void test_polynomial_integral() {
    // ∫(3*x^2 + 2*x + 1) dx = x^3 + x^2 + x
    auto r = CAS::integrate("3*x^2 + 2*x + 1");
    double val = CAS::evaluate(r, "x", 2.0);
    // expected: 8 + 4 + 2 = 14
    assert(std::abs(val - 14.0) < 1e-10);

    std::cout << "  [PASS] polynomial integral\n";
}

void test_ln_integral() {
    // ∫ln(x) dx = x*ln(x) - x
    auto r = CAS::integrate("ln(x)");
    double val = CAS::evaluate(r, "x", M_E);
    // e*ln(e) - e = e*1 - e = 0
    assert(std::abs(val) < 1e-10);

    std::cout << "  [PASS] ln integral\n";
}

int main() {
    std::cout << "Integration tests:\n";
    test_constant_integral();
    test_power_integral();
    test_trig_integral();
    test_exp_integral();
    test_linear_substitution();
    test_polynomial_integral();
    test_ln_integral();
    std::cout << "All integration tests passed!\n";
    return 0;
}

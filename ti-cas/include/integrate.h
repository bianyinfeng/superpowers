#ifndef TI_CAS_INTEGRATE_H
#define TI_CAS_INTEGRATE_H

#include "expr.h"
#include "simplify.h"
#include "differentiate.h"

namespace ti_cas {

// Symbolic indefinite integration engine
// Supports: polynomials, basic trig, exponentials, logarithms, and common patterns
class Integrator {
public:
    // Integrate expr with respect to var_name (returns antiderivative, no +C)
    static ExprPtr integrate(const ExprPtr& expr, const std::string& var_name) {
        auto simplified = Simplifier::simplify(expr);
        auto result = try_integrate(simplified, var_name);
        if (!result) {
            throw std::runtime_error("Cannot integrate: " + expr->to_string());
        }
        return Simplifier::simplify(result);
    }

private:
    static bool contains_var(const ExprPtr& expr, const std::string& var_name) {
        switch (expr->type()) {
            case ExprType::Number: return false;
            case ExprType::Variable: {
                auto v = std::static_pointer_cast<VariableExpr>(expr);
                return v->name == var_name;
            }
            case ExprType::UnaryOp: {
                auto u = std::static_pointer_cast<UnaryExpr>(expr);
                return contains_var(u->operand, var_name);
            }
            case ExprType::BinaryOp: {
                auto b = std::static_pointer_cast<BinaryExpr>(expr);
                return contains_var(b->left, var_name) || contains_var(b->right, var_name);
            }
            case ExprType::Function: {
                auto f = std::static_pointer_cast<FunctionExpr>(expr);
                return contains_var(f->arg, var_name);
            }
        }
        return false;
    }

    // Check if expr is a linear function of var: a*var + b, return {a, b} or nullptr
    static bool is_linear(const ExprPtr& expr, const std::string& var_name, double& coeff, double& constant) {
        if (expr->type() == ExprType::Variable) {
            auto v = std::static_pointer_cast<VariableExpr>(expr);
            if (v->name == var_name) { coeff = 1; constant = 0; return true; }
            return false;
        }
        if (expr->type() == ExprType::BinaryOp) {
            auto b = std::static_pointer_cast<BinaryExpr>(expr);
            if (b->op == BinOp::Mul) {
                if (b->left->type() == ExprType::Number && b->right->type() == ExprType::Variable) {
                    auto n = std::static_pointer_cast<NumberExpr>(b->left);
                    auto v = std::static_pointer_cast<VariableExpr>(b->right);
                    if (v->name == var_name) { coeff = n->value; constant = 0; return true; }
                }
            }
            if (b->op == BinOp::Add || b->op == BinOp::Sub) {
                double lc, lconst, rc, rconst;
                bool left_linear = is_linear(b->left, var_name, lc, lconst);
                bool right_linear = is_linear(b->right, var_name, rc, rconst);
                if (!left_linear && !contains_var(b->left, var_name)) {
                    lc = 0;
                    lconst = (b->left->type() == ExprType::Number) ?
                        std::static_pointer_cast<NumberExpr>(b->left)->value : 0;
                    left_linear = (b->left->type() == ExprType::Number);
                }
                if (!right_linear && !contains_var(b->right, var_name)) {
                    rc = 0;
                    rconst = (b->right->type() == ExprType::Number) ?
                        std::static_pointer_cast<NumberExpr>(b->right)->value : 0;
                    right_linear = (b->right->type() == ExprType::Number);
                }
                if (left_linear && right_linear) {
                    if (b->op == BinOp::Add) { coeff = lc + rc; constant = lconst + rconst; }
                    else { coeff = lc - rc; constant = lconst - rconst; }
                    return true;
                }
            }
        }
        return false;
    }

    static ExprPtr try_integrate(const ExprPtr& expr, const std::string& var_name) {
        // Constant (no variable)
        if (!contains_var(expr, var_name)) {
            return mul(expr, var(var_name));
        }

        // Variable itself: ∫x dx = x^2/2
        if (expr->type() == ExprType::Variable) {
            auto v = std::static_pointer_cast<VariableExpr>(expr);
            if (v->name == var_name) {
                return div_expr(pow_expr(var(var_name), num(2)), num(2));
            }
            // Different variable - treat as constant
            return mul(expr, var(var_name));
        }

        // Binary operations
        if (expr->type() == ExprType::BinaryOp) {
            auto b = std::static_pointer_cast<BinaryExpr>(expr);
            return try_integrate_binary(b, var_name);
        }

        // Functions
        if (expr->type() == ExprType::Function) {
            auto f = std::static_pointer_cast<FunctionExpr>(expr);
            return try_integrate_function(f, var_name);
        }

        // Unary
        if (expr->type() == ExprType::UnaryOp) {
            auto u = std::static_pointer_cast<UnaryExpr>(expr);
            if (u->op == UnOp::Neg) {
                auto inner = try_integrate(u->operand, var_name);
                if (inner) return mul(num(-1), inner);
            }
        }

        return nullptr;
    }

    static ExprPtr try_integrate_binary(const std::shared_ptr<BinaryExpr>& b, const std::string& var_name) {
        switch (b->op) {
            case BinOp::Add: {
                // ∫(f + g) = ∫f + ∫g
                auto left = try_integrate(b->left, var_name);
                auto right = try_integrate(b->right, var_name);
                if (left && right) return add(left, right);
                return nullptr;
            }

            case BinOp::Sub: {
                // ∫(f - g) = ∫f - ∫g
                auto left = try_integrate(b->left, var_name);
                auto right = try_integrate(b->right, var_name);
                if (left && right) return sub(left, right);
                return nullptr;
            }

            case BinOp::Mul: {
                // Constant * f(x)
                if (!contains_var(b->left, var_name)) {
                    auto inner = try_integrate(b->right, var_name);
                    if (inner) return mul(b->left, inner);
                }
                if (!contains_var(b->right, var_name)) {
                    auto inner = try_integrate(b->left, var_name);
                    if (inner) return mul(b->right, inner);
                }

                // Try to recognize patterns like x * cos(x^2) -> use substitution hints
                // f'(x) * g(f(x)) pattern (simple substitution)
                return try_substitution(b, var_name);
            }

            case BinOp::Div: {
                // f(x) / constant
                if (!contains_var(b->right, var_name)) {
                    auto inner = try_integrate(b->left, var_name);
                    if (inner) return div_expr(inner, b->right);
                }
                // 1/x -> ln|x|
                if (b->left->is_one() && b->right->type() == ExprType::Variable) {
                    auto v = std::static_pointer_cast<VariableExpr>(b->right);
                    if (v->name == var_name) {
                        return fn("ln", fn("abs", var(var_name)));
                    }
                }
                // 1/f(x) where f is linear: ∫1/(ax+b) = ln|ax+b|/a
                if (b->left->is_one()) {
                    double a, c;
                    if (is_linear(b->right, var_name, a, c)) {
                        return div_expr(fn("ln", fn("abs", b->right)), num(a));
                    }
                }
                // f'(x)/f(x) -> ln|f(x)|
                auto deriv = Differentiator::differentiate(b->right, var_name);
                auto simplified_num = Simplifier::simplify(b->left);
                auto simplified_deriv = Simplifier::simplify(deriv);
                if (simplified_num->to_string() == simplified_deriv->to_string()) {
                    return fn("ln", fn("abs", b->right));
                }
                return nullptr;
            }

            case BinOp::Pow: {
                bool base_has_var = contains_var(b->left, var_name);
                bool exp_has_var = contains_var(b->right, var_name);

                if (base_has_var && !exp_has_var) {
                    // ∫x^n dx = x^(n+1)/(n+1) for n != -1
                    if (b->left->type() == ExprType::Variable) {
                        auto v = std::static_pointer_cast<VariableExpr>(b->left);
                        if (v->name == var_name) {
                            if (b->right->type() == ExprType::Number) {
                                auto n = std::static_pointer_cast<NumberExpr>(b->right);
                                if (std::abs(n->value + 1) < 1e-12) {
                                    // ∫x^(-1) = ln|x|
                                    return fn("ln", fn("abs", var(var_name)));
                                }
                                double new_exp = n->value + 1;
                                return div_expr(pow_expr(var(var_name), num(new_exp)), num(new_exp));
                            }
                        }
                    }
                    // ∫(ax+b)^n dx = (ax+b)^(n+1) / (a*(n+1))
                    double a, c;
                    if (is_linear(b->left, var_name, a, c) && b->right->type() == ExprType::Number) {
                        auto n = std::static_pointer_cast<NumberExpr>(b->right);
                        if (std::abs(n->value + 1) < 1e-12) {
                            return div_expr(fn("ln", fn("abs", b->left)), num(a));
                        }
                        double new_exp = n->value + 1;
                        return div_expr(pow_expr(b->left, num(new_exp)), num(a * new_exp));
                    }
                }

                if (!base_has_var && exp_has_var) {
                    // ∫a^x dx = a^x / ln(a) (for simple variable)
                    if (b->right->type() == ExprType::Variable) {
                        auto v = std::static_pointer_cast<VariableExpr>(b->right);
                        if (v->name == var_name) {
                            return div_expr(
                                pow_expr(b->left, var(var_name)),
                                fn("ln", b->left)
                            );
                        }
                    }
                    // ∫a^(cx) dx = a^(cx) / (c*ln(a))
                    double coeff, constant;
                    if (is_linear(b->right, var_name, coeff, constant) && std::abs(constant) < 1e-12) {
                        return div_expr(
                            pow_expr(b->left, b->right),
                            mul(num(coeff), fn("ln", b->left))
                        );
                    }
                }

                return nullptr;
            }
        }
        return nullptr;
    }

    static ExprPtr try_integrate_function(const std::shared_ptr<FunctionExpr>& f, const std::string& var_name) {
        // Check if arg is simply the variable
        bool arg_is_var = (f->arg->type() == ExprType::Variable &&
                          std::static_pointer_cast<VariableExpr>(f->arg)->name == var_name);

        // Check if arg is linear: a*x + b
        double a = 1, b = 0;
        bool arg_is_linear = is_linear(f->arg, var_name, a, b);

        if (arg_is_var || arg_is_linear) {
            double divisor = arg_is_var ? 1.0 : a;
            ExprPtr u = f->arg;

            ExprPtr antideriv = nullptr;

            if (f->name == "sin") {
                // ∫sin(u) du = -cos(u)
                antideriv = mul(num(-1), fn("cos", u));
            } else if (f->name == "cos") {
                // ∫cos(u) du = sin(u)
                antideriv = fn("sin", u);
            } else if (f->name == "tan") {
                // ∫tan(u) du = -ln|cos(u)|
                antideriv = mul(num(-1), fn("ln", fn("abs", fn("cos", u))));
            } else if (f->name == "exp") {
                // ∫exp(u) du = exp(u)
                antideriv = fn("exp", u);
            } else if (f->name == "ln" || f->name == "log") {
                // ∫ln(u) du = u*ln(u) - u (for u = x only)
                if (arg_is_var) {
                    antideriv = sub(mul(var(var_name), fn("ln", var(var_name))), var(var_name));
                }
            } else if (f->name == "sqrt") {
                // ∫sqrt(u) du = (2/3)*u^(3/2)
                antideriv = mul(div_expr(num(2), num(3)), pow_expr(u, num(1.5)));
            } else if (f->name == "asin") {
                // ∫asin(x) dx = x*asin(x) + sqrt(1-x^2) (for u=x only)
                if (arg_is_var) {
                    antideriv = add(
                        mul(var(var_name), fn("asin", var(var_name))),
                        fn("sqrt", sub(num(1), pow_expr(var(var_name), num(2))))
                    );
                }
            } else if (f->name == "acos") {
                // ∫acos(x) dx = x*acos(x) - sqrt(1-x^2) (for u=x only)
                if (arg_is_var) {
                    antideriv = sub(
                        mul(var(var_name), fn("acos", var(var_name))),
                        fn("sqrt", sub(num(1), pow_expr(var(var_name), num(2))))
                    );
                }
            } else if (f->name == "atan") {
                // ∫atan(x) dx = x*atan(x) - ln(1+x^2)/2 (for u=x only)
                if (arg_is_var) {
                    antideriv = sub(
                        mul(var(var_name), fn("atan", var(var_name))),
                        div_expr(fn("ln", add(num(1), pow_expr(var(var_name), num(2)))), num(2))
                    );
                }
            }

            if (antideriv) {
                if (std::abs(divisor - 1.0) < 1e-12) return antideriv;
                return div_expr(antideriv, num(divisor));
            }
        }

        return nullptr;
    }

    // Attempt simple u-substitution: ∫f'(g(x)) * g'(x) dx = f(g(x))
    static ExprPtr try_substitution(const std::shared_ptr<BinaryExpr>& product, const std::string& var_name) {
        // Try: left = scalar * derivative, right = integrable function, or vice versa
        // Pattern: c * x^n * f(x^(n+1)) type patterns

        // Simple case: x * x^n = x^(n+1) pattern is handled by power rule
        // For now, try: if one factor is the derivative of the inner function of the other

        // Check if it matches pattern: g'(x) * f(g(x))
        // or: f(g(x)) * g'(x)

        return nullptr; // Complex substitution not yet implemented
    }
};

} // namespace ti_cas

#endif // TI_CAS_INTEGRATE_H

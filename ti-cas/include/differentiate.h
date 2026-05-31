#ifndef TI_CAS_DIFFERENTIATE_H
#define TI_CAS_DIFFERENTIATE_H

#include "expr.h"
#include "simplify.h"

namespace ti_cas {

// Symbolic differentiation using standard calculus rules
class Differentiator {
public:
    // Differentiate expr with respect to variable var_name
    static ExprPtr differentiate(const ExprPtr& expr, const std::string& var_name) {
        ExprPtr result = diff(expr, var_name);
        return Simplifier::simplify(result);
    }

private:
    static bool contains_var(const ExprPtr& expr, const std::string& var_name) {
        switch (expr->type()) {
            case ExprType::Number:
                return false;
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

    static ExprPtr diff(const ExprPtr& expr, const std::string& var_name) {
        switch (expr->type()) {
            case ExprType::Number:
                return num(0);

            case ExprType::Variable: {
                auto v = std::static_pointer_cast<VariableExpr>(expr);
                return (v->name == var_name) ? num(1) : num(0);
            }

            case ExprType::UnaryOp: {
                auto u = std::static_pointer_cast<UnaryExpr>(expr);
                if (u->op == UnOp::Neg) {
                    return mul(num(-1), diff(u->operand, var_name));
                }
                return num(0);
            }

            case ExprType::BinaryOp: {
                auto b = std::static_pointer_cast<BinaryExpr>(expr);
                return diff_binary(b, var_name);
            }

            case ExprType::Function: {
                auto f = std::static_pointer_cast<FunctionExpr>(expr);
                return diff_function(f, var_name);
            }
        }
        return num(0);
    }

    static ExprPtr diff_binary(const std::shared_ptr<BinaryExpr>& b, const std::string& var_name) {
        auto dl = diff(b->left, var_name);
        auto dr = diff(b->right, var_name);

        switch (b->op) {
            case BinOp::Add:
                // d/dx (f + g) = f' + g'
                return add(dl, dr);

            case BinOp::Sub:
                // d/dx (f - g) = f' - g'
                return sub(dl, dr);

            case BinOp::Mul:
                // Product rule: d/dx (f * g) = f'*g + f*g'
                return add(mul(dl, b->right), mul(b->left, dr));

            case BinOp::Div:
                // Quotient rule: d/dx (f/g) = (f'*g - f*g') / g^2
                return div_expr(
                    sub(mul(dl, b->right), mul(b->left, dr)),
                    pow_expr(b->right, num(2))
                );

            case BinOp::Pow: {
                bool base_has_var = contains_var(b->left, var_name);
                bool exp_has_var = contains_var(b->right, var_name);

                if (!base_has_var && !exp_has_var) {
                    // Constant
                    return num(0);
                } else if (base_has_var && !exp_has_var) {
                    // Power rule: d/dx (f^n) = n * f^(n-1) * f'
                    return mul(mul(b->right, pow_expr(b->left, sub(b->right, num(1)))), dl);
                } else if (!base_has_var && exp_has_var) {
                    // Exponential rule: d/dx (a^g) = a^g * ln(a) * g'
                    return mul(mul(expr_from_binary(b), fn("ln", b->left)), dr);
                } else {
                    // General case: d/dx (f^g) = f^g * (g' * ln(f) + g * f'/f)
                    auto base_expr = expr_from_binary(b);
                    return mul(base_expr,
                        add(mul(dr, fn("ln", b->left)),
                            mul(b->right, div_expr(dl, b->left))));
                }
            }
        }
        return num(0);
    }

    static ExprPtr expr_from_binary(const std::shared_ptr<BinaryExpr>& b) {
        return std::make_shared<BinaryExpr>(b->op, b->left, b->right);
    }

    static ExprPtr diff_function(const std::shared_ptr<FunctionExpr>& f, const std::string& var_name) {
        auto inner_diff = diff(f->arg, var_name);

        // Chain rule: d/dx f(g(x)) = f'(g(x)) * g'(x)
        ExprPtr outer_diff;

        if (f->name == "sin") {
            // d/dx sin(u) = cos(u)
            outer_diff = fn("cos", f->arg);
        } else if (f->name == "cos") {
            // d/dx cos(u) = -sin(u)
            outer_diff = mul(num(-1), fn("sin", f->arg));
        } else if (f->name == "tan") {
            // d/dx tan(u) = 1/cos^2(u) = sec^2(u)
            outer_diff = div_expr(num(1), pow_expr(fn("cos", f->arg), num(2)));
        } else if (f->name == "exp") {
            // d/dx exp(u) = exp(u)
            outer_diff = fn("exp", f->arg);
        } else if (f->name == "ln" || f->name == "log") {
            // d/dx ln(u) = 1/u
            outer_diff = div_expr(num(1), f->arg);
        } else if (f->name == "sqrt") {
            // d/dx sqrt(u) = 1/(2*sqrt(u))
            outer_diff = div_expr(num(1), mul(num(2), fn("sqrt", f->arg)));
        } else if (f->name == "asin") {
            // d/dx asin(u) = 1/sqrt(1 - u^2)
            outer_diff = div_expr(num(1), fn("sqrt", sub(num(1), pow_expr(f->arg, num(2)))));
        } else if (f->name == "acos") {
            // d/dx acos(u) = -1/sqrt(1 - u^2)
            outer_diff = div_expr(num(-1), fn("sqrt", sub(num(1), pow_expr(f->arg, num(2)))));
        } else if (f->name == "atan") {
            // d/dx atan(u) = 1/(1 + u^2)
            outer_diff = div_expr(num(1), add(num(1), pow_expr(f->arg, num(2))));
        } else if (f->name == "abs") {
            // d/dx |u| = u/|u| (signum)
            outer_diff = div_expr(f->arg, fn("abs", f->arg));
        } else {
            throw std::runtime_error("Cannot differentiate unknown function: " + f->name);
        }

        return mul(outer_diff, inner_diff);
    }
};

} // namespace ti_cas

#endif // TI_CAS_DIFFERENTIATE_H

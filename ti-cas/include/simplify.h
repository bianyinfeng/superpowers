#ifndef TI_CAS_SIMPLIFY_H
#define TI_CAS_SIMPLIFY_H

#include "expr.h"
#include <cmath>

namespace ti_cas {

// Simplification engine - applies algebraic rules iteratively
class Simplifier {
public:
    static ExprPtr simplify(const ExprPtr& expr) {
        ExprPtr current = expr;
        // Iterate until no more simplifications apply
        for (int i = 0; i < 100; ++i) {
            ExprPtr simplified = simplify_once(current);
            if (simplified->to_string() == current->to_string()) {
                break;
            }
            current = simplified;
        }
        return current;
    }

private:
    static ExprPtr simplify_once(const ExprPtr& expr) {
        switch (expr->type()) {
            case ExprType::Number:
            case ExprType::Variable:
                return expr;

            case ExprType::UnaryOp: {
                auto u = std::static_pointer_cast<UnaryExpr>(expr);
                auto operand = simplify_once(u->operand);
                if (u->op == UnOp::Neg) {
                    if (operand->type() == ExprType::Number) {
                        auto n = std::static_pointer_cast<NumberExpr>(operand);
                        return num(-n->value);
                    }
                }
                return std::make_shared<UnaryExpr>(u->op, operand);
            }

            case ExprType::Function: {
                auto f = std::static_pointer_cast<FunctionExpr>(expr);
                auto arg = simplify_once(f->arg);
                // Evaluate numeric functions
                if (arg->type() == ExprType::Number) {
                    auto n = std::static_pointer_cast<NumberExpr>(arg);
                    if (f->name == "sin") return num(std::sin(n->value));
                    if (f->name == "cos") return num(std::cos(n->value));
                    if (f->name == "tan") return num(std::tan(n->value));
                    if (f->name == "exp") return num(std::exp(n->value));
                    if (f->name == "ln" || f->name == "log") return num(std::log(n->value));
                    if (f->name == "sqrt") return num(std::sqrt(n->value));
                    if (f->name == "abs") return num(std::abs(n->value));
                }
                // ln(e^x) = x
                if ((f->name == "ln" || f->name == "log") && arg->type() == ExprType::Function) {
                    auto inner = std::static_pointer_cast<FunctionExpr>(arg);
                    if (inner->name == "exp") return simplify_once(inner->arg);
                }
                // exp(ln(x)) = x
                if (f->name == "exp" && arg->type() == ExprType::Function) {
                    auto inner = std::static_pointer_cast<FunctionExpr>(arg);
                    if (inner->name == "ln" || inner->name == "log") return simplify_once(inner->arg);
                }
                return std::make_shared<FunctionExpr>(f->name, arg);
            }

            case ExprType::BinaryOp: {
                auto b = std::static_pointer_cast<BinaryExpr>(expr);
                auto left = simplify_once(b->left);
                auto right = simplify_once(b->right);
                return simplify_binary(b->op, left, right);
            }
        }
        return expr;
    }

    static ExprPtr simplify_binary(BinOp op, const ExprPtr& left, const ExprPtr& right) {
        // Constant folding
        if (left->type() == ExprType::Number && right->type() == ExprType::Number) {
            auto l = std::static_pointer_cast<NumberExpr>(left);
            auto r = std::static_pointer_cast<NumberExpr>(right);
            switch (op) {
                case BinOp::Add: return num(l->value + r->value);
                case BinOp::Sub: return num(l->value - r->value);
                case BinOp::Mul: return num(l->value * r->value);
                case BinOp::Div:
                    if (!r->is_zero()) return num(l->value / r->value);
                    break;
                case BinOp::Pow: return num(std::pow(l->value, r->value));
            }
        }

        switch (op) {
            case BinOp::Add:
                // x + 0 = x
                if (right->is_zero()) return left;
                // 0 + x = x
                if (left->is_zero()) return right;
                // x + x = 2*x
                if (left->equals(right)) return mul(num(2), left);
                break;

            case BinOp::Sub:
                // x - 0 = x
                if (right->is_zero()) return left;
                // 0 - x = -x
                if (left->is_zero()) return mul(num(-1), right);
                // x - x = 0
                if (left->equals(right)) return num(0);
                break;

            case BinOp::Mul:
                // x * 0 = 0
                if (left->is_zero() || right->is_zero()) return num(0);
                // x * 1 = x
                if (right->is_one()) return left;
                // 1 * x = x
                if (left->is_one()) return right;
                // (-1) * (-1 * x) = x
                if (left->type() == ExprType::Number && right->type() == ExprType::BinaryOp) {
                    auto ln = std::static_pointer_cast<NumberExpr>(left);
                    auto rb = std::static_pointer_cast<BinaryExpr>(right);
                    if (ln->value == -1 && rb->op == BinOp::Mul &&
                        rb->left->type() == ExprType::Number) {
                        auto rln = std::static_pointer_cast<NumberExpr>(rb->left);
                        if (rln->value == -1) return rb->right;
                    }
                }
                // x * x = x^2
                if (left->equals(right)) return pow_expr(left, num(2));
                // x^a * x^b = x^(a+b)
                if (left->type() == ExprType::BinaryOp && right->type() == ExprType::BinaryOp) {
                    auto lb = std::static_pointer_cast<BinaryExpr>(left);
                    auto rb = std::static_pointer_cast<BinaryExpr>(right);
                    if (lb->op == BinOp::Pow && rb->op == BinOp::Pow &&
                        lb->left->equals(rb->left)) {
                        return pow_expr(lb->left, add(lb->right, rb->right));
                    }
                }
                break;

            case BinOp::Div:
                // 0 / x = 0
                if (left->is_zero()) return num(0);
                // x / 1 = x
                if (right->is_one()) return left;
                // x / x = 1
                if (left->equals(right)) return num(1);
                break;

            case BinOp::Pow:
                // x^0 = 1
                if (right->is_zero()) return num(1);
                // x^1 = x
                if (right->is_one()) return left;
                // 0^x = 0 (for positive x)
                if (left->is_zero()) return num(0);
                // 1^x = 1
                if (left->is_one()) return num(1);
                break;
        }

        return std::make_shared<BinaryExpr>(op, left, right);
    }
};

} // namespace ti_cas

#endif // TI_CAS_SIMPLIFY_H

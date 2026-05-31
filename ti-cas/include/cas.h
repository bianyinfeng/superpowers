#ifndef TI_CAS_H
#define TI_CAS_H

#include "expr.h"
#include "parser.h"
#include "simplify.h"
#include "differentiate.h"
#include "integrate.h"

namespace ti_cas {

// Main CAS engine interface
class CAS {
public:
    // Parse a mathematical expression string
    static ExprPtr parse(const std::string& input) {
        return Parser::parse_string(input);
    }

    // Simplify an expression
    static ExprPtr simplify(const std::string& input) {
        auto expr = parse(input);
        return Simplifier::simplify(expr);
    }

    static ExprPtr simplify(const ExprPtr& expr) {
        return Simplifier::simplify(expr);
    }

    // Differentiate expression with respect to a variable
    static ExprPtr diff(const std::string& input, const std::string& var_name = "x") {
        auto expr = parse(input);
        return Differentiator::differentiate(expr, var_name);
    }

    static ExprPtr diff(const ExprPtr& expr, const std::string& var_name = "x") {
        return Differentiator::differentiate(expr, var_name);
    }

    // Compute nth derivative
    static ExprPtr nth_diff(const std::string& input, int n, const std::string& var_name = "x") {
        auto expr = parse(input);
        ExprPtr result = expr;
        for (int i = 0; i < n; ++i) {
            result = Differentiator::differentiate(result, var_name);
        }
        return result;
    }

    // Indefinite integral (antiderivative)
    static ExprPtr integrate(const std::string& input, const std::string& var_name = "x") {
        auto expr = parse(input);
        return Integrator::integrate(expr, var_name);
    }

    static ExprPtr integrate(const ExprPtr& expr, const std::string& var_name = "x") {
        return Integrator::integrate(expr, var_name);
    }

    // Evaluate expression numerically (substitute variable values)
    static double evaluate(const ExprPtr& expr, const std::string& var_name, double value) {
        auto substituted = substitute(expr, var_name, num(value));
        auto simplified = Simplifier::simplify(substituted);
        if (simplified->type() == ExprType::Number) {
            return std::static_pointer_cast<NumberExpr>(simplified)->value;
        }
        throw std::runtime_error("Expression did not reduce to a number");
    }

    // Substitute a variable with an expression
    static ExprPtr substitute(const ExprPtr& expr, const std::string& var_name, const ExprPtr& replacement) {
        switch (expr->type()) {
            case ExprType::Number:
                return expr;

            case ExprType::Variable: {
                auto v = std::static_pointer_cast<VariableExpr>(expr);
                if (v->name == var_name) return replacement->clone();
                return expr;
            }

            case ExprType::UnaryOp: {
                auto u = std::static_pointer_cast<UnaryExpr>(expr);
                return std::make_shared<UnaryExpr>(u->op, substitute(u->operand, var_name, replacement));
            }

            case ExprType::BinaryOp: {
                auto b = std::static_pointer_cast<BinaryExpr>(expr);
                return std::make_shared<BinaryExpr>(b->op,
                    substitute(b->left, var_name, replacement),
                    substitute(b->right, var_name, replacement));
            }

            case ExprType::Function: {
                auto f = std::static_pointer_cast<FunctionExpr>(expr);
                return std::make_shared<FunctionExpr>(f->name, substitute(f->arg, var_name, replacement));
            }
        }
        return expr;
    }
};

} // namespace ti_cas

#endif // TI_CAS_H

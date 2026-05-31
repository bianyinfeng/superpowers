#ifndef TI_CAS_EXPR_H
#define TI_CAS_EXPR_H

#include <memory>
#include <string>
#include <vector>
#include <cmath>
#include <stdexcept>
#include <iostream>
#include <sstream>

namespace ti_cas {

// Forward declarations
class Expr;
using ExprPtr = std::shared_ptr<Expr>;

// Expression node types
enum class ExprType {
    Number,
    Variable,
    BinaryOp,
    UnaryOp,
    Function
};

// Binary operators
enum class BinOp {
    Add,
    Sub,
    Mul,
    Div,
    Pow
};

// Unary operators
enum class UnOp {
    Neg
};

// Base expression class
class Expr : public std::enable_shared_from_this<Expr> {
public:
    virtual ~Expr() = default;
    virtual ExprType type() const = 0;
    virtual ExprPtr clone() const = 0;
    virtual std::string to_string() const = 0;
    virtual bool equals(const ExprPtr& other) const = 0;
    virtual bool is_zero() const { return false; }
    virtual bool is_one() const { return false; }
};

// Number literal
class NumberExpr : public Expr {
public:
    double value;

    explicit NumberExpr(double v) : value(v) {}

    ExprType type() const override { return ExprType::Number; }
    ExprPtr clone() const override { return std::make_shared<NumberExpr>(value); }

    std::string to_string() const override {
        if (value == static_cast<int>(value)) {
            return std::to_string(static_cast<int>(value));
        }
        std::ostringstream oss;
        oss << value;
        return oss.str();
    }

    bool equals(const ExprPtr& other) const override {
        if (other->type() != ExprType::Number) return false;
        auto o = std::static_pointer_cast<NumberExpr>(other);
        return std::abs(value - o->value) < 1e-12;
    }

    bool is_zero() const override { return std::abs(value) < 1e-12; }
    bool is_one() const override { return std::abs(value - 1.0) < 1e-12; }
};

// Variable
class VariableExpr : public Expr {
public:
    std::string name;

    explicit VariableExpr(const std::string& n) : name(n) {}

    ExprType type() const override { return ExprType::Variable; }
    ExprPtr clone() const override { return std::make_shared<VariableExpr>(name); }
    std::string to_string() const override { return name; }

    bool equals(const ExprPtr& other) const override {
        if (other->type() != ExprType::Variable) return false;
        auto o = std::static_pointer_cast<VariableExpr>(other);
        return name == o->name;
    }
};

// Binary operation
class BinaryExpr : public Expr {
public:
    BinOp op;
    ExprPtr left;
    ExprPtr right;

    BinaryExpr(BinOp o, ExprPtr l, ExprPtr r) : op(o), left(std::move(l)), right(std::move(r)) {}

    ExprType type() const override { return ExprType::BinaryOp; }
    ExprPtr clone() const override { return std::make_shared<BinaryExpr>(op, left->clone(), right->clone()); }

    std::string to_string() const override {
        std::string op_str;
        switch (op) {
            case BinOp::Add: op_str = " + "; break;
            case BinOp::Sub: op_str = " - "; break;
            case BinOp::Mul: op_str = "*"; break;
            case BinOp::Div: op_str = "/"; break;
            case BinOp::Pow: op_str = "^"; break;
        }
        std::string l = left->to_string();
        std::string r = right->to_string();

        // Add parentheses for lower-precedence sub-expressions
        if (left->type() == ExprType::BinaryOp) {
            auto lb = std::static_pointer_cast<BinaryExpr>(left);
            if ((op == BinOp::Mul || op == BinOp::Div || op == BinOp::Pow) &&
                (lb->op == BinOp::Add || lb->op == BinOp::Sub)) {
                l = "(" + l + ")";
            }
        }
        if (right->type() == ExprType::BinaryOp) {
            auto rb = std::static_pointer_cast<BinaryExpr>(right);
            if ((op == BinOp::Mul || op == BinOp::Div || op == BinOp::Pow) &&
                (rb->op == BinOp::Add || rb->op == BinOp::Sub)) {
                r = "(" + r + ")";
            }
        }
        return l + op_str + r;
    }

    bool equals(const ExprPtr& other) const override {
        if (other->type() != ExprType::BinaryOp) return false;
        auto o = std::static_pointer_cast<BinaryExpr>(other);
        return op == o->op && left->equals(o->left) && right->equals(o->right);
    }
};

// Unary operation
class UnaryExpr : public Expr {
public:
    UnOp op;
    ExprPtr operand;

    UnaryExpr(UnOp o, ExprPtr e) : op(o), operand(std::move(e)) {}

    ExprType type() const override { return ExprType::UnaryOp; }
    ExprPtr clone() const override { return std::make_shared<UnaryExpr>(op, operand->clone()); }

    std::string to_string() const override {
        switch (op) {
            case UnOp::Neg: return "-(" + operand->to_string() + ")";
        }
        return "";
    }

    bool equals(const ExprPtr& other) const override {
        if (other->type() != ExprType::UnaryOp) return false;
        auto o = std::static_pointer_cast<UnaryExpr>(other);
        return op == o->op && operand->equals(o->operand);
    }
};

// Function call (sin, cos, ln, exp, tan, sqrt, etc.)
class FunctionExpr : public Expr {
public:
    std::string name;
    ExprPtr arg;

    FunctionExpr(const std::string& n, ExprPtr a) : name(n), arg(std::move(a)) {}

    ExprType type() const override { return ExprType::Function; }
    ExprPtr clone() const override { return std::make_shared<FunctionExpr>(name, arg->clone()); }
    std::string to_string() const override { return name + "(" + arg->to_string() + ")"; }

    bool equals(const ExprPtr& other) const override {
        if (other->type() != ExprType::Function) return false;
        auto o = std::static_pointer_cast<FunctionExpr>(other);
        return name == o->name && arg->equals(o->arg);
    }
};

// ---- Helper constructors ----
inline ExprPtr num(double v) { return std::make_shared<NumberExpr>(v); }
inline ExprPtr var(const std::string& n) { return std::make_shared<VariableExpr>(n); }
inline ExprPtr add(ExprPtr l, ExprPtr r) { return std::make_shared<BinaryExpr>(BinOp::Add, std::move(l), std::move(r)); }
inline ExprPtr sub(ExprPtr l, ExprPtr r) { return std::make_shared<BinaryExpr>(BinOp::Sub, std::move(l), std::move(r)); }
inline ExprPtr mul(ExprPtr l, ExprPtr r) { return std::make_shared<BinaryExpr>(BinOp::Mul, std::move(l), std::move(r)); }
inline ExprPtr div_expr(ExprPtr l, ExprPtr r) { return std::make_shared<BinaryExpr>(BinOp::Div, std::move(l), std::move(r)); }
inline ExprPtr pow_expr(ExprPtr l, ExprPtr r) { return std::make_shared<BinaryExpr>(BinOp::Pow, std::move(l), std::move(r)); }
inline ExprPtr neg(ExprPtr e) { return std::make_shared<UnaryExpr>(UnOp::Neg, std::move(e)); }
inline ExprPtr fn(const std::string& name, ExprPtr arg) { return std::make_shared<FunctionExpr>(name, std::move(arg)); }

} // namespace ti_cas

#endif // TI_CAS_EXPR_H

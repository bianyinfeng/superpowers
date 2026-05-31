#ifndef TI_CAS_PARSER_H
#define TI_CAS_PARSER_H

#include "expr.h"
#include <string>
#include <cctype>

namespace ti_cas {

// Recursive descent parser for mathematical expressions
// Grammar:
//   expr     -> term (('+' | '-') term)*
//   term     -> power (('*' | '/') power)*
//   power    -> unary ('^' power)?
//   unary    -> '-' unary | atom
//   atom     -> NUMBER | VARIABLE | FUNCTION '(' expr ')' | '(' expr ')'
class Parser {
public:
    explicit Parser(const std::string& input) : input_(input), pos_(0) {}

    ExprPtr parse() {
        skip_whitespace();
        auto result = parse_expr();
        skip_whitespace();
        if (pos_ < input_.size()) {
            throw std::runtime_error("Unexpected character at position " + std::to_string(pos_));
        }
        return result;
    }

    // Convenience static method
    static ExprPtr parse_string(const std::string& input) {
        Parser p(input);
        return p.parse();
    }

private:
    std::string input_;
    size_t pos_;

    char peek() const {
        if (pos_ >= input_.size()) return '\0';
        return input_[pos_];
    }

    char advance() {
        return input_[pos_++];
    }

    void skip_whitespace() {
        while (pos_ < input_.size() && std::isspace(input_[pos_])) {
            pos_++;
        }
    }

    bool match(char c) {
        skip_whitespace();
        if (peek() == c) {
            advance();
            return true;
        }
        return false;
    }

    void expect(char c) {
        skip_whitespace();
        if (peek() != c) {
            throw std::runtime_error(std::string("Expected '") + c + "' at position " + std::to_string(pos_));
        }
        advance();
    }

    ExprPtr parse_expr() {
        auto left = parse_term();
        skip_whitespace();
        while (peek() == '+' || peek() == '-') {
            char op = advance();
            auto right = parse_term();
            if (op == '+') {
                left = add(left, right);
            } else {
                left = sub(left, right);
            }
            skip_whitespace();
        }
        return left;
    }

    ExprPtr parse_term() {
        auto left = parse_power();
        skip_whitespace();
        while (peek() == '*' || peek() == '/') {
            char op = advance();
            auto right = parse_power();
            if (op == '*') {
                left = mul(left, right);
            } else {
                left = div_expr(left, right);
            }
            skip_whitespace();
        }
        return left;
    }

    ExprPtr parse_power() {
        auto base = parse_unary();
        skip_whitespace();
        if (peek() == '^') {
            advance();
            auto exp = parse_power(); // right-associative
            return pow_expr(base, exp);
        }
        return base;
    }

    ExprPtr parse_unary() {
        skip_whitespace();
        if (peek() == '-') {
            advance();
            auto operand = parse_unary();
            // Optimize: -number -> negative number
            if (operand->type() == ExprType::Number) {
                auto n = std::static_pointer_cast<NumberExpr>(operand);
                return num(-n->value);
            }
            return mul(num(-1), operand);
        }
        return parse_atom();
    }

    ExprPtr parse_atom() {
        skip_whitespace();

        // Parenthesized expression
        if (peek() == '(') {
            advance();
            auto e = parse_expr();
            expect(')');
            return e;
        }

        // Number
        if (std::isdigit(peek()) || peek() == '.') {
            return parse_number();
        }

        // Identifier (variable or function)
        if (std::isalpha(peek()) || peek() == '_') {
            return parse_identifier();
        }

        throw std::runtime_error(std::string("Unexpected character '") + peek() + "' at position " + std::to_string(pos_));
    }

    ExprPtr parse_number() {
        size_t start = pos_;
        while (pos_ < input_.size() && (std::isdigit(input_[pos_]) || input_[pos_] == '.')) {
            pos_++;
        }
        double val = std::stod(input_.substr(start, pos_ - start));
        return num(val);
    }

    ExprPtr parse_identifier() {
        size_t start = pos_;
        while (pos_ < input_.size() && (std::isalnum(input_[pos_]) || input_[pos_] == '_')) {
            pos_++;
        }
        std::string name = input_.substr(start, pos_ - start);

        // Check for known constants
        if (name == "pi" || name == "PI") return num(M_PI);
        if (name == "e" && peek() != '(') return num(M_E);

        // Check if it's a function call
        skip_whitespace();
        if (peek() == '(') {
            advance();
            auto arg = parse_expr();
            expect(')');
            return fn(name, arg);
        }

        return var(name);
    }
};

} // namespace ti_cas

#endif // TI_CAS_PARSER_H

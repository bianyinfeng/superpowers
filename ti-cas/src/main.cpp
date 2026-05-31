#include "cas.h"
#include <iostream>
#include <string>

using namespace ti_cas;

void print_help() {
    std::cout << "TI CAS Symbolic Calculator\n";
    std::cout << "==========================\n";
    std::cout << "Commands:\n";
    std::cout << "  simplify <expr>         - Simplify expression\n";
    std::cout << "  diff <expr> [var]       - Differentiate (default var: x)\n";
    std::cout << "  integrate <expr> [var]  - Indefinite integral (default var: x)\n";
    std::cout << "  eval <expr> <var>=<val> - Evaluate numerically\n";
    std::cout << "  <expr>                  - Parse and display\n";
    std::cout << "  help                    - Show this help\n";
    std::cout << "  quit/exit               - Exit\n";
    std::cout << "\nExamples:\n";
    std::cout << "  diff x^3 + 2*x\n";
    std::cout << "  integrate sin(x)\n";
    std::cout << "  simplify (x+0)*(1+0)\n";
    std::cout << "  eval x^2 + 1 x=3\n\n";
}

std::string trim(const std::string& s) {
    size_t start = s.find_first_not_of(" \t\n\r");
    if (start == std::string::npos) return "";
    size_t end = s.find_last_not_of(" \t\n\r");
    return s.substr(start, end - start + 1);
}

int main() {
    print_help();

    std::string line;
    while (true) {
        std::cout << "cas> ";
        if (!std::getline(std::cin, line)) break;

        line = trim(line);
        if (line.empty()) continue;
        if (line == "quit" || line == "exit") break;
        if (line == "help") { print_help(); continue; }

        try {
            if (line.substr(0, 8) == "simplify") {
                std::string expr_str = trim(line.substr(8));
                auto result = CAS::simplify(expr_str);
                std::cout << "  = " << result->to_string() << "\n";
            } else if (line.substr(0, 4) == "diff") {
                std::string rest = trim(line.substr(4));
                std::string var_name = "x";
                // Check if last token is a variable name
                size_t last_space = rest.rfind(' ');
                if (last_space != std::string::npos) {
                    std::string last_token = rest.substr(last_space + 1);
                    if (last_token.size() == 1 && std::isalpha(last_token[0])) {
                        var_name = last_token;
                        rest = trim(rest.substr(0, last_space));
                    }
                }
                auto result = CAS::diff(rest, var_name);
                std::cout << "  d/d" << var_name << " = " << result->to_string() << "\n";
            } else if (line.substr(0, 9) == "integrate") {
                std::string rest = trim(line.substr(9));
                std::string var_name = "x";
                size_t last_space = rest.rfind(' ');
                if (last_space != std::string::npos) {
                    std::string last_token = rest.substr(last_space + 1);
                    if (last_token.size() == 1 && std::isalpha(last_token[0])) {
                        var_name = last_token;
                        rest = trim(rest.substr(0, last_space));
                    }
                }
                auto result = CAS::integrate(rest, var_name);
                std::cout << "  ∫ d" << var_name << " = " << result->to_string() << " + C\n";
            } else if (line.substr(0, 4) == "eval") {
                std::string rest = trim(line.substr(4));
                // Find var=value at the end
                size_t eq_pos = rest.rfind('=');
                if (eq_pos == std::string::npos) {
                    std::cout << "  Error: use format 'eval <expr> <var>=<value>'\n";
                    continue;
                }
                size_t var_start = rest.rfind(' ', eq_pos - 1);
                if (var_start == std::string::npos) {
                    std::cout << "  Error: use format 'eval <expr> <var>=<value>'\n";
                    continue;
                }
                std::string expr_str = trim(rest.substr(0, var_start));
                std::string var_name = rest.substr(var_start + 1, eq_pos - var_start - 1);
                double value = std::stod(rest.substr(eq_pos + 1));
                auto expr = CAS::parse(expr_str);
                double result = CAS::evaluate(expr, var_name, value);
                std::cout << "  = " << result << "\n";
            } else {
                // Just parse and display
                auto expr = CAS::parse(line);
                auto simplified = CAS::simplify(expr);
                std::cout << "  = " << simplified->to_string() << "\n";
            }
        } catch (const std::exception& e) {
            std::cout << "  Error: " << e.what() << "\n";
        }
    }

    return 0;
}

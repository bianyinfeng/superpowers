cmake_minimum_required(VERSION 3.14)
project(ti-cas VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Header-only library
add_library(ti_cas INTERFACE)
target_include_directories(ti_cas INTERFACE ${CMAKE_CURRENT_SOURCE_DIR}/include)

# Main interactive program
add_executable(ti_cas_repl src/main.cpp)
target_link_libraries(ti_cas_repl PRIVATE ti_cas)

# Tests
enable_testing()
add_executable(test_parser tests/test_parser.cpp)
target_link_libraries(test_parser PRIVATE ti_cas)
add_test(NAME test_parser COMMAND test_parser)

add_executable(test_simplify tests/test_simplify.cpp)
target_link_libraries(test_simplify PRIVATE ti_cas)
add_test(NAME test_simplify COMMAND test_simplify)

add_executable(test_differentiate tests/test_differentiate.cpp)
target_link_libraries(test_differentiate PRIVATE ti_cas)
add_test(NAME test_differentiate COMMAND test_differentiate)

add_executable(test_integrate tests/test_integrate.cpp)
target_link_libraries(test_integrate PRIVATE ti_cas)
add_test(NAME test_integrate COMMAND test_integrate)

add_executable(test_cas tests/test_cas.cpp)
target_link_libraries(test_cas PRIVATE ti_cas)
add_test(NAME test_cas COMMAND test_cas)

cmake_minimum_required(VERSION 3.16)
project(spice_mvp C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS OFF)

add_executable(spice
    src/main.c
    src/parser.c
    src/simulator.c
)

target_include_directories(spice PRIVATE include)

enable_testing()

add_test(
    NAME op_divider
    COMMAND spice ${CMAKE_CURRENT_SOURCE_DIR}/examples/divider_op.cir
)
set_tests_properties(op_divider PROPERTIES
    PASS_REGULAR_EXPRESSION "V\(out\)=5"
)

add_test(
    NAME tran_rc
    COMMAND spice ${CMAKE_CURRENT_SOURCE_DIR}/examples/rc_tran.cir
)
set_tests_properties(tran_rc PROPERTIES
    PASS_REGULAR_EXPRESSION "0\.001,3\.[0-9]+"
)

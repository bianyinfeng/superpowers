# TI CAS 符号计算系统

一个用 C++17 实现的 TI 风格计算器代数系统 (Computer Algebra System)，支持符号计算、微分、不定积分和表达式化简。

## 功能特性

### 表达式解析
- 支持标准数学中缀表达式：`x^2 + 2*x + 1`
- 支持函数调用：`sin(x)`, `cos(x)`, `tan(x)`, `exp(x)`, `ln(x)`, `sqrt(x)`, `asin(x)`, `acos(x)`, `atan(x)`
- 支持常量：`pi`, `e`
- 正确处理运算符优先级和括号

### 表达式化简
- 常量折叠：`2 + 3` → `5`
- 恒等规则：`x + 0` → `x`, `x * 1` → `x`, `x^1` → `x`
- 零规则：`x * 0` → `0`, `x^0` → `1`
- 消去规则：`x - x` → `0`, `x / x` → `1`
- 幂合并：`x^a * x^b` → `x^(a+b)`
- 函数简化：`ln(exp(x))` → `x`, `exp(ln(x))` → `x`

### 符号微分 (diff)
- 基本规则：常数、变量、幂函数
- 乘法法则（积规则）
- 除法法则（商规则）
- 链式法则
- 三角函数、指数函数、对数函数
- 反三角函数
- 高阶导数支持
- 多元偏微分

### 不定积分 (integrate)
- 幂函数规则：`∫x^n dx = x^(n+1)/(n+1)`
- 三角函数：`∫sin(x)`, `∫cos(x)`, `∫tan(x)`
- 指数函数：`∫exp(x)`, `∫a^x`
- 对数函数：`∫ln(x)`, `∫1/x`
- 线性代换：`∫f(ax+b) dx = F(ax+b)/a`
- 和/差的积分
- 常数因子提取
- `f'(x)/f(x)` 模式识别 → `ln|f(x)|`

### 数值求值
- 代入变量值计算表达式
- 支持多变量表达式

## 构建

```bash
cd ti-cas
mkdir build && cd build
cmake ..
make -j$(nproc)
```

## 运行测试

```bash
cd build
ctest --output-on-failure
```

## 交互式使用

```bash
./ti_cas_repl
```

### 命令示例

```
cas> simplify (x + 0) * (1 + 0)
  = x

cas> diff x^3 + 2*x
  d/dx = 3*x^2 + 2

cas> diff sin(x^2)
  d/dx = cos(x^2)*2*x

cas> integrate x^2
  ∫ dx = x^3/3 + C

cas> integrate sin(2*x)
  ∫ dx = -1*cos(2*x)/2 + C

cas> integrate exp(x)
  ∫ dx = exp(x) + C

cas> eval x^2 + 1 x=3
  = 10
```

## 架构

系统采用头文件库 (header-only) 设计：

| 文件 | 描述 |
|------|------|
| `include/expr.h` | 表达式 AST 节点定义（Number, Variable, BinaryOp, UnaryOp, Function）|
| `include/parser.h` | 递归下降解析器（支持优先级和函数调用）|
| `include/simplify.h` | 代数化简引擎（迭代应用规则直到不动点）|
| `include/differentiate.h` | 符号微分（链式法则、乘积法则、商法则等）|
| `include/integrate.h` | 不定积分（幂规则、三角、指数、线性代换等）|
| `include/cas.h` | 统一 CAS 接口 |
| `src/main.cpp` | 交互式 REPL |

## 扩展

要添加新的函数支持：
1. 在 `differentiate.h` 的 `diff_function()` 中添加导数规则
2. 在 `integrate.h` 的 `try_integrate_function()` 中添加积分规则
3. 在 `simplify.h` 中添加相应的简化规则（可选）

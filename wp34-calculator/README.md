# WP-34S Scientific RPN Calculator

A web-based implementation of the WP-34S scientific calculator — a famous open-source RPN (Reverse Polish Notation) scientific calculator.

## Features

### Core
- **4-level RPN stack** (X, Y, Z, T registers) with full stack visualization
- **Last X register** for recalling the previous X value
- **100 memory registers** (R00–R99) with STO, RCL, STO+, STO−
- **Keyboard support** for fast number entry and operations

### Scientific Functions
- **Trigonometric**: sin, cos, tan and their inverses (with DEG/RAD/GRAD modes)
- **Hyperbolic**: sinh, cosh, tanh and their inverses
- **Logarithmic**: ln, log₁₀, log₂, eˣ, 10ˣ, 2ˣ
- **Power & Roots**: yˣ, √x, x², ³√x, ˣ√y, 1/x
- **Factorial & Combinatorics**: n!, C(n,r), P(n,r)
- **Statistics**: Σ+, Σ−, mean (x̄, ȳ), standard deviation
- **Percentage**: %, Δ%
- **Coordinate conversion**: rectangular ↔ polar
- **Constants**: π, e

### Display
- **Multiple display modes**: FIX, SCI, ENG, ALL
- **Stack visualization** showing T, Z, Y registers
- **Shift indicators** (f/g) for accessing alternate functions
- **Error display** for invalid operations

## How to Use

### Quick Start
Open `index.html` in any modern web browser — no server or build step needed.

### RPN Basics
RPN (Reverse Polish Notation) enters operands before operators:

| Calculation | RPN Keystrokes | Result |
|---|---|---|
| 2 + 3 | `2 ENTER 3 +` | 5 |
| (2 + 3) × 4 | `2 ENTER 3 + 4 ×` | 20 |
| sin(30°) | `30 SIN` | 0.5 |
| √9 | `9 √x` | 3 |
| 5! | `5 n!` | 120 |

### Keyboard Shortcuts

| Key | Function |
|---|---|
| `0`–`9`, `.` | Number entry |
| `Enter` | ENTER (push stack) |
| `+` `-` `*` `/` | Arithmetic |
| `Backspace` | Delete last digit |
| `Escape` | Clear X |
| `r` | Square root |
| `^` | Power (yˣ) |
| `s` `c` `t` | sin, cos, tan |
| `l` / `L` | ln / log₁₀ |
| `p` | π |
| `!` | Factorial |
| `%` | Percent |
| `n` | Change sign (+/−) |
| `x` | Swap X↔Y |
| `d` | Roll down |
| `f` / `g` | f-shift / g-shift |

### Shift Functions
- Press **f** (yellow) then a function key for the **f-shifted** function (shown in gold above buttons)
- Press **g** (blue) then a function key for the **g-shifted** function (shown in blue below buttons)

Examples:
- `f` then `√x` → x² (square)
- `f` then `SIN` → sin⁻¹ (arcsine)
- `g` then `SIN` → sinh (hyperbolic sine)
- `f` then `LN` → eˣ
- `f` then `CLx` → Clear All

### Memory Operations
1. Press **STO** then a register number (0–99) to store X
2. Press **RCL** then a register number to recall
3. Press **f** then **STO** for STO+ (add to register)
4. Press **g** then **STO** for STO− (subtract from register)

## Technology

- **Pure HTML/CSS/JavaScript** — zero dependencies
- **No build step required** — open `index.html` directly
- **Responsive design** — works on mobile and desktop
- **~700 lines** of engine code with full IEEE 754 arithmetic

## Testing

```bash
node wp34-calculator/tests/engine.test.js
```

106 unit tests covering all engine functions.

## Architecture

```
wp34-calculator/
├── index.html          # Calculator UI
├── css/
│   └── style.css       # Calculator styling
├── js/
│   ├── engine.js       # RPN calculator engine (WP34Engine class)
│   └── app.js          # UI controller (WP34App class)
├── tests/
│   └── engine.test.js  # Engine unit tests
└── README.md           # This file
```

## License

MIT

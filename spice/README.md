# SPICE MVP (C)

This directory contains a C-based SPICE simulator foundation aligned with the staged plan for building a full analog/digital simulator.

## Current Scope (implemented)

- Netlist parser (basic SPICE-like syntax)
- Device layer with unified element representation
- MNA matrix assembly and Gaussian elimination solver
- Newton iteration framework for nonlinear devices
- Analyses:
  - `.op` (DC operating point)
  - `.tran <step> <stop>` (fixed-step transient with backward-Euler capacitor companion model)
- Supported devices:
  - Passive: `R`, `C`
  - Independent sources: `V`, `I`
  - Active (basic): `D` + `.model <name> D ...`

## Build

```bash
cd /tmp/workspace/bianyinfeng/superpowers/spice
cmake -S . -B build
cmake --build build
```

## Run

```bash
./build/spice ./examples/divider_op.cir
./build/spice ./examples/rc_tran.cir
./build/spice ./examples/diode_op.cir
```

## Test

```bash
cd /tmp/workspace/bianyinfeng/superpowers/spice/build
ctest --output-on-failure
```

## Architecture

- `src/parser.c`: netlist parsing, node/model/element registration
- `src/simulator.c`: MNA stamping, Newton loop, OP/TRAN controllers
- `src/main.c`: CLI entry
- `include/spice.h`: shared data model and public interfaces

## Roadmap Mapping

- ✅ M1 seed: OP + TRAN + foundational passive/source devices
- ⚙️ Next: BJT/MOS models, convergence enhancements (`gmin/source stepping`), AC/noise/temperature, subcircuits, mixed-signal event engine, GUI/script ecosystem

/**
 * WP-34S Calculator Engine Tests
 *
 * Comprehensive test suite for the RPN calculator engine.
 * Run with: node wp34-calculator/tests/engine.test.js
 */

'use strict';

const WP34Engine = require('../js/engine.js');

let passCount = 0;
let failCount = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passCount++;
  } else {
    failCount++;
    console.error(`  FAIL: ${message}`);
  }
}

function assertClose(actual, expected, message, tolerance) {
  tolerance = tolerance || 1e-10;
  const diff = Math.abs(actual - expected);
  assert(diff < tolerance, `${message} (expected ${expected}, got ${actual}, diff ${diff})`);
}

function assertEqual(actual, expected, message) {
  assert(actual === expected, `${message} (expected ${expected}, got ${actual})`);
}

function group(name, fn) {
  console.log(`\n  ${name}`);
  fn();
}

// ======================================
// Test Suite
// ======================================

console.log('\nWP-34S Engine Tests');
console.log('='.repeat(50));

// --- Initialization ---
group('Initialization', () => {
  const engine = new WP34Engine();
  assertEqual(engine.stack.x, 0, 'X register starts at 0');
  assertEqual(engine.stack.y, 0, 'Y register starts at 0');
  assertEqual(engine.stack.z, 0, 'Z register starts at 0');
  assertEqual(engine.stack.t, 0, 'T register starts at 0');
  assertEqual(engine.angleMode, 'DEG', 'Default angle mode is DEG');
  assertEqual(engine.displayMode, 'FIX', 'Default display mode is FIX');
  assertEqual(engine.displayDigits, 4, 'Default display digits is 4');
  assertEqual(engine.registers.length, 100, '100 memory registers');
  assertEqual(engine.error, null, 'No initial error');
});

// --- Digit Entry ---
group('Digit Entry', () => {
  const engine = new WP34Engine();
  engine.digit(5);
  assertEqual(engine.stack.x, 5, 'Enter digit 5');

  engine.digit(3);
  assertEqual(engine.stack.x, 53, 'Enter 53');

  engine.digit(7);
  assertEqual(engine.stack.x, 537, 'Enter 537');
});

group('Decimal Entry', () => {
  const engine = new WP34Engine();
  engine.digit(3);
  engine.decimal();
  engine.digit(1);
  engine.digit(4);
  assertClose(engine.stack.x, 3.14, 'Enter 3.14');
});

group('Negative Number Entry', () => {
  const engine = new WP34Engine();
  engine.digit(5);
  engine.changeSign();
  assertEqual(engine.stack.x, -5, 'Change sign of 5');

  engine.changeSign();
  assertEqual(engine.stack.x, 5, 'Change sign back');
});

group('Backspace', () => {
  const engine = new WP34Engine();
  engine.digit(1);
  engine.digit(2);
  engine.digit(3);
  engine.backspace();
  assertEqual(engine.stack.x, 12, 'Backspace from 123');

  engine.backspace();
  assertEqual(engine.stack.x, 1, 'Backspace to 1');

  engine.backspace();
  assertEqual(engine.stack.x, 0, 'Backspace to empty');
});

// --- Stack Operations ---
group('ENTER', () => {
  const engine = new WP34Engine();
  engine.digit(5);
  engine.enter();
  assertEqual(engine.stack.x, 5, 'X is 5 after ENTER');
  assertEqual(engine.stack.y, 5, 'Y is 5 after ENTER (duplicate)');
});

group('Stack Lift on new entry after operation', () => {
  const engine = new WP34Engine();
  engine.digit(3);
  engine.enter();
  engine.digit(4);
  assertEqual(engine.stack.x, 4, 'X is 4');
  assertEqual(engine.stack.y, 3, 'Y is 3 (lifted)');
});

group('Swap X↔Y', () => {
  const engine = new WP34Engine();
  engine.digit(3);
  engine.enter();
  engine.digit(7);
  engine.swapXY();
  assertEqual(engine.stack.x, 3, 'X is 3 after swap');
  assertEqual(engine.stack.y, 7, 'Y is 7 after swap');
});

group('Roll Down', () => {
  const engine = new WP34Engine();
  engine.stack = { x: 1, y: 2, z: 3, t: 4 };
  engine.rollDown();
  assertEqual(engine.stack.x, 2, 'X=2 after roll down');
  assertEqual(engine.stack.y, 3, 'Y=3 after roll down');
  assertEqual(engine.stack.z, 4, 'Z=4 after roll down');
  assertEqual(engine.stack.t, 1, 'T=1 after roll down');
});

group('Roll Up', () => {
  const engine = new WP34Engine();
  engine.stack = { x: 1, y: 2, z: 3, t: 4 };
  engine.rollUp();
  assertEqual(engine.stack.x, 4, 'X=4 after roll up');
  assertEqual(engine.stack.y, 1, 'Y=1 after roll up');
  assertEqual(engine.stack.z, 2, 'Z=2 after roll up');
  assertEqual(engine.stack.t, 3, 'T=3 after roll up');
});

group('Last X', () => {
  const engine = new WP34Engine();
  engine.digit(5);
  engine.enter();
  engine.digit(3);
  engine.add();
  assertEqual(engine.stack.x, 8, 'X=8 after 5+3');
  engine.recallLastX();
  assertEqual(engine.stack.x, 3, 'Last X is 3');
});

// --- Arithmetic ---
group('Addition', () => {
  const engine = new WP34Engine();
  engine.digit(2);
  engine.enter();
  engine.digit(3);
  engine.add();
  assertEqual(engine.stack.x, 5, '2 + 3 = 5');
});

group('Subtraction', () => {
  const engine = new WP34Engine();
  engine.digit(9);
  engine.enter();
  engine.digit(4);
  engine.subtract();
  assertEqual(engine.stack.x, 5, '9 - 4 = 5');
});

group('Multiplication', () => {
  const engine = new WP34Engine();
  engine.digit(6);
  engine.enter();
  engine.digit(7);
  engine.multiply();
  assertEqual(engine.stack.x, 42, '6 × 7 = 42');
});

group('Division', () => {
  const engine = new WP34Engine();
  engine.digit(1);
  engine.digit(0);
  engine.enter();
  engine.digit(4);
  engine.divide();
  assertEqual(engine.stack.x, 2.5, '10 ÷ 4 = 2.5');
});

group('Division by Zero', () => {
  const engine = new WP34Engine();
  engine.digit(5);
  engine.enter();
  engine.digit(0);
  engine.divide();
  assert(isNaN(engine.stack.x), 'Division by 0 returns NaN');
  assertEqual(engine.error, 'Invalid', 'Error is set on division by zero');
});

// --- Chain Calculations ---
group('Chain Calculation (2 + 3) * 4', () => {
  const engine = new WP34Engine();
  engine.digit(2);
  engine.enter();
  engine.digit(3);
  engine.add();
  engine.enter();
  engine.digit(4);
  engine.multiply();
  assertEqual(engine.stack.x, 20, '(2 + 3) * 4 = 20');
});

group('Chain Calculation with stack: 1 2 3 + *', () => {
  const engine = new WP34Engine();
  engine.digit(1);
  engine.enter();
  engine.digit(2);
  engine.enter();
  engine.digit(3);
  engine.add(); // 2 + 3 = 5
  engine.multiply(); // 1 * 5 = 5
  assertEqual(engine.stack.x, 5, '1 ENTER 2 ENTER 3 + * = 5');
});

// --- Scientific Functions ---
group('Square Root', () => {
  const engine = new WP34Engine();
  engine.digit(9);
  engine.squareRoot();
  assertEqual(engine.stack.x, 3, '√9 = 3');
});

group('Square Root of Negative', () => {
  const engine = new WP34Engine();
  engine.digit(4);
  engine.changeSign();
  engine.squareRoot();
  assert(isNaN(engine.stack.x), '√(-4) = NaN');
});

group('Square', () => {
  const engine = new WP34Engine();
  engine.digit(7);
  engine.square();
  assertEqual(engine.stack.x, 49, '7² = 49');
});

group('Reciprocal', () => {
  const engine = new WP34Engine();
  engine.digit(4);
  engine.reciprocal();
  assertEqual(engine.stack.x, 0.25, '1/4 = 0.25');
});

group('Power', () => {
  const engine = new WP34Engine();
  engine.digit(2);
  engine.enter();
  engine.digit(1);
  engine.digit(0);
  engine.power();
  assertEqual(engine.stack.x, 1024, '2^10 = 1024');
});

// --- Logarithmic ---
group('Natural Log', () => {
  const engine = new WP34Engine();
  engine.stack.x = Math.E;
  engine.ln();
  assertClose(engine.stack.x, 1, 'ln(e) ≈ 1');
});

group('Log Base 10', () => {
  const engine = new WP34Engine();
  engine.digit(1);
  engine.digit(0);
  engine.digit(0);
  engine.log10();
  assertClose(engine.stack.x, 2, 'log10(100) = 2');
});

group('Exp', () => {
  const engine = new WP34Engine();
  engine.digit(1);
  engine.exp();
  assertClose(engine.stack.x, Math.E, 'e^1 ≈ 2.718...');
});

group('10^x', () => {
  const engine = new WP34Engine();
  engine.digit(3);
  engine.pow10();
  assertEqual(engine.stack.x, 1000, '10^3 = 1000');
});

// --- Trigonometric ---
group('Sin (DEG)', () => {
  const engine = new WP34Engine();
  engine.digit(3);
  engine.digit(0);
  engine.sin();
  assertClose(engine.stack.x, 0.5, 'sin(30°) = 0.5');
});

group('Cos (DEG)', () => {
  const engine = new WP34Engine();
  engine.digit(6);
  engine.digit(0);
  engine.cos();
  assertClose(engine.stack.x, 0.5, 'cos(60°) = 0.5');
});

group('Tan (DEG)', () => {
  const engine = new WP34Engine();
  engine.digit(4);
  engine.digit(5);
  engine.tan();
  assertClose(engine.stack.x, 1.0, 'tan(45°) = 1.0');
});

group('Sin exact values (DEG)', () => {
  const engine = new WP34Engine();
  engine.digit(0);
  engine.sin();
  assertEqual(engine.stack.x, 0, 'sin(0°) = 0');

  engine.clearX();
  engine.digit(9);
  engine.digit(0);
  engine.sin();
  assertEqual(engine.stack.x, 1, 'sin(90°) = 1');
});

group('Cos exact values (DEG)', () => {
  const engine = new WP34Engine();
  engine.digit(0);
  engine.cos();
  assertEqual(engine.stack.x, 1, 'cos(0°) = 1');

  engine.clearX();
  engine.digit(9);
  engine.digit(0);
  engine.cos();
  assertEqual(engine.stack.x, 0, 'cos(90°) = 0');
});

group('Inverse Trig (DEG)', () => {
  const engine = new WP34Engine();
  engine.digit(1);
  engine.asin();
  assertClose(engine.stack.x, 90, 'asin(1) = 90°');
});

group('Trig in RAD mode', () => {
  const engine = new WP34Engine();
  engine.setAngleMode('RAD');
  engine.stack.x = Math.PI / 6;
  engine.sin();
  assertClose(engine.stack.x, 0.5, 'sin(π/6) = 0.5 in RAD');
});

// --- Hyperbolic ---
group('Hyperbolic functions', () => {
  const engine = new WP34Engine();
  engine.digit(0);
  engine.sinh();
  assertEqual(engine.stack.x, 0, 'sinh(0) = 0');

  engine.clearX();
  engine.digit(0);
  engine.cosh();
  assertEqual(engine.stack.x, 1, 'cosh(0) = 1');

  engine.clearX();
  engine.digit(0);
  engine.tanh();
  assertEqual(engine.stack.x, 0, 'tanh(0) = 0');
});

// --- Constants ---
group('Pi', () => {
  const engine = new WP34Engine();
  engine.pi();
  assertClose(engine.stack.x, Math.PI, 'π = 3.14159...');
});

group('Euler e', () => {
  const engine = new WP34Engine();
  engine.eulerE();
  assertClose(engine.stack.x, Math.E, 'e = 2.71828...');
});

// --- Factorial ---
group('Factorial', () => {
  const engine = new WP34Engine();
  engine.digit(5);
  engine.factorial();
  assertEqual(engine.stack.x, 120, '5! = 120');
});

group('Factorial of 0', () => {
  const engine = new WP34Engine();
  engine.digit(0);
  engine.factorial();
  assertEqual(engine.stack.x, 1, '0! = 1');
});

// --- Combinations & Permutations ---
group('Combinations', () => {
  const engine = new WP34Engine();
  engine.digit(5);
  engine.enter();
  engine.digit(2);
  engine.combinations();
  assertEqual(engine.stack.x, 10, 'C(5,2) = 10');
});

group('Permutations', () => {
  const engine = new WP34Engine();
  engine.digit(5);
  engine.enter();
  engine.digit(3);
  engine.permutations();
  assertEqual(engine.stack.x, 60, 'P(5,3) = 60');
});

// --- Percentage ---
group('Percentage', () => {
  const engine = new WP34Engine();
  engine.digit(2);
  engine.digit(0);
  engine.digit(0);
  engine.enter();
  engine.digit(1);
  engine.digit(5);
  engine.percent();
  assertEqual(engine.stack.x, 30, '15% of 200 = 30');
});

// --- Absolute Value ---
group('Absolute Value', () => {
  const engine = new WP34Engine();
  engine.digit(5);
  engine.changeSign();
  engine.abs();
  assertEqual(engine.stack.x, 5, '|-5| = 5');
});

// --- Integer / Fractional ---
group('Integer Part', () => {
  const engine = new WP34Engine();
  engine.stack.x = 3.75;
  engine.integerPart();
  assertEqual(engine.stack.x, 3, 'INT(3.75) = 3');
});

group('Fractional Part', () => {
  const engine = new WP34Engine();
  engine.stack.x = 3.75;
  engine.fractionalPart();
  assertClose(engine.stack.x, 0.75, 'FRAC(3.75) = 0.75');
});

// --- Modulo ---
group('Modulo', () => {
  const engine = new WP34Engine();
  engine.digit(1);
  engine.digit(0);
  engine.enter();
  engine.digit(3);
  engine.modulo();
  assertEqual(engine.stack.x, 1, '10 MOD 3 = 1');
});

// --- Memory Operations ---
group('Store and Recall', () => {
  const engine = new WP34Engine();
  engine.digit(4);
  engine.digit(2);
  engine.store(0);
  engine.clearX();
  engine.recall(0);
  assertEqual(engine.stack.x, 42, 'STO 0 / RCL 0 = 42');
});

group('Store Add', () => {
  const engine = new WP34Engine();
  engine.digit(1);
  engine.digit(0);
  engine.store(5);
  engine.clearX();
  engine.digit(5);
  engine.storeAdd(5);
  assertEqual(engine.registers[5], 15, 'STO+ 5: 10 + 5 = 15');
});

group('Store Subtract', () => {
  const engine = new WP34Engine();
  engine.digit(2);
  engine.digit(0);
  engine.store(3);
  engine.clearX();
  engine.digit(8);
  engine.storeSubtract(3);
  assertEqual(engine.registers[3], 12, 'STO- 3: 20 - 8 = 12');
});

// --- Statistics ---
group('Statistics: Mean', () => {
  const engine = new WP34Engine();
  engine.clearStatistics();

  // Enter data: 10, 20, 30
  engine.digit(0); engine.enter();
  engine.digit(1); engine.digit(0);
  engine.sigmaPlus();

  engine.digit(0); engine.enter();
  engine.digit(2); engine.digit(0);
  engine.sigmaPlus();

  engine.digit(0); engine.enter();
  engine.digit(3); engine.digit(0);
  engine.sigmaPlus();

  assertEqual(engine.registers[0], 3, 'n = 3');
  engine.mean();
  assertClose(engine.stack.x, 20, 'Mean of 10, 20, 30 = 20');
});

// --- Coordinate Conversion ---
group('Rectangular to Polar', () => {
  const engine = new WP34Engine();
  engine.digit(3);
  engine.enter();
  engine.digit(4);
  engine.toPolar();
  assertClose(engine.stack.x, 5, 'r = 5 for (4, 3)');
});

// --- Display Formatting ---
group('Display FIX mode', () => {
  const engine = new WP34Engine();
  engine.setDisplayMode('FIX', 2);
  assertEqual(engine.formatDisplay(3.14159), '3.14', 'FIX 2: 3.14');
});

group('Display SCI mode', () => {
  const engine = new WP34Engine();
  engine.setDisplayMode('SCI', 3);
  assertEqual(engine.formatDisplay(12345), '1.235e+4', 'SCI 3: 1.235e+4');
});

group('Display ALL mode', () => {
  const engine = new WP34Engine();
  engine.setDisplayMode('ALL');
  const result = engine.formatDisplay(3.14);
  assertEqual(result, '3.14', 'ALL mode: 3.14');
});

// --- Angle Mode Toggle ---
group('Angle Mode Toggle', () => {
  const engine = new WP34Engine();
  assertEqual(engine.angleMode, 'DEG', 'Starts at DEG');
  engine.toggleAngleMode();
  assertEqual(engine.angleMode, 'RAD', 'Toggle to RAD');
  engine.toggleAngleMode();
  assertEqual(engine.angleMode, 'GRAD', 'Toggle to GRAD');
  engine.toggleAngleMode();
  assertEqual(engine.angleMode, 'DEG', 'Toggle back to DEG');
});

// --- Clear Operations ---
group('Clear X', () => {
  const engine = new WP34Engine();
  engine.digit(5);
  engine.enter();
  engine.digit(3);
  engine.clearX();
  assertEqual(engine.stack.x, 0, 'X = 0 after CLx');
  assertEqual(engine.stack.y, 5, 'Y unchanged after CLx');
});

group('Clear All', () => {
  const engine = new WP34Engine();
  engine.digit(5);
  engine.enter();
  engine.digit(3);
  engine.store(0);
  engine.clearAll();
  assertEqual(engine.stack.x, 0, 'X = 0 after CLR ALL');
  assertEqual(engine.stack.y, 0, 'Y = 0 after CLR ALL');
  assertEqual(engine.registers[0], 0, 'R0 = 0 after CLR ALL');
});

// --- Cube Root ---
group('Cube Root', () => {
  const engine = new WP34Engine();
  engine.digit(2);
  engine.digit(7);
  engine.cubeRoot();
  assertClose(engine.stack.x, 3, '³√27 = 3');
});

// --- xth Root ---
group('xth Root', () => {
  const engine = new WP34Engine();
  engine.digit(1);
  engine.digit(6);
  engine.enter();
  engine.digit(4);
  engine.xthRoot();
  assertClose(engine.stack.x, 2, '⁴√16 = 2');
});

// --- Log2 / 2^x ---
group('Log2 and 2^x', () => {
  const engine = new WP34Engine();
  engine.digit(8);
  engine.log2();
  assertClose(engine.stack.x, 3, 'log2(8) = 3');

  engine.clearX();
  engine.digit(5);
  engine.pow2();
  assertEqual(engine.stack.x, 32, '2^5 = 32');
});

// --- Degree/Radian Conversion ---
group('Deg to Rad', () => {
  const engine = new WP34Engine();
  engine.digit(1);
  engine.digit(8);
  engine.digit(0);
  engine.degToRad();
  assertClose(engine.stack.x, Math.PI, '180° = π rad');
});

group('Rad to Deg', () => {
  const engine = new WP34Engine();
  engine.pi();
  engine.radToDeg();
  assertClose(engine.stack.x, 180, 'π rad = 180°');
});

// --- Error Handling ---
group('Error handling', () => {
  const engine = new WP34Engine();
  engine.digit(0);
  engine.reciprocal();
  assert(isNaN(engine.stack.x), '1/0 = NaN');
  assertEqual(engine.error, 'Invalid', 'Error set for 1/0');

  engine.clearX();
  assertEqual(engine.error, null, 'Error cleared after CLx');
});

group('Ln of negative', () => {
  const engine = new WP34Engine();
  engine.digit(5);
  engine.changeSign();
  engine.ln();
  assert(isNaN(engine.stack.x), 'ln(-5) = NaN');
  assertEqual(engine.error, 'Invalid', 'Error set for ln(-5)');
});

// --- Complex RPN Workflow ---
group('Complex: Quadratic formula discriminant √(b²−4ac)', () => {
  // a=1, b=5, c=6  =>  discriminant = 25 - 24 = 1
  const engine = new WP34Engine();

  // Step 1: compute b² = 25 using direct stack manipulation
  engine.setX(5);
  engine.square(); // X = 25

  // Step 2: store b² and compute 4*a*c
  engine.store(0); // R0 = 25

  engine.clearX();
  engine.setX(4);  // X = 4
  engine.enter();   // Y = 4
  engine.setX(1);  // X = 1 (a)
  engine.multiply(); // X = 4*1 = 4
  engine.enter();
  engine.setX(6);  // X = 6 (c)
  engine.multiply(); // X = 4*1*6 = 24

  // Step 3: b² - 4ac
  engine.store(1); // R1 = 24
  engine.clearX();
  engine.recall(0); // X = 25
  engine.enter();
  engine.recall(1); // X = 24, Y = 25
  engine.subtract(); // X = 25 - 24 = 1

  // Step 4: √(discriminant)
  engine.squareRoot(); // √1 = 1

  assertEqual(engine.stack.x, 1, '√(5²−4·1·6) = 1');
});

// --- getDisplay during entry ---
group('getDisplay during entry', () => {
  const engine = new WP34Engine();
  engine.digit(3);
  engine.decimal();
  engine.digit(1);
  assertEqual(engine.getDisplay(), '3.1', 'Display shows input buffer during entry');
});

// --- setX ---
group('setX', () => {
  const engine = new WP34Engine();
  engine.setX(42);
  assertEqual(engine.stack.x, 42, 'setX sets X to 42');
});

// ======================================
// Summary
// ======================================

console.log('\n' + '='.repeat(50));
console.log(`Results: ${passCount} passed, ${failCount} failed, ${totalTests} total`);

if (failCount > 0) {
  console.log('\nSome tests FAILED!');
  process.exit(1);
} else {
  console.log('\nAll tests PASSED!');
  process.exit(0);
}

/**
 * WP-34S RPN Calculator Engine
 *
 * Implements a 4-level RPN stack (X, Y, Z, T) with scientific functions,
 * memory registers, and multiple display/angle modes.
 *
 * Based on the WP-34S calculator design (an open-source scientific calculator
 * firmware for HP-20b/HP-30b hardware).
 */

'use strict';

class WP34Engine {
  constructor() {
    // 4-level RPN stack: X (display), Y, Z, T
    this.stack = { x: 0, y: 0, z: 0, t: 0 };
    // Last X register (stores X before operations)
    this.lastX = 0;
    // 100 numbered memory registers (R00-R99)
    this.registers = new Array(100).fill(0);
    // Angle mode: 'DEG', 'RAD', 'GRAD'
    this.angleMode = 'DEG';
    // Display mode: 'FIX', 'SCI', 'ENG', 'ALL'
    this.displayMode = 'FIX';
    // Display precision (digits after decimal)
    this.displayDigits = 4;
    // Input buffer for digit entry
    this.inputBuffer = '';
    // Whether we are in the middle of entering a number
    this.isEntering = false;
    // Whether stack lift is enabled (after operations, ENTER disables it)
    this.stackLiftEnabled = true;
    // Flag register for conditional operations
    this.flags = new Array(12).fill(false);
    // Error state
    this.error = null;
  }

  // === Stack Operations ===

  /**
   * Push a value onto the stack (lift stack).
   * T is lost, Z←T, Y←Z, X←Y, new value→X
   */
  stackLift(value) {
    this.stack.t = this.stack.z;
    this.stack.z = this.stack.y;
    this.stack.y = this.stack.x;
    this.stack.x = value;
  }

  /**
   * Drop the stack.
   * X is lost, Y→X, Z→Y, T→Z, T remains
   */
  stackDrop() {
    this.stack.x = this.stack.y;
    this.stack.y = this.stack.z;
    this.stack.z = this.stack.t;
    // T register replicates (standard RPN behavior)
  }

  /**
   * ENTER key: duplicate X into Y, disable stack lift.
   */
  enter() {
    this._finishEntry();
    this.stackLift(this.stack.x);
    this.stackLiftEnabled = false;
    return this.stack.x;
  }

  /**
   * Swap X and Y registers.
   */
  swapXY() {
    this._finishEntry();
    const temp = this.stack.x;
    this.stack.x = this.stack.y;
    this.stack.y = temp;
    return this.stack.x;
  }

  /**
   * Roll stack down: X→T, Y→X, Z→Y, T→Z
   */
  rollDown() {
    this._finishEntry();
    const temp = this.stack.x;
    this.stack.x = this.stack.y;
    this.stack.y = this.stack.z;
    this.stack.z = this.stack.t;
    this.stack.t = temp;
    return this.stack.x;
  }

  /**
   * Roll stack up: T→X, X→Y, Y→Z, Z→T
   */
  rollUp() {
    this._finishEntry();
    const temp = this.stack.t;
    this.stack.t = this.stack.z;
    this.stack.z = this.stack.y;
    this.stack.y = this.stack.x;
    this.stack.x = temp;
    return this.stack.x;
  }

  /**
   * Recall Last X value.
   */
  recallLastX() {
    this._finishEntry();
    if (this.stackLiftEnabled) {
      this.stackLift(this.lastX);
    } else {
      this.stack.x = this.lastX;
    }
    this.stackLiftEnabled = true;
    return this.stack.x;
  }

  /**
   * Clear the X register.
   */
  clearX() {
    this.stack.x = 0;
    this.inputBuffer = '';
    this.isEntering = false;
    this.stackLiftEnabled = false;
    this.error = null;
    return 0;
  }

  /**
   * Clear all (stack, registers, flags).
   */
  clearAll() {
    this.stack = { x: 0, y: 0, z: 0, t: 0 };
    this.lastX = 0;
    this.registers = new Array(100).fill(0);
    this.inputBuffer = '';
    this.isEntering = false;
    this.stackLiftEnabled = true;
    this.error = null;
    this.flags = new Array(12).fill(false);
    return 0;
  }

  // === Number Entry ===

  /**
   * Digit entry (0-9).
   */
  digit(d) {
    if (d < 0 || d > 9 || !Number.isInteger(d)) {
      return this.stack.x;
    }
    this.error = null;

    if (!this.isEntering) {
      // Start new number entry
      if (this.stackLiftEnabled) {
        this.stackLift(0);
      }
      this.inputBuffer = '';
      this.isEntering = true;
    }

    this.inputBuffer += d.toString();
    this.stack.x = this._parseInput(this.inputBuffer);
    this.stackLiftEnabled = true;
    return this.stack.x;
  }

  /**
   * Decimal point entry.
   */
  decimal() {
    this.error = null;

    if (!this.isEntering) {
      if (this.stackLiftEnabled) {
        this.stackLift(0);
      }
      this.inputBuffer = '0';
      this.isEntering = true;
    }

    if (!this.inputBuffer.includes('.')) {
      this.inputBuffer += '.';
    }
    this.stack.x = this._parseInput(this.inputBuffer);
    this.stackLiftEnabled = true;
    return this.stack.x;
  }

  /**
   * Change sign (+/-).
   */
  changeSign() {
    if (this.isEntering) {
      if (this.inputBuffer.startsWith('-')) {
        this.inputBuffer = this.inputBuffer.substring(1);
      } else {
        this.inputBuffer = '-' + this.inputBuffer;
      }
      this.stack.x = this._parseInput(this.inputBuffer);
    } else {
      this.stack.x = -this.stack.x;
    }
    return this.stack.x;
  }

  /**
   * Backspace: remove last digit.
   */
  backspace() {
    if (this.isEntering && this.inputBuffer.length > 0) {
      this.inputBuffer = this.inputBuffer.slice(0, -1);
      if (this.inputBuffer === '' || this.inputBuffer === '-') {
        this.inputBuffer = '';
        this.stack.x = 0;
      } else {
        this.stack.x = this._parseInput(this.inputBuffer);
      }
    }
    return this.stack.x;
  }

  /**
   * EEX: Enter exponent mode.
   */
  enterExponent() {
    this.error = null;

    if (!this.isEntering) {
      if (this.stackLiftEnabled) {
        this.stackLift(0);
      }
      this.inputBuffer = '1';
      this.isEntering = true;
    }

    if (!this.inputBuffer.includes('e')) {
      this.inputBuffer += 'e';
    }
    return this.stack.x;
  }

  // === Arithmetic Operations ===

  /**
   * Perform a binary operation (uses X and Y, result in X, stack drops).
   */
  _binaryOp(fn) {
    this._finishEntry();
    this.lastX = this.stack.x;
    const result = fn(this.stack.y, this.stack.x);

    if (!isFinite(result)) {
      this.error = isNaN(result) ? 'Invalid' : 'Overflow';
    }

    this.stack.x = result;
    // Drop stack: Y←Z, Z←T, T remains
    this.stack.y = this.stack.z;
    this.stack.z = this.stack.t;
    this.stackLiftEnabled = true;
    return this.stack.x;
  }

  /**
   * Perform a unary operation (operates on X only).
   */
  _unaryOp(fn) {
    this._finishEntry();
    this.lastX = this.stack.x;
    const result = fn(this.stack.x);

    if (!isFinite(result)) {
      this.error = isNaN(result) ? 'Invalid' : 'Overflow';
    }

    this.stack.x = result;
    this.stackLiftEnabled = true;
    return this.stack.x;
  }

  add() {
    return this._binaryOp((y, x) => y + x);
  }

  subtract() {
    return this._binaryOp((y, x) => y - x);
  }

  multiply() {
    return this._binaryOp((y, x) => y * x);
  }

  divide() {
    return this._binaryOp((y, x) => {
      if (x === 0) return NaN;
      return y / x;
    });
  }

  // === Scientific Functions ===

  // --- Power & Root ---

  power() {
    return this._binaryOp((y, x) => Math.pow(y, x));
  }

  squareRoot() {
    return this._unaryOp(x => {
      if (x < 0) return NaN;
      return Math.sqrt(x);
    });
  }

  square() {
    return this._unaryOp(x => x * x);
  }

  reciprocal() {
    return this._unaryOp(x => {
      if (x === 0) return NaN;
      return 1 / x;
    });
  }

  cubeRoot() {
    return this._unaryOp(x => Math.cbrt(x));
  }

  xthRoot() {
    return this._binaryOp((y, x) => {
      if (x === 0) return NaN;
      return Math.pow(y, 1 / x);
    });
  }

  // --- Logarithmic ---

  ln() {
    return this._unaryOp(x => {
      if (x <= 0) return NaN;
      return Math.log(x);
    });
  }

  log10() {
    return this._unaryOp(x => {
      if (x <= 0) return NaN;
      return Math.log10(x);
    });
  }

  exp() {
    return this._unaryOp(x => Math.exp(x));
  }

  pow10() {
    return this._unaryOp(x => Math.pow(10, x));
  }

  log2() {
    return this._unaryOp(x => {
      if (x <= 0) return NaN;
      return Math.log2(x);
    });
  }

  pow2() {
    return this._unaryOp(x => Math.pow(2, x));
  }

  // --- Trigonometric ---

  _toRadians(angle) {
    switch (this.angleMode) {
      case 'DEG': return angle * Math.PI / 180;
      case 'GRAD': return angle * Math.PI / 200;
      case 'RAD': return angle;
      default: return angle;
    }
  }

  _fromRadians(radians) {
    switch (this.angleMode) {
      case 'DEG': return radians * 180 / Math.PI;
      case 'GRAD': return radians * 200 / Math.PI;
      case 'RAD': return radians;
      default: return radians;
    }
  }

  sin() {
    return this._unaryOp(x => {
      const rad = this._toRadians(x);
      // Handle exact values for common angles in DEG mode
      if (this.angleMode === 'DEG') {
        const normalized = ((x % 360) + 360) % 360;
        if (normalized === 0 || normalized === 180) return 0;
        if (normalized === 90) return 1;
        if (normalized === 270) return -1;
      }
      return Math.sin(rad);
    });
  }

  cos() {
    return this._unaryOp(x => {
      const rad = this._toRadians(x);
      if (this.angleMode === 'DEG') {
        const normalized = ((x % 360) + 360) % 360;
        if (normalized === 0) return 1;
        if (normalized === 90 || normalized === 270) return 0;
        if (normalized === 180) return -1;
      }
      return Math.cos(rad);
    });
  }

  tan() {
    return this._unaryOp(x => {
      if (this.angleMode === 'DEG') {
        const normalized = ((x % 360) + 360) % 360;
        if (normalized === 0 || normalized === 180) return 0;
        if (normalized === 90 || normalized === 270) return NaN;
      }
      return Math.tan(this._toRadians(x));
    });
  }

  asin() {
    return this._unaryOp(x => {
      if (x < -1 || x > 1) return NaN;
      return this._fromRadians(Math.asin(x));
    });
  }

  acos() {
    return this._unaryOp(x => {
      if (x < -1 || x > 1) return NaN;
      return this._fromRadians(Math.acos(x));
    });
  }

  atan() {
    return this._unaryOp(x => this._fromRadians(Math.atan(x)));
  }

  // --- Hyperbolic ---

  sinh() {
    return this._unaryOp(x => Math.sinh(x));
  }

  cosh() {
    return this._unaryOp(x => Math.cosh(x));
  }

  tanh() {
    return this._unaryOp(x => Math.tanh(x));
  }

  asinh() {
    return this._unaryOp(x => Math.asinh(x));
  }

  acosh() {
    return this._unaryOp(x => {
      if (x < 1) return NaN;
      return Math.acosh(x);
    });
  }

  atanh() {
    return this._unaryOp(x => {
      if (x <= -1 || x >= 1) return NaN;
      return Math.atanh(x);
    });
  }

  // --- Constants ---

  pi() {
    this._finishEntry();
    if (this.stackLiftEnabled) {
      this.stackLift(Math.PI);
    } else {
      this.stack.x = Math.PI;
    }
    this.stackLiftEnabled = true;
    return this.stack.x;
  }

  eulerE() {
    this._finishEntry();
    if (this.stackLiftEnabled) {
      this.stackLift(Math.E);
    } else {
      this.stack.x = Math.E;
    }
    this.stackLiftEnabled = true;
    return this.stack.x;
  }

  // --- Factorial & Combinatorics ---

  factorial() {
    return this._unaryOp(x => {
      if (x < 0 || x !== Math.floor(x) || x > 170) {
        if (x < 0) return NaN;
        if (x > 170) return Infinity;
        // Gamma function for non-integers: x! = Gamma(x+1)
        return this._gamma(x + 1);
      }
      let result = 1;
      for (let i = 2; i <= x; i++) {
        result *= i;
      }
      return result;
    });
  }

  /**
   * Lanczos approximation of the Gamma function.
   */
  _gamma(z) {
    if (z < 0.5) {
      return Math.PI / (Math.sin(Math.PI * z) * this._gamma(1 - z));
    }
    z -= 1;
    const g = 7;
    const c = [
      0.99999999999980993,
      676.5203681218851,
      -1259.1392167224028,
      771.32342877765313,
      -176.61502916214059,
      12.507343278686905,
      -0.13857109526572012,
      9.9843695780195716e-6,
      1.5056327351493116e-7
    ];
    let x = c[0];
    for (let i = 1; i < g + 2; i++) {
      x += c[i] / (z + i);
    }
    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }

  /**
   * Combinations: C(y, x) = y! / (x! * (y-x)!)
   */
  combinations() {
    return this._binaryOp((y, x) => {
      if (x < 0 || y < 0 || x > y) return NaN;
      if (x !== Math.floor(x) || y !== Math.floor(y)) return NaN;
      let result = 1;
      const k = Math.min(x, y - x);
      for (let i = 0; i < k; i++) {
        result = result * (y - i) / (i + 1);
      }
      return Math.round(result);
    });
  }

  /**
   * Permutations: P(y, x) = y! / (y-x)!
   */
  permutations() {
    return this._binaryOp((y, x) => {
      if (x < 0 || y < 0 || x > y) return NaN;
      if (x !== Math.floor(x) || y !== Math.floor(y)) return NaN;
      let result = 1;
      for (let i = 0; i < x; i++) {
        result *= (y - i);
      }
      return result;
    });
  }

  // --- Percentage ---

  percent() {
    this._finishEntry();
    this.lastX = this.stack.x;
    this.stack.x = this.stack.y * this.stack.x / 100;
    this.stackLiftEnabled = true;
    return this.stack.x;
  }

  percentChange() {
    this._finishEntry();
    this.lastX = this.stack.x;
    if (this.stack.y === 0) {
      this.error = 'Invalid';
      this.stack.x = NaN;
    } else {
      this.stack.x = (this.stack.x - this.stack.y) / this.stack.y * 100;
    }
    this.stackLiftEnabled = true;
    return this.stack.x;
  }

  // --- Absolute Value, Integer, Fractional ---

  abs() {
    return this._unaryOp(x => Math.abs(x));
  }

  integerPart() {
    return this._unaryOp(x => Math.trunc(x));
  }

  fractionalPart() {
    return this._unaryOp(x => x - Math.trunc(x));
  }

  floor() {
    return this._unaryOp(x => Math.floor(x));
  }

  ceil() {
    return this._unaryOp(x => Math.ceil(x));
  }

  round() {
    return this._unaryOp(x => Math.round(x));
  }

  // --- Modulo ---

  modulo() {
    return this._binaryOp((y, x) => {
      if (x === 0) return NaN;
      return y % x;
    });
  }

  // --- Max / Min ---

  max() {
    return this._binaryOp((y, x) => Math.max(y, x));
  }

  min() {
    return this._binaryOp((y, x) => Math.min(y, x));
  }

  // === Memory Register Operations ===

  /**
   * Store X to register n.
   */
  store(n) {
    if (n < 0 || n >= 100 || !Number.isInteger(n)) return this.stack.x;
    this._finishEntry();
    this.registers[n] = this.stack.x;
    return this.stack.x;
  }

  /**
   * Recall register n to X.
   */
  recall(n) {
    if (n < 0 || n >= 100 || !Number.isInteger(n)) return this.stack.x;
    this._finishEntry();
    if (this.stackLiftEnabled) {
      this.stackLift(this.registers[n]);
    } else {
      this.stack.x = this.registers[n];
    }
    this.stackLiftEnabled = true;
    return this.stack.x;
  }

  /**
   * Store + (add X to register n).
   */
  storeAdd(n) {
    if (n < 0 || n >= 100 || !Number.isInteger(n)) return this.stack.x;
    this._finishEntry();
    this.registers[n] += this.stack.x;
    return this.stack.x;
  }

  /**
   * Store - (subtract X from register n).
   */
  storeSubtract(n) {
    if (n < 0 || n >= 100 || !Number.isInteger(n)) return this.stack.x;
    this._finishEntry();
    this.registers[n] -= this.stack.x;
    return this.stack.x;
  }

  // === Angle Mode ===

  setAngleMode(mode) {
    if (['DEG', 'RAD', 'GRAD'].includes(mode)) {
      this.angleMode = mode;
    }
    return this.angleMode;
  }

  toggleAngleMode() {
    const modes = ['DEG', 'RAD', 'GRAD'];
    const idx = modes.indexOf(this.angleMode);
    this.angleMode = modes[(idx + 1) % 3];
    return this.angleMode;
  }

  // === Display Mode ===

  setDisplayMode(mode, digits) {
    if (['FIX', 'SCI', 'ENG', 'ALL'].includes(mode)) {
      this.displayMode = mode;
    }
    if (typeof digits === 'number' && digits >= 0 && digits <= 15) {
      this.displayDigits = digits;
    }
    return this.formatDisplay(this.stack.x);
  }

  /**
   * Format a number for display according to current display mode.
   */
  formatDisplay(value) {
    if (this.error) {
      return this.error;
    }
    if (value === undefined || value === null) value = this.stack.x;
    if (!isFinite(value)) {
      if (isNaN(value)) return 'Error';
      return value > 0 ? 'Overflow' : '-Overflow';
    }

    switch (this.displayMode) {
      case 'FIX':
        return this._formatFixed(value);
      case 'SCI':
        return value.toExponential(this.displayDigits);
      case 'ENG':
        return this._formatEngineering(value);
      case 'ALL':
        return this._formatAll(value);
      default:
        return value.toString();
    }
  }

  _formatFixed(value) {
    return value.toFixed(this.displayDigits);
  }

  _formatEngineering(value) {
    if (value === 0) return (0).toFixed(this.displayDigits);
    const exp = Math.floor(Math.log10(Math.abs(value)));
    const engExp = Math.floor(exp / 3) * 3;
    const mantissa = value / Math.pow(10, engExp);
    const mantissaDigits = Math.max(0, this.displayDigits - (exp - engExp));
    return mantissa.toFixed(mantissaDigits) + (engExp !== 0 ? 'e' + engExp : '');
  }

  _formatAll(value) {
    // Show all significant digits
    const str = value.toPrecision(15);
    // Remove trailing zeros after decimal point
    if (str.includes('.')) {
      return str.replace(/\.?0+$/, '') || '0';
    }
    return str;
  }

  // === Statistics ===

  /**
   * Σ+ : Accumulate statistics (x, y pair from stack).
   * R0 = n, R1 = Σx, R2 = Σx², R3 = Σy, R4 = Σy², R5 = Σxy
   */
  sigmaPlus() {
    this._finishEntry();
    const x = this.stack.x;
    const y = this.stack.y;
    this.registers[0] += 1;    // n
    this.registers[1] += x;    // Σx
    this.registers[2] += x * x; // Σx²
    this.registers[3] += y;    // Σy
    this.registers[4] += y * y; // Σy²
    this.registers[5] += x * y; // Σxy
    this.lastX = x;
    // Drop stack
    this.stack.x = this.registers[0];
    this.stack.y = this.stack.z;
    this.stack.z = this.stack.t;
    this.stackLiftEnabled = true;
    return this.stack.x;
  }

  /**
   * Σ- : Remove a data point from statistics.
   */
  sigmaMinus() {
    this._finishEntry();
    const x = this.stack.x;
    const y = this.stack.y;
    this.registers[0] -= 1;
    this.registers[1] -= x;
    this.registers[2] -= x * x;
    this.registers[3] -= y;
    this.registers[4] -= y * y;
    this.registers[5] -= x * y;
    this.lastX = x;
    this.stack.x = this.registers[0];
    this.stack.y = this.stack.z;
    this.stack.z = this.stack.t;
    this.stackLiftEnabled = true;
    return this.stack.x;
  }

  /**
   * Clear statistics registers (R0-R5).
   */
  clearStatistics() {
    for (let i = 0; i <= 5; i++) {
      this.registers[i] = 0;
    }
    return 0;
  }

  /**
   * Mean: x̄ and ȳ.
   */
  mean() {
    this._finishEntry();
    const n = this.registers[0];
    if (n === 0) {
      this.error = 'Invalid';
      return NaN;
    }
    if (this.stackLiftEnabled) {
      this.stackLift(0);
    }
    this.stack.x = this.registers[1] / n; // x̄
    this.stack.y = this.registers[3] / n; // ȳ
    this.stackLiftEnabled = true;
    return this.stack.x;
  }

  /**
   * Standard deviation (sample).
   */
  standardDeviation() {
    this._finishEntry();
    const n = this.registers[0];
    if (n < 2) {
      this.error = 'Invalid';
      return NaN;
    }
    const sx = Math.sqrt((this.registers[2] - this.registers[1] * this.registers[1] / n) / (n - 1));
    const sy = Math.sqrt((this.registers[4] - this.registers[3] * this.registers[3] / n) / (n - 1));
    if (this.stackLiftEnabled) {
      this.stackLift(0);
    }
    this.stack.x = sx;
    this.stack.y = sy;
    this.stackLiftEnabled = true;
    return this.stack.x;
  }

  // === Coordinate Conversion ===

  /**
   * Rectangular to Polar: (x, y) → (r, θ)
   */
  toPolar() {
    this._finishEntry();
    const x = this.stack.x;
    const y = this.stack.y;
    this.lastX = x;
    const r = Math.sqrt(x * x + y * y);
    const theta = this._fromRadians(Math.atan2(y, x));
    this.stack.x = r;
    this.stack.y = theta;
    this.stackLiftEnabled = true;
    return this.stack.x;
  }

  /**
   * Polar to Rectangular: (r, θ) → (x, y)
   */
  toRectangular() {
    this._finishEntry();
    const r = this.stack.x;
    const theta = this.stack.y;
    this.lastX = r;
    const rad = this._toRadians(theta);
    this.stack.x = r * Math.cos(rad);
    this.stack.y = r * Math.sin(rad);
    this.stackLiftEnabled = true;
    return this.stack.x;
  }

  // === Unit Conversions ===

  degToRad() {
    return this._unaryOp(x => x * Math.PI / 180);
  }

  radToDeg() {
    return this._unaryOp(x => x * 180 / Math.PI);
  }

  // === Utility ===

  /**
   * Get current display value.
   */
  getDisplay() {
    if (this.isEntering) {
      return this.inputBuffer || '0';
    }
    return this.formatDisplay(this.stack.x);
  }

  /**
   * Get the raw X register value.
   */
  getX() {
    return this.stack.x;
  }

  /**
   * Get the full stack state (for display/debugging).
   */
  getStackState() {
    return {
      x: this.stack.x,
      y: this.stack.y,
      z: this.stack.z,
      t: this.stack.t,
      lastX: this.lastX
    };
  }

  /**
   * Set a value directly into X (for testing or programmatic use).
   */
  setX(value) {
    this._finishEntry();
    if (this.stackLiftEnabled) {
      this.stackLift(value);
    } else {
      this.stack.x = value;
    }
    this.stackLiftEnabled = true;
    return this.stack.x;
  }

  // === Internal Helpers ===

  _finishEntry() {
    if (this.isEntering) {
      this.stack.x = this._parseInput(this.inputBuffer);
      this.inputBuffer = '';
      this.isEntering = false;
    }
  }

  _parseInput(buffer) {
    if (!buffer || buffer === '-' || buffer === '.') return 0;
    const value = parseFloat(buffer);
    return isNaN(value) ? 0 : value;
  }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WP34Engine;
}

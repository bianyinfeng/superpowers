/**
 * WP-34S Calculator UI Controller
 *
 * Connects the WP34Engine to the HTML UI, handling button clicks,
 * keyboard input, shift states, and display updates.
 */

'use strict';

class WP34App {
  constructor() {
    this.engine = new WP34Engine();
    // Shift state: null, 'f', or 'g'
    this.shiftState = null;
    // STO/RCL mode: null, 'STO', 'RCL', 'STO+', 'STO-'
    this.memoryMode = null;
    // Whether we expect a register number next
    this.awaitingRegister = false;
    // Register digit buffer for two-digit register numbers
    this.registerBuffer = '';

    this._initUI();
    this._bindEvents();
    this._updateDisplay();
  }

  _initUI() {
    this.displayMain = document.getElementById('display-main');
    this.displayT = document.getElementById('stack-t');
    this.displayZ = document.getElementById('stack-z');
    this.displayY = document.getElementById('stack-y');
    this.modeAngle = document.getElementById('mode-angle');
    this.modeDisplay = document.getElementById('mode-display');
    this.shiftIndicator = document.getElementById('shift-indicator');
    this.memoryIndicator = document.getElementById('memory-indicator');
  }

  _bindEvents() {
    // Button clicks
    document.querySelectorAll('.calc-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        if (action) {
          this._handleAction(action);
        }
      });
    });

    // Keyboard input
    document.addEventListener('keydown', (e) => {
      this._handleKeyboard(e);
    });
  }

  _handleAction(action) {
    // If awaiting register number, handle differently
    if (this.awaitingRegister) {
      if (action >= '0' && action <= '9') {
        this._handleRegisterDigit(parseInt(action));
        return;
      } else {
        // Cancel memory mode
        this.awaitingRegister = false;
        this.memoryMode = null;
        this.registerBuffer = '';
        this._updateMemoryIndicator();
      }
    }

    // Handle shift states
    if (action === 'f-shift') {
      this.shiftState = this.shiftState === 'f' ? null : 'f';
      this._updateShiftIndicator();
      return;
    }
    if (action === 'g-shift') {
      this.shiftState = this.shiftState === 'g' ? null : 'g';
      this._updateShiftIndicator();
      return;
    }

    // Route action based on shift state
    const shift = this.shiftState;
    this.shiftState = null;
    this._updateShiftIndicator();

    this._executeAction(action, shift);
    this._updateDisplay();
  }

  _executeAction(action, shift) {
    // Digit entry
    if (action >= '0' && action <= '9') {
      this.engine.digit(parseInt(action));
      return;
    }

    switch (action) {
      // Basic operations
      case 'decimal': this.engine.decimal(); break;
      case 'enter': this.engine.enter(); break;
      case 'add': this.engine.add(); break;
      case 'subtract': this.engine.subtract(); break;
      case 'multiply': this.engine.multiply(); break;
      case 'divide': this.engine.divide(); break;
      case 'chs': this.engine.changeSign(); break;
      case 'eex': this.engine.enterExponent(); break;
      case 'backspace': this.engine.backspace(); break;
      case 'clx':
        if (shift === 'f') this.engine.clearAll();
        else this.engine.clearX();
        break;

      // Stack operations
      case 'swap': this.engine.swapXY(); break;
      case 'roll-down':
        if (shift === 'g') this.engine.rollUp();
        else this.engine.rollDown();
        break;
      case 'lastx': this.engine.recallLastX(); break;

      // Power & Root
      case 'sqrt':
        if (shift === 'f') this.engine.square();
        else this.engine.squareRoot();
        break;
      case 'power': this.engine.power(); break;
      case 'reciprocal': this.engine.reciprocal(); break;

      // Logarithmic
      case 'ln':
        if (shift === 'f') this.engine.exp();
        else this.engine.ln();
        break;
      case 'log':
        if (shift === 'f') this.engine.pow10();
        else this.engine.log10();
        break;

      // Trigonometric
      case 'sin':
        if (shift === 'f') this.engine.asin();
        else if (shift === 'g') this.engine.sinh();
        else this.engine.sin();
        break;
      case 'cos':
        if (shift === 'f') this.engine.acos();
        else if (shift === 'g') this.engine.cosh();
        else this.engine.cos();
        break;
      case 'tan':
        if (shift === 'f') this.engine.atan();
        else if (shift === 'g') this.engine.tanh();
        else this.engine.tan();
        break;

      // Constants
      case 'pi': this.engine.pi(); break;

      // Percentage
      case 'percent':
        if (shift === 'f') this.engine.percentChange();
        else this.engine.percent();
        break;

      // Factorial / Combinatorics
      case 'factorial':
        if (shift === 'f') this.engine.combinations();
        else if (shift === 'g') this.engine.permutations();
        else this.engine.factorial();
        break;

      // Absolute value / Integer / Fractional
      case 'abs':
        if (shift === 'f') this.engine.integerPart();
        else if (shift === 'g') this.engine.fractionalPart();
        else this.engine.abs();
        break;

      // Statistics
      case 'sigma-plus':
        if (shift === 'f') this.engine.sigmaMinus();
        else this.engine.sigmaPlus();
        break;
      case 'mean':
        if (shift === 'f') this.engine.standardDeviation();
        else this.engine.mean();
        break;
      case 'clear-stat': this.engine.clearStatistics(); break;

      // Coordinate conversion
      case 'to-polar':
        if (shift === 'f') this.engine.toRectangular();
        else this.engine.toPolar();
        break;

      // Memory operations
      case 'sto':
        if (shift === 'f') {
          this.memoryMode = 'STO+';
        } else if (shift === 'g') {
          this.memoryMode = 'STO-';
        } else {
          this.memoryMode = 'STO';
        }
        this.awaitingRegister = true;
        this.registerBuffer = '';
        this._updateMemoryIndicator();
        return; // Don't update display yet

      case 'rcl':
        this.memoryMode = 'RCL';
        this.awaitingRegister = true;
        this.registerBuffer = '';
        this._updateMemoryIndicator();
        return;

      // Angle mode
      case 'angle-mode': this.engine.toggleAngleMode(); break;

      // Display modes
      case 'fix': this.engine.setDisplayMode('FIX', shift === 'f' ? undefined : this.engine.displayDigits); break;
      case 'sci': this.engine.setDisplayMode('SCI'); break;
      case 'eng': this.engine.setDisplayMode('ENG'); break;

      // Modulo
      case 'mod': this.engine.modulo(); break;

      // Round
      case 'round': this.engine.round(); break;

      // Floor/Ceil
      case 'floor': this.engine.floor(); break;
      case 'ceil': this.engine.ceil(); break;

      // Cube root
      case 'cbrt': this.engine.cubeRoot(); break;

      // xth root
      case 'xroot': this.engine.xthRoot(); break;

      // log2 / 2^x
      case 'log2':
        if (shift === 'f') this.engine.pow2();
        else this.engine.log2();
        break;

      // Deg/Rad conversions
      case 'deg-to-rad': this.engine.degToRad(); break;
      case 'rad-to-deg': this.engine.radToDeg(); break;

      default:
        break;
    }
  }

  _handleRegisterDigit(digit) {
    this.registerBuffer += digit.toString();

    if (this.registerBuffer.length >= 2) {
      const regNum = parseInt(this.registerBuffer);
      this._executeMemoryOp(regNum);
    } else {
      // Wait for second digit, but also allow single digit with a timeout
      this._updateMemoryIndicator();
      this._registerTimeout = setTimeout(() => {
        if (this.awaitingRegister && this.registerBuffer.length === 1) {
          const regNum = parseInt(this.registerBuffer);
          this._executeMemoryOp(regNum);
        }
      }, 1500);
    }
  }

  _executeMemoryOp(regNum) {
    if (this._registerTimeout) {
      clearTimeout(this._registerTimeout);
      this._registerTimeout = null;
    }

    switch (this.memoryMode) {
      case 'STO': this.engine.store(regNum); break;
      case 'RCL': this.engine.recall(regNum); break;
      case 'STO+': this.engine.storeAdd(regNum); break;
      case 'STO-': this.engine.storeSubtract(regNum); break;
    }

    this.awaitingRegister = false;
    this.memoryMode = null;
    this.registerBuffer = '';
    this._updateMemoryIndicator();
    this._updateDisplay();
  }

  _handleKeyboard(e) {
    // Prevent default for keys we handle
    const key = e.key;
    let handled = true;

    if (key >= '0' && key <= '9') {
      this._handleAction(key);
    } else if (key === '.') {
      this._handleAction('decimal');
    } else if (key === 'Enter') {
      this._handleAction('enter');
    } else if (key === '+') {
      this._handleAction('add');
    } else if (key === '-') {
      this._handleAction('subtract');
    } else if (key === '*') {
      this._handleAction('multiply');
    } else if (key === '/') {
      e.preventDefault(); // Prevent browser search
      this._handleAction('divide');
    } else if (key === 'Backspace') {
      this._handleAction('backspace');
    } else if (key === 'Escape') {
      this._handleAction('clx');
    } else if (key === 'n') {
      this._handleAction('chs');
    } else if (key === 's') {
      this._handleAction('sin');
    } else if (key === 'c') {
      this._handleAction('cos');
    } else if (key === 't') {
      this._handleAction('tan');
    } else if (key === 'l') {
      this._handleAction('ln');
    } else if (key === 'L') {
      this._handleAction('log');
    } else if (key === 'p') {
      this._handleAction('pi');
    } else if (key === 'r') {
      this._handleAction('sqrt');
    } else if (key === '^') {
      this._handleAction('power');
    } else if (key === '!') {
      this._handleAction('factorial');
    } else if (key === '%') {
      this._handleAction('percent');
    } else if (key === 'x') {
      this._handleAction('swap');
    } else if (key === 'd') {
      this._handleAction('roll-down');
    } else if (key === 'f') {
      this._handleAction('f-shift');
    } else if (key === 'g') {
      this._handleAction('g-shift');
    } else {
      handled = false;
    }

    if (handled) {
      e.preventDefault();
    }
  }

  _updateDisplay() {
    // Main display
    const displayValue = this.engine.getDisplay();
    this.displayMain.textContent = displayValue;
    this.displayMain.classList.toggle('error', !!this.engine.error);

    // Flash animation
    this.displayMain.classList.remove('display-flash');
    // Force reflow
    void this.displayMain.offsetWidth;
    this.displayMain.classList.add('display-flash');

    // Stack display
    const state = this.engine.getStackState();
    this.displayT.textContent = this.engine.formatDisplay(state.t);
    this.displayZ.textContent = this.engine.formatDisplay(state.z);
    this.displayY.textContent = this.engine.formatDisplay(state.y);

    // Angle mode indicator
    this.modeAngle.textContent = this.engine.angleMode;

    // Display mode indicator
    const dm = this.engine.displayMode;
    const dd = this.engine.displayDigits;
    this.modeDisplay.textContent = dm === 'ALL' ? 'ALL' : `${dm} ${dd}`;
  }

  _updateShiftIndicator() {
    this.shiftIndicator.textContent = '';
    this.shiftIndicator.className = 'shift-indicator';
    if (this.shiftState === 'f') {
      this.shiftIndicator.textContent = 'f';
      this.shiftIndicator.classList.add('f-shift');
    } else if (this.shiftState === 'g') {
      this.shiftIndicator.textContent = 'g';
      this.shiftIndicator.classList.add('g-shift');
    }
  }

  _updateMemoryIndicator() {
    if (this.memoryIndicator) {
      if (this.awaitingRegister) {
        this.memoryIndicator.textContent = this.memoryMode + (this.registerBuffer ? ' ' + this.registerBuffer : ' _');
      } else {
        this.memoryIndicator.textContent = '';
      }
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new WP34App();
});

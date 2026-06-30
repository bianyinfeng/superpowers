/**
 * 计量经济学模型库
 * 包含回归分析、相关性分析、VAR模型等
 */

export interface RegressionResult {
  coefficients: { variable: string; coefficient: number; tStat: number; pValue: number }[];
  rSquared: number;
  adjustedRSquared: number;
  fStatistic: number;
  observations: number;
  interpretation: string;
}

export interface CorrelationMatrix {
  variables: string[];
  matrix: number[][];
}

export interface VARResult {
  equation: string;
  lagOrder: number;
  coefficients: { lag: number; variable: string; coefficient: number }[];
  grangerCausality: { from: string; to: string; fStat: number; pValue: number }[];
}

/**
 * 简单线性回归 (OLS)
 */
export function linearRegression(
  y: number[],
  X: number[][],
  variableNames: string[]
): RegressionResult {
  const n = y.length;
  const k = X[0]?.length || 0;

  // Add intercept
  const XWithIntercept = X.map((row) => [1, ...row]);
  const kFull = k + 1;

  // OLS: β = (X'X)^(-1) X'y
  const XtX = matMul(transpose(XWithIntercept), XWithIntercept);
  const XtY = matVecMul(transpose(XWithIntercept), y);
  const XtXInv = invertMatrix(XtX);
  const beta = matVecMul(XtXInv, XtY);

  // Predicted values and residuals
  const yHat = XWithIntercept.map((row) =>
    row.reduce((sum, val, i) => sum + val * beta[i], 0)
  );
  const residuals = y.map((yi, i) => yi - yHat[i]);

  // R-squared
  const yMean = y.reduce((a, b) => a + b, 0) / n;
  const ssTot = y.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0);
  const ssRes = residuals.reduce((sum, e) => sum + e ** 2, 0);
  const rSquared = 1 - ssRes / ssTot;
  const adjustedRSquared = 1 - ((1 - rSquared) * (n - 1)) / (n - kFull);

  // Standard errors and t-statistics
  const s2 = ssRes / (n - kFull);
  const seCoeffs = XtXInv.map((row, i) => Math.sqrt(Math.abs(row[i]) * s2));
  const tStats = beta.map((b, i) => b / (seCoeffs[i] || 1));

  // F-statistic
  const ssReg = ssTot - ssRes;
  const fStatistic = (ssReg / k) / (ssRes / (n - kFull));

  const allVarNames = ["截距项", ...variableNames];
  const coefficients = allVarNames.map((name, i) => ({
    variable: name,
    coefficient: beta[i] || 0,
    tStat: tStats[i] || 0,
    pValue: approximatePValue(Math.abs(tStats[i] || 0), n - kFull),
  }));

  return {
    coefficients,
    rSquared: Math.max(0, Math.min(1, rSquared)),
    adjustedRSquared: Math.max(0, Math.min(1, adjustedRSquared)),
    fStatistic,
    observations: n,
    interpretation: generateInterpretation(coefficients, rSquared),
  };
}

/**
 * 皮尔逊相关系数矩阵
 */
export function correlationMatrix(
  data: number[][],
  variables: string[]
): CorrelationMatrix {
  const n = data.length;
  const k = variables.length;
  const matrix: number[][] = Array.from({ length: k }, () => Array(k).fill(0));

  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      if (i === j) {
        matrix[i][j] = 1;
      } else {
        const xi = data.map((row) => row[i]);
        const xj = data.map((row) => row[j]);
        matrix[i][j] = pearsonCorrelation(xi, xj);
      }
    }
  }

  return { variables, matrix };
}

/**
 * 格兰杰因果检验（简化版）
 */
export function grangerCausality(
  x: number[],
  y: number[],
  maxLag: number = 4
): { fStat: number; pValue: number; optimalLag: number } {
  // Simplified: compare restricted vs unrestricted model
  const n = x.length - maxLag;
  
  // Unrestricted: y_t = a + b1*y_{t-1} + ... + c1*x_{t-1} + ...
  // Restricted: y_t = a + b1*y_{t-1} + ...
  
  const yDep = y.slice(maxLag);
  const XRestricted: number[][] = [];
  const XUnrestricted: number[][] = [];
  
  for (let t = maxLag; t < y.length; t++) {
    const restricted: number[] = [];
    const unrestricted: number[] = [];
    for (let lag = 1; lag <= maxLag; lag++) {
      restricted.push(y[t - lag]);
      unrestricted.push(y[t - lag]);
    }
    for (let lag = 1; lag <= maxLag; lag++) {
      unrestricted.push(x[t - lag]);
    }
    XRestricted.push(restricted);
    XUnrestricted.push(unrestricted);
  }
  
  const rssR = computeRSS(yDep, XRestricted);
  const rssU = computeRSS(yDep, XUnrestricted);
  
  const fStat = ((rssR - rssU) / maxLag) / (rssU / (n - 2 * maxLag - 1));
  const pValue = approximatePValue(Math.sqrt(Math.abs(fStat)), n - 2 * maxLag - 1);
  
  return { fStat: Math.abs(fStat), pValue, optimalLag: maxLag };
}

// Helper functions
function transpose(matrix: number[][]): number[][] {
  return matrix[0].map((_, i) => matrix.map((row) => row[i]));
}

function matMul(A: number[][], B: number[][]): number[][] {
  const m = A.length;
  const n = B[0].length;
  const p = B.length;
  const result: number[][] = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < p; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return result;
}

function matVecMul(A: number[][], v: number[]): number[] {
  return A.map((row) => row.reduce((sum, val, i) => sum + val * v[i], 0));
}

function invertMatrix(matrix: number[][]): number[][] {
  const n = matrix.length;
  const augmented = matrix.map((row, i) => [
    ...row,
    ...Array(n).fill(0).map((_, j) => (i === j ? 1 : 0)),
  ]);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    const pivot = augmented[i][i];
    if (Math.abs(pivot) < 1e-10) continue;
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= pivot;
    }

    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const factor = augmented[k][i];
      for (let j = 0; j < 2 * n; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }

  return augmented.map((row) => row.slice(n));
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

function computeRSS(y: number[], X: number[][]): number {
  const varNames = X[0]?.map((_, i) => `x${i}`) || [];
  const result = linearRegression(y, X, varNames);
  const yMean = y.reduce((a, b) => a + b, 0) / y.length;
  const ssTot = y.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0);
  return ssTot * (1 - result.rSquared);
}

function approximatePValue(t: number, df: number): number {
  // Simplified t-distribution approximation
  const x = df / (df + t * t);
  const p = 0.5 * Math.pow(x, df / 2);
  return Math.min(1, Math.max(0, p * 2));
}

function generateInterpretation(
  coefficients: RegressionResult["coefficients"],
  rSquared: number
): string {
  const significantVars = coefficients
    .filter((c) => c.variable !== "截距项" && c.pValue < 0.05)
    .map((c) => `${c.variable}(${c.coefficient > 0 ? "正向" : "负向"}影响)`);

  let interpretation = `模型拟合优度R²=${(rSquared * 100).toFixed(1)}%，`;
  if (rSquared > 0.7) {
    interpretation += "模型解释力较强。";
  } else if (rSquared > 0.4) {
    interpretation += "模型具有中等解释力。";
  } else {
    interpretation += "模型解释力有限，可能存在遗漏变量。";
  }

  if (significantVars.length > 0) {
    interpretation += `显著因子包括：${significantVars.join("、")}。`;
  }

  return interpretation;
}

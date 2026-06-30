/**
 * 模拟数据生成器
 * 生成接近真实的金融市场数据用于模型演示
 */

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface YieldCurveData {
  date: string;
  m1: number;
  m3: number;
  m6: number;
  y1: number;
  y2: number;
  y3: number;
  y5: number;
  y7: number;
  y10: number;
  y20: number;
  y30: number;
}

export interface TreasuryModelData {
  yieldCurve: YieldCurveData[];
  yields10Y: TimeSeriesPoint[];
  yields2Y: TimeSeriesPoint[];
  termSpread: TimeSeriesPoint[];
  fedFundsRate: TimeSeriesPoint[];
  inflationExpectations: TimeSeriesPoint[];
  qeBalance: TimeSeriesPoint[];
}

export interface USDModelData {
  dxyIndex: TimeSeriesPoint[];
  realInterestRate: TimeSeriesPoint[];
  tradeBalance: TimeSeriesPoint[];
  capitalFlows: TimeSeriesPoint[];
  fedPolicy: TimeSeriesPoint[];
  usdEur: TimeSeriesPoint[];
  usdJpy: TimeSeriesPoint[];
  usdCny: TimeSeriesPoint[];
}

export interface GoldModelData {
  goldPrice: TimeSeriesPoint[];
  realYield: TimeSeriesPoint[];
  dxyIndex: TimeSeriesPoint[];
  vixIndex: TimeSeriesPoint[];
  centralBankBuying: TimeSeriesPoint[];
  inflationExpectations: TimeSeriesPoint[];
  geopoliticalRisk: TimeSeriesPoint[];
}

export interface InflationModelData {
  cpiHeadline: TimeSeriesPoint[];
  cpiCore: TimeSeriesPoint[];
  pceDeflator: TimeSeriesPoint[];
  ppiIndex: TimeSeriesPoint[];
  wageGrowth: TimeSeriesPoint[];
  moneySupplyM2: TimeSeriesPoint[];
  oilPrice: TimeSeriesPoint[];
  housingCPI: TimeSeriesPoint[];
  inflationExpectations5Y: TimeSeriesPoint[];
}

function generateTimeSeries(
  startDate: string,
  months: number,
  baseValue: number,
  volatility: number,
  trend: number = 0,
  meanReversion: number = 0
): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  let value = baseValue;
  const start = new Date(startDate);

  for (let i = 0; i < months; i++) {
    const date = new Date(start);
    date.setMonth(date.getMonth() + i);
    
    const noise = (Math.random() - 0.5) * 2 * volatility;
    const reversion = meanReversion * (baseValue - value);
    value += trend + reversion + noise;
    
    points.push({
      date: date.toISOString().slice(0, 10),
      value: Math.round(value * 100) / 100,
    });
  }
  return points;
}

function generateCorrelatedSeries(
  reference: TimeSeriesPoint[],
  correlation: number,
  baseValue: number,
  scale: number
): TimeSeriesPoint[] {
  const refMean = reference.reduce((s, p) => s + p.value, 0) / reference.length;
  return reference.map((p) => {
    const refDeviation = (p.value - refMean) / refMean;
    const noise = (Math.random() - 0.5) * 2 * (1 - Math.abs(correlation));
    const value = baseValue + scale * (correlation * refDeviation + noise);
    return { date: p.date, value: Math.round(value * 100) / 100 };
  });
}

export function generateTreasuryData(): TreasuryModelData {
  const startDate = "2020-01-01";
  const months = 60;

  const yields10Y = generateTimeSeries(startDate, months, 1.8, 0.15, 0.03, 0.02);
  const yields2Y = generateTimeSeries(startDate, months, 1.5, 0.12, 0.025, 0.02);
  const fedFundsRate = generateTimeSeries(startDate, months, 1.75, 0.1, 0.02, 0.01);
  const inflationExpectations = generateTimeSeries(startDate, months, 2.0, 0.1, 0.01, 0.03);
  const qeBalance = generateTimeSeries(startDate, months, 4.0, 0.2, 0.05, 0.005);

  const termSpread = yields10Y.map((p, i) => ({
    date: p.date,
    value: Math.round((p.value - yields2Y[i].value) * 100) / 100,
  }));

  const yieldCurve: YieldCurveData[] = yields10Y.map((p, i) => {
    const base = yields2Y[i].value;
    const spread = termSpread[i].value;
    return {
      date: p.date,
      m1: Math.round((base - 0.3 + (Math.random() - 0.5) * 0.1) * 100) / 100,
      m3: Math.round((base - 0.2 + (Math.random() - 0.5) * 0.1) * 100) / 100,
      m6: Math.round((base - 0.1 + (Math.random() - 0.5) * 0.1) * 100) / 100,
      y1: Math.round((base + (Math.random() - 0.5) * 0.1) * 100) / 100,
      y2: base,
      y3: Math.round((base + spread * 0.3) * 100) / 100,
      y5: Math.round((base + spread * 0.6) * 100) / 100,
      y7: Math.round((base + spread * 0.8) * 100) / 100,
      y10: p.value,
      y20: Math.round((p.value + spread * 0.3) * 100) / 100,
      y30: Math.round((p.value + spread * 0.5) * 100) / 100,
    };
  });

  return { yieldCurve, yields10Y, yields2Y, termSpread, fedFundsRate, inflationExpectations, qeBalance };
}

export function generateUSDData(): USDModelData {
  const startDate = "2020-01-01";
  const months = 60;

  const dxyIndex = generateTimeSeries(startDate, months, 97, 1.5, 0.1, 0.01);
  const realInterestRate = generateTimeSeries(startDate, months, 0.5, 0.2, 0.01, 0.02);
  const tradeBalance = generateTimeSeries(startDate, months, -65, 5, -0.5, 0.01);
  const capitalFlows = generateTimeSeries(startDate, months, 50, 10, 0.2, 0.02);
  const fedPolicy = generateTimeSeries(startDate, months, 1.75, 0.15, 0.02, 0.01);

  const usdEur = generateCorrelatedSeries(dxyIndex, 0.85, 1.1, 0.05);
  const usdJpy = generateCorrelatedSeries(dxyIndex, 0.7, 110, 8);
  const usdCny = generateCorrelatedSeries(dxyIndex, 0.6, 6.9, 0.3);

  return { dxyIndex, realInterestRate, tradeBalance, capitalFlows, fedPolicy, usdEur, usdJpy, usdCny };
}

export function generateGoldData(): GoldModelData {
  const startDate = "2020-01-01";
  const months = 60;

  const goldPrice = generateTimeSeries(startDate, months, 1550, 40, 8, 0.005);
  const realYield = generateTimeSeries(startDate, months, 0.3, 0.15, -0.01, 0.02);
  const dxyIndex = generateTimeSeries(startDate, months, 97, 1.5, 0.1, 0.01);
  const vixIndex = generateTimeSeries(startDate, months, 18, 4, 0, 0.05);
  const centralBankBuying = generateTimeSeries(startDate, months, 150, 30, 2, 0.02);
  const inflationExpectations = generateTimeSeries(startDate, months, 2.0, 0.15, 0.01, 0.03);
  const geopoliticalRisk = generateTimeSeries(startDate, months, 50, 10, 0.5, 0.03);

  return { goldPrice, realYield, dxyIndex, vixIndex, centralBankBuying, inflationExpectations, geopoliticalRisk };
}

export function generateInflationData(): InflationModelData {
  const startDate = "2020-01-01";
  const months = 60;

  const cpiHeadline = generateTimeSeries(startDate, months, 2.3, 0.3, 0.05, 0.02);
  const cpiCore = generateTimeSeries(startDate, months, 2.2, 0.2, 0.03, 0.02);
  const pceDeflator = generateTimeSeries(startDate, months, 1.8, 0.2, 0.04, 0.02);
  const ppiIndex = generateTimeSeries(startDate, months, 1.5, 0.5, 0.04, 0.03);
  const wageGrowth = generateTimeSeries(startDate, months, 3.0, 0.3, 0.02, 0.02);
  const moneySupplyM2 = generateTimeSeries(startDate, months, 15.5, 0.3, 0.1, 0.005);
  const oilPrice = generateTimeSeries(startDate, months, 60, 8, 0.5, 0.02);
  const housingCPI = generateTimeSeries(startDate, months, 3.2, 0.3, 0.03, 0.02);
  const inflationExpectations5Y = generateTimeSeries(startDate, months, 2.1, 0.1, 0.01, 0.03);

  return { cpiHeadline, cpiCore, pceDeflator, ppiIndex, wageGrowth, moneySupplyM2, oilPrice, housingCPI, inflationExpectations5Y };
}

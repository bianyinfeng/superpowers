"use client";

import { useMemo } from "react";
import { TimeSeriesChart, MultiSeriesChart } from "@/components/charts/TimeSeriesChart";
import { RegressionTable, CorrelationMatrixTable } from "@/components/charts/ModelResults";
import { generateInflationData } from "@/lib/data/generators";
import { linearRegression, correlationMatrix } from "@/lib/models/econometrics";

export default function InflationMonitor() {
  const data = useMemo(() => generateInflationData(), []);

  // Regression: CPI Headline = f(wage growth, M2, oil price, housing CPI)
  const regressionResult = useMemo(() => {
    const n = Math.min(
      data.cpiHeadline.length,
      data.wageGrowth.length,
      data.moneySupplyM2.length,
      data.oilPrice.length,
      data.housingCPI.length
    );
    const y = data.cpiHeadline.slice(0, n).map((p) => p.value);
    const X = Array.from({ length: n }, (_, i) => [
      data.wageGrowth[i].value,
      data.moneySupplyM2[i].value,
      data.oilPrice[i].value,
      data.housingCPI[i].value,
    ]);
    return linearRegression(y, X, ["工资增速", "M2货币供应量", "原油价格", "住房CPI"]);
  }, [data]);

  // Correlation matrix
  const corrMatrix = useMemo(() => {
    const n = Math.min(data.cpiHeadline.length, data.cpiCore.length, data.wageGrowth.length, data.oilPrice.length);
    const matrixData = Array.from({ length: n }, (_, i) => [
      data.cpiHeadline[i].value,
      data.cpiCore[i].value,
      data.pceDeflator[i].value,
      data.wageGrowth[i].value,
      data.oilPrice[i].value,
      data.housingCPI[i].value,
      data.moneySupplyM2[i].value,
    ]);
    return correlationMatrix(matrixData, ["CPI总体", "核心CPI", "PCE", "工资增速", "油价", "住房CPI", "M2"]);
  }, [data]);

  const latestCPI = data.cpiHeadline[data.cpiHeadline.length - 1]?.value || 0;
  const latestCore = data.cpiCore[data.cpiCore.length - 1]?.value || 0;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          📈 通胀监测模型
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          多维度通胀跟踪与分析框架，涵盖CPI、PCE、工资及预期通胀等关键指标
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <InflationGauge title="CPI同比" value={latestCPI} target={2.0} />
        <InflationGauge title="核心CPI" value={latestCore} target={2.0} />
        <InflationGauge title="PCE平减指数" value={data.pceDeflator[data.pceDeflator.length - 1]?.value || 0} target={2.0} />
        <InflationGauge title="工资增速" value={data.wageGrowth[data.wageGrowth.length - 1]?.value || 0} target={3.5} />
        <InflationGauge title="5Y通胀预期" value={data.inflationExpectations5Y[data.inflationExpectations5Y.length - 1]?.value || 0} target={2.0} />
      </div>

      {/* Charts */}
      <MultiSeriesChart
        title="通胀指标对比 (同比%)"
        series={[
          { data: data.cpiHeadline, name: "CPI总体", color: "#ef4444" },
          { data: data.cpiCore, name: "核心CPI", color: "#3b82f6" },
          { data: data.pceDeflator, name: "PCE平减指数", color: "#10b981" },
        ]}
        unit="%"
        height={350}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MultiSeriesChart
          title="需求侧通胀因子"
          series={[
            { data: data.wageGrowth, name: "工资增速", color: "#8b5cf6" },
            { data: data.housingCPI, name: "住房CPI", color: "#f97316" },
          ]}
          unit="%"
        />
        <MultiSeriesChart
          title="供给侧通胀因子"
          series={[
            { data: data.oilPrice, name: "原油价格($)", color: "#0ea5e9" },
            { data: data.ppiIndex, name: "PPI(%)", color: "#ec4899" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TimeSeriesChart data={data.moneySupplyM2} title="M2货币供应量 (万亿美元)" color="#6366f1" unit="T" />
        <TimeSeriesChart data={data.inflationExpectations5Y} title="5年期通胀预期" color="#14b8a6" unit="%" />
      </div>

      {/* Model Results */}
      <RegressionTable
        result={regressionResult}
        title="OLS回归模型：CPI通胀驱动因子分析"
      />

      <CorrelationMatrixTable data={corrMatrix} title="变量相关性矩阵" />

      {/* Model Explanation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📖 模型说明</h3>
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <p>
            <strong>分析框架：</strong>本模型从供给侧和需求侧两个维度分析通胀成因，并追踪通胀预期的锚定状态。
          </p>
          <p><strong>核心指标含义：</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>CPI总体 vs 核心CPI：</strong>核心CPI剔除食品和能源波动，更好反映趋势性通胀压力</li>
            <li><strong>PCE平减指数：</strong>美联储首选通胀指标，权重更新更频繁，目标为2%</li>
            <li><strong>工资增速：</strong>劳动力成本是服务业通胀的核心驱动力（工资-价格螺旋）</li>
            <li><strong>住房CPI：</strong>占CPI权重约1/3，具有显著滞后性（6-12个月）</li>
          </ul>
          <p><strong>驱动因子分析：</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>需求拉动型：</strong>M2超发→过剩流动性→需求过热→物价上涨</li>
            <li><strong>成本推动型：</strong>原油价格上涨→运输/生产成本增加→PPI传导至CPI</li>
            <li><strong>工资推动型：</strong>劳动力市场紧张→工资快速增长→企业转嫁成本至消费者</li>
            <li><strong>住房通胀：</strong>房价上涨滞后反映至租金CPI，是核心通胀的主要组成</li>
          </ul>
          <p><strong>政策含义：</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>当CPI持续高于2%目标时，美联储倾向加息抑制需求</li>
            <li>核心PCE是美联储决策的主要参考，而非CPI总体</li>
            <li>5年通胀预期若脱锚（远离2%），将加大美联储紧缩力度</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function InflationGauge({ title, value, target }: { title: string; value: number; target: number }) {
  const diff = value - target;
  const status = Math.abs(diff) < 0.3 ? "正常" : diff > 0 ? "偏高" : "偏低";
  const statusColor = Math.abs(diff) < 0.3
    ? "text-green-600 bg-green-50 dark:bg-green-900/20"
    : diff > 0
      ? "text-red-600 bg-red-50 dark:bg-red-900/20"
      : "text-blue-600 bg-blue-50 dark:bg-blue-900/20";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="text-xs text-gray-500 dark:text-gray-400">{title}</div>
      <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">{value.toFixed(1)}%</div>
      <div className={`text-xs mt-1 px-2 py-0.5 rounded inline-block ${statusColor}`}>
        {status} (目标{target}%)
      </div>
    </div>
  );
}

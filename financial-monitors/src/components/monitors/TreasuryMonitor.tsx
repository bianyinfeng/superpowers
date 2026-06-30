"use client";

import { useMemo } from "react";
import { TimeSeriesChart, MultiSeriesChart } from "@/components/charts/TimeSeriesChart";
import { YieldCurveChart } from "@/components/charts/YieldCurveChart";
import { RegressionTable, CorrelationMatrixTable } from "@/components/charts/ModelResults";
import { generateTreasuryData } from "@/lib/data/generators";
import { linearRegression, correlationMatrix } from "@/lib/models/econometrics";

export default function TreasuryMonitor() {
  const data = useMemo(() => generateTreasuryData(), []);

  // Run regression: 10Y yield = f(fed funds rate, inflation expectations, QE balance)
  const regressionResult = useMemo(() => {
    const n = Math.min(data.yields10Y.length, data.fedFundsRate.length, data.inflationExpectations.length, data.qeBalance.length);
    const y = data.yields10Y.slice(0, n).map((p) => p.value);
    const X = Array.from({ length: n }, (_, i) => [
      data.fedFundsRate[i].value,
      data.inflationExpectations[i].value,
      data.qeBalance[i].value,
    ]);
    return linearRegression(y, X, ["联邦基金利率", "通胀预期", "美联储资产负债表(万亿)"]);
  }, [data]);

  // Correlation matrix
  const corrMatrix = useMemo(() => {
    const n = Math.min(data.yields10Y.length, data.yields2Y.length, data.fedFundsRate.length, data.inflationExpectations.length);
    const matrixData = Array.from({ length: n }, (_, i) => [
      data.yields10Y[i].value,
      data.yields2Y[i].value,
      data.fedFundsRate[i].value,
      data.inflationExpectations[i].value,
      data.qeBalance[i].value,
    ]);
    return correlationMatrix(matrixData, ["10Y收益率", "2Y收益率", "联邦基金利率", "通胀预期", "QE规模"]);
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🏛️ 美国国债市场监测模型
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          基于宏观经济因子的国债收益率分析模型，追踪收益率曲线变化、期限利差及政策影响
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="10Y收益率"
          value={`${data.yields10Y[data.yields10Y.length - 1]?.value.toFixed(2)}%`}
          change={data.yields10Y[data.yields10Y.length - 1]?.value - data.yields10Y[data.yields10Y.length - 2]?.value}
        />
        <MetricCard
          title="2Y收益率"
          value={`${data.yields2Y[data.yields2Y.length - 1]?.value.toFixed(2)}%`}
          change={data.yields2Y[data.yields2Y.length - 1]?.value - data.yields2Y[data.yields2Y.length - 2]?.value}
        />
        <MetricCard
          title="期限利差(10Y-2Y)"
          value={`${data.termSpread[data.termSpread.length - 1]?.value.toFixed(2)}%`}
          change={data.termSpread[data.termSpread.length - 1]?.value - data.termSpread[data.termSpread.length - 2]?.value}
        />
        <MetricCard
          title="联邦基金利率"
          value={`${data.fedFundsRate[data.fedFundsRate.length - 1]?.value.toFixed(2)}%`}
          change={data.fedFundsRate[data.fedFundsRate.length - 1]?.value - data.fedFundsRate[data.fedFundsRate.length - 2]?.value}
        />
      </div>

      {/* Yield Curve */}
      <YieldCurveChart data={data.yieldCurve} title="美国国债收益率曲线（当前 vs 历史对比）" />

      {/* Time Series Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MultiSeriesChart
          title="收益率走势对比"
          series={[
            { data: data.yields10Y, name: "10年期", color: "#3b82f6" },
            { data: data.yields2Y, name: "2年期", color: "#f59e0b" },
            { data: data.fedFundsRate, name: "联邦基金利率", color: "#ef4444" },
          ]}
          unit="%"
        />
        <TimeSeriesChart
          data={data.termSpread}
          title="期限利差 (10Y - 2Y)"
          color="#10b981"
          unit="%"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TimeSeriesChart
          data={data.inflationExpectations}
          title="通胀预期 (盈亏平衡利率)"
          color="#8b5cf6"
          unit="%"
        />
        <TimeSeriesChart
          data={data.qeBalance}
          title="美联储资产负债表规模 (万亿美元)"
          color="#ec4899"
          unit="T"
        />
      </div>

      {/* Model Results */}
      <RegressionTable
        result={regressionResult}
        title="OLS回归模型：10年期国债收益率驱动因子分析"
      />

      <CorrelationMatrixTable
        data={corrMatrix}
        title="变量相关性矩阵"
      />

      {/* Model Explanation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📖 模型说明</h3>
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <p>
            <strong>模型框架：</strong>本模型采用多元线性回归(OLS)方法，分析影响美国10年期国债收益率的核心宏观因子。
          </p>
          <p>
            <strong>核心变量：</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>联邦基金利率：</strong>美联储设定的短期利率目标，直接影响收益率曲线短端</li>
            <li><strong>通胀预期：</strong>市场对未来通胀的预期（通过TIPS隐含的盈亏平衡利率衡量）</li>
            <li><strong>美联储资产负债表：</strong>量化宽松(QE)通过购买国债压低长端收益率</li>
          </ul>
          <p>
            <strong>关键指标解读：</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>期限利差倒挂：</strong>当10Y-2Y利差转负，历史上是经济衰退的领先指标</li>
            <li><strong>收益率曲线平坦化：</strong>暗示市场预期经济增长放缓或美联储加息接近尾声</li>
            <li><strong>收益率曲线陡峭化：</strong>暗示通胀预期上升或经济复苏预期增强</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change }: { title: string; value: string; change: number }) {
  const isPositive = change >= 0;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="text-xs text-gray-500 dark:text-gray-400">{title}</div>
      <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">{value}</div>
      <div className={`text-xs mt-1 ${isPositive ? "text-red-500" : "text-green-500"}`}>
        {isPositive ? "▲" : "▼"} {Math.abs(change).toFixed(2)}bp
      </div>
    </div>
  );
}

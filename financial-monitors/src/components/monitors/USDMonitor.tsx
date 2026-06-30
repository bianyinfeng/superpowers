"use client";

import { useMemo } from "react";
import { TimeSeriesChart, MultiSeriesChart } from "@/components/charts/TimeSeriesChart";
import { RegressionTable, CorrelationMatrixTable } from "@/components/charts/ModelResults";
import { generateUSDData } from "@/lib/data/generators";
import { linearRegression, correlationMatrix } from "@/lib/models/econometrics";

export default function USDMonitor() {
  const data = useMemo(() => generateUSDData(), []);

  // Regression: DXY = f(real interest rate, trade balance, capital flows, fed policy)
  const regressionResult = useMemo(() => {
    const n = Math.min(data.dxyIndex.length, data.realInterestRate.length, data.tradeBalance.length, data.capitalFlows.length);
    const y = data.dxyIndex.slice(0, n).map((p) => p.value);
    const X = Array.from({ length: n }, (_, i) => [
      data.realInterestRate[i].value,
      data.tradeBalance[i].value,
      data.capitalFlows[i].value,
      data.fedPolicy[i].value,
    ]);
    return linearRegression(y, X, ["实际利率", "贸易差额", "资本流动", "美联储政策利率"]);
  }, [data]);

  // Correlation matrix
  const corrMatrix = useMemo(() => {
    const n = Math.min(data.dxyIndex.length, data.realInterestRate.length, data.tradeBalance.length);
    const matrixData = Array.from({ length: n }, (_, i) => [
      data.dxyIndex[i].value,
      data.realInterestRate[i].value,
      data.tradeBalance[i].value,
      data.capitalFlows[i].value,
      data.fedPolicy[i].value,
    ]);
    return correlationMatrix(matrixData, ["美元指数", "实际利率", "贸易差额", "资本流动", "政策利率"]);
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          💵 美元指数监测模型
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          基于利率平价与国际收支理论的美元汇率分析框架，追踪美元强弱周期及驱动因子
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="美元指数(DXY)" value={data.dxyIndex[data.dxyIndex.length - 1]?.value.toFixed(1) || "0"} />
        <MetricCard title="USD/EUR" value={data.usdEur[data.usdEur.length - 1]?.value.toFixed(4) || "0"} />
        <MetricCard title="USD/JPY" value={data.usdJpy[data.usdJpy.length - 1]?.value.toFixed(2) || "0"} />
        <MetricCard title="USD/CNY" value={data.usdCny[data.usdCny.length - 1]?.value.toFixed(4) || "0"} />
      </div>

      {/* Charts */}
      <TimeSeriesChart data={data.dxyIndex} title="美元指数(DXY)走势" color="#16a34a" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MultiSeriesChart
          title="主要货币对"
          series={[
            { data: data.usdEur, name: "EUR/USD", color: "#3b82f6" },
            { data: data.usdCny, name: "USD/CNY", color: "#ef4444" },
          ]}
        />
        <MultiSeriesChart
          title="美元驱动因子"
          series={[
            { data: data.realInterestRate, name: "实际利率", color: "#8b5cf6" },
            { data: data.fedPolicy, name: "政策利率", color: "#f59e0b" },
          ]}
          unit="%"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TimeSeriesChart data={data.tradeBalance} title="美国贸易差额 (十亿美元)" color="#ef4444" unit="B" />
        <TimeSeriesChart data={data.capitalFlows} title="资本净流入 (十亿美元)" color="#10b981" unit="B" />
      </div>

      {/* Model Results */}
      <RegressionTable
        result={regressionResult}
        title="OLS回归模型：美元指数驱动因子分析"
      />

      <CorrelationMatrixTable data={corrMatrix} title="变量相关性矩阵" />

      {/* Model Explanation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📖 模型说明</h3>
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <p>
            <strong>理论基础：</strong>本模型结合了利率平价理论(IRP)和国际收支(BOP)方法，分析美元汇率的核心驱动力。
          </p>
          <p><strong>核心变量：</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>实际利率差：</strong>美国与其他主要经济体的实际利率之差，是资本流动的核心驱动力</li>
            <li><strong>贸易差额：</strong>经常账户赤字/盈余反映对美元的结构性需求</li>
            <li><strong>资本流动：</strong>跨境资本净流入增加美元需求，推升美元指数</li>
            <li><strong>美联储政策利率：</strong>加息/降息周期直接影响短期资金成本和美元吸引力</li>
          </ul>
          <p><strong>美元周期特征：</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>美元通常呈现7-10年的大周期波动</li>
            <li>美联储加息初期美元走强，加息末期往往见顶</li>
            <li>全球风险偏好下降时，美元作为避险货币走强(美元微笑曲线)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="text-xs text-gray-500 dark:text-gray-400">{title}</div>
      <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">{value}</div>
    </div>
  );
}

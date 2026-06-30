"use client";

import { useMemo } from "react";
import { TimeSeriesChart, MultiSeriesChart } from "@/components/charts/TimeSeriesChart";
import { RegressionTable, CorrelationMatrixTable } from "@/components/charts/ModelResults";
import { generateGoldData } from "@/lib/data/generators";
import { linearRegression, correlationMatrix } from "@/lib/models/econometrics";

export default function GoldMonitor() {
  const data = useMemo(() => generateGoldData(), []);

  // Regression: Gold = f(real yield, DXY, VIX, central bank buying, inflation expectations)
  const regressionResult = useMemo(() => {
    const n = Math.min(
      data.goldPrice.length,
      data.realYield.length,
      data.dxyIndex.length,
      data.vixIndex.length,
      data.centralBankBuying.length,
      data.inflationExpectations.length
    );
    const y = data.goldPrice.slice(0, n).map((p) => p.value);
    const X = Array.from({ length: n }, (_, i) => [
      data.realYield[i].value,
      data.dxyIndex[i].value,
      data.vixIndex[i].value,
      data.centralBankBuying[i].value,
      data.inflationExpectations[i].value,
    ]);
    return linearRegression(y, X, ["实际收益率", "美元指数", "VIX恐慌指数", "央行购金量", "通胀预期"]);
  }, [data]);

  // Correlation matrix
  const corrMatrix = useMemo(() => {
    const n = Math.min(data.goldPrice.length, data.realYield.length, data.dxyIndex.length, data.vixIndex.length);
    const matrixData = Array.from({ length: n }, (_, i) => [
      data.goldPrice[i].value,
      data.realYield[i].value,
      data.dxyIndex[i].value,
      data.vixIndex[i].value,
      data.centralBankBuying[i].value,
      data.inflationExpectations[i].value,
      data.geopoliticalRisk[i].value,
    ]);
    return correlationMatrix(matrixData, ["金价", "实际收益率", "美元指数", "VIX", "央行购金", "通胀预期", "地缘风险"]);
  }, [data]);

  const latestPrice = data.goldPrice[data.goldPrice.length - 1]?.value || 0;
  const prevPrice = data.goldPrice[data.goldPrice.length - 2]?.value || 0;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🥇 黄金价格监测模型
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          基于实际利率、美元强弱和避险需求的黄金定价分析框架
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="text-xs text-yellow-700 dark:text-yellow-300">现货金价</div>
          <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">${latestPrice.toFixed(0)}</div>
          <div className={`text-xs mt-1 ${latestPrice >= prevPrice ? "text-green-600" : "text-red-600"}`}>
            {latestPrice >= prevPrice ? "▲" : "▼"} ${Math.abs(latestPrice - prevPrice).toFixed(1)}
          </div>
        </div>
        <MetricCard title="实际收益率" value={`${data.realYield[data.realYield.length - 1]?.value.toFixed(2)}%`} />
        <MetricCard title="美元指数" value={data.dxyIndex[data.dxyIndex.length - 1]?.value.toFixed(1)} />
        <MetricCard title="VIX指数" value={data.vixIndex[data.vixIndex.length - 1]?.value.toFixed(1)} />
      </div>

      {/* Gold Price Chart */}
      <TimeSeriesChart data={data.goldPrice} title="黄金价格走势 (美元/盎司)" color="#eab308" unit="$" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MultiSeriesChart
          title="黄金 vs 实际收益率（反向关系）"
          series={[
            { data: data.goldPrice.map(p => ({ ...p, value: (p.value - 1500) / 100 })), name: "金价(标准化)", color: "#eab308" },
            { data: data.realYield, name: "实际收益率%", color: "#3b82f6" },
          ]}
        />
        <MultiSeriesChart
          title="避险需求指标"
          series={[
            { data: data.vixIndex, name: "VIX指数", color: "#ef4444" },
            { data: data.geopoliticalRisk, name: "地缘风险指数", color: "#8b5cf6" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TimeSeriesChart data={data.centralBankBuying} title="全球央行购金量 (吨/季度)" color="#f97316" unit="t" />
        <TimeSeriesChart data={data.inflationExpectations} title="通胀预期" color="#10b981" unit="%" />
      </div>

      {/* Model Results */}
      <RegressionTable
        result={regressionResult}
        title="OLS回归模型：黄金价格驱动因子分析"
      />

      <CorrelationMatrixTable data={corrMatrix} title="变量相关性矩阵" />

      {/* Model Explanation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📖 模型说明</h3>
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <p>
            <strong>定价框架：</strong>黄金作为零息资产，其持有的机会成本是实际利率。本模型从实际利率、美元强弱、
            避险需求三个维度分析金价驱动力。
          </p>
          <p><strong>核心驱动因子：</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>实际收益率（最重要）：</strong>TIPS隐含的实际利率与金价呈强负相关。实际利率下降→持有黄金机会成本降低→金价上涨</li>
            <li><strong>美元指数：</strong>黄金以美元计价，美元走弱通常推升金价。两者呈负相关</li>
            <li><strong>VIX恐慌指数：</strong>市场恐慌时避险资金流入黄金，推升金价</li>
            <li><strong>央行购金：</strong>近年来新兴市场央行大规模增持黄金储备，构成结构性需求支撑</li>
            <li><strong>通胀预期：</strong>黄金作为通胀对冲工具，通胀预期上升利好金价</li>
          </ul>
          <p><strong>交易含义：</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>实际利率见顶回落时，通常是黄金牛市的起点</li>
            <li>美联储转向降息周期时，黄金往往表现优异</li>
            <li>地缘政治危机时金价短期飙升，但持续性取决于基本面</li>
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

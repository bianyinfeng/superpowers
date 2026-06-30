"use client";

import { RegressionResult, CorrelationMatrix } from "@/lib/models/econometrics";

interface RegressionTableProps {
  result: RegressionResult;
  title: string;
}

interface CorrelationMatrixProps {
  data: CorrelationMatrix;
  title: string;
}

export function RegressionTable({ result, title }: RegressionTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        {title}
      </h3>
      
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="R²" value={`${(result.rSquared * 100).toFixed(1)}%`} />
        <StatCard label="调整R²" value={`${(result.adjustedRSquared * 100).toFixed(1)}%`} />
        <StatCard label="F统计量" value={result.fStatistic.toFixed(2)} />
        <StatCard label="观测数" value={result.observations.toString()} />
      </div>

      {/* Coefficients table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-600">
              <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400">变量</th>
              <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-400">系数</th>
              <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-400">t统计量</th>
              <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-400">P值</th>
              <th className="text-center py-2 px-2 text-gray-600 dark:text-gray-400">显著性</th>
            </tr>
          </thead>
          <tbody>
            {result.coefficients.map((coef) => (
              <tr key={coef.variable} className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-2 px-2 font-medium text-gray-800 dark:text-gray-200">
                  {coef.variable}
                </td>
                <td className="text-right py-2 px-2 text-gray-700 dark:text-gray-300">
                  {coef.coefficient.toFixed(4)}
                </td>
                <td className="text-right py-2 px-2 text-gray-700 dark:text-gray-300">
                  {coef.tStat.toFixed(3)}
                </td>
                <td className="text-right py-2 px-2 text-gray-700 dark:text-gray-300">
                  {coef.pValue.toFixed(4)}
                </td>
                <td className="text-center py-2 px-2">
                  <SignificanceStars pValue={coef.pValue} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Interpretation */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <strong>模型解读：</strong>{result.interpretation}
        </p>
      </div>

      <p className="mt-2 text-xs text-gray-400">
        注：*** p&lt;0.01, ** p&lt;0.05, * p&lt;0.1
      </p>
    </div>
  );
}

export function CorrelationMatrixTable({ data, title }: CorrelationMatrixProps) {
  const getColor = (value: number) => {
    if (value > 0.7) return "bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100";
    if (value > 0.3) return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
    if (value < -0.7) return "bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100";
    if (value < -0.3) return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
    return "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="py-2 px-1"></th>
              {data.variables.map((v) => (
                <th key={v} className="py-2 px-1 text-center text-gray-600 dark:text-gray-400 max-w-16 truncate">
                  {v}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.variables.map((v, i) => (
              <tr key={v}>
                <td className="py-1 px-1 font-medium text-gray-700 dark:text-gray-300 max-w-20 truncate">
                  {v}
                </td>
                {data.matrix[i].map((val, j) => (
                  <td
                    key={`${i}-${j}`}
                    className={`py-1 px-1 text-center rounded ${getColor(val)}`}
                  >
                    {val.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-200 rounded"></span> 正相关
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-200 rounded"></span> 负相关
        </span>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 text-center">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{value}</div>
    </div>
  );
}

function SignificanceStars({ pValue }: { pValue: number }) {
  if (pValue < 0.01) return <span className="text-green-600 font-bold">***</span>;
  if (pValue < 0.05) return <span className="text-green-500 font-bold">**</span>;
  if (pValue < 0.1) return <span className="text-yellow-500 font-bold">*</span>;
  return <span className="text-gray-400">-</span>;
}

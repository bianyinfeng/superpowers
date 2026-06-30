"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { YieldCurveData } from "@/lib/data/generators";

interface YieldCurveChartProps {
  data: YieldCurveData[];
  title: string;
}

export function YieldCurveChart({ data, title }: YieldCurveChartProps) {
  // Show the latest yield curve
  const latest = data[data.length - 1];
  const prev3m = data[Math.max(0, data.length - 4)];
  const prev1y = data[Math.max(0, data.length - 13)];

  if (!latest) return null;

  const maturities = ["m1", "m3", "m6", "y1", "y2", "y3", "y5", "y7", "y10", "y20", "y30"];
  const labels = ["1月", "3月", "6月", "1年", "2年", "3年", "5年", "7年", "10年", "20年", "30年"];

  const chartData = maturities.map((key, i) => ({
    maturity: labels[i],
    当前: (latest as unknown as Record<string, number>)[key],
    "3个月前": (prev3m as unknown as Record<string, number>)[key],
    "1年前": (prev1y as unknown as Record<string, number>)[key],
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="maturity" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit="%" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="当前" stroke="#3b82f6" strokeWidth={2} dot />
          <Line type="monotone" dataKey="3个月前" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
          <Line type="monotone" dataKey="1年前" stroke="#6b7280" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
} from "recharts";

interface LineChartProps {
  data: { name: string; value: number }[];
  height?: number;
  asBars?: boolean;
  title?: string;
}

export default function LineChart({
  data,
  height = 380,
  asBars = false,
  title,
}: LineChartProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((d) => ({ name: d.name, value: d.value }));

  if (asBars) {
    return (
      <div className="chart-container" style={{ height }}>
        {title && <h4 className="chart-title">{title}</h4>}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 24, left: 16, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--borde)" opacity={0.5} />
            <XAxis
              dataKey="name"
              stroke="var(--texto-medio)"
              fontSize={11}
              tick={{ fill: "var(--texto-claro)" }}
            />
            <YAxis stroke="var(--texto-medio)" fontSize={11} />
            <Tooltip
              contentStyle={{
                background: "var(--fondo-card)",
                border: "1px solid var(--borde)",
                borderRadius: "8px",
                color: "var(--texto-claro)",
              }}
            />
            <Bar
              dataKey="value"
              fill="var(--acento1)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="chart-container" style={{ height }}>
      {title && <h4 className="chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 24, left: 16, bottom: 24 }}>
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--acento1)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--acento1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--borde)" opacity={0.5} />
          <XAxis
            dataKey="name"
            stroke="var(--texto-medio)"
            fontSize={11}
            tick={{ fill: "var(--texto-claro)" }}
          />
          <YAxis stroke="var(--texto-medio)" fontSize={11} />
          <Tooltip
            contentStyle={{
              background: "var(--fondo-card)",
              border: "1px solid var(--borde)",
              borderRadius: "8px",
              color: "var(--texto-claro)",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--acento1)"
            strokeWidth={3}
            fill="url(#lineGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

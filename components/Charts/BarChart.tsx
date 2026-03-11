"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { COLORS } from "@/lib/constants";

interface BarChartProps {
  data: { name: string; value: number }[];
  horizontal?: boolean;
  height?: number;
  colors?: string[];
  title?: string;
}

export default function BarChart({
  data,
  horizontal = true,
  height = 400,
  colors = COLORS,
  title,
}: BarChartProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((d) => ({ name: d.name, value: d.value }));

  return (
    <div className="chart-container" style={{ height }}>
      {title && <h4 className="chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--borde)" opacity={0.5} />
          {horizontal ? (
            <>
              <XAxis type="number" stroke="var(--texto-medio)" fontSize={11} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                stroke="var(--texto-medio)"
                fontSize={11}
                tick={{ fill: "var(--texto-claro)" }}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="name"
                stroke="var(--texto-medio)"
                fontSize={11}
                tick={{ fill: "var(--texto-claro)" }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="var(--texto-medio)" fontSize={11} />
            </>
          )}
          <Tooltip
            contentStyle={{
              background: "var(--fondo-card)",
              border: "1px solid var(--borde)",
              borderRadius: "8px",
              color: "var(--texto-claro)",
            }}
            labelStyle={{ color: "var(--texto-medio)" }}
          />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            fill="var(--acento1)"
            maxBarSize={40}
            label={{ position: "right", fill: "var(--texto-claro)", fontSize: 11 }}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

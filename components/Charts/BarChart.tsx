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

const truncateLabel = (str: string, max = 45) =>
  str.length > max ? str.slice(0, max) + "…" : str;

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

  const chartData = data.map((d) => ({
    name: d.name,
    nameFull: d.name,
    value: d.value,
  }));

  return (
    <div className="chart-container" style={{ height }}>
      {title && <h4 className="chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={
            horizontal
              ? { top: 16, right: 32, left: 8, bottom: 16 }
              : { top: 24, right: 24, left: 16, bottom: 100 }
          }
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--borde)" opacity={0.5} />
          {horizontal ? (
            <>
              <XAxis
                type="number"
                stroke="var(--texto-medio)"
                fontSize={11}
                tick={{ fill: "var(--texto-claro)" }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={220}
                stroke="var(--texto-medio)"
                fontSize={11}
                tick={{ fill: "var(--texto-claro)" }}
                tickFormatter={(v) => truncateLabel(String(v))}
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
                height={100}
                interval={0}
              />
              <YAxis
                stroke="var(--texto-medio)"
                fontSize={11}
                tick={{ fill: "var(--texto-claro)" }}
                width={50}
              />
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
            formatter={(value: number, _name: string, props: { payload?: { nameFull?: string; name?: string } }) =>
              [value.toLocaleString(), props?.payload?.nameFull ?? props?.payload?.name ?? ""]
            }
          />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            fill="var(--acento1)"
            maxBarSize={40}
            label={{
              position: horizontal ? "right" : "top",
              fill: "var(--texto-claro)",
              fontSize: 11,
              offset: horizontal ? 8 : 4,
            }}
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

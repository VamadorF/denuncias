"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { COLORS } from "@/lib/constants";

interface PieChartProps {
  data: { name: string; value: number }[];
  height?: number;
  colors?: string[];
  title?: string;
}

export default function PieChart({
  data,
  height = 400,
  colors = COLORS,
  title,
}: PieChartProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((d) => ({ name: d.name, value: d.value }));

  return (
    <div className="chart-container" style={{ height }}>
      {title && <h4 className="chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="50%"
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} stroke="var(--fondo-card)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--fondo-card)",
              border: "1px solid var(--borde)",
              borderRadius: "8px",
              color: "var(--texto-claro)",
            }}
            formatter={(value: number) => [value.toLocaleString(), "Cantidad"]}
          />
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: 16 }}
            formatter={(value) => (
              <span style={{ color: "var(--texto-claro)" }}>{value}</span>
            )}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

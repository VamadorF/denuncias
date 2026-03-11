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
import { useIsMobile } from "@/lib/useMediaQuery";

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
  const isMobile = useIsMobile();
  if (!data || data.length === 0) return null;

  const chartData = data.map((d) => ({ name: d.name, value: d.value }));
  const fontSize = isMobile ? 12 : 11;
  const barMaxSize = isMobile ? 32 : 40;

  if (asBars) {
    return (
      <div className={`chart-container ${isMobile ? "chart-mobile" : ""}`} style={{ height }}>
        {title && <h4 className="chart-title">{title}</h4>}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={
              isMobile
                ? { top: 12, right: 16, left: 8, bottom: 60 }
                : { top: 20, right: 24, left: 16, bottom: 24 }
            }
            barCategoryGap={isMobile ? 12 : 4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--borde)" opacity={0.5} />
            <XAxis
              dataKey="name"
              stroke="var(--texto-medio)"
              fontSize={fontSize}
              tick={{ fill: "var(--texto-claro)" }}
            />
            <YAxis stroke="var(--texto-medio)" fontSize={fontSize} />
            <Tooltip
              contentStyle={{
                background: "var(--fondo-card)",
                border: "1px solid var(--borde)",
                borderRadius: "8px",
                color: "var(--texto-claro)",
                fontSize: isMobile ? 14 : 12,
              }}
            />
            <Bar
              dataKey="value"
              fill="var(--acento1)"
              radius={[4, 4, 0, 0]}
              maxBarSize={barMaxSize}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className={`chart-container ${isMobile ? "chart-mobile" : ""}`} style={{ height }}>
      {title && <h4 className="chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={
            isMobile ? { top: 12, right: 16, left: 8, bottom: 24 } : { top: 20, right: 24, left: 16, bottom: 24 }
          }
        >
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

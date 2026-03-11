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
import { useIsMobile } from "@/lib/useMediaQuery";

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
  const isMobile = useIsMobile();
  if (!data || data.length === 0) return null;

  const chartData = data.map((d) => ({ name: d.name, value: d.value }));

  return (
    <div className={`chart-container ${isMobile ? "chart-mobile" : ""}`} style={{ height }}>
      {title && <h4 className="chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart
          margin={
            isMobile ? { top: 12, right: 16, left: 16, bottom: 56 } : { top: 16, right: 24, left: 24, bottom: 48 }
          }
        >
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={isMobile ? "45%" : "50%"}
            outerRadius={isMobile ? "75%" : "80%"}
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
              fontSize: isMobile ? 14 : 12,
            }}
            formatter={(value: number) => [value.toLocaleString(), "Cantidad"]}
          />
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: isMobile ? 12 : 16 }}
            formatter={(value) => (
              <span style={{ color: "var(--texto-claro)", fontSize: isMobile ? 12 : 11 }}>{value}</span>
            )}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

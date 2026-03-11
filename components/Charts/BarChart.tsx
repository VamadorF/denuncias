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
import { useIsMobile } from "@/lib/useMediaQuery";

interface BarChartProps {
  data: { name: string; value: number }[];
  horizontal?: boolean;
  height?: number;
  colors?: string[];
  title?: string;
  /** Ancho del eje Y para etiquetas (horizontal) */
  labelWidth?: number;
  /** Máx. caracteres antes de truncar (0 = sin truncar) */
  labelMaxLength?: number;
}

export default function BarChart({
  data,
  horizontal = true,
  height = 400,
  colors = COLORS,
  title,
  labelWidth = 280,
  labelMaxLength = 60,
}: BarChartProps) {
  const isMobile = useIsMobile();
  const effectiveLabelWidth = isMobile ? 110 : labelWidth;
  const effectiveLabelMaxLength = isMobile ? 18 : labelMaxLength;
  const truncate = (str: string) =>
    effectiveLabelMaxLength > 0 && str.length > effectiveLabelMaxLength
      ? str.slice(0, effectiveLabelMaxLength) + "…"
      : str;
  if (!data || data.length === 0) return null;

  const chartData = data.map((d) => ({
    name: d.name,
    nameFull: d.name,
    value: d.value,
  }));
  const fontSize = isMobile ? 13 : 11;
  const maxBarSize = isMobile ? 36 : 45;
  const barCategoryGap = isMobile ? 12 : 4;
  const chartHeight = isMobile && horizontal ? Math.max(height, data.length * 52) : height;

  return (
    <div className={`chart-container ${isMobile ? "chart-mobile" : ""}`} style={{ height: chartHeight }}>
      {title && <h4 className="chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={
            horizontal
              ? isMobile
                ? { top: 12, right: 16, left: 4, bottom: 12 }
                : { top: 20, right: 40, left: 12, bottom: 20 }
              : isMobile
                ? { top: 16, right: 16, left: 8, bottom: 80 }
                : { top: 24, right: 24, left: 16, bottom: 100 }
          }
          barCategoryGap={barCategoryGap}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--borde)" opacity={0.5} />
          {horizontal ? (
            <>
              <XAxis
                type="number"
                stroke="var(--texto-medio)"
                fontSize={fontSize}
                tick={{ fill: "var(--texto-claro)" }}
                allowDecimals={false}
                tickFormatter={(v) => (isMobile && v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={effectiveLabelWidth}
                stroke="var(--texto-medio)"
                fontSize={fontSize}
                tick={{
                  fill: "var(--texto-claro)",
                  style: { lineHeight: 1.4 },
                }}
                tickFormatter={(v) => truncate(String(v))}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="name"
                stroke="var(--texto-medio)"
                fontSize={fontSize}
                tick={{ fill: "var(--texto-claro)" }}
                angle={-45}
                textAnchor="end"
                height={isMobile ? 70 : 100}
                interval={0}
              />
              <YAxis
                stroke="var(--texto-medio)"
                fontSize={fontSize}
                tick={{ fill: "var(--texto-claro)" }}
                width={isMobile ? 36 : 50}
              />
            </>
          )}
          <Tooltip
            contentStyle={{
              background: "var(--fondo-card)",
              border: "1px solid var(--borde)",
              borderRadius: "8px",
              color: "var(--texto-claro)",
              fontSize: isMobile ? 14 : 12,
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
            maxBarSize={maxBarSize}
            label={
              !isMobile
                ? {
                    position: horizontal ? "right" : "top",
                    fill: "var(--texto-claro)",
                    fontSize: 11,
                    offset: horizontal ? 8 : 4,
                  }
                : false
            }
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

"use client";

import { Denuncia } from "@/lib/data";
import BarChart from "./Charts/BarChart";
import PieChart from "./Charts/PieChart";

interface TopEstablecimientosProps {
  data: Denuncia[];
  tipoChart: "Barras" | "Circular";
}

export default function TopEstablecimientos({ data, tipoChart }: TopEstablecimientosProps) {
  const counts: Record<string, number> = {};
  data.forEach((d) => {
    const name = d.EE_NOMBRE?.trim();
    if (name && name !== "nan" && name.length > 0) {
      counts[name] = (counts[name] ?? 0) + 1;
    }
  });
  const top20 = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, value]) => ({ name, value }));

  if (top20.length === 0) return null;

  const chartData = top20.map((d) => ({ name: d.name, value: d.value }));

  return (
    <section className="chart-section">
      <h3 className="section-title">Top 20 Establecimientos Más Denunciados</h3>
      {tipoChart === "Circular" ? (
        <PieChart data={chartData} height={550} />
      ) : (
        <BarChart
          data={chartData}
          horizontal
          height={550}
          colors={["#9D4EDD", "#FF6B35", "#FF3366", "#9D4EDD", "#FF6B35", "#FF3366"]}
        />
      )}
    </section>
  );
}

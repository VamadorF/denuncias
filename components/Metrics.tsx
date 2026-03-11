"use client";

import { Denuncia } from "@/lib/data";
import { BarChart3 } from "lucide-react";

interface MetricsProps {
  data: Denuncia[];
  totalUnfiltered: number;
  hasFilters: boolean;
  filtros?: { comuna?: string; region?: string };
}

function countBy<T>(arr: T[], key: (x: T) => string | null | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  arr.forEach((x) => {
    const k = key(x) ?? "Sin información";
    out[k] = (out[k] ?? 0) + 1;
  });
  return out;
}

export default function Metrics({
  data,
  totalUnfiltered,
  hasFilters,
  filtros = {},
}: MetricsProps) {
  const total = data.length;
  const cerradas = data.filter((d) => d.Estado === "Cerrado").length;
  const enTramite = data.filter((d) => d.Estado === "En trámite").length;
  const ciber = data.filter((d) => d.DEN_CIBERBULLYING === 1).length;

  let metric4Label = "—";
  let metric4Value = "—";

  if (total > 0) {
    if (filtros.comuna) {
      const byEstab = countBy(data, (d) => d.EE_NOMBRE?.trim());
      const entries = Object.entries(byEstab).filter(
        ([k]) => k && k !== "nan" && k.length > 0
      );
      if (entries.length > 0) {
        const [name, count] = entries.sort((a, b) => b[1] - a[1])[0];
        metric4Label = name.length > 40 ? name.slice(0, 40) + "..." : name;
        metric4Value = count.toLocaleString() + " casos";
      }
    } else if (filtros.region && data.some((d) => d.Comuna)) {
      const byComuna = countBy(data, (d) => d.Comuna?.trim());
      const entries = Object.entries(byComuna).filter(
        ([k]) => k && k !== "nan" && k.length > 0
      );
      if (entries.length > 0) {
        const [comuna, count] = entries.sort((a, b) => b[1] - a[1])[0];
        metric4Label = comuna;
        metric4Value = count.toLocaleString() + " casos";
      }
    } else {
      const byRegion = countBy(data, (d) => d.Region);
      const entries = Object.entries(byRegion).sort((a, b) => b[1] - a[1]);
      if (entries.length > 0) {
        const [region, count] = entries[0];
        metric4Label = region;
        metric4Value = count.toLocaleString() + " casos";
      }
    }
  }

  return (
    <section className="metrics-section">
      <h2 className="metrics-title">
        <BarChart3 size={24} />
        Resumen General
      </h2>
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total Denuncias</span>
          <span className="metric-value">{total.toLocaleString()}</span>
          {hasFilters && (
            <span className="metric-delta">
              Filtradas de {totalUnfiltered.toLocaleString()}
            </span>
          )}
        </div>
        <div className="metric-card">
          <span className="metric-label">Cerradas</span>
          <span className="metric-value">{cerradas.toLocaleString()}</span>
          {total > 0 && (
            <span className="metric-delta">
              {((100 * cerradas) / total).toFixed(1)}%
            </span>
          )}
        </div>
        <div className="metric-card">
          <span className="metric-label">En trámite</span>
          <span className="metric-value">{enTramite.toLocaleString()}</span>
          {total > 0 && (
            <span className="metric-delta">
              {((100 * enTramite) / total).toFixed(1)}%
            </span>
          )}
        </div>
        <div className="metric-card">
          <span className="metric-label">Establecimiento / Comuna con más denuncias</span>
          <span className="metric-value">{metric4Label}</span>
          <span className="metric-delta">{metric4Value}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Ciberbullying</span>
          <span className="metric-value">{ciber.toLocaleString()}</span>
          {total > 0 && (
            <span className="metric-delta">
              {((100 * ciber) / total).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

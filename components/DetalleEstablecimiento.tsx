"use client";

import { useState } from "react";
import { Denuncia } from "@/lib/data";
import BarChart from "./Charts/BarChart";
import PieChart from "./Charts/PieChart";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DetalleEstablecimientoProps {
  data: Denuncia[];
  tipoChart: "Barras" | "Circular";
}

export default function DetalleEstablecimiento({
  data,
  tipoChart,
}: DetalleEstablecimientoProps) {
  const establecimientos = Array.from(
    new Set(
      data
        .map((d) => d.EE_NOMBRE?.trim())
        .filter((n): n is string => !!n && n !== "nan" && n.length > 0)
    )
  ).sort();

  const [selected, setSelected] = useState<string>("-- Seleccionar --");
  const [expanded, setExpanded] = useState(false);

  const dfColegio =
    selected !== "-- Seleccionar --"
      ? data.filter((d) => d.EE_NOMBRE?.trim() === selected)
      : [];

  const nDen = dfColegio.length;

  const temaCounts: Record<string, number> = {};
  const subtemaCounts: Record<string, number> = {};
  const ambitoCounts: Record<string, number> = {};
  dfColegio.forEach((d) => {
    if (d.DEN_TEMA) {
      temaCounts[d.DEN_TEMA] = (temaCounts[d.DEN_TEMA] ?? 0) + 1;
    }
    if (d.DEN_SUBTEMA) {
      subtemaCounts[d.DEN_SUBTEMA] = (subtemaCounts[d.DEN_SUBTEMA] ?? 0) + 1;
    }
    if (d.DEN_AMBITO) {
      ambitoCounts[d.DEN_AMBITO] = (ambitoCounts[d.DEN_AMBITO] ?? 0) + 1;
    }
  });

  const temaData = Object.entries(temaCounts).map(([name, value]) => ({ name, value }));
  const subtemaData = Object.entries(subtemaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name, value]) => ({ name, value }));
  const ambitoData = Object.entries(ambitoCounts).map(([name, value]) => ({ name, value }));

  const Chart = tipoChart === "Circular" ? PieChart : BarChart;

  return (
    <section className="chart-section">
      <h3 className="section-title">
        ¿De qué tratan las denuncias de un establecimiento?
      </h3>
      {data.length === 0 ? (
        <p className="info-message">Aplica filtros para ver el detalle por establecimiento.</p>
      ) : (
        <>
          <div className="filter-group">
            <label>Establecimiento</label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="establecimiento-select"
            >
              <option value="-- Seleccionar --">-- Seleccionar --</option>
              {establecimientos.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          {selected !== "-- Seleccionar --" && nDen > 0 && (
            <>
              <p className="detalle-summary">
                <strong>{selected}</strong> — {nDen.toLocaleString()} denuncia(s) en el período
                filtrado
              </p>
              <div className="detalle-charts">
                <div className="detalle-chart">
                  {temaData.length > 0 && (
                    <Chart data={temaData} horizontal height={350} title="Por tema" />
                  )}
                </div>
                <div className="detalle-chart">
                  {subtemaData.length > 0 && (
                    <Chart data={subtemaData} horizontal height={350} title="Por subtema" />
                  )}
                </div>
              </div>
              {ambitoData.length > 0 && (
                <div className="detalle-ambito">
                  <h4>Por ámbito</h4>
                  <Chart data={ambitoData} horizontal height={280} />
                </div>
              )}
              <div className="expander">
                <button
                  type="button"
                  className="expander-trigger"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  Ver denuncias de este establecimiento
                </button>
                {expanded && (
                  <div className="expander-content">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>DEN_ID</th>
                          <th>Año</th>
                          <th>DEN_TEMA</th>
                          <th>DEN_SUBTEMA</th>
                          <th>Estado</th>
                          <th>Comuna</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dfColegio.slice(0, 500).map((d, i) => (
                          <tr key={d.DEN_ID ?? i}>
                            <td>{d.DEN_ID ?? "—"}</td>
                            <td>{d.Año}</td>
                            <td>{d.DEN_TEMA ?? "—"}</td>
                            <td>{d.DEN_SUBTEMA ?? "—"}</td>
                            <td>{d.Estado ?? "—"}</td>
                            <td>{d.Comuna ?? d.EE_NOM_COMUNA ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}

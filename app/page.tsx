"use client";

import { useState, useEffect, useMemo } from "react";
import {
  loadIndex,
  loadDenuncias,
  applyFilters,
  getComunasForFilters,
  Denuncia,
  Filtros,
} from "@/lib/data";
import { MESES } from "@/lib/constants";
import Filters from "@/components/Filters";
import Metrics from "@/components/Metrics";
import BarChart from "@/components/Charts/BarChart";
import PieChart from "@/components/Charts/PieChart";
import LineChart from "@/components/Charts/LineChart";
import TopEstablecimientos from "@/components/TopEstablecimientos";
import DetalleEstablecimiento from "@/components/DetalleEstablecimiento";
import ComparadorEstablecimientos from "@/components/ComparadorEstablecimientos";
import MobileNav from "@/components/MobileNav";
import { useIsMobile } from "@/lib/useMediaQuery";
import { ChevronDown, ChevronUp } from "lucide-react";

function countBy(
  data: Denuncia[],
  key: keyof Denuncia
): { name: string; value: number }[] {
  const counts: Record<string, number> = {};
  data.forEach((d) => {
    const v = d[key];
    const k = v != null ? String(v).trim() : "Sin información";
    if (k && k !== "nan") counts[k] = (counts[k] ?? 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));
}

export default function DashboardPage() {
  const [index, setIndex] = useState<{ años: number[] } | null>(null);
  const [allData, setAllData] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<Filtros>({});
  const [tipoDistribucion, setTipoDistribucion] = useState<"Barras" | "Circular">("Barras");
  const [tipoEvolucion, setTipoEvolucion] = useState<"Líneas" | "Barras">("Líneas");
  const [tablaExpanded, setTablaExpanded] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isMobile = useIsMobile();

  const añosDisponibles = index?.años ?? [];

  useEffect(() => {
    loadIndex()
      .then((idx) => {
        setIndex(idx);
        return loadDenuncias(idx.años);
      })
      .then(setAllData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const dataInRange = useMemo(() => {
    if (filtros.añoDesde != null || filtros.añoHasta != null) {
      return allData.filter((d) => {
        if (filtros.añoDesde != null && d.Año < filtros.añoDesde) return false;
        if (filtros.añoHasta != null && d.Año > filtros.añoHasta) return false;
        return true;
      });
    }
    return allData;
  }, [allData, filtros.añoDesde, filtros.añoHasta]);

  const filtered = useMemo(
    () => applyFilters(dataInRange, filtros),
    [dataInRange, filtros]
  );

  const hasFilters = useMemo(
    () =>
      filtros.añoDesde != null ||
      filtros.añoHasta != null ||
      !!filtros.region ||
      !!filtros.comuna ||
      !!filtros.ambito ||
      !!filtros.tema ||
      !!filtros.subtema ||
      !!filtros.estado ||
      filtros.mes != null ||
      filtros.trimestre != null,
    [filtros]
  );

  const regiones = useMemo(
    () =>
      Array.from(new Set(dataInRange.map((d) => d.Region).filter(Boolean))) as string[],
    [dataInRange]
  ).sort();

  const comunas = useMemo(
    () => getComunasForFilters(dataInRange, filtros),
    [dataInRange, filtros]
  );

  const ambitos = useMemo(
    () =>
      Array.from(
        new Set(dataInRange.map((d) => d.DEN_AMBITO).filter(Boolean))
      ) as string[],
    [dataInRange]
  ).sort();

  const temas = useMemo(
    () =>
      Array.from(new Set(dataInRange.map((d) => d.DEN_TEMA).filter(Boolean))) as string[],
    [dataInRange]
  ).sort();

  const subtemas = useMemo(
    () =>
      Array.from(
        new Set(dataInRange.map((d) => d.DEN_SUBTEMA).filter(Boolean))
      ) as string[],
    [dataInRange]
  ).sort();

  const estados = useMemo(
    () =>
      Array.from(new Set(dataInRange.map((d) => d.Estado).filter(Boolean))) as string[],
    [dataInRange]
  ).sort();

  const meses = useMemo(
    () =>
      Array.from(
        new Set(dataInRange.map((d) => d.DEN_MES_CREACION).filter((m): m is number => m != null))
      ).sort((a, b) => a - b),
    [dataInRange]
  );

  const trimestres = useMemo(
    () =>
      Array.from(
        new Set(
          dataInRange
            .map((d) => d.DEN_TRIMESTRE_CREACION)
            .filter((t): t is number => t != null)
        )
      ).sort((a, b) => a - b),
    [dataInRange]
  );

  const chart1Data = useMemo(() => {
    if (filtros.comuna) {
      return countBy(filtered, "DEN_TEMA").slice(0, 10);
    }
    if (filtros.region) {
      return countBy(filtered, "Comuna")
        .filter((d) => d.name && d.name !== "nan")
        .slice(0, 15);
    }
    return countBy(filtered, "Region").slice(0, 15);
  }, [filtered, filtros.comuna, filtros.region]);

  const chart1Title = useMemo(() => {
    if (filtros.comuna) return "Denuncias por Tema (comuna filtrada)";
    if (filtros.region) return "Denuncias por Comuna (región filtrada)";
    return "Denuncias por Región";
  }, [filtros.comuna, filtros.region]);

  const estadoData = useMemo(
    () => countBy(filtered, "Estado"),
    [filtered]
  );

  const ambitoData = useMemo(
    () => countBy(filtered, "DEN_AMBITO").slice(0, 10),
    [filtered]
  );

  const evolucionData = useMemo(() => {
    const byMes: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) byMes[m] = 0;
    filtered.forEach((d) => {
      if (d.DEN_MES_CREACION) byMes[d.DEN_MES_CREACION]++;
    });
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => ({
      name: MESES[m as keyof typeof MESES] ?? String(m),
      value: byMes[m],
    }));
  }, [filtered]);

  const temaTopData = useMemo(
    () => countBy(filtered, "DEN_TEMA").slice(0, 10),
    [filtered]
  );

  if (loading) {
    return (
      <div className="loading">
        Cargando datos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content" style={{ padding: "2rem" }}>
        <div className="info-message" style={{ color: "var(--acento5)" }}>
          Error: {error}
        </div>
      </div>
    );
  }

  const filtersProps = {
    filtros,
    onChange: setFiltros,
    añosDisponibles,
    regiones,
    comunas,
    ambitos,
    temas,
    subtemas,
    estados,
    meses,
    trimestres,
    tipoDistribucion,
    tipoEvolucion,
    onTipoDistribucion: setTipoDistribucion,
    onTipoEvolucion: setTipoEvolucion,
  };

  return (
    <div className={`dashboard-layout ${isMobile ? "mobile" : ""}`}>
      {isMobile ? (
        <MobileNav
          filtersOpen={filtersOpen}
          onFiltersToggle={() => setFiltersOpen((o) => !o)}
          hasActiveFilters={hasFilters}
          filtersContent={
            <Filters {...filtersProps} inDrawer />
          }
        />
      ) : (
        <Filters {...filtersProps} />
      )}
      <main className="main-content">
        <header className="main-header">
          <h1>Dashboard de Denuncias Educativas</h1>
          <p>
            Sistema de Superintendencia de Educación - Visualización y análisis
            de denuncias (múltiples años)
          </p>
        </header>

        <section id="resumen">
          <Metrics
            data={filtered}
            totalUnfiltered={dataInRange.length}
            hasFilters={hasFilters}
            filtros={filtros}
          />
        </section>

        <hr style={{ borderColor: "var(--borde)", margin: "2rem 0" }} />

        <section id="graficos">
        <div className="charts-row">
          <div className="chart-section">
            <h3 className="section-title">{chart1Title}</h3>
            {chart1Data.length > 0 ? (
              tipoDistribucion === "Circular" ? (
                <PieChart data={chart1Data} height={400} />
              ) : (
                <BarChart data={chart1Data} horizontal height={400} labelWidth={300} />
              )
            ) : (
              <p className="info-message">No hay datos para mostrar con los filtros aplicados.</p>
            )}
          </div>
          <div className="chart-section">
            <h3 className="section-title">Denuncias por Estado</h3>
            {estadoData.length > 0 ? (
              tipoDistribucion === "Circular" ? (
                <PieChart data={estadoData} height={400} />
              ) : (
                <BarChart data={estadoData} horizontal height={400} />
              )
            ) : (
              <p className="info-message">No hay datos de estado para mostrar.</p>
            )}
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-section">
            <h3 className="section-title">Denuncias por Ámbito</h3>
            {ambitoData.length > 0 ? (
              tipoDistribucion === "Circular" ? (
                <PieChart data={ambitoData} height={380} />
              ) : (
                <BarChart data={ambitoData} horizontal={false} height={380} />
              )
            ) : (
              <p className="info-message">No hay datos de ámbito.</p>
            )}
          </div>
          <div className="chart-section">
            <h3 className="section-title">Evolución Mensual</h3>
            {filtered.length > 0 ? (
              <LineChart
                data={evolucionData}
                height={380}
                asBars={tipoEvolucion === "Barras"}
              />
            ) : (
              <p className="info-message">No hay datos mensuales.</p>
            )}
          </div>
        </div>

        <div className="chart-section">
          <h3 className="section-title">Top 10 Temas de Denuncia</h3>
          {temaTopData.length > 0 ? (
            tipoDistribucion === "Circular" ? (
              <PieChart data={temaTopData} height={450} />
            ) : (
              <BarChart data={temaTopData} horizontal height={450} labelWidth={320} />
            )
          ) : (
            <p className="info-message">No hay datos.</p>
          )}
        </div>

        </section>

        <section id="establecimientos">
        <TopEstablecimientos data={filtered} tipoChart={tipoDistribucion} />

        <DetalleEstablecimiento data={filtered} tipoChart={tipoDistribucion} />

        </section>

        <section id="comparador">
        <ComparadorEstablecimientos data={filtered} />
        </section>

        <section id="tabla">
        <div className="expander" style={{ marginTop: "2rem" }}>
          <button
            type="button"
            className="expander-trigger"
            onClick={() => setTablaExpanded(!tablaExpanded)}
          >
            {tablaExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            Ver datos filtrados (tabla)
          </button>
          {tablaExpanded && (
            <div className="expander-content">
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>DEN_ID</th>
                      <th>Año</th>
                      <th>Region</th>
                      <th>DEN_AMBITO</th>
                      <th>DEN_TEMA</th>
                      <th>Estado</th>
                      <th>EE_NOM_COMUNA</th>
                      <th>EE_NOMBRE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 500).map((d, i) => (
                      <tr key={d.DEN_ID ?? i}>
                        <td>{d.DEN_ID ?? "—"}</td>
                        <td>{d.Año}</td>
                        <td>{d.Region ?? "—"}</td>
                        <td>{d.DEN_AMBITO ?? "—"}</td>
                        <td>{d.DEN_TEMA ?? "—"}</td>
                        <td>{d.Estado ?? "—"}</td>
                        <td>{d.EE_NOM_COMUNA ?? d.Comuna ?? "—"}</td>
                        <td>{d.EE_NOMBRE ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        </section>
      </main>
    </div>
  );
}

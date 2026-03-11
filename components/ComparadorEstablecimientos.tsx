"use client";

import { useState, useMemo, useCallback } from "react";
import { Denuncia } from "@/lib/data";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { COLORS } from "@/lib/constants";
import { MESES } from "@/lib/constants";
import { GitCompare, ChevronDown, ChevronUp, FileText, AlignHorizontalSpaceAround, AlignVerticalSpaceAround } from "lucide-react";
import BarChart from "./Charts/BarChart";
import PieChart from "./Charts/PieChart";

const MAX_ESTABLECIMIENTOS = 5;

/** Recharts Bar para evolución mensual en modo barras */
function EvolucionBarrasChart({
  data,
  seleccionados,
}: {
  data: Record<string, string | number>[];
  seleccionados: string[];
}) {
  return (
    <div className="chart-container" style={{ height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 16, right: 24, left: 16, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--borde)" opacity={0.5} />
          <XAxis
            dataKey="mes"
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
          <Legend
            wrapperStyle={{ paddingTop: 12 }}
            formatter={(value: string) => (
              <span style={{ color: "var(--texto-claro)", fontSize: 11 }}>
                {value.length > 40 ? value.slice(0, 40) + "…" : value}
              </span>
            )}
          />
          {seleccionados.map((nombre, i) => (
            <Bar
              key={nombre}
              dataKey={nombre}
              name={nombre}
              fill={COLORS[i % COLORS.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ComparadorEstablecimientosProps {
  data: Denuncia[];
  tipoDistribucion?: "Barras" | "Circular";
  tipoEvolucion?: "Líneas" | "Barras";
}

function countByKey(data: Denuncia[], key: keyof Denuncia): Record<string, number> {
  const out: Record<string, number> = {};
  data.forEach((d) => {
    const v = d[key];
    const k = v != null ? String(v).trim() : "Sin información";
    if (k && k !== "nan") out[k] = (out[k] ?? 0) + 1;
  });
  return out;
}

export default function ComparadorEstablecimientos({
  data,
  tipoDistribucion = "Barras",
  tipoEvolucion = "Líneas",
}: ComparadorEstablecimientosProps) {
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState("");

  const toggleEstablecimiento = useCallback((nombre: string) => {
    setSeleccionados((prev) => {
      if (prev.includes(nombre)) return prev.filter((p) => p !== nombre);
      if (prev.length >= MAX_ESTABLECIMIENTOS) return prev;
      return [...prev, nombre];
    });
  }, []);

  const establecimientos = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => {
      const n = d.EE_NOMBRE?.trim();
      if (n && n !== "nan" && n.length > 0) set.add(n);
    });
    return Array.from(set).sort();
  }, [data]);

  const establecimientosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return establecimientos.slice(0, 30);
    const q = busqueda.toLowerCase();
    return establecimientos.filter((e) => e.toLowerCase().includes(q)).slice(0, 30);
  }, [establecimientos, busqueda]);

  const datosPorEstablecimiento = useMemo(() => {
    const map = new Map<string, Denuncia[]>();
    seleccionados.forEach((nombre) => {
      const subset = data.filter((d) => d.EE_NOMBRE?.trim() === nombre);
      map.set(nombre, subset);
    });
    return map;
  }, [data, seleccionados]);

  const metricasComparacion = useMemo(() => {
    return seleccionados.map((nombre) => {
      const subset = datosPorEstablecimiento.get(nombre) ?? [];
      const total = subset.length;
      const cerradas = subset.filter((d) => d.Estado === "Cerrado").length;
      const enTramite = subset.filter((d) => d.Estado === "En trámite").length;
      const ciber = subset.filter((d) => d.DEN_CIBERBULLYING === 1).length;
      return {
        nombre: nombre.length > 50 ? nombre.slice(0, 50) + "…" : nombre,
        nombreFull: nombre,
        total,
        cerradas,
        enTramite,
        ciber,
      };
    });
  }, [seleccionados, datosPorEstablecimiento]);

  const temasComparacion = useMemo(() => {
    const todosTemas = new Set<string>();
    seleccionados.forEach((nombre) => {
      const subset = datosPorEstablecimiento.get(nombre) ?? [];
      const counts = countByKey(subset, "DEN_TEMA");
      Object.keys(counts).forEach((t) => todosTemas.add(t));
    });
    const temasOrdenados = Array.from(todosTemas).sort();
    return temasOrdenados.slice(0, 12).map((tema) => {
      const row: Record<string, string | number> = { tema: tema.length > 40 ? tema.slice(0, 40) + "…" : tema };
      seleccionados.forEach((nombre, i) => {
        const subset = datosPorEstablecimiento.get(nombre) ?? [];
        const counts = countByKey(subset, "DEN_TEMA");
        row[nombre] = counts[tema] ?? 0;
      });
      return row;
    });
  }, [seleccionados, datosPorEstablecimiento]);

  const ambitosComparacion = useMemo(() => {
    const todosAmbitos = new Set<string>();
    seleccionados.forEach((nombre) => {
      const subset = datosPorEstablecimiento.get(nombre) ?? [];
      const counts = countByKey(subset, "DEN_AMBITO");
      Object.keys(counts).forEach((a) => todosAmbitos.add(a));
    });
    return Array.from(todosAmbitos).sort().map((ambito) => {
      const row: Record<string, string | number> = { ambito };
      seleccionados.forEach((nombre) => {
        const subset = datosPorEstablecimiento.get(nombre) ?? [];
        const counts = countByKey(subset, "DEN_AMBITO");
        row[nombre] = counts[ambito] ?? 0;
      });
      return row;
    });
  }, [seleccionados, datosPorEstablecimiento]);

  const evolucionComparacion = useMemo(() => {
    const meses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    return meses.map((m) => {
      const row: Record<string, string | number> = {
        mes: MESES[m as keyof typeof MESES] ?? String(m),
      };
      seleccionados.forEach((nombre) => {
        const subset = datosPorEstablecimiento.get(nombre) ?? [];
        const count = subset.filter((d) => d.DEN_MES_CREACION === m).length;
        row[nombre] = count;
      });
      return row;
    });
  }, [seleccionados, datosPorEstablecimiento]);

  const dataKeyTemas = temasComparacion.length > 0 ? Object.keys(temasComparacion[0]).filter((k) => k !== "tema") : [];
  const dataKeyAmbitos = ambitosComparacion.length > 0 ? Object.keys(ambitosComparacion[0]).filter((k) => k !== "ambito") : [];

  const [expandedTema, setExpandedTema] = useState(false);
  const [expandedAmbito, setExpandedAmbito] = useState(false);
  const [expandedEvolucion, setExpandedEvolucion] = useState(false);
  const [orientacionBarra, setOrientacionBarra] = useState<"horizontal" | "vertical">("horizontal");

  const resumenComparacion = useMemo((): { menor: string; mayor: string; totalMenor: number; totalMayor: number; diferencia: number; ratio: number; tipo: "iguales" | "significativo" | "similar" } | null => {
    if (metricasComparacion.length < 2) return null;
    const ordenados = [...metricasComparacion].sort((a, b) => a.total - b.total);
    const menor = ordenados[0];
    const mayor = ordenados[ordenados.length - 1];
    const diferencia = mayor.total - menor.total;
    const ratio = menor.total > 0 ? mayor.total / menor.total : 0;
    const nombreMenor = menor.nombreFull.length > 50 ? menor.nombreFull.slice(0, 50) + "…" : menor.nombreFull;
    const nombreMayor = mayor.nombreFull.length > 50 ? mayor.nombreFull.slice(0, 50) + "…" : mayor.nombreFull;

    if (diferencia === 0) {
      return { menor: nombreMenor, mayor: nombreMayor, totalMenor: menor.total, totalMayor: mayor.total, diferencia: 0, ratio: 1, tipo: "iguales" };
    }
    if (ratio >= 2) {
      return { menor: nombreMenor, mayor: nombreMayor, totalMenor: menor.total, totalMayor: mayor.total, diferencia, ratio, tipo: "significativo" };
    }
    return { menor: nombreMenor, mayor: nombreMayor, totalMenor: menor.total, totalMayor: mayor.total, diferencia, ratio, tipo: "similar" };
  }, [metricasComparacion]);

  return (
    <section className="chart-section comparador-section">
      <h3 className="section-title">
        <GitCompare size={22} />
        Comparador de Establecimientos
      </h3>
      <p className="comparador-desc">
        Selecciona entre 2 y {MAX_ESTABLECIMIENTOS} establecimientos para comparar denuncias, temas y evolución.
      </p>

      <div className="comparador-selector">
        <label>Buscar y seleccionar establecimientos (máx. {MAX_ESTABLECIMIENTOS}):</label>
        <input
          type="text"
          className="comparador-busqueda"
          placeholder="Escribe para buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <div className="comparador-lista-opciones">
          {establecimientosFiltrados.map((nombre) => {
            const activo = seleccionados.includes(nombre);
            const disabled = !activo && seleccionados.length >= MAX_ESTABLECIMIENTOS;
            return (
              <button
                key={nombre}
                type="button"
                className={`comparador-opcion ${activo ? "activo" : ""} ${disabled ? "disabled" : ""}`}
                onClick={() => !disabled && toggleEstablecimiento(nombre)}
                title={nombre}
              >
                {nombre.length > 55 ? nombre.slice(0, 55) + "…" : nombre}
              </button>
            );
          })}
        </div>
        {seleccionados.length > 0 && (
          <div className="comparador-seleccionados">
            <span className="comparador-seleccionados-label">Seleccionados:</span>
            {seleccionados.map((nombre) => (
              <span key={nombre} className="comparador-chip">
                {nombre.length > 40 ? nombre.slice(0, 40) + "…" : nombre}
                <button
                  type="button"
                  className="comparador-chip-remove"
                  onClick={() => toggleEstablecimiento(nombre)}
                  aria-label="Quitar"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {seleccionados.length >= 2 && (
        <>
          <div className="comparador-metricas">
            <h4>Resumen comparativo</h4>
            <div className="comparador-tabla-wrapper">
              <table className="comparador-tabla">
                <thead>
                  <tr>
                    <th>Establecimiento</th>
                    <th>Total</th>
                    <th>Cerradas</th>
                    <th>En trámite</th>
                    <th>Ciberbullying</th>
                  </tr>
                </thead>
                <tbody>
                  {metricasComparacion.map((m) => (
                    <tr key={m.nombreFull}>
                      <td className="comparador-nombre">{m.nombreFull}</td>
                      <td>{m.total.toLocaleString()}</td>
                      <td>{m.cerradas.toLocaleString()}</td>
                      <td>{m.enTramite.toLocaleString()}</td>
                      <td>{m.ciber.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gráfico de total de denuncias por establecimiento */}
          <div className="comparador-chart comparador-total-chart">
            <div className="comparador-chart-header">
              <h4>Total de denuncias por establecimiento</h4>
              {tipoDistribucion === "Barras" && (
                <div className="comparador-orientacion-btns">
                  <button
                    type="button"
                    className={`comparador-orientacion-btn ${orientacionBarra === "horizontal" ? "active" : ""}`}
                    onClick={() => setOrientacionBarra("horizontal")}
                    title="Barras horizontales"
                  >
                    <AlignHorizontalSpaceAround size={18} />
                    Horizontal
                  </button>
                  <button
                    type="button"
                    className={`comparador-orientacion-btn ${orientacionBarra === "vertical" ? "active" : ""}`}
                    onClick={() => setOrientacionBarra("vertical")}
                    title="Barras verticales"
                  >
                    <AlignVerticalSpaceAround size={18} />
                    Vertical
                  </button>
                </div>
              )}
            </div>
            {tipoDistribucion === "Circular" ? (
              <PieChart
                data={metricasComparacion.map((m) => ({ name: m.nombreFull, value: m.total }))}
                height={Math.max(280, seleccionados.length * 90)}
                colors={COLORS.slice(0, seleccionados.length)}
              />
            ) : (
              <BarChart
                data={metricasComparacion.map((m) => ({
                  name: m.nombreFull,
                  value: m.total,
                }))}
                horizontal={orientacionBarra === "horizontal"}
                height={orientacionBarra === "vertical" ? Math.max(300, 50 * seleccionados.length) : Math.max(200, seleccionados.length * 80)}
                labelWidth={orientacionBarra === "horizontal" ? 220 : 120}
                labelMaxLength={orientacionBarra === "horizontal" ? 40 : 25}
                colors={COLORS.slice(0, seleccionados.length)}
              />
            )}
          </div>

          {resumenComparacion && (
            <div className="comparador-resumen-texto">
              <h4>
                <FileText size={18} />
                Resumen de la comparación
              </h4>
              <p>
                {resumenComparacion.tipo === "iguales" ? (
                  <>Los {seleccionados.length} establecimientos presentan el mismo número de denuncias ({resumenComparacion.totalMenor.toLocaleString()}) en el período analizado.</>
                ) : resumenComparacion.tipo === "significativo" ? (
                  <>
                    Con base en las denuncias registradas, <strong>{resumenComparacion.menor}</strong> presenta un menor número de denuncias ({resumenComparacion.totalMenor.toLocaleString()}) que <strong>{resumenComparacion.mayor}</strong> ({resumenComparacion.totalMayor.toLocaleString()}), con una diferencia de {resumenComparacion.diferencia.toLocaleString()} casos. Esto sugiere un entorno más favorable en el período analizado para el establecimiento con menos denuncias.
                  </>
                ) : (
                  <>
                    <strong>{resumenComparacion.menor}</strong> registra menos denuncias ({resumenComparacion.totalMenor.toLocaleString()}) que <strong>{resumenComparacion.mayor}</strong> ({resumenComparacion.totalMayor.toLocaleString()}). La diferencia de {resumenComparacion.diferencia.toLocaleString()} casos indica que ambos establecimientos presentan niveles relativamente similares en el período.
                  </>
                )}
              </p>
            </div>
          )}

          {temasComparacion.length > 0 && (
            <div className="comparador-expander">
              <button
                type="button"
                className="comparador-expander-trigger"
                onClick={() => setExpandedTema((e) => !e)}
              >
                {expandedTema ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                Comparación por Tema
              </button>
              {expandedTema && (
                <div className="comparador-expander-content">
              <div className="chart-container" style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={temasComparacion}
                    margin={{ top: 16, right: 24, left: 8, bottom: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--borde)" opacity={0.5} />
                    <XAxis
                      dataKey="tema"
                      stroke="var(--texto-medio)"
                      fontSize={10}
                      tick={{ fill: "var(--texto-claro)" }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
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
                    <Legend
                      wrapperStyle={{ paddingTop: 16 }}
                      formatter={(value) => (
                        <span style={{ color: "var(--texto-claro)", fontSize: 11 }}>
                          {value.length > 40 ? value.slice(0, 40) + "…" : value}
                        </span>
                      )}
                    />
                    {dataKeyTemas.map((key, i) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        name={key}
                        fill={COLORS[i % COLORS.length]}
                        radius={[0, 0, 0, 0]}
                        maxBarSize={45}
                      />
                    ))}
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
                </div>
              )}
            </div>
          )}

          {ambitosComparacion.length > 0 && (
            <div className="comparador-expander">
              <button
                type="button"
                className="comparador-expander-trigger"
                onClick={() => setExpandedAmbito((e) => !e)}
              >
                {expandedAmbito ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                Comparación por Ámbito
              </button>
              {expandedAmbito && (
                <div className="comparador-expander-content">
              <div className="chart-container" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={ambitosComparacion}
                    margin={{ top: 16, right: 24, left: 8, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--borde)" opacity={0.5} />
                    <XAxis
                      dataKey="ambito"
                      stroke="var(--texto-medio)"
                      fontSize={10}
                      tick={{ fill: "var(--texto-claro)" }}
                      angle={-45}
                      textAnchor="end"
                      height={70}
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
                    <Legend
                      wrapperStyle={{ paddingTop: 12 }}
                      formatter={(value) => (
                        <span style={{ color: "var(--texto-claro)", fontSize: 11 }}>
                          {value.length > 40 ? value.slice(0, 40) + "…" : value}
                        </span>
                      )}
                    />
                    {dataKeyAmbitos.map((key, i) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        name={key}
                        fill={COLORS[i % COLORS.length]}
                        radius={[0, 0, 0, 0]}
                        maxBarSize={45}
                      />
                    ))}
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
                </div>
              )}
            </div>
          )}

          <div className="comparador-expander">
            <button
              type="button"
              className="comparador-expander-trigger"
              onClick={() => setExpandedEvolucion((e) => !e)}
            >
              {expandedEvolucion ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              Evolución mensual
            </button>
            {expandedEvolucion && (
              <div className="comparador-expander-content">
            {tipoEvolucion === "Barras" ? (
              <EvolucionBarrasChart data={evolucionComparacion} seleccionados={seleccionados} />
            ) : (
              <div className="chart-container" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={evolucionComparacion}
                    margin={{ top: 16, right: 24, left: 16, bottom: 24 }}
                  >
                    <defs>
                      {seleccionados.map((_, i) => (
                        <linearGradient key={i} id={`evolGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--borde)" opacity={0.5} />
                    <XAxis
                      dataKey="mes"
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
                    <Legend
                      wrapperStyle={{ paddingTop: 12 }}
                      formatter={(value) => (
                        <span style={{ color: "var(--texto-claro)", fontSize: 11 }}>
                          {value.length > 40 ? value.slice(0, 40) + "…" : value}
                        </span>
                      )}
                    />
                    {seleccionados.map((nombre, i) => (
                      <Area
                        key={nombre}
                        type="monotone"
                        dataKey={nombre}
                        name={nombre}
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth={2}
                        fill={`url(#evolGrad${i})`}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
              </div>
            )}
          </div>
        </>
      )}

      {seleccionados.length === 1 && (
        <p className="info-message">Selecciona al menos 2 establecimientos para comparar.</p>
      )}
    </section>
  );
}

"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
import { GitCompare, ChevronDown, ChevronUp, FileText, AlignHorizontalSpaceAround, AlignVerticalSpaceAround, Heart } from "lucide-react";
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
  initialSeleccionados?: string[];
  paraAntonia?: boolean;
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
  initialSeleccionados,
  paraAntonia = false,
}: ComparadorEstablecimientosProps) {
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState("");

  const appliedInitial = useRef(false);
  useEffect(() => {
    if (initialSeleccionados?.length && data.length > 0 && !appliedInitial.current) {
      const existentes = initialSeleccionados.filter((n) =>
        data.some((d) => d.EE_NOMBRE?.trim() === n)
      );
      if (existentes.length > 0) {
        setSeleccionados(existentes);
        appliedInitial.current = true;
      }
    }
  }, [initialSeleccionados, data]);

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
  const [tipoResumen, setTipoResumen] = useState<"total" | "estado" | "ciberbullying">("total");

  type ResumenData = {
    favorable: string;
    desfavorable: string;
    valorFavorable: number;
    valorDesfavorable: number;
    diferencia: number;
    tipo: "iguales" | "significativo" | "similar";
    descripcion: string;
  };

  const { ordenados, resumenData } = useMemo(() => {
    if (metricasComparacion.length < 2) {
      return { ordenados: metricasComparacion, resumenData: null as ResumenData | null };
    }

    let ordenados: typeof metricasComparacion;
    let favorable: (typeof metricasComparacion)[0];
    let desfavorable: (typeof metricasComparacion)[0];
    let valorFavorable: number;
    let valorDesfavorable: number;
    let descripcion: string;

    if (tipoResumen === "total") {
      ordenados = [...metricasComparacion].sort((a, b) => a.total - b.total);
      favorable = ordenados[0];
      desfavorable = ordenados[ordenados.length - 1];
      valorFavorable = favorable.total;
      valorDesfavorable = desfavorable.total;
      descripcion = "Ordenado de menor a mayor número de denuncias.";
    } else if (tipoResumen === "estado") {
      ordenados = [...metricasComparacion].sort((a, b) => {
        const pctA = a.total > 0 ? (a.cerradas / a.total) * 100 : 0;
        const pctB = b.total > 0 ? (b.cerradas / b.total) * 100 : 0;
        return pctB - pctA;
      });
      favorable = ordenados[0];
      desfavorable = ordenados[ordenados.length - 1];
      valorFavorable = favorable.total > 0 ? Math.round((favorable.cerradas / favorable.total) * 100) : 0;
      valorDesfavorable = desfavorable.total > 0 ? Math.round((desfavorable.cerradas / desfavorable.total) * 100) : 0;
      descripcion = "Ordenado por mayor % de denuncias cerradas (resueltas).";
    } else {
      ordenados = [...metricasComparacion].sort((a, b) => a.ciber - b.ciber);
      favorable = ordenados[0];
      desfavorable = ordenados[ordenados.length - 1];
      valorFavorable = favorable.ciber;
      valorDesfavorable = desfavorable.ciber;
      descripcion = "Ordenado por menor número de casos de ciberbullying.";
    }

    const diferencia = valorDesfavorable - valorFavorable;
    const ratio = valorFavorable > 0 ? valorDesfavorable / valorFavorable : 0;
    const nombreFav = favorable.nombreFull.length > 50 ? favorable.nombreFull.slice(0, 50) + "…" : favorable.nombreFull;
    const nombreDes = desfavorable.nombreFull.length > 50 ? desfavorable.nombreFull.slice(0, 50) + "…" : desfavorable.nombreFull;

    let tipo: "iguales" | "significativo" | "similar" = "similar";
    if (diferencia === 0) tipo = "iguales";
    else if (ratio >= 2 || (tipoResumen === "estado" && diferencia >= 15)) tipo = "significativo";

    const resumenData: ResumenData = {
      favorable: nombreFav,
      desfavorable: nombreDes,
      valorFavorable,
      valorDesfavorable,
      diferencia,
      tipo,
      descripcion,
    };

    return { ordenados, resumenData };
  }, [metricasComparacion, tipoResumen]);

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

      {paraAntonia && seleccionados.length >= 2 && (
        <div className="para-antonia-banner">
          <h4>
            <Heart size={22} />
            Para Antonia
          </h4>
          <p>
            Este estudio compara el <strong>Liceo Comercial Instituto Superior de Comercio de Chile (ex A99)</strong> con el <strong>Colegio Santa Rosa</strong>, utilizando datos oficiales de denuncias ante la Superintendencia de Educación.
          </p>
          <p>
            <strong>¿Por qué elegiríamos el Liceo Comercial en este estudio?</strong> Por tres razones principales basadas en los datos: (1) <strong>Menor número total de denuncias</strong> — indica un entorno con menos conflictos reportados; (2) <strong>Menor incidencia de ciberbullying</strong> — un aspecto especialmente relevante para la convivencia escolar; (3) <strong>Mayor proporción de denuncias cerradas</strong> — sugiere una mejor capacidad de resolución. Explora los gráficos y resúmenes a continuación para ver los detalles.
          </p>
        </div>
      )}

      {seleccionados.length >= 2 && (
        <>
          <div className="comparador-metricas">
            <div className="comparador-metricas-header">
              <h4>Resumen comparativo</h4>
              <div className="comparador-tipo-resumen">
                <label>Tipo de resumen:</label>
                <div className="comparador-tipo-resumen-btns">
                  <button
                    type="button"
                    className={`comparador-tipo-resumen-btn ${tipoResumen === "total" ? "active" : ""}`}
                    onClick={() => setTipoResumen("total")}
                    title="Por total de denuncias"
                  >
                    Total
                  </button>
                  <button
                    type="button"
                    className={`comparador-tipo-resumen-btn ${tipoResumen === "estado" ? "active" : ""}`}
                    onClick={() => setTipoResumen("estado")}
                    title="Por % denuncias cerradas"
                  >
                    Estado
                  </button>
                  <button
                    type="button"
                    className={`comparador-tipo-resumen-btn ${tipoResumen === "ciberbullying" ? "active" : ""}`}
                    onClick={() => setTipoResumen("ciberbullying")}
                    title="Por ciberbullying"
                  >
                    Ciberbullying
                  </button>
                </div>
              </div>
            </div>
            {resumenData && (
              <p className="comparador-metricas-desc">
                {resumenData.descripcion} El primero es el más favorable.
              </p>
            )}
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
                  {ordenados.map((m, i) => {
                    const hayDiferencia = resumenData && ordenados.length > 1 && resumenData.diferencia > 0;
                    const esFavorable = i === 0 && hayDiferencia;
                    return (
                      <tr key={m.nombreFull} className={esFavorable ? "comparador-fila-favorable" : ""}>
                        <td className="comparador-nombre">
                          {m.nombreFull}
                          {esFavorable && (
                            <span
                              className="comparador-badge-favorable"
                              title={
                                tipoResumen === "total"
                                  ? "Menor número de denuncias"
                                  : tipoResumen === "estado"
                                    ? "Mayor % denuncias cerradas"
                                    : "Menor ciberbullying"
                              }
                            >
                              más favorable
                            </span>
                          )}
                        </td>
                        <td>{m.total.toLocaleString()}</td>
                        <td>{m.cerradas.toLocaleString()}</td>
                        <td>{m.enTramite.toLocaleString()}</td>
                        <td>{m.ciber.toLocaleString()}</td>
                      </tr>
                    );
                  })}
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

          {resumenData && (
            <div className="comparador-resumen-texto">
              <h4>
                <FileText size={18} />
                Resumen de la comparación ({tipoResumen === "total" ? "por total" : tipoResumen === "estado" ? "por estado" : "por ciberbullying"})
              </h4>
              <p>
                {resumenData.tipo === "iguales" ? (
                  tipoResumen === "total" ? (
                    <>Los {seleccionados.length} establecimientos presentan el mismo número de denuncias ({resumenData.valorFavorable.toLocaleString()}) en el período analizado.</>
                  ) : tipoResumen === "estado" ? (
                    <>Los {seleccionados.length} establecimientos presentan un porcentaje similar de denuncias cerradas ({resumenData.valorFavorable}%) en el período analizado.</>
                  ) : (
                    <>Los {seleccionados.length} establecimientos presentan el mismo número de casos de ciberbullying ({resumenData.valorFavorable.toLocaleString()}) en el período analizado.</>
                  )
                ) : resumenData.tipo === "significativo" ? (
                  tipoResumen === "total" ? (
                    <>
                      Con base en las denuncias registradas, <strong>{resumenData.favorable}</strong> presenta un menor número de denuncias ({resumenData.valorFavorable.toLocaleString()}) que <strong>{resumenData.desfavorable}</strong> ({resumenData.valorDesfavorable.toLocaleString()}), con una diferencia de {resumenData.diferencia.toLocaleString()} casos. Esto sugiere un entorno más favorable para <strong>{resumenData.favorable}</strong>.
                    </>
                  ) : tipoResumen === "estado" ? (
                    <>
                      <strong>{resumenData.favorable}</strong> tiene un mayor porcentaje de denuncias cerradas ({resumenData.valorFavorable}%) que <strong>{resumenData.desfavorable}</strong> ({resumenData.valorDesfavorable}%), con una diferencia de {resumenData.diferencia} puntos. Esto sugiere una mayor capacidad de resolución para <strong>{resumenData.favorable}</strong>.
                    </>
                  ) : (
                    <>
                      <strong>{resumenData.favorable}</strong> registra menos casos de ciberbullying ({resumenData.valorFavorable.toLocaleString()}) que <strong>{resumenData.desfavorable}</strong> ({resumenData.valorDesfavorable.toLocaleString()}), con una diferencia de {resumenData.diferencia.toLocaleString()} casos. Esto sugiere un entorno más favorable en este aspecto para <strong>{resumenData.favorable}</strong>.
                    </>
                  )
                ) : (
                  tipoResumen === "total" ? (
                    <>
                      <strong>{resumenData.favorable}</strong> registra menos denuncias ({resumenData.valorFavorable.toLocaleString()}) que <strong>{resumenData.desfavorable}</strong> ({resumenData.valorDesfavorable.toLocaleString()}). La diferencia de {resumenData.diferencia.toLocaleString()} casos indica niveles relativamente similares; el más favorable es <strong>{resumenData.favorable}</strong>.
                    </>
                  ) : tipoResumen === "estado" ? (
                    <>
                      <strong>{resumenData.favorable}</strong> tiene mayor % de denuncias cerradas ({resumenData.valorFavorable}%) que <strong>{resumenData.desfavorable}</strong> ({resumenData.valorDesfavorable}%). Diferencia de {resumenData.diferencia} puntos; el más favorable es <strong>{resumenData.favorable}</strong>.
                    </>
                  ) : (
                    <>
                      <strong>{resumenData.favorable}</strong> tiene menos ciberbullying ({resumenData.valorFavorable.toLocaleString()}) que <strong>{resumenData.desfavorable}</strong> ({resumenData.valorDesfavorable.toLocaleString()}). Diferencia de {resumenData.diferencia.toLocaleString()} casos; el más favorable es <strong>{resumenData.favorable}</strong>.
                    </>
                  )
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

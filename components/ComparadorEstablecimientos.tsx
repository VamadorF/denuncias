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
import { GitCompare } from "lucide-react";
import BarChart from "./Charts/BarChart";

const MAX_ESTABLECIMIENTOS = 5;

interface ComparadorEstablecimientosProps {
  data: Denuncia[];
  seleccionados: string[];
  onToggle: (nombre: string) => void;
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
  seleccionados,
  onToggle,
}: ComparadorEstablecimientosProps) {

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

  return (
    <section className="chart-section comparador-section">
      <h3 className="section-title">
        <GitCompare size={22} />
        Comparador de Establecimientos
      </h3>
      <p className="comparador-desc">
        Usa el selector en la barra lateral para elegir establecimientos. Los resultados aparecen aquí.
      </p>

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
            <h4>Total de denuncias por establecimiento</h4>
            <BarChart
              data={metricasComparacion.map((m) => ({
                name: m.nombreFull,
                value: m.total,
              }))}
              horizontal
              height={Math.max(200, seleccionados.length * 80)}
              labelWidth={220}
              labelMaxLength={40}
              colors={COLORS.slice(0, seleccionados.length)}
            />
          </div>

          {temasComparacion.length > 0 && (
            <div className="comparador-chart">
              <h4>Comparación por Tema</h4>
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

          {ambitosComparacion.length > 0 && (
            <div className="comparador-chart">
              <h4>Comparación por Ámbito</h4>
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

          <div className="comparador-chart">
            <h4>Evolución mensual</h4>
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
          </div>
        </>
      )}

      {seleccionados.length === 1 && (
        <p className="info-message">Selecciona al menos 2 establecimientos para comparar.</p>
      )}
    </section>
  );
}

"use client";

import { useMemo } from "react";
import { Denuncia } from "@/lib/data";
import { GitCompare } from "lucide-react";

const MAX_ESTABLECIMIENTOS = 5;

interface ComparadorSelectorProps {
  data: Denuncia[];
  seleccionados: string[];
  onToggle: (nombre: string) => void;
  busqueda: string;
  onBusquedaChange: (v: string) => void;
  compact?: boolean;
}

export default function ComparadorSelector({
  data,
  seleccionados,
  onToggle,
  busqueda,
  onBusquedaChange,
  compact = false,
}: ComparadorSelectorProps) {
  const establecimientos = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => {
      const n = d.EE_NOMBRE?.trim();
      if (n && n !== "nan" && n.length > 0) set.add(n);
    });
    return Array.from(set).sort();
  }, [data]);

  const establecimientosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return establecimientos.slice(0, compact ? 15 : 30);
    const q = busqueda.toLowerCase();
    return establecimientos.filter((e) => e.toLowerCase().includes(q)).slice(0, compact ? 15 : 30);
  }, [establecimientos, busqueda, compact]);

  return (
    <div className="comparador-selector-sidebar">
      <h3 className="comparador-sidebar-title">
        <GitCompare size={18} />
        Comparador
      </h3>
      <p className="comparador-sidebar-desc">
        Selecciona 2–{MAX_ESTABLECIMIENTOS} establecimientos para comparar.
      </p>
      <input
        type="text"
        className="comparador-busqueda"
        placeholder="Buscar..."
        value={busqueda}
        onChange={(e) => onBusquedaChange(e.target.value)}
      />
      <div className={`comparador-lista-opciones ${compact ? "compact" : ""}`}>
        {establecimientosFiltrados.map((nombre) => {
          const activo = seleccionados.includes(nombre);
          const disabled = !activo && seleccionados.length >= MAX_ESTABLECIMIENTOS;
          return (
            <button
              key={nombre}
              type="button"
              className={`comparador-opcion ${activo ? "activo" : ""} ${disabled ? "disabled" : ""}`}
              onClick={() => !disabled && onToggle(nombre)}
              title={nombre}
            >
              {nombre.length > (compact ? 30 : 45) ? nombre.slice(0, compact ? 30 : 45) + "…" : nombre}
            </button>
          );
        })}
      </div>
      {seleccionados.length > 0 && (
        <div className="comparador-seleccionados-sidebar">
          <span className="comparador-seleccionados-label">Seleccionados:</span>
          {seleccionados.map((nombre) => (
            <span key={nombre} className="comparador-chip">
              {nombre.length > (compact ? 25 : 35) ? nombre.slice(0, compact ? 25 : 35) + "…" : nombre}
              <button
                type="button"
                className="comparador-chip-remove"
                onClick={() => onToggle(nombre)}
                aria-label="Quitar"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

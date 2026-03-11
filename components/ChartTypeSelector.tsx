"use client";

import { BarChart2, PieChart, TrendingUp, BarChart3 } from "lucide-react";

interface ChartTypeSelectorProps {
  tipoDistribucion: "Barras" | "Circular";
  tipoEvolucion: "Líneas" | "Barras";
  onTipoDistribucion: (t: "Barras" | "Circular") => void;
  onTipoEvolucion: (t: "Líneas" | "Barras") => void;
}

export default function ChartTypeSelector({
  tipoDistribucion,
  tipoEvolucion,
  onTipoDistribucion,
  onTipoEvolucion,
}: ChartTypeSelectorProps) {
  return (
    <div className="chart-type-selector">
      <div className="chart-type-group">
        <span className="chart-type-label">Distribuciones:</span>
        <div className="chart-type-btns">
          <button
            type="button"
            className={`chart-type-btn ${tipoDistribucion === "Barras" ? "active" : ""}`}
            onClick={() => onTipoDistribucion("Barras")}
            aria-pressed={tipoDistribucion === "Barras"}
          >
            <BarChart2 size={18} />
            Barras
          </button>
          <button
            type="button"
            className={`chart-type-btn ${tipoDistribucion === "Circular" ? "active" : ""}`}
            onClick={() => onTipoDistribucion("Circular")}
            aria-pressed={tipoDistribucion === "Circular"}
          >
            <PieChart size={18} />
            Circular
          </button>
        </div>
      </div>
      <div className="chart-type-group">
        <span className="chart-type-label">Evolución:</span>
        <div className="chart-type-btns">
          <button
            type="button"
            className={`chart-type-btn ${tipoEvolucion === "Líneas" ? "active" : ""}`}
            onClick={() => onTipoEvolucion("Líneas")}
            aria-pressed={tipoEvolucion === "Líneas"}
          >
            <TrendingUp size={18} />
            Líneas
          </button>
          <button
            type="button"
            className={`chart-type-btn ${tipoEvolucion === "Barras" ? "active" : ""}`}
            onClick={() => onTipoEvolucion("Barras")}
            aria-pressed={tipoEvolucion === "Barras"}
          >
            <BarChart3 size={18} />
            Barras
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Filtros } from "@/lib/data";
import { MESES } from "@/lib/constants";
import { Search } from "lucide-react";

interface FiltersProps {
  filtros: Filtros;
  onChange: (f: Filtros) => void;
  añosDisponibles: number[];
  regiones: string[];
  comunas: string[];
  ambitos: string[];
  temas: string[];
  subtemas: string[];
  estados: string[];
  meses: number[];
  trimestres: number[];
  tipoDistribucion: "Barras" | "Circular";
  tipoEvolucion: "Líneas" | "Barras";
  onTipoDistribucion: (t: "Barras" | "Circular") => void;
  onTipoEvolucion: (t: "Líneas" | "Barras") => void;
}

export default function Filters({
  filtros,
  onChange,
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
  onTipoDistribucion,
  onTipoEvolucion,
}: FiltersProps) {
  const update = (partial: Partial<Filtros>) => {
    onChange({ ...filtros, ...partial });
  };

  return (
    <aside className="filters-sidebar">
      <h2 className="filters-header">
        <Search size={20} />
        Filtros
      </h2>
      <hr className="filters-divider" />

      <div className="filter-group">
        <label>Rango de años</label>
        <div className="filter-row">
          <select
            value={filtros.añoDesde ?? "Todos"}
            onChange={(e) =>
              update({
                añoDesde:
                  e.target.value === "Todos" ? undefined : parseInt(e.target.value),
              })
            }
          >
            <option value="Todos">Desde</option>
            {añosDisponibles.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            value={filtros.añoHasta ?? "Todos"}
            onChange={(e) =>
              update({
                añoHasta:
                  e.target.value === "Todos" ? undefined : parseInt(e.target.value),
              })
            }
          >
            <option value="Todos">Hasta</option>
            {añosDisponibles.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-group">
        <label>Región</label>
        <select
          value={filtros.region ?? "Todas"}
          onChange={(e) =>
            update({ region: e.target.value === "Todas" ? undefined : e.target.value })
          }
        >
          <option value="Todas">Todas</option>
          {regiones.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Comuna</label>
        <select
          value={filtros.comuna ?? "Todas"}
          onChange={(e) =>
            update({ comuna: e.target.value === "Todas" ? undefined : e.target.value })
          }
        >
          <option value="Todas">Todas</option>
          {comunas.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Ámbito</label>
        <select
          value={filtros.ambito ?? "Todos"}
          onChange={(e) =>
            update({ ambito: e.target.value === "Todos" ? undefined : e.target.value })
          }
        >
          <option value="Todos">Todos</option>
          {ambitos.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Tema</label>
        <select
          value={filtros.tema ?? "Todos"}
          onChange={(e) =>
            update({ tema: e.target.value === "Todos" ? undefined : e.target.value })
          }
        >
          <option value="Todos">Todos</option>
          {temas.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Subtema</label>
        <select
          value={filtros.subtema ?? "Todos"}
          onChange={(e) =>
            update({ subtema: e.target.value === "Todos" ? undefined : e.target.value })
          }
        >
          <option value="Todos">Todos</option>
          {subtemas.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Estado</label>
        <select
          value={filtros.estado ?? "Todos"}
          onChange={(e) =>
            update({ estado: e.target.value === "Todos" ? undefined : e.target.value })
          }
        >
          <option value="Todos">Todos</option>
          {estados.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Mes</label>
        <select
          value={filtros.mes ?? "Todos"}
          onChange={(e) =>
            update({
              mes: e.target.value === "Todos" ? undefined : parseInt(e.target.value),
            })
          }
        >
          <option value="Todos">Todos</option>
          {meses.map((m) => (
            <option key={m} value={m}>
              {MESES[m as keyof typeof MESES] ?? m}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Trimestre</label>
        <select
          value={filtros.trimestre ?? "Todos"}
          onChange={(e) =>
            update({
              trimestre:
                e.target.value === "Todos" ? undefined : parseInt(e.target.value),
            })
          }
        >
          <option value="Todos">Todos</option>
          {trimestres.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <hr className="filters-divider" />
      <h3 className="filter-subheader">Tipo de gráfico</h3>
      <div className="filter-group">
        <label>Distribuciones</label>
        <div className="filter-radio">
          <label>
            <input
              type="radio"
              name="dist"
              checked={tipoDistribucion === "Barras"}
              onChange={() => onTipoDistribucion("Barras")}
            />
            Barras
          </label>
          <label>
            <input
              type="radio"
              name="dist"
              checked={tipoDistribucion === "Circular"}
              onChange={() => onTipoDistribucion("Circular")}
            />
            Circular
          </label>
        </div>
      </div>
      <div className="filter-group">
        <label>Evolución mensual</label>
        <div className="filter-radio">
          <label>
            <input
              type="radio"
              name="evol"
              checked={tipoEvolucion === "Líneas"}
              onChange={() => onTipoEvolucion("Líneas")}
            />
            Líneas
          </label>
          <label>
            <input
              type="radio"
              name="evol"
              checked={tipoEvolucion === "Barras"}
              onChange={() => onTipoEvolucion("Barras")}
            />
            Barras
          </label>
        </div>
      </div>

      <hr className="filters-divider" />
      <p className="filters-caption">Datos: Denuncias - Superintendencia de Educación</p>
    </aside>
  );
}

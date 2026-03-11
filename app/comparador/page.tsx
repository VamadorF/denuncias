"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  loadIndex,
  loadDenuncias,
  applyFilters,
  getComunasForFilters,
  Denuncia,
  Filtros,
} from "@/lib/data";
import Filters from "@/components/Filters";
import ComparadorEstablecimientos from "@/components/ComparadorEstablecimientos";
import MobileNav from "@/components/MobileNav";
import { useIsMobile } from "@/lib/useMediaQuery";
import { GitCompare, ArrowLeft } from "lucide-react";

export default function ComparadorPage() {
  const [index, setIndex] = useState<{ años: number[] } | null>(null);
  const [allData, setAllData] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<Filtros>({});
  const [tipoDistribucion, setTipoDistribucion] = useState<"Barras" | "Circular">("Barras");
  const [tipoEvolucion, setTipoEvolucion] = useState<"Líneas" | "Barras">("Líneas");
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
        <Link href="/" className="comparador-back-link">
          <ArrowLeft size={18} /> Volver al dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className={`dashboard-layout ${isMobile ? "mobile" : ""}`}>
      {isMobile ? (
        <MobileNav
          filtersOpen={filtersOpen}
          onFiltersToggle={() => setFiltersOpen((o) => !o)}
          hasActiveFilters={hasFilters}
          filtersContent={<Filters {...filtersProps} inDrawer />}
          isComparadorPage
        />
      ) : (
        <aside className="filters-sidebar">
          <Link href="/" className="comparador-sidebar-back">
            <ArrowLeft size={18} />
            Volver al dashboard
          </Link>
          <Filters {...filtersProps} inSidebar />
        </aside>
      )}
      <main className="main-content">
        <header className="main-header">
          <h1>
            <GitCompare size={28} style={{ verticalAlign: "middle", marginRight: "0.5rem" }} />
            Comparador de Establecimientos
          </h1>
          <p>
            Selecciona entre 2 y 5 establecimientos para comparar denuncias, temas, ámbitos y evolución mensual.
          </p>
        </header>

        <ComparadorEstablecimientos data={filtered} />
      </main>
    </div>
  );
}

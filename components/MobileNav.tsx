"use client";

import { X, SlidersHorizontal, BarChart3, Building2, GitCompare, Table2, Home } from "lucide-react";

interface MobileNavProps {
  filtersOpen: boolean;
  onFiltersToggle: () => void;
  hasActiveFilters: boolean;
  hasComparadorSelection?: boolean;
  filtersContent: React.ReactNode;
}

const SECTIONS = [
  { id: "resumen", label: "Resumen", icon: Home },
  { id: "graficos", label: "Gráficos", icon: BarChart3 },
  { id: "establecimientos", label: "Top 20", icon: Building2 },
  { id: "comparador", label: "Comparar", icon: GitCompare },
  { id: "tabla", label: "Tabla", icon: Table2 },
];

export default function MobileNav({
  filtersOpen,
  onFiltersToggle,
  hasActiveFilters,
  hasComparadorSelection = false,
  filtersContent,
}: MobileNavProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header className="mobile-topbar">
        <div className="mobile-topbar-inner">
          <h1 className="mobile-logo">Denuncias Educativas</h1>
          <button
            type="button"
            className={`mobile-menu-btn ${hasActiveFilters || hasComparadorSelection ? "has-filters" : ""}`}
            onClick={onFiltersToggle}
            aria-label={filtersOpen ? "Cerrar filtros" : "Abrir filtros"}
          >
            {filtersOpen ? <X size={24} /> : <SlidersHorizontal size={22} />}
            {hasActiveFilters && <span className="mobile-filters-badge" />}
          </button>
        </div>
      </header>

      <div
        className={`mobile-drawer-overlay ${filtersOpen ? "open" : ""}`}
        onClick={onFiltersToggle}
        aria-hidden={!filtersOpen}
      />

      <aside className={`mobile-filters-drawer ${filtersOpen ? "open" : ""}`}>
        <div className="mobile-drawer-header">
          <h2>Filtros y Comparador</h2>
          <button
            type="button"
            className="mobile-drawer-close"
            onClick={onFiltersToggle}
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>
        <div className="mobile-drawer-body">{filtersContent}</div>
      </aside>

      <nav className="mobile-bottom-nav">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className="mobile-nav-item"
            onClick={() => scrollTo(id)}
            aria-label={label}
          >
            <Icon size={22} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

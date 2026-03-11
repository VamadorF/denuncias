"use client";

import Link from "next/link";
import { X, SlidersHorizontal, BarChart3, Building2, GitCompare, Table2, Home, ArrowLeft } from "lucide-react";

interface MobileNavProps {
  filtersOpen: boolean;
  onFiltersToggle: () => void;
  hasActiveFilters: boolean;
  hasComparadorSelection?: boolean;
  filtersContent: React.ReactNode;
  /** En la página del comparador no mostramos la barra inferior de secciones */
  isComparadorPage?: boolean;
}

const SECTIONS: { id: string; label: string; icon: typeof Home; href?: string }[] = [
  { id: "resumen", label: "Resumen", icon: Home },
  { id: "graficos", label: "Gráficos", icon: BarChart3 },
  { id: "establecimientos", label: "Top 20", icon: Building2 },
  { id: "comparador", label: "Comparar", icon: GitCompare, href: "/comparador" },
  { id: "tabla", label: "Tabla", icon: Table2 },
];

export default function MobileNav({
  filtersOpen,
  onFiltersToggle,
  hasActiveFilters,
  hasComparadorSelection = false,
  filtersContent,
  isComparadorPage = false,
}: MobileNavProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header className="mobile-topbar">
        <div className="mobile-topbar-inner">
          {isComparadorPage ? (
            <Link href="/" className="mobile-logo-link">
              <ArrowLeft size={22} />
              <span>Volver</span>
            </Link>
          ) : (
            <h1 className="mobile-logo">Denuncias Educativas</h1>
          )}
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
          <h2>{isComparadorPage ? "Filtros" : "Filtros y Comparador"}</h2>
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

      {!isComparadorPage && (
        <nav className="mobile-bottom-nav">
          {SECTIONS.map(({ id, label, icon: Icon, href }) =>
            href ? (
              <Link
                key={id}
                href={href}
                className="mobile-nav-item"
                aria-label={label}
              >
                <Icon size={22} strokeWidth={1.8} />
                <span>{label}</span>
              </Link>
            ) : (
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
            )
          )}
        </nav>
      )}
    </>
  );
}

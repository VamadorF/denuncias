"use client";

import Link from "next/link";
import { useRef, useEffect, useCallback } from "react";
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

const SWIPE_THRESHOLD = 60;

export default function MobileNav({
  filtersOpen,
  onFiltersToggle,
  hasActiveFilters,
  hasComparadorSelection = false,
  filtersContent,
  isComparadorPage = false,
}: MobileNavProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const drawerTouchStart = useRef<{ x: number; y: number } | null>(null);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (filtersOpen) return;
      const t = e.touches[0];
      if (t.clientX < 40) {
        touchStart.current = { x: t.clientX, y: t.clientY };
      }
    },
    [filtersOpen]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchStart.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      if (dx > SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
        onFiltersToggle();
      }
      touchStart.current = null;
    },
    [onFiltersToggle]
  );

  const handleDrawerTouchStart = useCallback((e: React.TouchEvent) => {
    drawerTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleDrawerTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!drawerTouchStart.current || !filtersOpen) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - drawerTouchStart.current.x;
      if (dx < -SWIPE_THRESHOLD) onFiltersToggle();
      drawerTouchStart.current = null;
    },
    [filtersOpen, onFiltersToggle]
  );

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

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
            className={`mobile-filters-btn ${hasActiveFilters || hasComparadorSelection ? "has-filters" : ""}`}
            onClick={onFiltersToggle}
            aria-label={filtersOpen ? "Cerrar filtros" : "Abrir filtros"}
          >
            {filtersOpen ? <X size={24} /> : <SlidersHorizontal size={22} />}
            <span className="mobile-filters-btn-label">{filtersOpen ? "Cerrar" : "Filtros"}</span>
            {hasActiveFilters && !filtersOpen && <span className="mobile-filters-badge" />}
          </button>
        </div>
      </header>

      <div
        className={`mobile-drawer-overlay ${filtersOpen ? "open" : ""}`}
        onClick={onFiltersToggle}
        aria-hidden={!filtersOpen}
      />

      <aside
        className={`mobile-filters-drawer ${filtersOpen ? "open" : ""}`}
        onTouchStart={handleDrawerTouchStart}
        onTouchEnd={handleDrawerTouchEnd}
      >
        <div className="mobile-drawer-swipe-handle" aria-hidden />
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
        <p className="mobile-drawer-swipe-hint">Desliza desde el borde izquierdo para abrir</p>
        <div className="mobile-drawer-body">{filtersContent}</div>
      </aside>

      {!isComparadorPage && (
        <button
          type="button"
          className="mobile-fab-filters"
          onClick={onFiltersToggle}
          aria-label="Abrir filtros"
          title="Filtros"
        >
          <SlidersHorizontal size={24} />
        </button>
      )}

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

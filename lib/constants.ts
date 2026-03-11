export const REGIONES: Record<number, string> = {
  1: "Tarapacá",
  2: "Antofagasta",
  3: "Atacama",
  4: "Coquimbo",
  5: "Valparaíso",
  6: "O'Higgins",
  7: "Maule",
  8: "Biobío",
  9: "Araucanía",
  10: "Los Lagos",
  11: "Aysén",
  12: "Magallanes",
  13: "Metropolitana",
  14: "Los Ríos",
  15: "Arica y Parinacota",
  16: "Ñuble",
};

export const ESTADOS: Record<number, string> = {
  1: "Cerrado",
  2: "En trámite",
  3: "En seguimiento",
};

export const MESES: Record<number, string> = {
  1: "Ene",
  2: "Feb",
  3: "Mar",
  4: "Abr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Ago",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dic",
};

export const PALETTE = {
  fondo: "#0f0f1a",
  fondoCard: "#1a1a2e",
  fondoCardHover: "#252542",
  textoClaro: "#E8E8F0",
  textoMedio: "#A0A0B8",
  acento1: "#00D4FF",
  acento2: "#00FF88",
  acento3: "#FF6B35",
  acento4: "#FFD93D",
  acento5: "#FF3366",
  acento6: "#9D4EDD",
  sidebar: "#16162a",
  borde: "#2d2d4a",
};

/** Paleta principal: colores serios, vívidos y con buen contraste sobre fondo oscuro */
export const COLORS = [
  "#0EA5E9", // sky-500
  "#14B8A6", // teal-500
  "#6366F1", // indigo-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
  "#F59E0B", // amber-500
  "#10B981", // emerald-500
  "#3B82F6", // blue-500
  "#06B6D4", // cyan-500
  "#A855F7", // purple-500
];

/** Colores semánticos por estado de denuncia */
export const ESTADO_COLORS: Record<string, string> = {
  Cerrado: "#10B981",      // emerald - resuelto
  "En trámite": "#F59E0B", // amber - en proceso
  "En seguimiento": "#3B82F6", // blue - seguimiento
};

/** Colores semánticos por tipo de problema (ámbito/tema común) */
export const TEMA_COLORS: Record<string, string> = {
  "Maltrato entre pares": "#EC4899",
  "Maltrato de adultos": "#F59E0B",
  "Ciberbullying": "#8B5CF6",
  "Discriminación": "#6366F1",
  "Proceso educativo": "#14B8A6",
  "Infraestructura": "#06B6D4",
  "Otros": "#64748B",
};

/** Obtener color por categoría (estado, tema, etc.) o usar índice en COLORS */
export function getColorForCategory(category: string, index: number): string {
  return ESTADO_COLORS[category] ?? TEMA_COLORS[category] ?? COLORS[index % COLORS.length];
}

export interface Denuncia {
  DEN_ID: string | null;
  Año: number;
  Region: string | null;
  Comuna: string | null;
  DEN_AMBITO: string | null;
  DEN_TEMA: string | null;
  DEN_SUBTEMA: string | null;
  Estado: string | null;
  DEN_MES_CREACION: number | null;
  DEN_TRIMESTRE_CREACION: number | null;
  EE_NOMBRE: string | null;
  EE_NOM_COMUNA: string | null;
  DEN_CIBERBULLYING: number;
}

export interface Filtros {
  añoDesde?: number;
  añoHasta?: number;
  region?: string;
  comuna?: string;
  ambito?: string;
  tema?: string;
  subtema?: string;
  estado?: string;
  mes?: number;
  trimestre?: number;
}

export async function loadIndex(): Promise<{ años: number[] }> {
  const res = await fetch("/data/index.json");
  if (!res.ok) throw new Error("No se pudo cargar el índice de datos");
  return res.json();
}

export async function loadDenunciasByYear(year: number): Promise<Denuncia[]> {
  const res = await fetch(`/data/denuncias-${year}.json`);
  if (!res.ok) throw new Error(`No se pudieron cargar datos de ${year}`);
  return res.json();
}

export async function loadDenuncias(years: number[]): Promise<Denuncia[]> {
  if (years.length === 0) return [];
  const chunks = await Promise.all(years.map(loadDenunciasByYear));
  return chunks.flat();
}

export function applyFilters(data: Denuncia[], filtros: Filtros): Denuncia[] {
  let result = [...data];

  if (filtros.añoDesde != null) {
    result = result.filter((d) => d.Año >= filtros.añoDesde!);
  }
  if (filtros.añoHasta != null) {
    result = result.filter((d) => d.Año <= filtros.añoHasta!);
  }
  if (filtros.region) {
    result = result.filter((d) => d.Region === filtros.region);
  }
  if (filtros.comuna) {
    result = result.filter((d) => d.Comuna === filtros.comuna);
  }
  if (filtros.ambito) {
    result = result.filter((d) => d.DEN_AMBITO === filtros.ambito);
  }
  if (filtros.tema) {
    result = result.filter((d) => d.DEN_TEMA === filtros.tema);
  }
  if (filtros.subtema) {
    result = result.filter((d) => d.DEN_SUBTEMA === filtros.subtema);
  }
  if (filtros.estado) {
    result = result.filter((d) => d.Estado === filtros.estado);
  }
  if (filtros.mes != null) {
    result = result.filter((d) => d.DEN_MES_CREACION === filtros.mes);
  }
  if (filtros.trimestre != null) {
    result = result.filter((d) => d.DEN_TRIMESTRE_CREACION === filtros.trimestre);
  }

  return result;
}

export function getComunasForFilters(
  data: Denuncia[],
  filtros: Partial<Filtros>
): string[] {
  let subset = [...data];
  if (filtros.añoDesde != null) subset = subset.filter((d) => d.Año >= filtros.añoDesde!);
  if (filtros.añoHasta != null) subset = subset.filter((d) => d.Año <= filtros.añoHasta!);
  if (filtros.region) subset = subset.filter((d) => d.Region === filtros.region);
  const comunas = new Set<string>();
  subset.forEach((d) => {
    const c = d.Comuna?.trim();
    if (c && c !== "nan") comunas.add(c);
  });
  return Array.from(comunas).sort();
}

"""
Script de preprocesamiento: convierte CSVs de denuncias a JSON estático.
Ejecutar desde la raíz del proyecto: python scripts/build-data.py
"""

import json
import sys
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    print("Error: pandas no está instalado. Ejecuta: pip install pandas")
    sys.exit(1)

REGIONES = {
    1: "Tarapacá", 2: "Antofagasta", 3: "Atacama", 4: "Coquimbo",
    5: "Valparaíso", 6: "O'Higgins", 7: "Maule", 8: "Biobío",
    9: "Araucanía", 10: "Los Lagos", 11: "Aysén", 12: "Magallanes",
    13: "Metropolitana", 14: "Los Ríos", 15: "Arica y Parinacota", 16: "Ñuble"
}

ESTADOS = {1: "Cerrado", 2: "En trámite", 3: "En seguimiento"}

COLUMNAS_SALIDA = [
    "DEN_ID", "Año", "Region", "Comuna", "DEN_AMBITO", "DEN_TEMA", "DEN_SUBTEMA",
    "Estado", "DEN_MES_CREACION", "DEN_TRIMESTRE_CREACION", "EE_NOMBRE",
    "EE_NOM_COMUNA", "DEN_CIBERBULLYING"
]


def main():
    base_path = Path(__file__).resolve().parent.parent
    datos_path = base_path / "denuncias" / "datos"
    output_dir = base_path / "public" / "data"
    output_dir.mkdir(parents=True, exist_ok=True)

    if not datos_path.exists():
        print(f"Error: No se encuentra la carpeta {datos_path}")
        sys.exit(1)

    csv_files = list(datos_path.glob("*.csv"))
    if not csv_files:
        csv_files = list(base_path.glob("*.csv"))

    if not csv_files:
        print("Error: No se encontraron archivos CSV.")
        sys.exit(1)

    dfs = []
    for csv_path in csv_files:
        try:
            d = pd.read_csv(csv_path, sep=";", encoding="utf-8", low_memory=False)
            if len(d) > 0 and ("DEN_ID" in d.columns or "AGNO" in d.columns):
                dfs.append(d)
        except Exception as e:
            print(f"Advertencia: No se pudo leer {csv_path}: {e}")
            continue

    if not dfs:
        print("Error: No se pudieron cargar datos válidos.")
        sys.exit(1)

    df = pd.concat(dfs, ignore_index=True)
    if "DEN_ID" in df.columns:
        df = df.drop_duplicates(subset=["DEN_ID"], keep="first")

    # Año
    if "AGNO" in df.columns:
        df["Año"] = pd.to_numeric(df["AGNO"], errors="coerce")
    elif "DEN_FEC_CREACION" in df.columns:
        df["Año"] = pd.to_numeric(df["DEN_FEC_CREACION"].astype(str).str[:4], errors="coerce")
    df["Año"] = df["Año"].fillna(0).astype(int)
    df = df[df["Año"] > 2000]

    # Region
    if "DEN_REGION" in df.columns:
        df["Region"] = df["DEN_REGION"].map(REGIONES).fillna("Sin información")
    elif "EE_COD_REGION" in df.columns:
        df["Region"] = df["EE_COD_REGION"].map(REGIONES).fillna("Sin información")

    # Estado
    if "DEN_ESTADO" in df.columns:
        df["Estado"] = df["DEN_ESTADO"].map(ESTADOS).fillna("Sin información")

    # Comuna
    if "EE_NOM_COMUNA" in df.columns:
        df["Comuna"] = df["EE_NOM_COMUNA"].astype(str).str.strip()

    # Seleccionar columnas existentes
    cols = [c for c in COLUMNAS_SALIDA if c in df.columns]
    df_out = df[cols].copy()

    # Convertir DEN_CIBERBULLYING a int si existe
    if "DEN_CIBERBULLYING" in df_out.columns:
        df_out["DEN_CIBERBULLYING"] = pd.to_numeric(df_out["DEN_CIBERBULLYING"], errors="coerce").fillna(0).astype(int)

    def to_json_records(dframe):
        records = dframe.to_dict(orient="records")
        for r in records:
            for k, v in r.items():
                if pd.isna(v):
                    r[k] = None
        return records

    # Dividir por año para evitar archivos > 50 MB (límite Vercel)
    años = sorted(df_out["Año"].unique().tolist())
    all_records = []
    for año in años:
        df_año = df_out[df_out["Año"] == año]
        records = to_json_records(df_año)
        f_año = output_dir / f"denuncias-{año}.json"
        with open(f_año, "w", encoding="utf-8") as f:
            json.dump(records, f, ensure_ascii=False, indent=0)
        size_mb = f_año.stat().st_size / (1024 * 1024)
        print(f"  {año}: {len(records):,} registros, {size_mb:.2f} MB -> {f_año.name}")
        all_records.extend(records)

    # Índice de años disponibles
    index_file = output_dir / "index.json"
    with open(index_file, "w", encoding="utf-8") as f:
        json.dump({"años": años}, f, ensure_ascii=False)
    print(f"OK: {len(all_records):,} registros totales en {len(años)} archivos")


if __name__ == "__main__":
    main()

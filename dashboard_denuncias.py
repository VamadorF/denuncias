"""
Dashboard de Estadísticas - Denuncias Educativas
Visualización interactiva con filtros y gráficos adornados
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from pathlib import Path

# Configuración de página
st.set_page_config(
    page_title="Denuncias Educativas",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Tema oscuro con colores vivos - alta legibilidad
PALETTE = {
    "fondo": "#0f0f1a",
    "fondo_card": "#1a1a2e",
    "fondo_card_hover": "#252542",
    "texto_claro": "#E8E8F0",
    "texto_medio": "#A0A0B8",
    "acento_1": "#00D4FF",   # Cian brillante
    "acento_2": "#00FF88",   # Verde lima
    "acento_3": "#FF6B35",   # Coral
    "acento_4": "#FFD93D",   # Amarillo dorado
    "acento_5": "#FF3366",   # Rosa fucsia
    "acento_6": "#9D4EDD",   # Violeta
    "sidebar": "#16162a",
    "borde": "#2d2d4a",
}

# Colores vivos para gráficos
COLORS = [
    "#00D4FF", "#00FF88", "#FF6B35", "#FFD93D", "#FF3366",
    "#9D4EDD", "#00B4D8", "#2EC4B6", "#FF9F1C", "#E040FB"
]

# Estilos con animaciones y paleta legible
st.markdown(f"""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    @keyframes fadeInUp {{
        from {{ opacity: 0; transform: translateY(20px); }}
        to {{ opacity: 1; transform: translateY(0); }}
    }}
    
    @keyframes slideInLeft {{
        from {{ opacity: 0; transform: translateX(-30px); }}
        to {{ opacity: 1; transform: translateX(0); }}
    }}
    
    @keyframes pulse {{
        0%, 100% {{ opacity: 1; }}
        50% {{ opacity: 0.85; }}
    }}
    
    @keyframes shimmer {{
        0% {{ background-position: -200% 0; }}
        100% {{ background-position: 200% 0; }}
    }}
    
    @keyframes scaleIn {{
        from {{ opacity: 0; transform: scale(0.95); }}
        to {{ opacity: 1; transform: scale(1); }}
    }}
    
    .stApp {{
        background: {PALETTE['fondo']};
        font-family: 'Inter', sans-serif;
    }}
    
    .main-header {{
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        padding: 1.5rem 2rem;
        border-radius: 16px;
        margin-bottom: 2rem;
        box-shadow: 0 4px 24px rgba(0, 212, 255, 0.15);
        border: 1px solid {PALETTE['borde']};
        color: {PALETTE['texto_claro']};
        animation: fadeInUp 0.6s ease-out;
    }}
    
    .main-header h1 {{
        font-weight: 700;
        margin: 0;
        font-size: 2rem;
        color: {PALETTE['texto_claro']};
    }}
    
    .main-header p {{
        margin: 0.3rem 0 0 0;
        opacity: 0.9;
        font-size: 1rem;
        color: {PALETTE['texto_medio']};
    }}
    
    [data-testid="stMetric"] {{
        background: {PALETTE['fondo_card']};
        padding: 1rem 1.25rem;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        border: 1px solid {PALETTE['borde']};
        border-left: 4px solid {PALETTE['acento_1']};
        animation: fadeInUp 0.5s ease-out backwards;
        transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
    }}
    
    [data-testid="stMetric"]:nth-child(1) {{ animation-delay: 0.1s; }}
    [data-testid="stMetric"]:nth-child(2) {{ animation-delay: 0.15s; }}
    [data-testid="stMetric"]:nth-child(3) {{ animation-delay: 0.2s; }}
    [data-testid="stMetric"]:nth-child(4) {{ animation-delay: 0.25s; }}
    [data-testid="stMetric"]:nth-child(5) {{ animation-delay: 0.3s; }}
    
    [data-testid="stMetric"]:hover {{
        transform: translateY(-4px);
        background: {PALETTE['fondo_card_hover']};
        box-shadow: 0 8px 24px rgba(0, 212, 255, 0.2);
    }}
    
    div[data-testid="stMetricValue"] {{
        font-size: 1.8rem !important;
        font-weight: 700 !important;
        color: {PALETTE['acento_1']} !important;
    }}
    
    [data-testid="stMetric"] label {{
        color: {PALETTE['texto_medio']} !important;
    }}
    
    [data-testid="stVerticalBlock"] > div {{
        animation: fadeInUp 0.5s ease-out;
    }}
    
    .stSelectbox > div > div {{
        border-radius: 8px !important;
        transition: all 0.2s ease;
    }}
    
    .stSelectbox > div > div:hover {{
        box-shadow: 0 0 0 2px {PALETTE['acento_1']};
    }}
    
    p, .stMarkdown {{
        color: {PALETTE['texto_medio']} !important;
    }}
    
    [data-testid="stExpander"] {{
        animation: fadeInUp 0.4s ease-out;
    }}
    
    .js-plotly-plot .main-svg {{
        animation: fadeInUp 0.6s ease-out backwards;
    }}
    
    [data-testid="stPlotlyChart"] {{
        animation: scaleIn 0.5s ease-out backwards;
    }}
    
    h4, h3, h2, h1 {{
        animation: fadeInUp 0.4s ease-out backwards;
        color: {PALETTE['texto_claro']} !important;
    }}
    
    [data-testid="stSidebar"] {{
        background: linear-gradient(180deg, {PALETTE['sidebar']} 0%, #0d0d1a 100%);
        animation: slideInLeft 0.4s ease-out;
        border-right: 1px solid {PALETTE['borde']};
    }}
    
    [data-testid="stSidebar"] label, [data-testid="stSidebar"] p {{
        color: {PALETTE['texto_claro']} !important;
    }}
    
    [data-testid="stHorizontalBlock"] > div {{
        animation: fadeInUp 0.5s ease-out backwards;
    }}
    [data-testid="stHorizontalBlock"] > div:nth-child(1) {{ animation-delay: 0.05s; }}
    [data-testid="stHorizontalBlock"] > div:nth-child(2) {{ animation-delay: 0.15s; }}
    
    [data-testid="stExpander"] summary {{
        transition: all 0.3s ease;
    }}
    [data-testid="stExpander"] summary:hover {{
        color: {PALETTE['acento_1']};
    }}
    
    [data-testid="stPlotlyChart"] {{
        background: {PALETTE['fondo_card']};
        border-radius: 12px;
        padding: 1rem;
        border: 1px solid {PALETTE['borde']};
    }}
    
    hr {{
        border-color: {PALETTE['borde']} !important;
    }}
    
    [data-testid="stAlert"] {{
        background: {PALETTE['fondo_card']} !important;
        border: 1px solid {PALETTE['borde']};
        color: {PALETTE['texto_claro']} !important;
    }}
    
    .stDataFrame {{
        background: {PALETTE['fondo_card']} !important;
    }}
</style>
""", unsafe_allow_html=True)

# Mapeo de regiones de Chile
REGIONES = {
    1: "Tarapacá", 2: "Antofagasta", 3: "Atacama", 4: "Coquimbo",
    5: "Valparaíso", 6: "O'Higgins", 7: "Maule", 8: "Biobío",
    9: "Araucanía", 10: "Los Lagos", 11: "Aysén", 12: "Magallanes",
    13: "Metropolitana", 14: "Los Ríos", 15: "Arica y Parinacota", 16: "Ñuble"
}

ESTADOS = {1: "Cerrado", 2: "En trámite", 3: "En seguimiento"}

# Colores para gráficos (usa la paleta vivida de arriba)


@st.cache_data
def cargar_datos():
    """Carga todos los archivos CSV de denuncias (soporta múltiples años)"""
    base_path = Path(__file__).parent
    # Buscar en denuncias/datos/ primero, luego en carpeta actual
    datos_path = base_path / "denuncias" / "datos"
    if datos_path.exists():
        csv_files = list(datos_path.glob("*.csv"))
    else:
        csv_files = []
    if not csv_files:
        csv_files = list(base_path.glob("*.csv"))
    if not csv_files:
        return None
    dfs = []
    for csv_path in csv_files:
        try:
            d = pd.read_csv(csv_path, sep=";", encoding="utf-8", low_memory=False)
            if len(d) > 0 and ("DEN_ID" in d.columns or "AGNO" in d.columns):
                dfs.append(d)
        except Exception:
            continue
    if not dfs:
        return None
    df = pd.concat(dfs, ignore_index=True)
    if "DEN_ID" in df.columns:
        df = df.drop_duplicates(subset=["DEN_ID"], keep="first")
    
    # Año (AGNO o inferir de DEN_FEC_CREACION)
    if "AGNO" in df.columns:
        df["Año"] = pd.to_numeric(df["AGNO"], errors="coerce")
    elif "DEN_FEC_CREACION" in df.columns:
        df["Año"] = pd.to_numeric(df["DEN_FEC_CREACION"].astype(str).str[:4], errors="coerce")
    df["Año"] = df["Año"].fillna(0).astype(int)
    df = df[df["Año"] > 2000]
    
    # Limpiar y preparar datos
    if "DEN_REGION" in df.columns:
        df["Region"] = df["DEN_REGION"].map(REGIONES).fillna("Sin información")
    elif "EE_COD_REGION" in df.columns:
        df["Region"] = df["EE_COD_REGION"].map(REGIONES).fillna("Sin información")
    
    if "DEN_ESTADO" in df.columns:
        df["Estado"] = df["DEN_ESTADO"].map(ESTADOS).fillna("Sin información")
    
    if "DEN_MES_CREACION" in df.columns:
        meses = {1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr", 5: "May", 6: "Jun",
                 7: "Jul", 8: "Ago", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic"}
        df["Mes"] = df["DEN_MES_CREACION"].map(meses).fillna("N/A")
    
    if "EE_NOM_COMUNA" in df.columns:
        df["Comuna"] = df["EE_NOM_COMUNA"].astype(str).str.strip()
    
    return df


def render_chart_distribucion(counts, titulo, tipo_chart, uirevision, height=400, horizontal=True, colorscale=None):
    """Renderiza un gráfico de distribución según el tipo seleccionado."""
    if counts is None or len(counts) == 0:
        return None
    colorscale = colorscale or [[0, '#00D4FF'], [0.5, '#00FF88'], [1, '#00B4D8']]
    layout_base = dict(
        template='plotly_dark',
        margin=dict(l=20, r=20, t=30, b=80 if not horizontal else 20),
        height=height,
        font=dict(family="Inter, sans-serif", size=11, color='#E8E8F0'),
        paper_bgcolor='rgba(26, 26, 46, 0.95)',
        plot_bgcolor='rgba(26, 26, 46, 0.95)',
        uirevision=uirevision,
        xaxis=dict(gridcolor='#2d2d4a', tickfont=dict(color='#A0A0B8')),
        yaxis=dict(tickfont=dict(color='#E8E8F0'))
    )
    if tipo_chart == "Circular":
        fig = go.Figure(data=[go.Pie(
            labels=counts.index,
            values=counts.values,
            hole=0.5,
            marker=dict(colors=COLORS[:len(counts)], line=dict(color='#1a1a2e', width=2)),
            textinfo='label+percent',
            textposition='outside',
            textfont=dict(size=11, color='#E8E8F0'),
            pull=[0.02] * len(counts)
        )])
        fig.update_layout(**layout_base, showlegend=True,
            legend=dict(orientation="h", yanchor="bottom", y=-0.25, xanchor="center", x=0.5, font=dict(color='#E8E8F0')))
    else:  # Barras
        if horizontal:
            fig = go.Figure(data=[go.Bar(
                x=counts.values, y=counts.index, orientation='h',
                marker=dict(color=counts.values, colorscale=colorscale,
                    line=dict(color='#00D4FF', width=0.5), opacity=0.9),
                text=counts.values, textposition='outside', textfont=dict(size=11, color='#E8E8F0')
            )])
            fig.update_layout(**layout_base, xaxis_title="Cantidad", showlegend=False)
        else:
            fig = go.Figure(data=[go.Bar(
                x=counts.index, y=counts.values,
                marker=dict(color=COLORS[:len(counts)], line=dict(color='#00D4FF', width=0.5), opacity=0.9),
                text=counts.values, textposition='outside', textfont=dict(size=11, color='#E8E8F0')
            )])
            fig.update_layout(**layout_base, xaxis_tickangle=-45, showlegend=False)
    return fig


def main():
    df = cargar_datos()
    if df is None:
        st.error("No se encontró ningún archivo CSV válido. Coloca archivos de denuncias (.csv) en la misma carpeta que este script.")
        return
    
    # Header principal
    st.markdown("""
    <div class="main-header">
        <h1>📊 Dashboard de Denuncias Educativas</h1>
        <p>Sistema de Superintendencia de Educación - Visualización y análisis de denuncias (múltiples años)</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Sidebar - Filtros
    st.sidebar.header("🔍 Filtros")
    st.sidebar.markdown("---")
    
    # Filtros dinámicos
    filtros = {}
    
    # Filtro por año o rango de años
    if "Año" in df.columns:
        años_disponibles = sorted(df["Año"].dropna().unique().tolist())
        años_disponibles = [int(a) for a in años_disponibles if a > 2000]
        if años_disponibles:
            st.sidebar.markdown("**Rango de años**")
            col_a1, col_a2 = st.sidebar.columns(2)
            with col_a1:
                año_desde = st.selectbox("Desde", ["Todos"] + años_disponibles, key="año_desde")
            with col_a2:
                año_hasta = st.selectbox("Hasta", ["Todos"] + años_disponibles, key="año_hasta")
            if año_desde != "Todos":
                filtros["_año_desde"] = int(año_desde)
            if año_hasta != "Todos":
                filtros["_año_hasta"] = int(año_hasta)
    
    if "Region" in df.columns:
        regiones_opciones = ["Todas"] + sorted(df["Region"].dropna().unique().tolist())
        region_sel = st.sidebar.selectbox("Región", regiones_opciones)
        if region_sel != "Todas":
            filtros["Region"] = region_sel
    
    if "Comuna" in df.columns:
        # Si hay otros filtros, mostrar solo comunas que coincidan
        df_comunas = df.copy()
        if filtros.get("_año_desde") and "Año" in df_comunas.columns:
            df_comunas = df_comunas[df_comunas["Año"] >= filtros["_año_desde"]]
        if filtros.get("_año_hasta") and "Año" in df_comunas.columns:
            df_comunas = df_comunas[df_comunas["Año"] <= filtros["_año_hasta"]]
        for col, val in filtros.items():
            if col.startswith("_") or col not in df_comunas.columns:
                continue
            df_comunas = df_comunas[df_comunas[col] == val]
        comunas_validas = df_comunas["Comuna"].dropna()
        comunas_validas = comunas_validas[comunas_validas.str.len() > 0]
        comunas_validas = comunas_validas[comunas_validas != "nan"]
        comunas_opciones = ["Todas"] + sorted(comunas_validas.unique().tolist())
        comuna_sel = st.sidebar.selectbox("Comuna", comunas_opciones)
        if comuna_sel != "Todas":
            filtros["Comuna"] = comuna_sel
    
    if "DEN_AMBITO" in df.columns:
        ambitos = ["Todos"] + sorted(df["DEN_AMBITO"].dropna().unique().tolist())
        ambito_sel = st.sidebar.selectbox("Ámbito", ambitos)
        if ambito_sel != "Todos":
            filtros["DEN_AMBITO"] = ambito_sel
    
    if "DEN_TEMA" in df.columns:
        temas = ["Todos"] + sorted(df["DEN_TEMA"].dropna().unique().tolist())
        tema_sel = st.sidebar.selectbox("Tema", temas)
        if tema_sel != "Todos":
            filtros["DEN_TEMA"] = tema_sel
    
    if "DEN_SUBTEMA" in df.columns:
        subtemas = ["Todos"] + sorted(df["DEN_SUBTEMA"].dropna().unique().tolist())
        subtema_sel = st.sidebar.selectbox("Subtema", subtemas)
        if subtema_sel != "Todos":
            filtros["DEN_SUBTEMA"] = subtema_sel
    
    if "Estado" in df.columns:
        estados_opc = ["Todos"] + sorted(df["Estado"].dropna().unique().tolist())
        estado_sel = st.sidebar.selectbox("Estado", estados_opc)
        if estado_sel != "Todos":
            filtros["Estado"] = estado_sel
    
    if "DEN_MES_CREACION" in df.columns:
        meses_opc = ["Todos"] + sorted(df["DEN_MES_CREACION"].dropna().unique().tolist())
        mes_sel = st.sidebar.selectbox("Mes", meses_opc)
        if mes_sel != "Todos":
            filtros["DEN_MES_CREACION"] = mes_sel
    
    if "DEN_TRIMESTRE_CREACION" in df.columns:
        trimestres = ["Todos"] + sorted(df["DEN_TRIMESTRE_CREACION"].dropna().unique().tolist())
        trim_sel = st.sidebar.selectbox("Trimestre", trimestres)
        if trim_sel != "Todos":
            filtros["DEN_TRIMESTRE_CREACION"] = trim_sel
    
    st.sidebar.markdown("---")
    st.sidebar.subheader("📊 Tipo de gráfico")
    tipo_distribucion = st.sidebar.radio(
        "Para distribuciones (región, ámbito, tema, etc.)",
        ["Barras", "Circular"],
        horizontal=True
    )
    tipo_evolucion = st.sidebar.radio(
        "Para evolución mensual",
        ["Líneas", "Barras"],
        horizontal=True
    )
    
    # Aplicar filtros
    df_filtrado = df.copy()
    año_desde = filtros.get("_año_desde")
    año_hasta = filtros.get("_año_hasta")
    if año_desde is not None and año_hasta is not None and año_desde > año_hasta:
        año_desde, año_hasta = año_hasta, año_desde
    if año_desde is not None and "Año" in df_filtrado.columns:
        df_filtrado = df_filtrado[df_filtrado["Año"] >= año_desde]
    if año_hasta is not None and "Año" in df_filtrado.columns:
        df_filtrado = df_filtrado[df_filtrado["Año"] <= año_hasta]
    for col, val in filtros.items():
        if col.startswith("_"):
            continue
        if col in df_filtrado.columns:
            df_filtrado = df_filtrado[df_filtrado[col] == val]
    
    # Métricas principales
    st.subheader("📈 Resumen General")
    col1, col2, col3, col4, col5 = st.columns(5)
    
    total = len(df_filtrado)
    with col1:
        st.metric("Total Denuncias", f"{total:,}", 
                  f"Filtradas de {len(df):,}" if len(filtros) > 0 else "")
    
    if "Estado" in df_filtrado.columns:
        cerradas = len(df_filtrado[df_filtrado["Estado"] == "Cerrado"])
        with col2:
            st.metric("Cerradas", f"{cerradas:,}", f"{100*cerradas/total:.1f}%" if total > 0 else "0%")
        
        en_tramite = len(df_filtrado[df_filtrado["Estado"] == "En trámite"])
        with col3:
            st.metric("En trámite", f"{en_tramite:,}", f"{100*en_tramite/total:.1f}%" if total > 0 else "0%")
    
    # Métrica contextual según filtros aplicados
    if total > 0:
        with col4:
            if "Comuna" in filtros:
                top_ee = df_filtrado["EE_NOMBRE"].dropna().astype(str).str.strip()
                top_ee = top_ee[(top_ee.str.len() > 0) & (top_ee != "nan")]
                if len(top_ee) > 0:
                    top_estab = top_ee.value_counts().index[0]
                    count_top = top_ee.value_counts().iloc[0]
                    st.metric("Establecimiento con más denuncias", top_estab[:40] + ("..." if len(str(top_estab)) > 40 else ""), f"{count_top:,} casos")
                else:
                    st.metric("Establecimiento con más denuncias", filtros.get("Comuna", "—"), "—")
            elif "Region" in filtros and "Comuna" in df_filtrado.columns:
                top_comuna = df_filtrado["Comuna"].value_counts()
                top_comuna = top_comuna[top_comuna.index.astype(str).str.len() > 0]
                if len(top_comuna) > 0:
                    st.metric("Comuna con más denuncias", top_comuna.index[0], f"{top_comuna.iloc[0]:,} casos")
                else:
                    st.metric("Comuna con más denuncias", filtros.get("Region", "—"), "—")
            elif "Region" in df_filtrado.columns:
                top_region = df_filtrado["Region"].value_counts().index[0]
                count_top = df_filtrado["Region"].value_counts().iloc[0]
                st.metric("Región con más denuncias", top_region, f"{count_top:,} casos")
    
    if "DEN_CIBERBULLYING" in df_filtrado.columns:
        ciber = len(df_filtrado[df_filtrado["DEN_CIBERBULLYING"] == 1])
        with col5:
            st.metric("Ciberbullying", f"{ciber:,}", f"{100*ciber/total:.1f}%" if total > 0 else "0%")
    
    st.markdown("---")
    
    # Gráficos
    col_izq, col_der = st.columns(2)
    
    with col_izq:
        # Gráfico contextual: evita redundancia según filtros (siempre datos relevantes al filtro)
        if "Comuna" in filtros:
            titulo_chart1 = "Denuncias por Tema (comuna filtrada)"
            counts_chart1 = df_filtrado["DEN_TEMA"].value_counts().head(10) if "DEN_TEMA" in df_filtrado.columns else None
        elif "Region" in filtros and "Comuna" in df_filtrado.columns:
            titulo_chart1 = "Denuncias por Comuna (región filtrada)"
            counts_chart1 = df_filtrado["Comuna"].value_counts()
            counts_chart1 = counts_chart1[(counts_chart1.index.astype(str).str.len() > 0) & (counts_chart1.index.astype(str) != "nan")].head(15)
        else:
            titulo_chart1 = "Denuncias por Región"
            counts_chart1 = df_filtrado["Region"].value_counts().head(15) if "Region" in df_filtrado.columns else None
        
        st.markdown(f"#### {titulo_chart1}")
        if counts_chart1 is not None and len(counts_chart1) > 0:
            fig_chart1 = render_chart_distribucion(counts_chart1, titulo_chart1, tipo_distribucion, "chart1", 400, horizontal=True)
            if fig_chart1:
                st.plotly_chart(fig_chart1, use_container_width=True)
        else:
            st.info("No hay datos para mostrar con los filtros aplicados.")
    
    with col_der:
        st.markdown("#### Denuncias por Estado")
        if "Estado" in df_filtrado.columns and total > 0:
            est_counts = df_filtrado["Estado"].value_counts()
            fig_est = render_chart_distribucion(est_counts, "Estado", tipo_distribucion, "estado", 400, horizontal=True)
            if fig_est:
                st.plotly_chart(fig_est, use_container_width=True)
        else:
            st.info("No hay datos de estado para mostrar.")
    
    # Segunda fila de gráficos
    col_a, col_b = st.columns(2)
    
    with col_a:
        st.markdown("#### Denuncias por Ámbito")
        if "DEN_AMBITO" in df_filtrado.columns and total > 0:
            ambito_counts = df_filtrado["DEN_AMBITO"].value_counts().head(10)
            fig_amb = render_chart_distribucion(ambito_counts, "Ámbito", tipo_distribucion, "ambito", 380, horizontal=False)
            if fig_amb:
                st.plotly_chart(fig_amb, use_container_width=True)
        else:
            st.info("No hay datos de ámbito.")
    
    with col_b:
        st.markdown("#### Evolución Mensual")
        if "DEN_MES_CREACION" in df_filtrado.columns and total > 0:
            mes_counts = df_filtrado.groupby("DEN_MES_CREACION").size().sort_index()
            orden_mes = list(range(1, 13))
            mes_counts = mes_counts.reindex([m for m in orden_mes if m in mes_counts.index])
            meses_nombres = {1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr", 5: "May", 6: "Jun", 7: "Jul", 8: "Ago", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic"}
            x_mes = [meses_nombres.get(m, str(m)) for m in mes_counts.index]
            y_mes = mes_counts.values
            if tipo_evolucion == "Barras":
                fig_mes = go.Figure(data=[go.Bar(
                    x=x_mes, y=y_mes,
                    marker=dict(color=y_mes, colorscale=[[0, '#00D4FF'], [1, '#00FF88']], line=dict(color='#00D4FF', width=0.5), opacity=0.9),
                    text=y_mes, textposition='outside', textfont=dict(color='#E8E8F0')
                )])
            else:
                fig_mes = go.Figure(data=[go.Scatter(
                    x=x_mes, y=y_mes, mode='lines+markers',
                    line=dict(color='#00D4FF', width=3),
                    marker=dict(size=12, color='#00FF88', line=dict(color='#1a1a2e', width=2)),
                    fill='tozeroy', fillcolor='rgba(0, 212, 255, 0.2)'
                )])
            fig_mes.update_layout(
                template='plotly_dark', margin=dict(l=20, r=20, t=30, b=20), height=380,
                xaxis_title="Mes", yaxis_title="Cantidad",
                font=dict(family="Inter, sans-serif", size=12, color='#E8E8F0'),
                paper_bgcolor='rgba(26, 26, 46, 0.95)', plot_bgcolor='rgba(26, 26, 46, 0.95)',
                showlegend=False, uirevision='mes',
                xaxis=dict(gridcolor='#2d2d4a', tickfont=dict(color='#A0A0B8')),
                yaxis=dict(gridcolor='#2d2d4a', tickfont=dict(color='#A0A0B8'))
            )
            st.plotly_chart(fig_mes, use_container_width=True)
        else:
            st.info("No hay datos mensuales.")
    
    # Tercera fila - Top temas
    st.markdown("#### Top 10 Temas de Denuncia")
    if "DEN_TEMA" in df_filtrado.columns and total > 0:
        tema_counts = df_filtrado["DEN_TEMA"].value_counts().head(10)
        fig_tema = render_chart_distribucion(tema_counts, "Tema", tipo_distribucion, "tema", 450, horizontal=True)
        if fig_tema:
            fig_tema.update_layout(xaxis_title="Cantidad de denuncias", margin=dict(l=20, r=60, t=30, b=20))
            st.plotly_chart(fig_tema, use_container_width=True)
    
    # Top 20 colegios más denunciados (según filtro)
    st.markdown("#### Top 20 Establecimientos Más Denunciados")
    if "EE_NOMBRE" in df_filtrado.columns and total > 0:
        colegios_counts = df_filtrado["EE_NOMBRE"].dropna().astype(str).str.strip()
        colegios_counts = colegios_counts[(colegios_counts.str.len() > 0) & (colegios_counts != "nan")]
        colegios_top = colegios_counts.value_counts().head(20)
        if len(colegios_top) > 0:
            fig_colegios = render_chart_distribucion(
                colegios_top, "Establecimientos", tipo_distribucion, "colegios", 550, horizontal=True,
                colorscale=[[0, '#9D4EDD'], [0.5, '#FF6B35'], [1, '#FF3366']]
            )
            if fig_colegios:
                fig_colegios.update_layout(margin=dict(l=20, r=60, t=30, b=20), xaxis_title="Cantidad de denuncias")
                st.plotly_chart(fig_colegios, use_container_width=True)
        else:
            st.info("No hay datos de establecimientos para mostrar.")
    else:
        st.info("No hay datos de establecimientos para mostrar.")
    
    # Detalle: ¿De qué tratan las denuncias de un colegio?
    st.markdown("---")
    st.markdown("#### 🔍 ¿De qué tratan las denuncias de un establecimiento?")
    if "EE_NOMBRE" in df_filtrado.columns and total > 0:
        colegios_lista = df_filtrado["EE_NOMBRE"].dropna().astype(str).str.strip()
        colegios_lista = colegios_lista[(colegios_lista.str.len() > 0) & (colegios_lista != "nan")].unique()
        colegios_lista = sorted(colegios_lista.tolist())
        colegio_seleccionado = st.selectbox(
            "Selecciona un establecimiento para ver el detalle de sus denuncias",
            options=["-- Seleccionar --"] + colegios_lista,
            key="detalle_colegio"
        )
        if colegio_seleccionado != "-- Seleccionar --":
            df_colegio = df_filtrado[df_filtrado["EE_NOMBRE"].astype(str).str.strip() == colegio_seleccionado]
            n_den_colegio = len(df_colegio)
            st.markdown(f"**{colegio_seleccionado}** — {n_den_colegio:,} denuncia(s) en el período filtrado")
            col_d1, col_d2 = st.columns(2)
            with col_d1:
                if "DEN_TEMA" in df_colegio.columns and n_den_colegio > 0:
                    tema_colegio = df_colegio["DEN_TEMA"].value_counts()
                    fig_tema_colegio = render_chart_distribucion(tema_colegio, "Por tema", tipo_distribucion, "tema_colegio", 350, horizontal=True)
                    if fig_tema_colegio:
                        st.plotly_chart(fig_tema_colegio, use_container_width=True)
            with col_d2:
                if "DEN_SUBTEMA" in df_colegio.columns and n_den_colegio > 0:
                    subtema_colegio = df_colegio["DEN_SUBTEMA"].value_counts().head(12)
                    fig_subtema_colegio = render_chart_distribucion(subtema_colegio, "Por subtema", tipo_distribucion, "subtema_colegio", 350, horizontal=True)
                    if fig_subtema_colegio:
                        st.plotly_chart(fig_subtema_colegio, use_container_width=True)
            if "DEN_AMBITO" in df_colegio.columns and n_den_colegio > 0:
                st.markdown("**Por ámbito**")
                ambito_colegio = df_colegio["DEN_AMBITO"].value_counts()
                fig_ambito_colegio = render_chart_distribucion(ambito_colegio, "Ámbito", tipo_distribucion, "ambito_colegio", 280, horizontal=True)
                if fig_ambito_colegio:
                    st.plotly_chart(fig_ambito_colegio, use_container_width=True)
            if n_den_colegio > 0:
                with st.expander("📋 Ver denuncias de este establecimiento"):
                    cols_tabla = [c for c in ["DEN_ID", "Año", "DEN_TEMA", "DEN_SUBTEMA", "Estado", "Comuna"] if c in df_colegio.columns]
                    st.dataframe(df_colegio[cols_tabla] if cols_tabla else df_colegio, use_container_width=True, height=250)
    else:
        st.info("Aplica filtros para ver el detalle por establecimiento.")
    
    # Tabla de datos filtrados (expandible)
    with st.expander("📋 Ver datos filtrados (tabla)"):
        columnas_visibles = [c for c in ["DEN_ID", "Año", "Region", "DEN_AMBITO", "DEN_TEMA", "Estado", "EE_NOM_COMUNA", "EE_NOMBRE"] if c in df_filtrado.columns]
        if columnas_visibles:
            st.dataframe(df_filtrado[columnas_visibles].head(500), use_container_width=True, height=300)
        else:
            st.dataframe(df_filtrado.head(500), use_container_width=True, height=300)
    
    st.sidebar.markdown("---")
    st.sidebar.caption("Datos: Denuncias - Superintendencia de Educación")


if __name__ == "__main__":
    main()

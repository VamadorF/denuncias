# Dashboard de Denuncias Educativas (Next.js + Vercel)

Dashboard interactivo de denuncias educativas de la Superintendencia de Educación, migrado de Streamlit a Next.js para despliegue en Vercel.

## Requisitos

- Node.js 18+
- Python 3.x (para el script de preprocesamiento)
- pandas (`pip install pandas`)

## Desarrollo local

1. **Generar datos** (opcional si ya existen en `public/data/`):
   ```bash
   python scripts/build-data.py
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre http://localhost:3000

## Build y deploy

```bash
npm run build
```

El script `prebuild` ejecuta automáticamente `python scripts/build-data.py` antes del build de Next.js.

### Deploy en Vercel

1. Conecta el repositorio a Vercel
2. Vercel detectará Next.js automáticamente
3. Asegúrate de que Python esté disponible en el entorno de build (Vercel lo incluye por defecto)
4. Si el prebuild falla, ejecuta `python scripts/build-data.py` localmente y commitea los archivos en `public/data/`

## Estructura

- `scripts/build-data.py` - Convierte CSVs a JSON por año
- `public/data/` - JSON estáticos (denuncias-YYYY.json, index.json)
- `app/` - Páginas Next.js
- `components/` - Componentes React (filtros, métricas, gráficos)
- `lib/` - Tipos, constantes y lógica de datos

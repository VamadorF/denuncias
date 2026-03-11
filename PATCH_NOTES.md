# Notas del parche: Navegación móvil y espaciado

## Resumen
Parche que mejora la experiencia en dispositivos móviles y tablets, y corrige el espaciado de textos en los gráficos.

---

## Cambios incluidos

### Navegación móvil y tablet
- **Barra superior**: Título compacto + botón de filtros con indicador cuando hay filtros activos
- **Drawer de filtros**: Panel lateral deslizable con todos los filtros (reemplaza sidebar en pantallas ≤1024px)
- **Barra de navegación inferior**: Acceso rápido a Resumen, Gráficos, Top 20, Comparador y Tabla
- **Breakpoint**: Layout móvil aplicado hasta 1024px (incluye tablets)
- **Viewport**: Configuración para escalado correcto en móvil

### Espaciado de textos en gráficos
- **Ancho de etiquetas**: Aumentado de 220px a 280–320px según el gráfico
- **Truncado**: Límite aumentado a 60–70 caracteres (antes 45)
- **Separación entre barras**: `barCategoryGap` y `maxBarSize` ajustados
- **Márgenes**: Más espacio en contenedores de gráficos
- **Tipografía**: `lineHeight: 1.5` y `letter-spacing` para mejor legibilidad

### Archivos modificados
- `app/globals.css` – Estilos móviles, drawer, bottom nav, espaciado de gráficos
- `app/layout.tsx` – Export viewport
- `app/page.tsx` – Integración MobileNav, secciones con IDs, layout condicional
- `components/Charts/BarChart.tsx` – labelWidth, labelMaxLength, barCategoryGap, márgenes
- `components/Filters.tsx` – Prop `inDrawer` para uso en drawer
- `components/TopEstablecimientos.tsx` – labelWidth y labelMaxLength para Top 20

### Archivos nuevos
- `components/MobileNav.tsx` – Barra superior, drawer, barra inferior
- `lib/useMediaQuery.ts` – Hook `useIsMobile` para breakpoint 1024px

---

## Versión
Parche aplicado sobre `main` – compatible con despliegue en Vercel.

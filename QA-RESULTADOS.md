# CAZAMI Studio V8 — Estado de las verificaciones

## Revisión estática realizada

- 14 proyectos con enlaces de demostración distintos.
- 6 archivos WEBP correspondientes exclusivamente a pases digitales.
- Captura real de Zaid & Camila incluida.
- Video de NFC local incluido.
- **0 emojis** en el código de Astro, TypeScript y CSS.
- Las tarjetas no contienen iframes; se evita el escalado que deformaba la vista previa.
- La galería de pases no recorta los originales (`object-fit: contain`).
- 15 fragmentos de TypeScript examinados sin errores de sintaxis.
- Hoja CSS procesada sin errores de sintaxis.
- Menú móvil, filtros, buscador, cuadro de ampliación y controles de video implementados.

## Pruebas pendientes en la computadora del usuario / CI

- `npm install` y `npm run build` (el entorno de preparación carece de acceso al registro npm).
- Pruebas visuales en navegador (Chromium restringido en este entorno).
- Revisión final en Chrome y Safari móvil.
- Confirmar en Vercel que la nueva compilación termina en **Ready**.

## Consideraciones

- Se incluyen fichas editoriales en las tarjetas sin captura auténtica; **no se simula una captura web**.
- Puedes generar capturas reales desde los sitios externos ejecutando `npm run capturar:vistas` con conexión a Internet y Chrome o Playwright disponible. Las imágenes deben volver a subirse al repositorio.
- Los pases digitales contienen datos de ejemplo de eventos. Antes de compartir el sitio públicamente, comprueba que los QR de muestras no sean accesos vigentes.

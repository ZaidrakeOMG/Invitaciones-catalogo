# CAZAMI V9 — Pruebas de compatibilidad móvil

Cambios: viewport-fit para iPhone, safe areas para notch/isla dinámica, barras dinámicas de navegador, menú fijo con restauración del scroll, tipografía responsive, vistas de portafolio en una columna, carrusel táctil de pases, modal en viewport, video NFC inline sin sonido, soporte de movimiento reducido y controles táctiles de 44 px.

## Validar antes de dar por finalizado

- iPhone Safari (320, 375, 390, 414 y 430 px), vertical y horizontal.
- iPad Safari (768 y 820 px), vertical y horizontal.
- Chrome Android / Samsung Internet (360 y 412 px).
- Firefox Android y Chrome iOS (usan WebKit en iOS).
- Menú abierto después de desplazarse hasta la mitad; al cerrar debe volver al mismo punto.
- Búsqueda de proyectos: teclado no debe hacer zoom y el filtro debe funcionar.
- Galería horizontal de pases: se desplaza con un dedo, botón de ampliar y cerrar.
- Video NFC silencioso: puede necesitar un toque manual en modo de bajo consumo.
- Cambiar orientación con galería y menú abierto; no debe quedar texto cortado.
- Preferencia del sistema «Reducir movimiento» activa.

La compilación de Vercel no reemplaza las pruebas en un iPhone físico. El navegador puede limitar el video automáticamente por ahorro de batería, por lo que se conserva el control manual.

# CAZAMI STUDIO V8 — Catálogo editorial en Astro

Esta versión sustituye el diseño anterior: portada premium, navegación móvil, iconos SVG, animaciones discretas, servicios por sección y portafolio organizado. Los **seis pases digitales** permanecen únicamente en la galería de pases.

## Iniciar

1. Instala Node.js LTS.
2. Abre la terminal en la carpeta que contiene `package.json`.
3. Ejecuta `npm install` y luego `npm run dev`.
4. Abre `http://localhost:4321`.
5. Para producción: `npm run build`; el resultado queda en `dist/`.

## Vista previa de las 14 invitaciones

- **Portadas del inicio de la carta:** la galería de invitaciones muestra la primera pantalla de cada sitio, igual que Zaid y Camila. Nunca se utilizan las fotografías de los pases como miniaturas.
- La captura verificada de **Zaid y Camila** se conserva en `/previews-real/zyc-invitacion.png`.
- Las otras 13 capturas se guardan en `public/intro-previews/<slug>.webp`; si falta alguna, se muestra una ficha editorial (no la foto del pase).
- La acción de GitHub **Actualizar portadas reales de invitaciones** genera esas imágenes al actualizar el capturador; también admite ejecución manual en Actions → Run workflow.
- En Windows puedes ejecutar `CAPTURAR-VISTAS-PREVIAS.bat` o `npm run capturar:vistas -- --force`, revisar los resultados y subir la carpeta `public/intro-previews`.
- La captura usa Playwright, abre la carta cuando hay un botón claramente marcado «Abrir invitación/carta/sobre» y evita los elementos de pase/modal conocidos. Conviene revisar visualmente las capturas de sitios externos.
- Las vistas son imágenes estáticas y no usan iframes. Al pulsarlas se abre la demostración original.

## Servicios

Invitaciones web, funcionalidades acordadas, pases digitales, QR y control de acceso, recepción y mesas y tarjetas NFC con video silencioso. Las funciones y precios se acuerdan por cotización. Contacto: WhatsApp 871 797 7576; TikTok @cazami0225.

## Vercel

- Framework: Astro.
- Root: `./` (si `package.json` está en raíz).
- Build Command: `npm run build`.
- Output Directory: `dist`.
- No se necesita `.env` para publicar esta versión.

**Aviso**: por limitaciones de npm en el entorno de preparación, verifica `npm run build` antes de desplegar.

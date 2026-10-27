# CAZAMI STUDIO V8 — Catálogo editorial en Astro

Esta versión sustituye el diseño anterior: portada premium, navegación móvil, iconos SVG, animaciones discretas, servicios por sección y portafolio organizado. Los **seis pases digitales** permanecen únicamente en la galería de pases.

## Iniciar

1. Instala Node.js LTS.
2. Abre la terminal en la carpeta que contiene `package.json`.
3. Ejecuta `npm install` y luego `npm run dev`.
4. Abre `http://localhost:4321`.
5. Para producción: `npm run build`; el resultado queda en `dist/`.

## Vista previa de las 14 invitaciones

- La captura real de Zaid & Camila está incluida.
- Para los demás proyectos, las tarjetas usan fichas editoriales claramente identificadas hasta contar con capturas auténticas. **No usan las fotos de pases como portadas**.
- Si tienes Chrome instalado y acceso a internet, `npm run capturar:vistas` genera imágenes auténticas desde las URL reales usando Playwright; luego sube las imágenes generadas en `public/previews-real` a GitHub.
- La vista previa no usa iframes. Toda interacción ocurre únicamente al abrir el sitio original en otra pestaña.

## Servicios

Invitaciones web, funcionalidades acordadas, pases digitales, QR y control de acceso, recepción y mesas y tarjetas NFC con video silencioso. Las funciones y precios se acuerdan por cotización. Contacto: WhatsApp 871 797 7576; TikTok @cazami0225.

## Vercel

- Framework: Astro.
- Root: `./` (si `package.json` está en raíz).
- Build Command: `npm run build`.
- Output Directory: `dist`.
- No se necesita `.env` para publicar esta versión.

**Aviso**: por limitaciones de npm en el entorno de preparación, verifica `npm run build` antes de desplegar.

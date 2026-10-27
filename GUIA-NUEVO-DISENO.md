# CAZAMI STUDIO V7 — Nuevo diseño de autor

Rediseño realizado sobre Astro 5. Todas las imágenes de pases digitales están exclusivamente en `/public/passes`. No se presentan como portadas de las invitaciones web.

## Cambios principales
- Pantalla de bienvenida animada con monograma CZ original, se reproduce una vez por sesión.
- Iconografía vectorial en Astro (`src/components/Icon.astro`), sin emojis de servicios.
- Nueva portada cinemática con Zaid y Camila como única captura auténtica de web.
- Servicios separados y explicados sin mezclar pases, QR y NFC.
- Espacios amplios, tipografía refinada, transiciones suaves y responsive móvil.
- Conserva los 14 enlaces a demostraciones reales y los 6 pases digitales originales.
- Accesos a WhatsApp 871 797 7576 y TikTok @cazami0225.
- No se publican precios ni se dan por incluidas funcionalidades no confirmadas.

## Ejecución

```powershell
npm install
npm run build
npm run dev
```

## Despliegue

Configurar Vercel como Astro, directorio `./`, Build Command `npm run build`, Output `dist`, sin variables .env obligatorias.

**Nota:** antes de publicar los pases originales en un sitio público, revisar que los QR existentes no sean accesos vigentes.
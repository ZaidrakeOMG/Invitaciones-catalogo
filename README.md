# CAZAMI STUDIO · Catálogo editorial de lujo (V6)

Catálogo comercial y portafolio web creado con **Astro 5, TypeScript, CSS y JavaScript**. Sitio estático, responsive y preparado para GitHub + Vercel.

## Qué incluye

- Identidad CAZAMI y monograma oficial CZ.
- Portada editorial protagonizada por la **captura de portada real** de Zaid & Camila.
- Presentación de servicios, invitaciones web y funcionalidades opcionales.
- Portafolio filtrable con 14 demostraciones externas de Netlify.
- **6 ejemplos reales de pases digitales** en una sección propia, mostrados completos; **nunca se utilizan como portadas de webs**.
- QR/control de acceso, servicio de recepción y asignación de mesas descritos comercialmente, sin fingir capturas de software ni funciones no confirmadas.
- Tarjetas semifísicas NFC y video original reproducido sin pista de audio (silenciado, con control pausa/reproducir).
- Servicios a cotización: no se muestran tarifas ni paquetes inventados.
- Páginas individuales para las 14 invitaciones; contacto WhatsApp y TikTok.
- SEO inicial, metadatos y soporte responsive.

## En Windows

1. Instalar Node.js 20.3+ o 22 LTS desde https://nodejs.org
2. Descomprimir el ZIP y abrir la carpeta raíz donde está `package.json`.
3. Ejecutar `INICIAR-CAZAMI.bat` o, en terminal:

```bash
npm install
npm run dev
```

4. Visitar `http://localhost:4321`.
5. Antes de subir, ejecutar `VERIFICAR-PROYECTO.bat` o `npm run build`.

## Publicación

Crear repositorio vacío **ZaidrakeOMG/cazami-catalogo** y ejecutar `SUBIR-A-GITHUB.bat`, o usar comandos de Git incluidos en `DEPLOY-GITHUB-VERCEL.md`. En Vercel usar **Import Git Repository**, framework Astro, Build Command `npm run build` y Output Directory `dist`.

## Portadas web frente a pases digitales

- `public/previews-real/zyc-invitacion.png` es una **portada web auténtica**, aportada por CAZAMI.
- Los 13 sitios restantes tienen una vista web embebida no interactiva cuando su configuración de seguridad lo permite. Si la integración está bloqueada, cada tarjeta enlaza a la demo original.
- Para generar **capturas de las páginas web reales**, opcionalmente ejecutar `CAPTURAR-VISTAS-PREVIAS.bat` (Playwright con navegador Chrome/Chromium). Se guardan en `public/previews-real/*.webp`; Astro las detecta en el siguiente build. **No se generan portadas ficticias**.
- Las fotografías en `public/passes/` corresponden exclusivamente a **pases digitales personalizados**. Se muestran respetando su proporción original. El pase de Bernardo contiene un QR original; confirmar que puede publicarse antes de compartir el sitio.
- La ilustración de organización de invitados es explicativa, no una captura de un sistema operativo.

## Contacto y edición

- Marca y WhatsApp en `src/data/site.ts` (WhatsApp: **871 797 7576**, TikTok: **@cazami0225**).
- Títulos y enlaces de demostraciones en `src/data/catalog.ts`.
- Contenido comercial en `src/pages/index.astro`.
- Diseño y estilos responsive en `src/styles/global.css`.
- Galería de pases en `src/components/PassGallery.astro`.
- Video NFC en `src/components/NfcShowcase.astro`.

Precios únicamente por cotización. Características acordadas con el cliente según el proyecto.

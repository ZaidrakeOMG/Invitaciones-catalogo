import { defineConfig } from 'astro/config';
// Si ya tienes tu dominio, configura PUBLIC_SITE_URL en Vercel.
// No inventamos una URL canónica antes de la publicación.
export default defineConfig({
  output: 'static',
  ...(process.env.PUBLIC_SITE_URL ? {site:process.env.PUBLIC_SITE_URL} : {}),
  build: { format: 'directory' }
});

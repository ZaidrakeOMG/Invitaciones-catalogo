# CAZAMI STUDIO V6 — GitHub y Vercel

1. Instala Node.js LTS y Git.
2. En la carpeta del proyecto, ejecuta `npm install` y `npm run build`.
3. Ve a <https://github.com/new> e inicia sesión con `ZaidrakeOMG`.
4. Crea un repositorio **vacío** llamado `cazami-catalogo` (sin README ni .gitignore generados por GitHub).
5. Ejecuta `SUBIR-A-GITHUB.bat` **dentro de la carpeta raíz** y acepta crear el push.
6. En <https://vercel.com/new> selecciona *Import Git Repository* y `ZaidrakeOMG/cazami-catalogo`.
7. Framework Preset: **Astro**; Build Command: `npm run build`; Output Directory: `dist`. Publica.
8. Para cambiar contenido en el futuro, edita el código, haz commit y push. Vercel volverá a desplegar el sitio.

Comandos alternativos por terminal (solo si todavía no se creó la carpeta .git):

```bash
git init
git add .
git commit -m "CAZAMI V6 rediseño editorial"
git branch -M main
git remote add origin https://github.com/ZaidrakeOMG/cazami-catalogo.git
git push -u origin main
```

> Consejo: los enlaces originales de las invitaciones siguen alojados en Netlify; el catálogo es el sitio que se publica en Vercel. Si una invitación bloquea ser mostrada en iframe, el botón «Abrir demo» seguirá funcionando.

# Publicar CAZAMI con administrador

1. En tu proyecto de GitHub sube los archivos de esta carpeta (sin `node_modules/`, sin `.env`).
2. En Vercel importa el repositorio o conserva tu proyecto ya conectado a GitHub. Configura Framework: **Astro**, Build: `npm run build`, Output: `dist`.
3. Ejecuta `GENERAR-CLAVES-ADMIN.bat` en Windows o `node scripts/generar-claves-admin.mjs 2525`.
4. En Vercel → Settings → Environment Variables crea las variables `ADMIN_PASSWORD_SCRYPT` y `ADMIN_SESSION_SECRET` con los dos valores generados.
5. En GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens crea un token limitado al repo CAZAMI con permiso **Contents: Read and write**.
6. En Vercel crea `GITHUB_TOKEN` con ese token, `GITHUB_REPO` con el repo correcto (`usuario/repo`) y `GITHUB_BRANCH=main` (ajusta si usas otra rama).
7. Aplica las variables al entorno Production y vuelve a desplegar. Abre `https://tu-sitio/admin/` e inicia con **2525**.
8. Al añadir una invitación o subir una imagen se hace un commit en GitHub; Vercel reconstruye el catálogo automáticamente.

La contraseña no aparece en el navegador: el backend verifica un hash scrypt y firma la sesión. **2525 es un PIN muy sencillo**: para mayor seguridad cambia a una clave larga al exponer el sitio en público y agrega límites de acceso en Vercel.

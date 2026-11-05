# CAZAMI STUDIO · Catálogo de trabajos

Sitio de **Astro 5** con una presentación corta, catálogo de invitaciones y galería de pases.
Incluye **panel privado** para dar de alta invitaciones por URL y pases subiendo solo su imagen.

## El sitio público

- `/` — catálogo de invitaciones, filtros, galería "Pases que hemos hecho" y contacto.
- Conserva las **14 invitaciones** y **6 pases** del proyecto original.
- Las altas del administrador se suman a estos trabajos; no los reemplazan.
- `/admin/` — acceso a la administración. La contraseña **no está en el JavaScript del navegador**.

## Publicación con Vercel + GitHub (importante)

El catálogo estático se conserva y el administrador utiliza **Vercel Functions** para enviar cambios al repositorio de **GitHub**. Cada alta genera un commit y Vercel vuelve a publicar el sitio automáticamente. No se necesitan Supabase ni bases de datos adicionales.

1. Sube el contenido de este proyecto a tu repositorio de GitHub y conéctalo a Vercel (framework Astro, `npm run build`, salida `dist`).
2. En la carpeta del proyecto ejecuta:

   ```bash
   npm install
   node scripts/generar-claves-admin.mjs 2525
   ```

   O en Windows usa `GENERAR-CLAVES-ADMIN.bat`.
3. Copia **ADMIN_PASSWORD_SCRYPT** y **ADMIN_SESSION_SECRET** de la terminal a **Vercel → Proyecto → Settings → Environment Variables**. No las agregues al repositorio.
4. En GitHub crea un **Fine-grained personal access token** limitado a este repositorio, con permiso **Contents: Read and write**. Guárdalo en Vercel como **GITHUB_TOKEN**.
5. Configura además **GITHUB_REPO** en Vercel con `usuario/repositorio` (por ejemplo `ZaidrakeOMG/cazami-catalogo` si ese es tu repo real) y **GITHUB_BRANCH** con `main` o tu rama de producción.
6. Vuelve a desplegar el proyecto desde Vercel para activar esas variables.
7. Abre `https://tu-dominio/admin/`, ingresa **2525** y agrega trabajos.

> **Importante:** sin las variables de Vercel, el catálogo público funciona pero el panel no puede iniciar sesión ni guardar archivos. No guardes `GITHUB_TOKEN` ni la clave de sesión en archivos enviados a GitHub.

## ¿Cómo funciona el panel?

**Invitaciones:** pega una URL `https://...`, elige categoría y, si lo deseas, escribe un nombre. Se agrega a la lista de invitaciones del sitio.

**Pases:** selecciona una imagen JPG, PNG o WEBP. El navegador la optimiza y sube únicamente la imagen; no es necesario escribir nombres ni datos de invitados. Límite final 2.5 MB por imagen.

**Eliminar:** el panel permite retirar de la galería los trabajos nuevos. Los seis pases y catorce invitaciones iniciales siguen siendo parte del código y no se eliminan desde el panel. Los archivos ya subidos pueden permanecer en el historial de GitHub.

Las nuevas entradas se almacenan en `public/data/catalogo-adicional.json` dentro de tu repositorio y las fotos en `public/passes/nuevos/`. La web las verá cuando termine el despliegue automático de Vercel; por eso puede haber un pequeño intervalo entre guardar y ver el cambio público.

## Seguridad

- El código **2525** se transforma en un **hash scrypt con sal** generado al configurar Vercel; no se guarda la contraseña en texto plano en el sitio.
- El acceso utiliza una cookie firmada `HttpOnly`, `SameSite=Strict` con caducidad a las 8 horas.
- Las altas y eliminaciones exigen sesión válida y comprueban origen; las imágenes se validan por su tipo de archivo.
- Existe una limitación básica de intentos en memoria, que **no es suficiente por sí sola** frente a ataques distribuidos.
- **2525 es un PIN débil para Internet.** Si el panel se expone públicamente, es recomendable usar una contraseña mucho más larga y activar protección adicional como las reglas WAF o protección de acceso de Vercel. Puedes cambiarla generando nuevas claves con el mismo script.
- Usa siempre un dominio con HTTPS.

## Desarrollo local

```bash
npm install
npm run dev
```

La web pública funciona en Astro Dev. **Las rutas `/api/*` son funciones de Vercel**, por lo que para probar inicio de sesión y altas localmente debes usar `vercel dev` con el proyecto vinculado y las variables de entorno configuradas. En producción Vercel las despliega automáticamente.

## Archivos importantes

- `src/pages/index.astro`: portada y catálogo compacto.
- `src/components/PassGallery.astro`: pases y ampliación de imágenes.
- `src/pages/admin/index.astro`: formulario protegido (el servidor valida la sesión).
- `api/`: endpoints de acceso, autenticación y cambios al catálogo.
- `src/data/catalog.ts`: catálogo base de 14 invitaciones.
- `public/data/catalogo-adicional.json`: catálogo creado desde el panel.
- `scripts/generar-claves-admin.mjs`: genera el hash y el secreto de sesión.
- `src/data/site.ts`: datos de contacto.

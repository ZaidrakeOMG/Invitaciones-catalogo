# Publicar CAZAMI V8 sobre el repositorio existente

Repositorio: https://github.com/ZaidrakeOMG/Invitaciones-catalogo

**Opción recomendada para Windows:** descomprime el proyecto y ejecuta `SUBIR-A-GITHUB.bat`. Este script **clona el repositorio existente** en una carpeta temporal y sobreescribe los archivos de CAZAMI, crea el commit y lo envía a `main` sin reescribir el historial remoto.

Puedes hacerlo a mano si ya tienes el repositorio clonado:

```bat
cd C:\ruta\a\Invitaciones-catalogo
REM Copia aquí las carpetas src, public, scripts y archivos del ZIP.
npm install
npm run build
git add .
git commit -m "CAZAMI V8 - rediseno editorial"
git push origin main
```

Vercel: Astro, Root Directory `./`, Build Command `npm run build`, Output Directory `dist`, Install Command `npm install`, variables de entorno vacías.

Después de enviar el commit: en Vercel > Deployments comprueba el estado **Ready**.

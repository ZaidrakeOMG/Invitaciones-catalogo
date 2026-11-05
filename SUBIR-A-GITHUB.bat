@echo off
if exist "%~dp0..\SUBIR-CAMBIOS-A-VERCEL.bat" (
  call "%~dp0..\SUBIR-CAMBIOS-A-VERCEL.bat"
) else (
  echo Para publicar descarga el ZIP CAZAMI listo para Vercel y ejecuta SUBIR-CAMBIOS-A-VERCEL.bat desde la carpeta principal.
  pause
)

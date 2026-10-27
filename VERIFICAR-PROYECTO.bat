@echo off
chcp 65001 >nul
cd /d "%~dp0"
title CAZAMI - Verificar compilacion Astro
where node >nul 2>nul
if errorlevel 1 (
  echo Falta Node.js LTS. Descargalo desde https://nodejs.org/
  pause
  exit /b 1
)
echo.
echo ==== CAZAMI STUDIO V8 - VERIFICACION ====
echo.
call npm install
if errorlevel 1 goto :error
call npm run build
if errorlevel 1 goto :error
echo.
echo Compilacion correcta. La carpeta dist/ esta lista para publicacion.
echo Publica con GitHub y luego Import Project en Vercel.
pause
exit /b 0
:error
echo.
echo Error de instalacion o compilacion. Copia el mensaje y envialo para revisarlo.
pause
exit /b 1

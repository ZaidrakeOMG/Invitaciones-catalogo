@echo off
setlocal EnableExtensions
title CAZAMI - Capturar invitaciones abiertas
color 0D
echo.
echo ======================================================
echo   CAZAMI STUDIO - VISTAS PREVIAS DESPUES DEL SOBRE
echo ======================================================
echo.
where git >nul 2>&1
if errorlevel 1 (
  echo ERROR: Instala Git para Windows.
  goto :error
)
where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Instala Node.js LTS.
  goto :error
)
where npm >nul 2>&1
if errorlevel 1 (
  echo ERROR: No se encontro npm.
  goto :error
)
set "WORK=%TEMP%\CAZAMI_INVITACIONES_%RANDOM%%RANDOM%"
echo Descargando la version nueva del catalogo...
git clone --depth 1 https://github.com/ZaidrakeOMG/Invitaciones-catalogo.git "%WORK%"
if errorlevel 1 goto :error
cd /d "%WORK%"
echo.
echo Instalando dependencias...
call npm ci
if errorlevel 1 goto :error
echo.
echo Instalando navegador para las capturas...
call npx playwright install chromium
if errorlevel 1 goto :error
echo.
echo Abriendo los sobres para capturar las invitaciones...
node scripts\capture-previews.mjs --force
if errorlevel 1 goto :error
echo.
echo Preparando archivos nuevos...
git add public/invitation-previews/
git diff --cached --quiet
if not errorlevel 1 (
  echo No hay capturas nuevas para subir.
  goto :success
)
git commit -m "CAZAMI: vistas despues de abrir sobres"
if errorlevel 1 goto :error
git pull --rebase origin main
if errorlevel 1 goto :error
git push origin main
if errorlevel 1 goto :error
:success
echo.
echo LISTO: Las capturas se enviaron a GitHub.
echo Vercel debe publicar la nueva galeria al detectar el cambio.
goto :finish
:error
echo.
echo No se pudo terminar. Revisa el mensaje anterior.
echo No se borraron las invitaciones de GitHub.
:finish
echo.
pause
endlocal

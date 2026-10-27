@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title CAZAMI Studio V8 - Actualizar GitHub
set "REPO=https://github.com/ZaidrakeOMG/Invitaciones-catalogo.git"
where git >nul 2>nul
if errorlevel 1 (echo Falta Git. Instala Git para Windows desde https://git-scm.com/downloads/win & pause & exit /b 1)
echo.
echo ===== CAZAMI V8 - PUBLICAR NUEVO DISENO =====
echo Repositorio: %REPO%
echo.
choice /m "Deseas subir la nueva version al repositorio"
if errorlevel 2 exit /b 0
set "SYNC_DIR=%TEMP%\CAZAMI_V8_SYNC_%RANDOM%"
git clone "%REPO%" "%SYNC_DIR%"
if errorlevel 1 (echo No se pudo clonar el repositorio. Revisa tu acceso a GitHub. & pause & exit /b 1)
robocopy "%~dp0" "%SYNC_DIR%" /E /XD .git node_modules dist .astro .vercel /XF .env .env.local *.log >nul
if errorlevel 8 (echo Error al copiar el proyecto al repositorio temporal. & pause & exit /b 1)
if exist "%SYNC_DIR%\src\styles\redesign.css" del "%SYNC_DIR%\src\styles\redesign.css"
git -C "%SYNC_DIR%" add -A
git -C "%SYNC_DIR%" diff --cached --quiet
if not errorlevel 1 (echo Sin cambios pendientes de subir. & pause & exit /b 0)
git -C "%SYNC_DIR%" commit -m "CAZAMI V8 - rediseno premium responsive y previews estables"
if errorlevel 1 (echo Error haciendo commit. Revisa tu configuracion de usuario Git. & pause & exit /b 1)
git -C "%SYNC_DIR%" push origin main
if errorlevel 1 (echo Fallo el push. Revisa los permisos y el mensaje anterior. & pause & exit /b 1)
echo.
echo Listo. Vercel detectara el nuevo commit en main.
echo https://github.com/ZaidrakeOMG/Invitaciones-catalogo
echo.
pause

@echo off
chcp 65001 >nul
title CAZAMI - Capturar las portadas reales
cd /d "%~dp0"
echo ===== CAZAMI STUDIO - CAPTURAR VISTAS REALES =====
echo Se utilizaran los 14 enlaces Netlify, SIN proyectos ZIP.
call npm install
if errorlevel 1 goto :error
call npm run capturar:vistas
if errorlevel 1 goto :error
echo.
echo Capturas guardadas en public\previews-real\
echo Ya puedes ejecutar INICIAR-CAZAMI.bat o subir los cambios a GitHub.
pause
exit /b 0
:error
echo No se pudieron generar todas las capturas.
echo Si falta Chrome, ejecuta: npx playwright install chromium
pause
exit /b 1

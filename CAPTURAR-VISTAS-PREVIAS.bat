@echo off
chcp 65001 >nul
title CAZAMI - Portadas del inicio de las cartas
cd /d "%~dp0"
echo ===== CAZAMI STUDIO - PORTADAS DE INVITACIONES =====
echo Se capturara el INICIO de las 14 invitaciones, no el pase digital.
call npm install
if errorlevel 1 goto :error
call npm run capturar:vistas -- --force
if errorlevel 1 goto :error
echo.
echo Capturas guardadas en public\intro-previews\
echo Sube esas capturas a GitHub para verlas en el catalogo publicado.
pause
exit /b 0
:error
echo Algunas capturas no se pudieron generar.
echo Si falta Chrome, ejecuta: npx playwright install chromium
pause
exit /b 1

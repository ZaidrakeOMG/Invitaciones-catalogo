@echo off
chcp 65001 >nul
cd /d "%~dp0"
title CAZAMI STUDIO - Astro
where node >nul 2>nul
if errorlevel 1 (
  echo Instala Node.js LTS desde https://nodejs.org/
  pause
  exit /b 1
)
echo.
echo ========================================
echo      CAZAMI STUDIO / PREVISUALIZACION
echo ========================================
echo.
echo Instalando dependencias si hacen falta...
call npm install
if errorlevel 1 (
  echo.
  echo No se pudieron instalar las dependencias. Revisa internet, Node y npm.
  pause
  exit /b 1
)
echo.
echo Abre http://localhost:4321
call npm run dev
pause

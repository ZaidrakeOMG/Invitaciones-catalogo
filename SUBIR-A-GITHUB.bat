@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title CAZAMI - Publicacion GitHub
set "GITHUB_USER=ZaidrakeOMG"
set "REPO=cazami-catalogo"
where git >nul 2>nul
if errorlevel 1 (
  echo Necesitas instalar Git: https://git-scm.com/downloads/win
  pause
  exit /b 1
)
echo.
echo CAZAMI - ENVIO A GITHUB
echo Primero crea un repositorio VACIO en:
echo https://github.com/new
echo Nombre: %REPO%
echo Usuario: %GITHUB_USER%
echo.
choice /m "Ya lo creaste"
if errorlevel 2 exit /b 1
if not exist .git git init
call git add .
call git diff --cached --quiet
if errorlevel 1 (
  call git commit -m "CAZAMI V6 - catalogo editorial y servicios"
  if errorlevel 1 (
    echo El commit fallo. Verifica git config user.name y user.email.
    pause
    exit /b 1
  )
)
call git branch -M main
call git remote get-url origin >nul 2>nul
if errorlevel 1 call git remote add origin https://github.com/%GITHUB_USER%/%REPO%.git
call git push -u origin main
if errorlevel 1 (
  echo.
  echo Fallo el push. Comprueba permisos, autenticacion y nombre del repositorio.
  pause
  exit /b 1
)
echo.
echo Listo. Repositorio: https://github.com/%GITHUB_USER%/%REPO%
pause

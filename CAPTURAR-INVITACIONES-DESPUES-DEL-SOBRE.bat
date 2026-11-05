@echo off
setlocal EnableExtensions
title CAZAMI - Capturar invitaciones abiertas (reparado)
color 0D
echo.
echo ==========================================================
echo  CAZAMI - VISTAS DESPUES DE ABRIR EL SOBRE - REPARADO
echo ==========================================================
echo.
where git >nul 2>&1
if errorlevel 1 (
  echo ERROR: No se encontro Git. Instala Git para Windows.
  goto :error
)
where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: No se encontro Node.js.
  goto :error
)
where npm >nul 2>&1
if errorlevel 1 (
  echo ERROR: No se encontro npm.
  goto :error
)
set "WORK=%TEMP%\CAZAMI_CAPTURAS_%RANDOM%%RANDOM%"
echo Descargando la ultima version de tu repositorio...
git clone --depth 1 --branch main https://github.com/ZaidrakeOMG/Invitaciones-catalogo.git "%WORK%"
if errorlevel 1 goto :error
cd /d "%WORK%"
echo.
echo Instalando Playwright 1.64.1 en carpeta aislada...
echo Esto evita el error ETARGET de playwright-core 1.65.0.
pushd scripts
call npm init -y >nul
if errorlevel 1 (
  popd
  goto :error
)
call npm install --no-save --package-lock=false --no-audit --no-fund --registry=https://registry.npmjs.org playwright@1.64.1
if errorlevel 1 (
  popd
  goto :error
)
echo.
echo Preparando Chromium...
call node_modules\.bin\playwright.cmd install chromium
if errorlevel 1 (
  popd
  goto :error
)
popd
echo.
echo Abriendo sobres y generando vistas previas reales...
node scripts\capture-previews.mjs --force
if errorlevel 1 goto :error
echo.
echo Verificando que existan fotografias reales...
set "COUNT=0"
for /f %%G in ('dir /b /a-d "public\invitation-previews\*.jpg" 2^>nul ^| find /c /v ""') do set "COUNT=%%G"
echo Se generaron %COUNT% fotos JPG de invitaciones.
if "%COUNT%"=="0" (
  echo ERROR: No se capturo ninguna invitacion. Revisa la apertura de sobres.
  goto :error
)
echo.
echo Preparando las nuevas fotografias...
git add public/invitation-previews/
if errorlevel 1 goto :error
git diff --cached --quiet
if not errorlevel 1 (
  echo.
  echo No hay capturas nuevas para enviar.
  goto :success
)
git config user.name "CAZAMI Capturas"
git config user.email "cazami-capturas@users.noreply.github.com"
git commit -m "CAZAMI: capturas de invitaciones abiertas"
if errorlevel 1 goto :error
echo.
echo Sincronizando ultimos cambios de GitHub...
git pull --rebase origin main
if errorlevel 1 goto :error
echo.
echo Enviando a GitHub...
git push origin main
if errorlevel 1 goto :error
:success
echo.
echo ==========================================================
echo LISTO: Capturas enviadas. Vercel puede detectar el commit.
echo ==========================================================
goto :finish
:error
echo.
echo ERROR: No fue posible finalizar. Copia el mensaje de error.
echo No se borraron archivos de tu GitHub ni tu sitio actual.
:finish
echo.
pause
endlocal

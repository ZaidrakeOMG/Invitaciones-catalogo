@echo off
cd /d "%~dp0"
node scripts\generar-claves-admin.mjs 2525
if errorlevel 1 echo Instala Node.js antes de ejecutar el generador.
echo.
echo Copia los valores en Vercel - Settings - Environment Variables.
pause

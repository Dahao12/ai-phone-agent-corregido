@echo off
REM Script para verificar instalación en Windows

echo ====================================
echo   AI Phone Agent - Verificacion
echo ====================================
echo.

echo [1/4] Verificando Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado
    echo Descarga: https://nodejs.org
    pause
    exit /b 1
)

echo.
echo [2/4] Verificando NPM...
npm --version

echo.
echo [3/4] Verificando archivos...
if exist config\config.json (
    echo OK: config.json existe
) else (
    echo ERROR: config.json no encontrado
)

if exist test-llamada-saliente-correcta.js (
    echo OK: test-llamada-saliente-correcta.js existe
) else (
    echo ERROR: test-llamada-saliente-correcta.js no encontrado
)

if exist call-batch-correcto.js (
    echo OK: call-batch-correcto.js existe
) else (
    echo ERROR: call-batch-correcto.js no encontrado
)

if exist clients.csv (
    echo OK: clients.csv existe
) else (
    echo ERROR: clients.csv no encontrado
)

echo.
echo [4/4] Verificando cache...
if not exist cache (
    mkdir cache
    echo Creada carpeta cache
)

echo.
echo ====================================
echo   VERIFICACION COMPLETA
echo ====================================
echo.
echo Siguientes pasos:
echo 1. npm install
echo 2. Editar config\config.json
echo 3. node test-llamada-saliente-correcta.js
echo.
pause
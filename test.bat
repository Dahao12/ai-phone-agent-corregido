@echo off
REM Script de prueba rapida para llamada SALIENTE

echo ====================================
echo   TEST: LLAMADA SALIENTE
echo ====================================
echo.

REM Verificar si Node.js esta instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no encontrado
    echo Descarga: https://nodejs.org
    pause
    exit /b 1
)

REM Verificar si config.json existe
if not exist config\config.json (
    echo ERROR: config\config.json no encontrado
    echo Editar el archivo con tus credenciales Zadarma
    pause
    exit /b 1
)

echo Configuracion encontrada
echo.
echo ====================================
echo   INICIANDO PRUEBA...
echo ====================================
echo.
echo Esta prueba hara una llamada a tu movil
echo para verificar que es SALIENTE.
echo.
echo Presiona CTRL+C para cancelar
echo.
pause

node test-llamada-saliente-correcta.js

echo.
echo ====================================
echo   PRUEBA COMPLETADA
echo ====================================
echo.
pause
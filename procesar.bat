@echo off
REM Script para procesar clientes en lote

echo ====================================
echo   PROCESAR CLIENTES EN LOTE
echo ====================================
echo.

REM Verificar si Node.js esta instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no encontrado
    pause
    exit /b 1
)

echo [1/3] Verificando configuracion...
if not exist config\config.json (
    echo ERROR: config\config.json no encontrado
    pause
    exit /b 1
)
echo OK: Configuracion encontrada

echo.
echo [2/3] Verificando clientes...
if not exist clients.csv (
    echo ERROR: clients.csv no encontrado
    pause
    exit /b 1
)

REM Contar lineas del CSV
for /f %%A in ('type clients.csv ^| find /c /v ""') do set LINES=%%A
set /a CLIENTS=%LINES%-1
echo OK: %CLIENTS% clientes encontrados

echo.
echo [3/3] Verificando cache...
if not exist cache (
    mkdir cache
    echo Creada carpeta cache
) else (
    echo Cache encontrado
)

echo.
echo ====================================
echo   READY PARA EMPEZAR
echo ====================================
echo.
echo Este procesamiento:
echo - Llamara solo a clientes pendientes
echo - Guardara progreso en cache
echo - Podra reiniciar y continuar
echo - Llamadas seran SALIENTES (corregido)
echo.
echo Presiona CTRL+C para cancelar
echo.
pause

node call-batch-correcto.js

echo.
echo ====================================
echo   PROCESAMIENTO COMPLETADO
echo ====================================
echo.
echo Para reiniciar y continuar, ejecuta este script de nuevo.
echo Para empezar de cero, borra cache\state.json
echo.
pause
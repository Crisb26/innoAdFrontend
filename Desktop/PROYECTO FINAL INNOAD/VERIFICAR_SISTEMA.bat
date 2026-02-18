@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║         🔍 VERIFICACIÓN DEL SISTEMA INNOAD                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [1] Verificando PostgreSQL...
powershell -Command "Get-Service -Name 'postgresql*' | Select Status" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ PostgreSQL detectado
) else (
    echo ❌ PostgreSQL NO encontrado
)
echo.

echo [2] Verificando si Puerto 8080 (Backend) está disponible...
netstat -ano | findstr "8080" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend está corriendo en puerto 8080
) else (
    echo ⚠️ Puerto 8080 libre (backend no está corriendo)
)
echo.

echo [3] Verificando si Puerto 4200 (Frontend) está disponible...
netstat -ano | findstr "4200" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Frontend está corriendo en puerto 4200
) else (
    echo ⚠️ Puerto 4200 libre (frontend no está corriendo)
)
echo.

echo [4] Verificando si Puerto 5433 (PostgreSQL) está disponible...
netstat -ano | findstr "5433" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ PostgreSQL está corriendo en puerto 5433
) else (
    echo ❌ PostgreSQL NO está corriendo
)
echo.

echo ╔════════════════════════════════════════════════════════════╗
echo ║                    RESUMEN                                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Si ves ✅ en todos los puertos, el sistema está listo.
echo.
echo Si falta algo:
echo   1. Ejecuta: INICIAR_INNOAD.bat
echo   2. Espera 15 segundos
echo   3. Abre: http://localhost:4200
echo.
pause

@echo off
REM Script de Desarrollo Frontend InnoAd para Windows
REM Doble clic para ejecutar

echo ==========================================
echo   DESARROLLO LOCAL FRONTEND INNOAD
echo ==========================================
echo.

cd /d "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\innoadFrontend"

echo [1/3] Directorio del proyecto:
cd
echo.

echo [2/3] Verificando Node.js y npm...
node --version
npm --version
echo.

echo [3/3] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm ci
) else (
    echo Dependencias ya instaladas. Saltando...
)
echo.

echo ==========================================
echo   INICIANDO SERVIDOR DE DESARROLLO
echo ==========================================
echo.
echo Servidor Angular: http://localhost:4200
echo Proxy API/WebSocket: http://localhost:8080
echo.
echo IMPORTANTE: Asegurate de que el backend este corriendo en localhost:8080
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

npm run iniciar:proxy

pause

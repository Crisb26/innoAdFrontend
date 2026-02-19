@echo off
REM ==============================================================================
REM COMPILACION LIMPIA - SIN SATURACION DE TERMINAL
REM ==============================================================================
setlocal enabledelayedexpansion

echo.
echo ==================== PASO 1: LIMPIAR PROCESOS ====================
timeout /t 2 /nobreak >nul

taskkill /F /IM java.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.cmd >nul 2>&1
taskkill /F /IM cmd.exe >nul 2>&1

echo [✓] Procesos finalizados

echo.
echo ==================== PASO 2: COMPILAR BACKEND ====================
cd /d "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend"

REM Compilar silenciosamente, output a archivo
call mvn clean package -DskipTests -B -q >build-backend.log 2>&1

if exist "target\innoad-backend-2.0.0.jar" (
    echo [✓] Backend compilado exitosamente
    echo.
    dir /s target\innoad-backend-2.0.0.jar | findstr ".jar"
) else (
    echo [✗] Backend FALLO - revisar build-backend.log
    echo.
    type build-backend.log
    pause
    exit /b 1
)

echo.
echo ==================== PASO 3: COMPILAR FRONTEND ====================
cd /d "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend"

REM Compilar silenciosamente, output a archivo
call npm run build >build-frontend.log 2>&1

if exist "dist" (
    echo [✓] Frontend compilado exitosamente
    echo.
    dir dist | findstr "<DIR>"
) else (
    echo [✗] Frontend FALLO - revisar build-frontend.log
    echo.
    type build-frontend.log
    pause
    exit /b 1
)

echo.
echo ==================== COMPILACION COMPLETADA ====================
echo.
echo Ambos proyectos compilados sin errores.
echo Backend JAR: c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend\target\innoad-backend-2.0.0.jar
echo Frontend DIST: c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend\dist
echo.
pause

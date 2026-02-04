@echo off
setlocal enabledelayedexpansion

cls
echo.
echo ========================================
echo  INNOAD FULL STACK - LOCAL DEPLOY
echo ========================================
echo.
echo  Backend:  Spring Boot 3.5.8 + Java 21
echo  Frontend: Angular 19 + TypeScript
echo  Database: PostgreSQL 17.6
echo.
echo ========================================
echo.

set BACKEND_PATH=c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend
set FRONTEND_PATH=c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend

echo [1/4] Limpiando compilacion anterior...
cd /d "!BACKEND_PATH!"
call mvn clean -q

echo [2/4] Compilando aplicacion...
call mvn compile -q

if !errorlevel! neq 0 (
    echo ERROR: Compilacion fallida
    pause
    exit /b 1
)

echo [3/4] Iniciando Backend (puerto 8080)...
echo.
echo ======== BACKEND ========
echo URL: http://localhost:8080
echo Swagger: http://localhost:8080/swagger-ui.html
echo =======================
echo.

start "InnoAd Backend" cmd /k "cd /d !BACKEND_PATH! && mvn spring-boot:run"

echo Esperando 45 segundos para que el backend se estabilice...
timeout /t 45 /nobreak

echo.
echo [4/4] Iniciando Frontend (puerto 4200)...
echo.
echo ======== FRONTEND ========
echo URL: http://localhost:4200
echo Backend API: http://localhost:8080
echo =========================
echo.

start "InnoAd Frontend" cmd /k "cd /d !FRONTEND_PATH! && ng serve --port 4200 --open"

echo.
echo ========================================
echo  Ambas aplicaciones iniciadas
echo ========================================
echo.
echo El navegador deberia abrirse automaticamente en:
echo http://localhost:4200
echo.
echo Si no se abre, abre manualmente en tu navegador
echo.
pause

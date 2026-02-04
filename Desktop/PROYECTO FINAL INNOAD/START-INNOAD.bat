@echo off
REM ==============================================
REM Script para iniciar InnoAd BACKEND + FRONTEND
REM ==============================================

setlocal enabledelayedexpansion

echo.
echo ╔══════════════════════════════════════════════╗
echo ║     INICIANDO INNOAD BACKEND + FRONTEND      ║
echo ║         Presiona CTRL+C para detener         ║
echo ╚══════════════════════════════════════════════╝
echo.

REM Colores
color 0A

REM Rutas
set BACKEND_PATH=c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend
set FRONTEND_PATH=c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend

REM Verificar Java
echo [1/4] Verificando Java 21...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java no instalado
    pause
    exit /b 1
)
echo OK: Java encontrado
echo.

REM Verificar Maven
echo [2/4] Verificando Maven...
mvn -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Maven no instalado
    pause
    exit /b 1
)
echo OK: Maven encontrado
echo.

REM Verificar Node/npm
echo [3/4] Verificando Node.js...
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no instalado
    pause
    exit /b 1
)
echo OK: Node.js encontrado
echo.

REM Iniciar Backend
echo [4/4] Iniciando BACKEND (mvn spring-boot:run)...
echo ┌──────────────────────────────┐
echo │ Backend: http://localhost:8080 │
echo │ Swagger: /swagger-ui.html      │
echo └──────────────────────────────┘
echo.

start "InnoAd Backend - Spring Boot 3.5.8" cmd /k "cd /d !BACKEND_PATH! && mvn spring-boot:run"

echo Esperando a que el backend inicie (30 segundos)...
timeout /t 30 /nobreak

echo.
echo ╔══════════════════════════════════════════════╗
echo ║     INICIANDO FRONTEND (Angular 19+)         ║
echo ╚══════════════════════════════════════════════╝
echo.

REM Iniciar Frontend
start "InnoAd Frontend - Angular" cmd /k "cd /d !FRONTEND_PATH! && ng serve --port 4200 --open"

echo.
echo.
echo ╔══════════════════════════════════════════════╗
echo ║  AMBAS APLICACIONES EN EJECUCIÓN              ║
echo ╠══════════════════════════════════════════════╣
echo ║  📱 Frontend: http://localhost:4200           ║
echo ║  🔧 Backend:  http://localhost:8080          ║
echo ║  📚 Swagger:  /swagger-ui.html               ║
echo ║  💾 Database: PostgreSQL local               ║
echo ╠══════════════════════════════════════════════╣
echo ║  Próximos pasos:                             ║
echo ║  1. Espera a que ambas ventanas carguen      ║
echo ║  2. Abre http://localhost:4200 en navegador  ║
echo ║  3. Click en "Iniciar Sesión"                ║
echo ║  4. Verifica que la autenticación funcione   ║
echo ║  5. Navega por el Dashboard                  ║
echo ╚══════════════════════════════════════════════╝
echo.
echo Presiona cualquier tecla para finalizar el script...
pause

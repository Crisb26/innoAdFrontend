@echo off
setlocal enabledelayedexpansion

cls
color 0B

echo.
echo ====================================================
echo     INNOAD - FULL STACK LOCAL DEPLOYMENT
echo ====================================================
echo.
echo     Backend:  Spring Boot 3.5.8 + Java 21 LTS
echo     Frontend: Angular 19 + TypeScript
echo     Database: PostgreSQL 17.6
echo.
echo ====================================================
echo.

set BACKEND_PATH=c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend
set FRONTEND_PATH=c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend

echo [PASO 1/4] Limpiando directorios...
cd /d "!BACKEND_PATH!"
if exist target (
    rmdir /s /q target
)
echo OK: Directorio target limpio

echo.
echo [PASO 2/4] Compilando Backend...
echo.
cd /d "!BACKEND_PATH!"
call mvn clean compile -q
if !errorlevel! neq 0 (
    echo ERROR: Compilacion fallida
    pause
    exit /b 1
)
echo OK: Compilacion completada exitosamente

echo.
echo ====================================================
echo          INICIANDO SERVICIOS
echo ====================================================
echo.

echo [PASO 3/4] Abriendo Backend en nueva ventana...
echo            Puerto: 8080
echo            URL: http://localhost:8080
echo.
start "InnoAd Backend" cmd /k "cd /d !BACKEND_PATH! && mvn spring-boot:run"

echo Esperando 60 segundos para que el backend inicie...
timeout /t 60 /nobreak

echo.
echo [PASO 4/4] Abriendo Frontend en nueva ventana...
echo            Puerto: 4200
echo            URL: http://localhost:4200
echo.
start "InnoAd Frontend" cmd /k "cd /d !FRONTEND_PATH! && ng serve --port 4200"

echo.
echo ====================================================
echo     INICIALIZACION COMPLETADA
echo ====================================================
echo.
echo URLS DE ACCESO:
echo   Frontend:     http://localhost:4200
echo   Backend API:  http://localhost:8080/api
echo   Swagger:      http://localhost:8080/swagger-ui.html
echo   Health:       http://localhost:8080/api/health
echo.
echo Abre http://localhost:4200 en tu navegador
echo.
echo Presiona una tecla para cerrar esta ventana...
pause

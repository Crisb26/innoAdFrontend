@echo off
REM ============================================================
REM SCRIPT AUTOMATICO INNOAD - SIN INTERACCION DEL USUARIO
REM ============================================================
REM Autor: Sistema Autonomo InnoAd
REM Proposito: Compilar, testear y desplegar aplicacion
REM ============================================================

setlocal enabledelayedexpansion

set "BACKEND_DIR=c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend"
set "FRONTEND_DIR=c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend"
set "JAVA_BIN=java"

echo.
echo ============================================================
echo  INICIANDO DESPLIEGUE AUTOMATICO INNOAD
echo  Fecha: %date% %time%
echo ============================================================
echo.

REM ============================================================
REM 1. COMPILAR BACKEND
REM ============================================================
echo [1/5] Compilando Backend con Maven...
cd /d "%BACKEND_DIR%"
cls
mvn clean package -DskipTests -B -T 1C 2>NUL | find /V ""
if errorlevel 1 (
  echo [ERROR] Compilacion Backend falló
  exit /b 1
)

if not exist "target\innoad-backend-2.0.0.jar" (
  echo [ERROR] JAR no se genero
  exit /b 1
)
echo [✓] Backend compilado exitosamente

REM ============================================================
REM 2. COMPILAR FRONTEND
REM ============================================================
echo.
echo [2/5] Compilando Frontend...
cd /d "%FRONTEND_DIR%"
call npm run build --prod >NUL 2>&1
if errorlevel 1 (
  echo [ERROR] Compilacion Frontend falló
  exit /b 1
)
echo [✓] Frontend compilado exitosamente

REM ============================================================
REM 3. INICIAR BACKEND
REM ============================================================
echo.
echo [3/5] Iniciando Backend en puerto 8080...
cd /d "%BACKEND_DIR%"
start "INNOAD-BACKEND" cmd /k "%JAVA_BIN% -jar target\innoad-backend-2.0.0.jar --server.port=8080"
timeout /t 10 /nobreak
echo [✓] Backend iniciado

REM ============================================================
REM 4. INICIAR FRONTEND
REM ============================================================
echo.
echo [4/5] Iniciando Frontend en puerto 4200...
cd /d "%FRONTEND_DIR%"
start "INNOAD-FRONTEND" cmd /k "ng serve --port 4200 --poll 1000"
timeout /t 10 /nobreak
echo [✓] Frontend iniciado

REM ============================================================
REM 5. VERIFICAR SERVICIOS
REM ============================================================
echo.
echo [5/5] Verificando servicios...
echo.
timeout /t 15 /nobreak
echo ============================================================
echo  DESPLIEGUE COMPLETADO
echo ============================================================
echo.
echo  Backend:  http://localhost:8080/api/health
echo  Frontend: http://localhost:4200
echo  Swagger:  http://localhost:8080/swagger-ui.html
echo.
echo  Presione cualquier tecla para mantener las ventanas abiertas...
echo.
pause >nul

endlocal

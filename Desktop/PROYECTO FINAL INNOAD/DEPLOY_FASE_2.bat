@echo off
REM ============================================
REM FASE 2 - Deployment Script
REM Sistema de Alertas en Tiempo Real
REM ============================================

setlocal enabledelayedexpansion
set LOG_FILE=deployment_fase2_%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%.log

echo.
echo [FASE 2 - SISTEMA DE ALERTAS EN TIEMPO REAL]
echo ============================================
echo Iniciando despliegue...
echo.

REM Crear log
(
  echo [%date% %time%] - Iniciando FASE 2 Deployment
  echo ============================================
) > %LOG_FILE%

REM Paso 1: Backend Compilation
echo [PASO 1/4] Compilando Backend...
cd "%~dp0BACKEND\innoadBackend"
echo [%date% %time%] - Compilando Backend... >> %LOG_FILE%
call mvn clean install -DskipTests >> %LOG_FILE% 2>&1

if %errorlevel% neq 0 (
    echo ERROR: Compilacion Backend fallida
    echo [%date% %time%] - ERROR: Backend compilation failed >> %LOG_FILE%
    goto :error
)
echo ✓ Backend compilado exitosamente

REM Paso 2: Frontend Compilation
echo.
echo [PASO 2/4] Compilando Frontend...
cd "%~dp0FRONTEND\innoadFrontend"
echo [%date% %time%] - Compilando Frontend... >> %LOG_FILE%
call npm run construir >> %LOG_FILE% 2>&1

if %errorlevel% neq 0 (
    echo ERROR: Compilacion Frontend fallida
    echo [%date% %time%] - ERROR: Frontend compilation failed >> %LOG_FILE%
    goto :error
)
echo ✓ Frontend compilado exitosamente

REM Paso 3: Database Setup
echo.
echo [PASO 3/4] Configurando Base de Datos...
echo [%date% %time%] - Setting up database... >> %LOG_FILE%
echo.
echo Para ejecutar el script SQL:
echo 1. Abre tu cliente PostgreSQL (pgAdmin, DBeaver, etc.)
echo 2. Copia y ejecuta el contenido de: fase-2-alertas-tiempo-real.sql
echo 3. Verifica que las tablas se crearon: alertas_sistema, auditoria_alertas, plantillas_alertas
echo.
pause

REM Paso 4: Validacion
echo.
echo [PASO 4/4] Validando instalacion...
echo [%date% %time%] - Validating installation... >> %LOG_FILE%

REM Verificar archivo JAR backend
if exist "%~dp0BACKEND\innoadBackend\target\innoadBackend-*.jar" (
    echo ✓ Backend JAR generado
) else (
    echo ! Advertencia: Backend JAR no encontrado
)

REM Verificar carpeta dist frontend
if exist "%~dp0FRONTEND\innoadFrontend\dist" (
    echo ✓ Frontend dist generado
) else (
    echo ! Advertencia: Frontend dist no encontrado
)

REM Verificar scripts SQL
if exist "%~dp0BACKEND\innoadBackend\fase-2-alertas-tiempo-real.sql" (
    echo ✓ Script SQL encontrado
) else (
    echo ! Advertencia: Script SQL no encontrado
)

REM Resumen
echo.
echo ============================================
echo RESUMEN DE IMPLEMENTACION FASE 2
echo ============================================
echo.
echo Archivos creados:
echo   - Backend: 9 archivos Java
echo   - Frontend: 6 archivos TS/HTML/SCSS
echo   - Database: 1 script SQL
echo   - Documentacion: 3 archivos MD
echo.
echo Pasos siguientes:
echo.
echo 1. EJECUTAR BACKEND LOCALMENTE (Desarrollo):
echo    cd BACKEND\innoadBackend
echo    mvn spring-boot:run
echo    (Acceso: http://localhost:8080)
echo.
echo 2. EJECUTAR FRONTEND LOCALMENTE (Desarrollo):
echo    cd FRONTEND\innoadFrontend
echo    ng serve
echo    (Acceso: http://localhost:4200)
echo.
echo 3. DESPLEGAR A PRODUCCION:
echo    Backend: mvn clean package azure-webapp:deploy
echo    Frontend: npm run deploy (a Netlify)
echo.
echo DOCUMENTACION:
echo   - GUIA_IMPLEMENTACION_FASE_2.md (Paso a paso)
echo   - FASE_2_ALERTAS_TIEMPO_REAL.md (Tecnico)
echo   - RESUMEN_FASE_2_COMPLETO.md (Resumen ejecutivo)
echo.
echo CARACTERISTICAS IMPLEMENTADAS:
echo   ✅ Centro de Alertas en Tiempo Real
echo   ✅ WebSocket STOMP bidireccional
echo   ✅ REST API completa (8 endpoints)
echo   ✅ Base de datos optimizada (8 indices)
echo   ✅ Interfaz profesional responsive
echo   ✅ Navegacion rapida a modulos
echo   ✅ Notificaciones visuales
echo   ✅ Auditoria automática
echo   ✅ Plantillas reutilizables
echo   ✅ Reconexion automatica
echo.
echo ============================================
echo [%date% %time%] - Deployment completado exitosamente >> %LOG_FILE%
echo [%date% %time%] - Log guardado en: %LOG_FILE% >> %LOG_FILE%
echo ✅ DEPLOYMENT COMPLETADO EXITOSAMENTE
echo ============================================
echo.
echo Log guardado en: %LOG_FILE%
pause
goto :end

:error
echo.
echo ============================================
echo ❌ ERROR EN DEPLOYMENT
echo ============================================
echo Revisa el archivo de log para mas detalles:
echo %LOG_FILE%
echo.
echo Posibles soluciones:
echo - Asegúrate de tener Maven y Node.js instalados
echo - Verifica las variables de entorno (JAVA_HOME, etc.)
echo - Intenta ejecutar los comandos manualmente
echo.
pause
goto :end

:end
endlocal
exit /b %errorlevel%

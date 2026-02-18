@echo off
REM Script para configurar deployment automatico

echo.
echo ====================================================================
echo   CONFIGURACION DE DEPLOYMENT AUTOMATICO AL SERVIDOR TAILSCALE
echo   Servidor: 100.91.23.46
echo ====================================================================
echo.

echo [1/3] Estado actual del proyecto...
cd /D "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD"

echo.
echo Credenciales disponibles:
echo   - SSH Key: %USERPROFILE%\.ssh\id_ed25519
echo   - Servidor: 100.91.23.46 (postgres)
echo   - URL Publica: https://azure-pro.tail2a2f73.ts.net/

echo.
echo ====================================================================
echo   OPCIONES DISPONIBLES:
echo ====================================================================
echo.
echo [A] OPCION A - Deploy Manual Directo
echo     Entra al servidor y hace deploy manualmente
echo     COMANDO: git push
echo.
echo [B] OPCION B - GitHub Actions Automatico
echo     Configura CI/CD en GitHub
echo     COMANDO: git push (se activa automaticamente)
echo.
echo [C] OPCION C - Verificar Acceso Servidor
echo     Prueba la conexion al servidor Tailscale
echo.
echo [D] INFO - Ver detalles tecnic o
echo.

set /p choice="Elige opcion (A/B/C/D): "

if /i "%choice%"=="A" goto OPCION_A
if /i "%choice%"=="B" goto OPCION_B
if /i "%choice%"=="C" goto OPCION_C
if /i "%choice%"=="D" goto OPCION_D
echo Opcion no valida
goto FIN

:OPCION_A
echo.
echo ====================================================================
echo   OPCION A: DEPLOY MANUAL DIRECTO
echo ====================================================================
echo.
echo Lo que hace:
echo   1. Compila backend con Maven
echo   2. Envia JAR al servidor via SCP
echo   3. Reinicia backend en servidor
echo   4. Verifica que funciona
echo.
echo Para ejecutar manualmente:
echo.
echo   cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD"
echo   git add .
echo   git commit -m "cambios listos para deploy"
echo   git push
echo.
echo   Luego ejecuta:
echo.
echo   powershell -ExecutionPolicy Bypass "%%cd%%\deploy-backend-simple.ps1"
echo.
goto FIN

:OPCION_B
echo.
echo ====================================================================
echo   OPCION B: GITHUB ACTIONS AUTOMATICO
echo ====================================================================
echo.
echo PASO 1: Obtener tu SSH Key
echo   Comando: type %USERPROFILE%\.ssh\id_ed25519
echo.
echo PASO 2: Agregar a GitHub Secrets
echo   Abre: https://github.com/Crisb26/innoAdBackend/settings/secrets/actions
echo   Click: New repository secret
echo   Name:  TAILSCALE_SSH_KEY
echo   Value: (pega el contenido completo del SSH key)
echo.
echo PASO 3: Hacer Push
echo   Cualquier push a develop/main activara deployment automatico
echo.
echo   git add .
echo   git commit -m "cambios"
echo   git push
echo.
echo El servidor se actualiza automaticamente!
echo.
goto FIN

:OPCION_C
echo.
echo ====================================================================
echo   OPCION C: VERIFICAR ACCESO SERVIDOR
echo ====================================================================
echo.
echo Verificando ping al servidor...
ping -n 1 100.91.23.46
echo.
echo Verificando SSH...
echo   Necesitas tener:
echo   - Git Bash instalado, O
echo   - OpenSSH en Windows, O
echo   - PuTTY con plink
echo.
echo Para conectar al servidor:
echo   git bash console:
echo     ssh -i ~/.ssh/id_ed25519 postgres@100.91.23.46
echo.
echo   PowerShell (si tiene OpenSSH):
echo     ssh -i "%USERPROFILE%\.ssh\id_ed25519" postgres@100.91.23.46
echo.
goto FIN

:OPCION_D
echo.
echo ====================================================================
echo   DETALLES TECNIC O
echo ====================================================================
echo.
echo Arquitectura de deployment:
echo.
echo   TU PC
echo      ^|
echo      v
echo   Git Push %% GitHub
echo      ^|
echo      v
echo   Servidor Tailscale (100.91.23.46)
echo      ^|
echo      +--- Backend JAR (puerto 8080)
echo      +--- PostgreSQL (puerto 5432)
echo      +--- Nginx (puerto 80)
echo      ^|
echo      v
echo   Publico via HTTPS (azure-pro.tail2a2f73.ts.net)
echo.
echo Flujo de deployment:
echo.
echo   1. Git Push (local)
echo   2. GitHub Actions (compila)
echo   3. SCP (envia JAR)
echo   4. SSH Script (actualiza servidor)
echo   5. Health Check
echo   6. Listo en linea!
echo.
echo Archivos importantes:
echo   - deploy-to-server.ps1: Script main de deployment
echo   - deploy-backend-simple.ps1: Version simplificada
echo   - setup-auto-deployment.ps1: Este installer
echo   - .git/hooks/post-push: Hook que dispara deployment
echo.
goto FIN

:FIN
echo.
echo ====================================================================
echo.
pause

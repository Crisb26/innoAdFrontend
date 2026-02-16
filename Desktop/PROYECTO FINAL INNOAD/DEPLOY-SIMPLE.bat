echo off
REM Script SIMPLE de deployment
REM Ejecutar: cmd /c DEPLOY-SIMPLE.bat

setlocal

set JAR=c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\target\innoad-backend-2.0.0.jar
set KEY=%USERPROFILE%\.ssh\id_ed25519
set SERVER=100.91.23.46
set USER=postgres

echo.
echo DEPLOYMENT SIMPLE AL SERVIDOR
echo ==============================
echo.

if not exist "%JAR%" (
    echo ERROR: JAR no existe
    exit /b 1
)

if not exist "%KEY%" (
    echo ERROR: SSH Key no existe
    exit /b 1
)

echo [1/3] Archivos OK

echo [2/3] Enviando JAR con SCP...
scp -i "%KEY%" -o StrictHostKeyChecking=no "%JAR%" %USER%@%SERVER%:/tmp/

if errorlevel 1 (
    echo ERROR en SCP
    exit /b 1
)

echo [3/3] Ejecutando en servidor...

REM Conectar y ejecutar deployment
ssh -i "%KEY%" -o StrictHostKeyChecking=no %USER%@%SERVER% "pkill -f java; sleep 1; mkdir -p /opt/innoad/backend; cp /tmp/innoad-backend-2.0.0.jar /opt/innoad/backend/; cd /opt/innoad/backend; nohup java -jar innoad-backend-2.0.0.jar ^> innoad.log 2^>^&1 &"

echo.
echo DEPLOYMENT COMPLETADO
echo.
echo URL: https://azure-pro.tail2a2f73.ts.net/
echo Usuario: admin
echo Contrasena: Admin123!
echo.
echo Recarga browser (Ctrl+F5)
echo.

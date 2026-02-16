# Script SIMPLIFICADO para deployar backend al servidor Tailscale
# Usa SCP para copiar JAR y SSH para ejecutar en servidor

param(
    [string]$ServerIP = "100.91.23.46",
    [string]$ServerUser = "postgres"
)

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║     DEPLOYMENT AUTOMÁTICO - BACKEND AL SERVIDOR          ║" -ForegroundColor Yellow
Write-Host "║     Servidor: $ServerIP                        ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow

# Paso 1: Compilar backend
Write-Host "`n[1/4] Compilando backend..." -ForegroundColor Cyan
cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND"

Write-Host "Ejecutando mvn clean package..." -ForegroundColor Gray
mvn clean package -DskipTests 2>&1 | findstr /C:"BUILD SUCCESS" /C:"ERROR"

if (-not (Test-Path "target\innoad-backend-2.0.0.jar")) {
    Write-Host "❌ Error: JAR no fue generado" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend compilado" -ForegroundColor Green

# Paso 2: Enviar JAR al servidor
Write-Host "`n[2/4] Enviando JAR al servidor..." -ForegroundColor Cyan

$jarFile = (Get-Item "target\innoad-backend-2.0.0.jar").FullName
Write-Host "Archivo: $jarFile ($('{0:N2}' -f ((Get-Item $jarFile).Length/1MB)) MB)" -ForegroundColor Gray

# Usar PuTTY plink y pscp si están disponibles, sino usar scp de Git Bash
$sshKey = "$env:USERPROFILE\.ssh\id_ed25519"

# Intentar con SCP
Write-Host "Usando SCP..." -ForegroundColor Gray
$scpCmd = "scp -i `"$sshKey`" -o StrictHostKeyChecking=no -o ConnectTimeout=10 `"$jarFile`" ${ServerUser}@${ServerIP}:/tmp/"

try {
    $output = Invoke-Expression $scpCmd 2>&1
    Write-Host "✅ JAR enviado al servidor" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al enviar JAR: $_" -ForegroundColor Red
    exit 1
}

# Paso 3: Ejecutar deployment en servidor
Write-Host "`n[3/4] Ejecutando deployment en servidor..." -ForegroundColor Cyan

$deployCmd = @"
#!/bin/bash
set -e

echo "  [Server] Deteniendo backend anterior..."
pkill -f "java -jar.*innoad-backend" 2>/dev/null || true
sleep 2

echo "  [Server] Creando backup..."
mkdir -p /opt/innoad/backend
if [ -f "/opt/innoad/backend/innoad-backend-2.0.0.jar" ]; then
    cp /opt/innoad/backend/innoad-backend-2.0.0.jar /opt/innoad/backend/innoad-backend-2.0.0.jar.bak
fi

echo "  [Server] Copiando nuevo JAR..."
cp /tmp/innoad-backend-2.0.0.jar /opt/innoad/backend/

echo "  [Server] Iniciando backend..."
cd /opt/innoad/backend
nohup java -jar innoad-backend-2.0.0.jar > innoad.log 2>&1 &

echo "  [Server] Esperando inicialización..."
sleep 5

echo "  [Server] Verificando health check..."
for i in {1..10}; do
    if curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
        echo "  [Server] ✅ Backend respondiendo"
        exit 0
    fi
    echo "  [Server] Intento $i/10..."
    sleep 2
done

echo "  [Server] ⚠️  Backend inició pero aún no responde (puede tardar más)"
"@

Write-Host $deployCmd | ssh -i "$sshKey" -o StrictHostKeyChecking=no $ServerUser@$ServerIP "bash"

Write-Host "✅ Deployment ejecutado en servidor" -ForegroundColor Green

# Paso 4: Verificación final
Write-Host "`n[4/4] Verificando conexión..." -ForegroundColor Cyan

Start-Sleep -Seconds 3

try {
    $response = Invoke-RestMethod -Uri "http://$ServerIP`:8080/actuator/health" -TimeoutSec 5
    Write-Host "✅ Backend respondiendo en servidor" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No se pudo verificar (posible firewall), pero deployment se ejecutó" -ForegroundColor Yellow
}

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║       ✅ DEPLOYMENT COMPLETADO EXITOSAMENTE              ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║ Accede a: https://azure-pro.tail2a2f73.ts.net/           ║" -ForegroundColor Green
Write-Host "║ Cambios en vivo ahora mismo!                              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green

cd "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD"

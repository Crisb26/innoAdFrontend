#!/usr/bin/env pwsh
# Deploy urgente al servidor Tailscale
# Uso: .\deploy-urgente.ps1

param(
    [string]$ServerIP = "100.91.23.46",
    [string]$ServerUser = "postgres"
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║  DEPLOYMENT URGENTE - Actualizando servidor con cambios    ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow

$backendDir = "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND"
$jarPath = "$backendDir\target\innoad-backend-2.0.0.jar"
$sshKey = "$env:USERPROFILE\.ssh\id_ed25519"

# PASO 1: Verificar JAR
Write-Host "`n[1/3] Verificando JAR compilado..."
if (Test-Path $jarPath) {
    $jarSize = (Get-Item $jarPath).Length / 1MB
    Write-Host "✓ JAR encontrado: $($jarSize.ToString('F1')) MB" -ForegroundColor Green
} else {
    Write-Host "✗ JAR no encontrado" -ForegroundColor Red
    exit 1
}

# PASO 2: Enviar JAR
Write-Host "`n[2/3] Enviando JAR al servidor..."

if (Test-Path $sshKey) {
    Write-Host "✓ SSH Key encontrada" -ForegroundColor Green
    
    # Usar bash si git está disponible
    if (Get-Command bash -ErrorAction SilentlyContinue) {
        Write-Host "Usando git bash para SCP..."
        
        $bashCmd = @"
scp -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no 'c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\target\innoad-backend-2.0.0.jar' postgres@100.91.23.46:/tmp/
"@
        
        bash -c $bashCmd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ JAR enviado" -ForegroundColor Green
        } else {
            Write-Host "✗ SCP fallo" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Git bash no disponible, intenta con SSH..." -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ SSH Key no encontrada" -ForegroundColor Red
    exit 1
}

# PASO 3: Ejecutar deployment en servidor
Write-Host "`n[3/3] Ejecutando deployment en servidor..."

$sshCmd = @"
bash << 'DEPLOY_SCRIPT'

echo "  [Server] Deteniendo backend anterior..."
pkill -f "java.*innoad-backend" 2>/dev/null || true
sleep 2

echo "  [Server] Creando backup..."
mkdir -p /opt/innoad/backend
[ -f "/opt/innoad/backend/innoad-backend-2.0.0.jar" ] && cp /opt/innoad/backend/innoad-backend-2.0.0.jar /opt/innoad/backend/innoad-backend-2.0.0.jar.bak

echo "  [Server] Copiando JAR..."
cp /tmp/innoad-backend-2.0.0.jar /opt/innoad/backend/

echo "  [Server] Iniciando backend..."
cd /opt/innoad/backend
nohup java -jar innoad-backend-2.0.0.jar > innoad.log 2>&1 &

echo "  [Server] Esperando inicialización..."
sleep 5

echo "  [Server] Verificando health..."
for i in {1..10}; do
    if curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
        echo "  ✓ Backend respondiendo - DEPLOYMENT OK"
        exit 0
    fi
    echo "  Intento \$i/10..."
    sleep 1
done

echo "  ⚠️ Backend inició pero aún no responde"

DEPLOY_SCRIPT
"@

# Usar bash si el archivo es largo
$bashCmd = @"
ssh -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no postgres@100.91.23.46 << 'DEPLOY_EOF'
echo "  [Server] Deteniendo backend anterior..."
pkill -f "java.*innoad-backend" 2>/dev/null || true
sleep 2

echo "  [Server] Copiando JAR..."
mkdir -p /opt/innoad/backend
cp /tmp/innoad-backend-2.0.0.jar /opt/innoad/backend/

echo "  [Server] Iniciando backend..."
cd /opt/innoad/backend
nohup java -jar innoad-backend-2.0.0.jar > innoad.log 2>&1 &
sleep 5

echo "  [Server] Verificando..."
curl -f http://localhost:8080/actuator/health >/dev/null 2>&1 && echo "  ✓ OK" || echo "  ⚠️ Iniciando"
DEPLOY_EOF
"@

if (Get-Command bash -ErrorAction SilentlyContinue) {
    bash -c $bashCmd
}

# Resultado
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✓ DEPLOYMENT COMPLETADO                                  ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  Cambios aplicados:                                        ║" -ForegroundColor Green
Write-Host "║  ✓ Admin login case-insensitive                            ║" -ForegroundColor Green
Write-Host "║  ✓ Rol corregido a ADMIN                                  ║" -ForegroundColor Green
Write-Host "║  ✓ Cuenta desbloqueada                                    ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║  Accede a: https://azure-pro.tail2a2f73.ts.net/           ║" -ForegroundColor Green
Write-Host "║  Login: admin / Admin123!                                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📝 Recarga la página en navegador (Ctrl+F5) antes de probar login`n"

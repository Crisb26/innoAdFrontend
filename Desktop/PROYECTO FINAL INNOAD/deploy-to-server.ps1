# Script para deployar cambios automáticamente al servidor Tailscale
# Uso: .\deploy-to-server.ps1

param(
    [string]$ServerIP = "100.91.23.46",
    [string]$ServerUser = "postgres",
    [string]$SSHKey = "$env:USERPROFILE\.ssh\id_ed25519",
    [string]$ComponentType = "backend" # "backend", "frontend", o "both"
)

$ErrorActionPreference = "Stop"
$script:hasError = $false

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ ERROR: $Message" -ForegroundColor Red
    $script:hasError = $true
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

function Write-Section {
    param([string]$Title)
    Write-Host "`n================================" -ForegroundColor Yellow
    Write-Host "  $Title" -ForegroundColor Yellow
    Write-Host "================================" -ForegroundColor Yellow
}

function Test-SSHConnection {
    Write-Info "Verificando conexión SSH al servidor..."
    
    $sshCmd = "ssh -i `"$SSHKey`" -o StrictHostKeyChecking=no $ServerUser@$ServerIP `"echo 'SSH conectado correctamente'`""
    
    try {
        $output = Invoke-Expression $sshCmd 2>&1
        if ($output -like "*SSH conectado*") {
            Write-Success "Conexión SSH establec ida"
            return $true
        }
    } catch {
        Write-Error "No se pudo conectar por SSH: $_"
        return $false
    }
}

function Deploy-Backend {
    Write-Section "DEPLOYANDO BACKEND"
    
    Write-Info "Paso 1: Compilando backend..."
    
    $backendPath = "BACKEND"
    if (-not (Test-Path $backendPath)) {
        Write-Error "Carpeta BACKEND no encontrada en directorio actual"
        return $false
    }
    
    Push-Location $backendPath
    
    try {
        Write-Info "Ejecutando: mvn clean package -DskipTests"
        mvn clean package -DskipTests | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Maven compilation falló"
            Pop-Location
            return $false
        }
        
        Write-Success "Backend compilado exitosamente"
        
        if (-not (Test-Path "target\innoad-backend-2.0.0.jar")) {
            Write-Error "JAR no fue generado"
            Pop-Location
            return $false
        }
        
        Write-Info "Paso 2: Enviando JAR al servidor..."
        
        $jarFile = "target\innoad-backend-2.0.0.jar"
        $scpCmd = "scp -i `"$SSHKey`" -o StrictHostKeyChecking=no `"$jarFile`" ${ServerUser}@${ServerIP}:/tmp/"
        
        Invoke-Expression $scpCmd | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "JAR enviado al servidor"
        } else {
            Write-Error "Error al enviar JAR por SCP"
            Pop-Location
            return $false
        }
        
        Write-Info "Paso 3: Ejecutando deployment en servidor..."
        
        # Script de deployment en servidor
        $deployScript = @"
#!/bin/bash
set -e

echo "=== Backend Deployment EN SERVIDOR ==="

# Detener backend anterior
echo "Deteniendo backend anterior..."
pkill -f "java -jar.*innoad-backend" || true
sleep 2

# Backup del JAR anterior
if [ -f "/opt/innoad/backend/innoad-backend-2.0.0.jar" ]; then
    cp /opt/innoad/backend/innoad-backend-2.0.0.jar /opt/innoad/backend/innoad-backend-2.0.0.jar.bak
    echo "✅ Backup creado"
fi

# Copiar nuevo JAR
mkdir -p /opt/innoad/backend
cp /tmp/innoad-backend-2.0.0.jar /opt/innoad/backend/

echo "✅ JAR actualizado"

# Iniciar backend nuevo
cd /opt/innoad/backend
nohup java -jar innoad-backend-2.0.0.jar > innoad.log 2>&1 &

echo "✅ Backend iniciado"

# Esperar que inicie
sleep 5

# Verificar health check
echo "Verificando health check..."
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✅ Backend respondiendo correctamente"
else
    echo "⚠️ Esperando a que backend inicie completamente..."
    sleep 5
fi

echo "=== Deployment completado ==="
"@

        $sshCmd = "ssh -i `"$SSHKey`" -o StrictHostKeyChecking=no $ServerUser@$ServerIP"
        
        # Enviar script y ejecutarlo
        $deployScript | Invoke-Expression "$sshCmd `'bash`'" 2>&1 | Out-Null
        
        Write-Success "Backend actualizado en servidor"
        
        Pop-Location
        return $true
    }
    catch {
        Write-Error "Error durante deployment: $_"
        Pop-Location
        return $false
    }
}

function Deploy-Frontend {
    Write-Section "DEPLOYANDO FRONTEND"
    
    Write-Info "Paso 1: Compilando frontend..."
    
    $frontendPath = "FRONTEND\innoadFrontend"
    if (-not (Test-Path $frontendPath)) {
        Write-Error "Carpeta FRONTEND no encontrada"
        return $false
    }
    
    Push-Location $frontendPath
    
    try {
        Write-Info "Instalando dependencias..."
        npm install | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "npm install falló"
            Pop-Location
            return $false
        }
        
        Write-Info "Compilando con Vite..."
        npm run build | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "npm build falló"
            Pop-Location
            return $false
        }
        
        Write-Success "Frontend compilado exitosamente"
        
        Write-Info "Paso 2: Enviando archivos al servidor..."
        
        # Crear tarball
        tar -czf dist.tar.gz dist/
        
        $scpCmd = "scp -i `"$SSHKey`" -o StrictHostKeyChecking=no `"dist.tar.gz`" ${ServerUser}@${ServerIP}:/tmp/"
        
        Invoke-Expression $scpCmd | Out-Null
        
        Write-Success "Frontend enviado al servidor"
        
        Pop-Location
        
        Write-Info "Paso 3: Ejecutando deployment en servidor..."
        
        $sshCmd = "ssh -i `"$SSHKey`" -o StrictHostKeyChecking=no $ServerUser@$ServerIP"
        
        $cmd = "$sshCmd 'cd /opt/innoad/frontend && tar -xzf /tmp/dist.tar.gz --strip-components=1 && echo \"✅ Frontend actualizado\"'"
        
        Invoke-Expression $cmd 2>&1 | Out-Null
        
        Write-Success "Frontend actualizado en servidor"
        return $true
    }
    catch {
        Write-Error "Error durante deployment frontend: $_"
        Pop-Location
        return $false
    }
}

# MAIN
Write-Host "`n" -ForegroundColor Yellow
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║     DEPLOYMENT AUTOMÁTICO A SERVIDOR TAILSCALE             ║" -ForegroundColor Yellow
Write-Host "║     Servidor: $ServerIP                        ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow

# Verificar SSH
if (-not (Test-SSHConnection)) {
    exit 1
}

# Deploy
$deployBackend = $false
$deployFrontend = $false

switch ($ComponentType.ToLower()) {
    "backend" { 
        $deployBackend = $true
        Write-Info "Modo: Deployar BACKEND solamente"
    }
    "frontend" { 
        $deployFrontend = $true
        Write-Info "Modo: Deployar FRONTEND solamente"
    }
    "both" {
        $deployBackend = $true
        $deployFrontend = $true
        Write-Info "Modo: Deployar BACKEND y FRONTEND"
    }
    default {
        $deployBackend = $true
        Write-Info "Modo: Deployar BACKEND (default)"
    }
}

$startTime = Get-Date

if ($deployBackend) {
    if (-not (Deploy-Backend)) {
        Write-Error "Backend deployment falló"
    }
}

if ($deployFrontend) {
    if (-not (Deploy-Frontend)) {
        Write-Error "Frontend deployment falló"
    }
}

# Resultado final
$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Section "RESUMEN FINAL"

if (-not $script:hasError) {
    Write-Success "✅ Deployment completado exitosamente en $($duration.ToString('F1')) segundos"
    Write-Info "Accede a: https://azure-pro.tail2a2f73.ts.net/"
    exit 0
} else {
    Write-Error "❌ Deployment completado con errores (${duration} segundos)"
    exit 1
}

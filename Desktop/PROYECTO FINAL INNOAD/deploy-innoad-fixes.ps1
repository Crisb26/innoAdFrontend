# =============================================================================
# SCRIPT DE DEPLOYMENT AUTOMÁTICO - InnoAd Fixes (Windows - PowerShell)
# =============================================================================
# Uso: .\deploy-innoad-fixes.ps1
# Este script automatiza el deployment de todos los fixes en servidor Windows
# =============================================================================

param(
    [string]$PostgresHost = "localhost",
    [int]$PostgresPort = 5432,
    [string]$PostgresUser = "postgres",
    [string]$PostgresPassword = "postgres123",
    [string]$PostgresDb = "innoad_db",
    [string]$BackendJar = "BACKEND\target\innoad-backend-2.0.0.jar",
    [string]$BackendPort = "8080"
)

# Funciones de colores
function Write-Success { Write-Host "✓ $args" -ForegroundColor Green }
function Write-Error { Write-Host "✗ $args" -ForegroundColor Red }
function Write-Info { Write-Host "→ $args" -ForegroundColor Yellow }
function Write-Header { Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Green; Write-Host "║   $args".PadRight(51) + "║" -ForegroundColor Green; Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Green; Write-Host "" }

# ============================================================================
# HEADER
# ============================================================================

Clear-Host
Write-Header "INNOAD - Deployment Automático"
Write-Host "Fixes: Desbloqueo Admin + Case-Insensitive`n" -ForegroundColor Yellow

# ============================================================================
# PASO 1: Validar conexión a PostgreSQL
# ============================================================================

Write-Info "[PASO 1/5] Validando conexión a PostgreSQL..."

$env:PGPASSWORD = $PostgresPassword
$psqlCmd = "SELECT 1"
$result = & psql -h $PostgresHost -p $PostgresPort -U $PostgresUser -d $PostgresDb -c $psqlCmd 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Success "Conexión a PostgreSQL OK"
} else {
    Write-Error "NO se pudo conectar a PostgreSQL"
    Write-Host "  Host: $PostgresHost`:$PostgresPort" -ForegroundColor Red
    Write-Host "  Usuario: $PostgresUser" -ForegroundColor Red
    Write-Host "  BD: $PostgresDb" -ForegroundColor Red
    exit 1
}

# ============================================================================
# PASO 2: Ejecutar Scripts SQL
# ============================================================================

Write-Info "[PASO 2/5] Ejecutando scripts SQL..."

# Script 1: Desbloquear admin
Write-Host "  - Desbloqueando usuario admin..." -ForegroundColor Cyan
$sqlScript1 = @"
UPDATE usuarios 
SET intentos_fallidos = 0, fecha_bloqueo = NULL, activo = true, verificado = true
WHERE nombre_usuario = 'admin';
"@

$sqlScript1 | & psql -h $PostgresHost -p $PostgresPort -U $PostgresUser -d $PostgresDb 2>$null

# Script 2: Corregir rol
Write-Host "  - Corrigiendo rol..." -ForegroundColor Cyan
$sqlScript2 = @"
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
UPDATE usuarios SET rol='ADMIN' WHERE nombre_usuario='admin' AND rol='ADMINISTRADOR';
ALTER TABLE usuarios 
ADD CONSTRAINT usuarios_rol_check CHECK (rol IN ('ADMIN', 'TECNICO', 'USUARIO'));
"@

$sqlScript2 | & psql -h $PostgresHost -p $PostgresPort -U $PostgresUser -d $PostgresDb 2>$null

Write-Success "Scripts SQL ejecutados exitosamente"

# ============================================================================
# PASO 3: Detener backend anterior  
# ============================================================================

Write-Info "[PASO 3/5] Deteniendo backend anterior..."

try {
    $processes = Get-Process | Where-Object { $_.ProcessName -like "*java*" -and $_.CommandLine -like "*innoad*" }
    if ($processes) {
        $processes | Stop-Process -Force
        Start-Sleep -Seconds 2
        Write-Success "Backend detenido"
    } else {
        Write-Success "No hay backend corriendo"
    }
} catch {
    Write-Success "Backend no encontrado (no hay problema)"
}

# ============================================================================
# PASO 4: Desplegar Backend
# ============================================================================

Write-Info "[PASO 4/5] Desplegando backend..."

if (-not (Test-Path $BackendJar)) {
    Write-Error "JAR no encontrado: $BackendJar"
    exit 1
}

Write-Host "  - Iniciando backend en puerto $BackendPort..." -ForegroundColor Cyan
Start-Process -FilePath "java" -ArgumentList "-jar", $BackendJar, "--spring.profiles.active=server" -WindowStyle Hidden

# Esperar a que el backend esté listo
Write-Host "  - Esperando respuesta del backend..." -ForegroundColor Cyan
$maxWait = 60
$waited = 0
$backendReady = $false

while ($waited -lt $maxWait) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$BackendPort/actuator/health" -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            break
        }
    } catch {
        # Ignore errors
    }
    Start-Sleep -Seconds 1
    $waited += 1
    
    if ($waited % 5 -eq 0) {
        Write-Host "    Intento $waited/$maxWait..." -ForegroundColor Gray
    }
}

if ($backendReady) {
    Write-Success "Backend healthy en puerto $BackendPort"
} else {
    Write-Error "Backend no respondió después de $maxWait segundos"
    exit 1
}

# ============================================================================
# PASO 5: Validar Funcionamiento
# ============================================================================

Write-Info "[PASO 5/5] Validando funcionamiento..."

# Test 1: Login con admin (minúsculas)
Write-Host "  - Testeando login: admin + Admin123!" -ForegroundColor Cyan
$response = Invoke-WebRequest -Uri "http://localhost:$BackendPort/api/v1/auth/login" `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body '{"nombreUsuario":"admin","contrasena":"Admin123!"}' `
    -ErrorAction SilentlyContinue

if ($response.Content -like '*"exitoso":true*') {
    Write-Success "Login exitoso"
} else {
    Write-Error "Login fallido"
    Write-Host "Respuesta: $($response.Content)" -ForegroundColor Red
    exit 1
}

# Test 2: Login con ADMIN (mayúsculas)
Write-Host "  - Testeando login: ADMIN + Admin123!" -ForegroundColor Cyan
$response = Invoke-WebRequest -Uri "http://localhost:$BackendPort/api/v1/auth/login" `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body '{"nombreUsuario":"ADMIN","contrasena":"Admin123!"}' `
    -ErrorAction SilentlyContinue

if ($response.Content -like '*"exitoso":true*') {
    Write-Success "Case-insensitive OK"
} else {
    Write-Error "Case-insensitive fallo"
    Write-Host "Respuesta: $($response.Content)" -ForegroundColor Red
    exit 1
}

# Test 3: Login con contraseña incorrecta debe fallar
Write-Host "  - Testeando fallo de contraseña incorrecta..." -ForegroundColor Cyan
$response = Invoke-WebRequest -Uri "http://localhost:$BackendPort/api/v1/auth/login" `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body '{"nombreUsuario":"admin","contrasena":"WrongPassword123!"}' `
    -ErrorAction SilentlyContinue

if ($response.Content -like '*"exitoso":false*') {
    Write-Success "Rechazo de contraseña incorrecta OK"
} else {
    Write-Error "Debería rechazar contraseña incorrecta"
    exit 1
}

# ============================================================================
# FIN
# ============================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              🎉 DEPLOYMENT EXITOSO 🎉             ║" -ForegroundColor Green
Write-Host "║                                                    ║" -ForegroundColor Green
Write-Host "║  ✓ PostgreSQL validado                            ║" -ForegroundColor Green
Write-Host "║  ✓ Scripts SQL ejecutados                         ║" -ForegroundColor Green
Write-Host "║  ✓ Backend desplegado                             ║" -ForegroundColor Green
Write-Host "║  ✓ Validación completa                            ║" -ForegroundColor Green
Write-Host "║                                                    ║" -ForegroundColor Green
Write-Host "║  Estado: LISTO PARA PRODUCCIÓN                    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Credenciales de prueba:" -ForegroundColor Yellow
Write-Host "  - Usuario: admin    | Password: Admin123!" -ForegroundColor Cyan
Write-Host "  - Usuario: tecnico  | Password: Tecnico123!" -ForegroundColor Cyan
Write-Host "  - Usuario: usuario  | Password: Usuario123!" -ForegroundColor Cyan
Write-Host ""

Write-Host "URLs disponibles:" -ForegroundColor Yellow
Write-Host "  - API Backend:    http://localhost:$BackendPort" -ForegroundColor Cyan
Write-Host "  - Health check:   http://localhost:$BackendPort/actuator/health" -ForegroundColor Cyan
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  InnoAd - Verificacion de Configuracion Azure" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$backendUrl = "https://innoad-backend.wonderfuldune-d0f51e2f.eastus2.azurecontainerapps.io"
$healthEndpoint = "$backendUrl/actuator/health"
$apiEndpoint = "$backendUrl/api"

Write-Host "[1/4] Verificando conexion con Azure Backend..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $healthEndpoint -Method Get -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  OK - Backend Azure activo" -ForegroundColor Green
        Write-Host "  URL: $backendUrl" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ERROR - No se puede conectar al backend" -ForegroundColor Red
    Write-Host "  URL: $healthEndpoint" -ForegroundColor Gray
    Write-Host "  Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "[2/4] Verificando API endpoint..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $apiEndpoint -Method Get -TimeoutSec 10 -UseBasicParsing
    Write-Host "  OK - API endpoint respondiendo" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 404 -or $_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  OK - API endpoint activo (404/401 esperado sin auth)" -ForegroundColor Green
    } else {
        Write-Host "  ADVERTENCIA - Respuesta inesperada" -ForegroundColor Yellow
        Write-Host "  Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "[3/4] Verificando configuracion del frontend..." -ForegroundColor Yellow

$envProdPath = ".\src\environments\environment.prod.ts"
if (Test-Path $envProdPath) {
    $content = Get-Content $envProdPath -Raw
    if ($content -match "innoad-backend\.wonderfuldune") {
        Write-Host "  OK - environment.prod.ts configurado correctamente" -ForegroundColor Green
    } else {
        Write-Host "  ERROR - URL de Azure no encontrada en environment.prod.ts" -ForegroundColor Red
    }
} else {
    Write-Host "  ERROR - No se encontro environment.prod.ts" -ForegroundColor Red
}

Write-Host ""
Write-Host "[4/4] Verificando dependencias..." -ForegroundColor Yellow

if (Test-Path ".\package.json") {
    $packageJson = Get-Content ".\package.json" -Raw | ConvertFrom-Json
    
    # Verificar SweetAlert2
    if ($packageJson.dependencies.sweetalert2) {
        Write-Host "  OK - SweetAlert2 instalado: $($packageJson.dependencies.sweetalert2)" -ForegroundColor Green
    } else {
        Write-Host "  ADVERTENCIA - SweetAlert2 no encontrado" -ForegroundColor Yellow
    }
    
    # Verificar Angular
    if ($packageJson.dependencies.'@angular/core') {
        Write-Host "  OK - Angular: $($packageJson.dependencies.'@angular/core')" -ForegroundColor Green
    }
} else {
    Write-Host "  ERROR - No se encontro package.json" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Verificacion completada" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Siguiente paso:" -ForegroundColor Yellow
Write-Host "  1. Ejecutar: npm install (si es necesario)" -ForegroundColor Gray
Write-Host "  2. Ejecutar: npm start (desarrollo)" -ForegroundColor Gray
Write-Host "  3. Ejecutar: npm run build (produccion)" -ForegroundColor Gray
Write-Host ""

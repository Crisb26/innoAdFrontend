# Script de Desarrollo Frontend InnoAd para PowerShell
# Ejecutar con: .\dev-frontend.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  DESARROLLO LOCAL FRONTEND INNOAD" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Directorio del proyecto
$PROYECTO_DIR = "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\innoadFrontend"

Write-Host "[1/4] Navegando al directorio del proyecto..." -ForegroundColor Yellow
Set-Location $PROYECTO_DIR
Write-Host "Directorio actual: $(Get-Location)" -ForegroundColor Green

Write-Host ""
Write-Host "[2/4] Verificando Node.js y npm..." -ForegroundColor Yellow
node --version
npm --version

Write-Host ""
Write-Host "[3/4] Verificando dependencias..." -ForegroundColor Yellow
if (-Not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm ci
} else {
    Write-Host "Dependencias ya instaladas. Saltando..." -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  INICIANDO SERVIDOR DE DESARROLLO" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✓ Servidor Angular iniciará en: " -NoNewline -ForegroundColor Green
Write-Host "http://localhost:4200" -ForegroundColor Cyan
Write-Host "✓ Proxy API/WebSocket a:      " -NoNewline -ForegroundColor Green
Write-Host "http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE: " -NoNewline -ForegroundColor Yellow
Write-Host "Asegúrate de que el backend esté corriendo en localhost:8080"
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Gray
Write-Host ""
Write-Host "[4/4] Iniciando servidor con proxy..." -ForegroundColor Yellow
Write-Host ""

# Iniciar servidor Angular con proxy
npm run iniciar:proxy

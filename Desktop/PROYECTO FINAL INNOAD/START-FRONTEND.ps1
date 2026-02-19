#!/usr/bin/env pwsh

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Iniciando InnoAd FRONTEND         ║" -ForegroundColor Cyan
Write-Host "║        Angular 19 + TypeScript        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend"

Set-Location $frontendPath

Write-Host "[1/2] Verificando dependencias..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando npm packages..." -ForegroundColor Yellow
    npm install
}

Write-Host "[2/2] Iniciando servidor Angular..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 Frontend URL: http://localhost:4200" -ForegroundColor Green
Write-Host "🔗 Backend API:  http://localhost:8080" -ForegroundColor Green
Write-Host ""
Write-Host "El navegador debería abrir automáticamente..." -ForegroundColor Yellow
Write-Host ""

ng serve --port 4200 --open

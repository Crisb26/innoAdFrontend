#!/usr/bin/env pwsh

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Iniciando InnoAd BACKEND 2.0       ║" -ForegroundColor Cyan
Writetml "║        Spring Boot 3.5.8 + Java 21     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$backendPath = "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend"

Set-Location $backendPath

Write-Host "[1/3] Limpiando compilación anterior..." -ForegroundColor Yellow
mvn clean -q

Write-Host "[2/3] Compilando aplicación..." -ForegroundColor Yellow
mvn compile -q

if (-not $?) {
    Write-Host "ERROR: Compilación fallida" -ForegroundColor Red
    exit 1
}

Write-Host "[3/3] Iniciando Spring Boot..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 Backend URL: http://localhost:8080" -ForegroundColor Green
Write-Host "📚 Swagger UI:  http://localhost:8080/swagger-ui.html" -ForegroundColor Green
Write-Host "📊 Health:      http://localhost:8080/api/health" -ForegroundColor Green
Write-Host ""

mvn spring-boot:run

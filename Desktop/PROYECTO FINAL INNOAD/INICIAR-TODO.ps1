#!/usr/bin/env pwsh

Clear-Host

Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║       🚀 INNOAD FULL STACK - LOCAL DEPLOY       ║" -ForegroundColor Magenta
Write-Host "║                                                  ║" -ForegroundColor Magenta
Write-Host "║  Backend:  Spring Boot 3.5.8 + Java 21 LTS      ║" -ForegroundColor Magenta
Write-Host "║  Frontend: Angular 19 + TypeScript              ║" -ForegroundColor Magenta
Write-Host "║  Database: PostgreSQL 17.6                      ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Magenta

Write-Host ""
Write-Host "⚠️  Este script abrirá dos ventanas de terminal" -ForegroundColor Yellow
Write-Host "    - Terminal 1: Backend (puerto 8080)" -ForegroundColor Yellow
Write-Host "    - Terminal 2: Frontend (puerto 4200)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Esperando confirmación..." -ForegroundColor Cyan

Pause

Write-Host ""
Write-Host "▶️  Abriendo Backend..." -ForegroundColor Green
Start-Process PowerShell -ArgumentList "-NoExit -File 'c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\START-BACKEND.ps1'"

Write-Host "Esperando 45 segundos para que el backend se inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 45

Write-Host ""
Write-Host "▶️  Abriendo Frontend..." -ForegroundColor Green
Start-Process PowerShell -ArgumentList "-NoExit -File 'c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\START-FRONTEND.ps1'"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         ✅ AMBAS APLICACIONES INICIADAS         ║" -ForegroundColor Green
Write-Host "╠══════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║                                                  ║" -ForegroundColor Green
Write-Host "║  📱 Frontend:  http://localhost:4200            ║" -ForegroundColor Green
Write-Host "║  🔧 Backend:   http://localhost:8080            ║" -ForegroundColor Green
Write-Host "║  📚 Swagger:   /swagger-ui.html                 ║" -ForegroundColor Green
Write-Host "║  💾 Database:  PostgreSQL local                 ║" -ForegroundColor Green
Write-Host "║                                                  ║" -ForegroundColor Green
Write-Host "║  Próximos pasos:                                ║" -ForegroundColor Green
Write-Host "║  1. Abre http://localhost:4200 en el navegador  ║" -ForegroundColor Green
Write-Host "║  2. Haz clic en 'Iniciar Sesión'               ║" -ForegroundColor Green
Write-Host "║  3. Verifica credenciales de demostración       ║" -ForegroundColor Green
Write-Host "║  4. Explora el Dashboard y módulos             ║" -ForegroundColor Green
Write-Host "║                                                  ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host ""
Write-Host "Este script permanecerá abierto. Puedes cerrarlo en cualquier momento." -ForegroundColor Cyan

Pause

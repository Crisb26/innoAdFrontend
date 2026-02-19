# Script para iniciar backend y frontend
$backendPath = "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend"
$frontendPath = "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend"

Write-Host "╔════════════════════════════════════════╗"
Write-Host "║  INICIANDO INNOAD BACKEND + FRONTEND   ║"
Write-Host "╚════════════════════════════════════════╝`n"

# Iniciar Backend
Write-Host "1. Iniciando BACKEND en puerto 8080..."
Push-Location $backendPath
Start-Process -NoNewWindow -FilePath "mvn" -ArgumentList "spring-boot:run"
Pop-Location

# Esperar a que el backend esté listo
Write-Host "   Esperando que el backend inicie (30 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Iniciar Frontend
Write-Host "`n2. Iniciando FRONTEND en puerto 4200..."
Push-Location $frontendPath
Start-Process -NoNewWindow -FilePath "ng" -ArgumentList "serve", "--port", "4200"
Pop-Location

Write-Host "`n3. Abriendo navegador..."
Start-Sleep -Seconds 10
Start-Process "http://localhost:4200"

Write-Host "`n✅ AMBAS APLICACIONES EN EJECUCIÓN:"
Write-Host "   📱 Frontend: http://localhost:4200"
Write-Host "   🔧 Backend:  http://localhost:8080"
Write-Host "   📚 Swagger:  http://localhost:8080/swagger-ui.html`n"

Write-Host "Presiona Enter para terminar..." -ForegroundColor Cyan
Read-Host

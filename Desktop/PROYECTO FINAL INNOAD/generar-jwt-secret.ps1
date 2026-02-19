# ============================================================================
# Script PowerShell: Generar JWT_SECRET seguro
# ============================================================================
# Ejecutar con: .\generar-jwt-secret.ps1
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Generador de JWT_SECRET para InnoAd" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Generar 64 bytes aleatorios y convertir a Base64
$bytes = New-Object byte[] 64
$rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::Create()
$rng.GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)

Write-Host "Tu JWT_SECRET seguro es:" -ForegroundColor Green
Write-Host ""
Write-Host $secret -ForegroundColor Yellow
Write-Host ""
Write-Host "Copia este valor y pégalo en tu archivo .env.server" -ForegroundColor Cyan
Write-Host "Variable: JWT_SECRET=$secret" -ForegroundColor Gray
Write-Host ""

# Opcional: copiar al portapapeles (requiere Windows)
try {
    Set-Clipboard -Value $secret
    Write-Host "✓ Secreto copiado al portapapeles" -ForegroundColor Green
} catch {
    Write-Host "⚠ No se pudo copiar al portapapeles automáticamente" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Presiona Enter para salir..."
Read-Host

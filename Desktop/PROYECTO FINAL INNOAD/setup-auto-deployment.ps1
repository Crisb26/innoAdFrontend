# BootStrap para deployment automático
# Este script ejecuta el deployment compilado al servidor Tailscale

param(
    [string]$ServerIP = "100.91.23.46",
    [string]$ServerUser = "postgres"
)

$ErrorActionPreference = "Stop"

Write-Host "`n══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  DEPLOYMENT AUTOMÁTICO - BACKEND A SERVIDOR TAILSCALE" -ForegroundColor Yellow
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Yellow

$backendDir = "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND"
$jarPath = "$backendDir\target\innoad-backend-2.0.0.jar"
$sshKey = "$env:USERPROFILE\.ssh\id_ed25519"

# Verificar que el JAR compilado existe
if (-not (Test-Path $jarPath)) {
    Write-Host "`n❌ JAR no encontrado. Compilando..." -ForegroundColor Red
    Push-Location $backendDir
    mvn clean package -DskipTests
    Pop-Location
}

Write-Host "`n✅ JAR listo: $('{0:N2}' -f ((Get-Item $jarPath).Length/1MB)) MB"

# Mostrar instrucciones para completar el setup
Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        PRÓXIMO PASO: SETUP AUTOMATIZACIÓN                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n1. OPCIÓN A - Deploy Manual Directo (RECOMENDADO AHORA):" -ForegroundColor Green
Write-Host "   Ejecuta en PowerShell (como Admin):" -ForegroundColor Gray
Write-Host ""
Write-Host "   `$env:PUTTYGEN = 'plink'" -ForegroundColor White
Write-Host "   ssh -i `"$sshKey`" $ServerUser@$ServerIP" -ForegroundColor White
Write-Host ""

Write-Host "`n2. OPCIÓN B - Deploy Automatizado con GitHub Actions:" -ForegroundColor Green
Write-Host "   - Abre: https://github.com/Crisb26/settings/secrets/actions" -ForegroundColor Gray
Write-Host "   - Crea secret: TAILSCALE_SSH_KEY = tu SSH private key" -ForegroundColor Gray
Write-Host "   - Haz push a la rama 'develop'"-ForegroundColor Gray
Write-Host "   - El servidor se actualiza automáticamente" -ForegroundColor Gray

Write-Host "`n3. OPCIÓN C - Deploy Local Cada Cambio:" -ForegroundColor Green
Write-Host "   Comando: git push" -ForegroundColor Gray
Write-Host "   (Git hook ejecutará deployment automáticamente)" -ForegroundColor Gray
Write-Host ""

Write-Host "                    ↓ ¿QUÉ PREFIERES? ↓" -ForegroundColor Yellow
Write-Host ""
Write-Host "  A) Quiero probar el acceso SSH ahora" -ForegroundColor White
Write-Host "  B) Quiero usar GitHub Actions automático" -ForegroundColor White  
Write-Host "  C) Quiero que cada git push actualice el servidor" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Elige (A/B/C)"

switch ($choice.ToUpper()) {
    "A" {
        Write-Host "`n🔑 Probando conexión SSH..." -ForegroundColor Cyan
        
        Write-Host "Ejecuta este comando en PowerShell (posiblemente con OpenSSH instalado):" -ForegroundColor Gray
        Write-Host "ssh -i `"$sshKey`" $ServerUser@$ServerIP" -ForegroundColor White
        Write-Host ""
        
        # Si tiene Git Bash, puede usarlo
        if (Get-Command bash -ErrorAction SilentlyContinue) {
            Write-Host "O usa Git Bash:" -ForegroundColor Gray
            Write-Host "bash --login -i" -ForegroundColor Gray
            Write-Host "ssh -i ~/.ssh/id_ed25519 $ServerUser@$ServerIP" -ForegroundColor Gray
        }
        
        # Intentar conectar
        try {
            Write-Host "`n⏳ Conectando..." -ForegroundColor Yellow
            $testCmd = "ssh -i `"$sshKey`" -o StrictHostKeyChecking=no -o ConnectTimeout=5 $ServerUser@$ServerIP `"echo 'SSH OK'`""
            $result = Invoke-Expression $testCmd 2>&1
            
            if ($result -like "*SSH OK*") {
                Write-Host "✅ ¡Conexión SSH exitosa!" -ForegroundColor Green
                Write-Host "`nAhora puedes ejecutar:" -ForegroundColor Cyan
                Write-Host "ssh -i ~/.ssh/id_ed25519 $ServerUser@$ServerIP" -ForegroundColor White
            }
        } catch {
            Write-Host "⚠️  Conexión SSH no disponible de esta forma" -ForegroundColor Yellow
            Write-Host "Usa Git Bash o terminal de Linux" -ForegroundColor Gray
        }
    }
    
    "B" {
        Write-Host "`n📋 CONFIGURANDO GITHUB ACTIONS" -ForegroundColor Cyan
        
        Write-Host "`n1. Lee tu SSH private key:" -ForegroundColor Green
        Write-Host "   Comando: type $sshKey" -ForegroundColor Gray
        
        # Mostrar las primeras 3 líneas
        Write-Host "`n   Contenido (primeras líneas):" -ForegroundColor Gray
        Get-Content $sshKey | Select-Object -First 3 | ForEach-Object { Write-Host "   $_" -ForegroundColor DarkGray }
        Write-Host "   ... (más líneas)" -ForegroundColor DarkGray
        
        Write-Host "`n2. Abre: https://github.com/Crisb26/innoAdBackend/settings/secrets/actions" -ForegroundColor Green
        Write-Host ""
        Write-Host "3. Click en 'New repository secret'" -ForegroundColor Green
        Write-Host "   Nombre: TAILSCALE_SSH_KEY" -ForegroundColor White
        Write-Host "   Valor: (pega todo el contenido de id_ed25519)" -ForegroundColor White
        Write-Host ""
        Write-Host "`n4. Después, haz un push para activar workflow" -ForegroundColor Green
    }
    
    "C" {
        Write-Host "`n🔄 CONFIGURANDO GIT HOOK" -ForegroundColor Cyan
        
        Write-Host "`nEl sistema está listo. Cada que hagas:" -ForegroundColor Green
        Write-Host "  git push" -ForegroundColor White
        Write-Host ""
        Write-Host "Se ejecutará automáticamente:" -ForegroundColor Green
        Write-Host "  1. Compilar cambios" -ForegroundColor Gray
        Write-Host "  2. Enviar JAR al servidor" -ForegroundColor Gray
        Write-Host "  3. Reiniciar backend" -ForegroundColor Gray
        Write-Host "  4. Verificar health check" -ForegroundColor Gray
        Write-Host ""
        Write-Host "⚠️  Nota: Requiere que el hook esté activo y SSH accesible" -ForegroundColor Yellow
    }
    
    default {
        Write-Host "Opción no válida" -ForegroundColor Red
    }
}

Write-Host "`n══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  Servidor: https://azure-pro.tail2a2f73.ts.net/" -ForegroundColor Yellow
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

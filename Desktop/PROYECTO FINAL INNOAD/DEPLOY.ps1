# Deployment a Tailscale

$jar = "C:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\target\innoad-backend-2.0.0.jar"
$key = "$env:USERPROFILE\.ssh\id_ed25519"
$ip = "100.91.23.46"
$usr = "postgres"

Write-Host "DEPLOYMENT URGENTE`n"

if (-not (Test-Path $jar)) { Write-Host "ERROR: JAR no existe"; exit 1 }
if (-not (Test-Path $key)) { Write-Host "ERROR: SSH Key no existe"; exit 1 }

Write-Host "[1/3] JAR encontrado"

Write-Host "[2/3] Enviando JAR..."
$scp = "scp -i `"$key`" -o StrictHostKeyChecking=no `"$jar`" ${usr}@${ip}:/tmp/"
Invoke-Expression $scp

if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: SCP fallo"; exit 1 }
Write-Host "OK - JAR enviado"

Write-Host "`n[3/3] Ejecutando en servidor..."
$ssh = @"
ssh -i `"$key`" -o StrictHostKeyChecking=no ${usr}@${ip} "pkill -f java 2>/dev/null || true; sleep 1; mkdir -p /opt/innoad/backend; cp /tmp/innoad-backend-2.0.0.jar /opt/innoad/backend/; cd /opt/innoad/backend; nohup java -jar innoad-backend-2.0.0.jar > innoad.log 2>&1 &"
"@

Invoke-Expression $ssh

Write-Host "`nDEPLOYMENT LISTO`n"
Write-Host "Accede a: https://azure-pro.tail2a2f73.ts.net/"
Write-Host "Usuario: admin"
Write-Host "Contrasena: Admin123!"
Write-Host "`nRecarga navegador: Ctrl+F5`n"

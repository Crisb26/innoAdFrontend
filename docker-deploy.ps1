# Script PowerShell para construir y publicar imagen Docker de InnoAd Frontend
# Uso: .\docker-deploy.ps1 [-Version "2.0.0"] [-DockerUsername "tu-usuario"] [-BuildConfig "production"]

param(
    [Parameter(Mandatory=$false)]
    [string]$Version = "latest",
    
    [Parameter(Mandatory=$false)]
    [string]$DockerUsername = $env:DOCKER_USERNAME,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("production", "compose")]
    [string]$BuildConfig = "production"
)

# Colores para output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

$ImageName = "innoad-frontend"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  InnoAd Frontend - Docker Deploy" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Solicitar nombre de usuario si no está configurado
if ([string]::IsNullOrEmpty($DockerUsername)) {
    $DockerUsername = Read-Host "Ingresa tu nombre de usuario de Docker Hub"
}

# Verificar que Docker está instalado
Write-Host "🔍 Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Construir la imagen
Write-Host "🔨 Construyendo imagen Docker..." -ForegroundColor Yellow
Write-Host "Imagen: $DockerUsername/$ImageName`:$Version" -ForegroundColor Cyan
Write-Host "Build Config: $BuildConfig" -ForegroundColor Cyan
Write-Host ""

try {
    docker build `
        --build-arg BUILD_CONFIGURATION=$BuildConfig `
        -t "${ImageName}:${Version}" `
        -t "${ImageName}:latest" `
        .
    
    Write-Host "✓ Imagen construida exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al construir la imagen" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Mostrar tamaño de la imagen
Write-Host "📊 Información de la imagen:" -ForegroundColor Yellow
docker images $ImageName`:$Version
Write-Host ""

# Etiquetar para Docker Hub
Write-Host "🏷️  Etiquetando imagen para Docker Hub..." -ForegroundColor Yellow
docker tag "${ImageName}:${Version}" "${DockerUsername}/${ImageName}:${Version}"
docker tag "${ImageName}:${Version}" "${DockerUsername}/${ImageName}:latest"
Write-Host "✓ Imagen etiquetada" -ForegroundColor Green
Write-Host ""

# Login a Docker Hub
Write-Host "🔐 Iniciando sesión en Docker Hub..." -ForegroundColor Yellow
try {
    docker login
    Write-Host "✓ Login exitoso" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al iniciar sesión en Docker Hub" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Push a Docker Hub
Write-Host "📤 Subiendo imagen a Docker Hub..." -ForegroundColor Yellow
Write-Host "Subiendo ${DockerUsername}/${ImageName}:${Version}" -ForegroundColor Cyan

try {
    docker push "${DockerUsername}/${ImageName}:${Version}"
    Write-Host ""
    Write-Host "Subiendo ${DockerUsername}/${ImageName}:latest" -ForegroundColor Cyan
    docker push "${DockerUsername}/${ImageName}:latest"
    Write-Host "✓ Imagen subida exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al subir la imagen" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Limpiar imágenes antiguas (opcional)
$cleanup = Read-Host "🧹 ¿Deseas limpiar imágenes antiguas? (y/n)"
if ($cleanup -eq 'y' -or $cleanup -eq 'Y') {
    docker image prune -f
    Write-Host "✓ Limpieza completada" -ForegroundColor Green
}
Write-Host ""

# Resumen final
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ Deploy Completado Exitosamente" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Imagen publicada: " -NoNewline
Write-Host "${DockerUsername}/${ImageName}:${Version}" -ForegroundColor Blue
Write-Host "También disponible como: " -NoNewline
Write-Host "${DockerUsername}/${ImageName}:latest" -ForegroundColor Blue
Write-Host ""
Write-Host "Para usar la imagen en otro servidor:" -ForegroundColor Yellow
Write-Host "docker pull ${DockerUsername}/${ImageName}:${Version}" -ForegroundColor Cyan
Write-Host "docker run -d -p 80:80 ${DockerUsername}/${ImageName}:${Version}" -ForegroundColor Cyan
Write-Host ""

# Preguntar si desea ejecutar localmente
$runLocal = Read-Host "🚀 ¿Deseas ejecutar el contenedor localmente ahora? (y/n)"
if ($runLocal -eq 'y' -or $runLocal -eq 'Y') {
    Write-Host "Deteniendo contenedor anterior si existe..." -ForegroundColor Yellow
    docker stop $ImageName 2>$null
    docker rm $ImageName 2>$null
    
    Write-Host "Iniciando nuevo contenedor..." -ForegroundColor Yellow
    docker run -d -p 80:80 --name $ImageName "${DockerUsername}/${ImageName}:${Version}"
    
    Write-Host ""
    Write-Host "✓ Contenedor iniciado exitosamente" -ForegroundColor Green
    Write-Host "Accede a la aplicación en: " -NoNewline
    Write-Host "http://localhost" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Ver logs: " -NoNewline
    Write-Host "docker logs -f $ImageName" -ForegroundColor Cyan
}

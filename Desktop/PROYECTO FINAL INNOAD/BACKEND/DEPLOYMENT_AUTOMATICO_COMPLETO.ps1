#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Script de deployment automático para INNOAD Fase 4
.DESCRIPTION
    Compila backend y frontend, construye imágenes Docker
.NOTES
    Autor: INNOAD Team
    Versión: 2.0
    Requiere: Docker, Java 21, Maven, Node.js
#>

param(
    [switch]$SkipVerification,
    [switch]$BuildOnly,
    [switch]$Interactive = $true
)

$ErrorActionPreference = "Stop"
$WarningPreference = "Continue"

# Colores para output
$Colors = @{
    Success = 'Green'
    Error   = 'Red'
    Warning = 'Yellow'
    Info    = 'Cyan'
}

function Write-Log {
    param([string]$Message, [string]$Level = 'Info')
    
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $Color = $Colors[$Level]
    
    Write-Host "[$Timestamp] [$Level] $Message" -ForegroundColor $Color
}

function Test-Tool {
    param([string]$ToolName, [string]$Command)
    
    Write-Log "Verificando $ToolName..."
    
    try {
        $version = & $Command 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Log "$ToolName está instalado" 'Success'
            return $true
        }
    } catch {
        Write-Log "$ToolName NO está instalado" 'Error'
        return $false
    }
}

function Build-Maven {
    Write-Log "Compilando con Maven..." 'Info'
    
    $BackendDir = "C:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend"
    
    Push-Location $BackendDir
    try {
        & mvn clean install -DskipTests -q -T 1C
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Error en compilación Maven" 'Error'
            return $false
        }
        Write-Log "Maven compilado exitosamente" 'Success'
        return $true
    } finally {
        Pop-Location
    }
}

function Build-Npm {
    Write-Log "Compilando con npm..." 'Info'
    
    $FrontendDir = "C:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend"
    
    Push-Location $FrontendDir
    try {
        # Instalar dependencias si no existen
        if (-not (Test-Path "node_modules")) {
            Write-Log "Instalando dependencias npm..." 'Info'
            & npm install -q
        }
        
        # Build para producción
        & npm run build -- --configuration production -q
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Error en compilación npm" 'Error'
            return $false
        }
        
        Write-Log "npm compilado exitosamente" 'Success'
        return $true
    } finally {
        Pop-Location
    }
}

function Build-Docker {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Tag = "v2.0"
    )
    
    Write-Log "Construyendo imagen Docker: $Name..." 'Info'
    
    Push-Location $Path
    try {
        $ImageName = "innoad-$Name`:$Tag"
        
        & docker build -t $ImageName . --no-cache -q
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Error construyendo imagen $ImageName" 'Error'
            return $false
        }
        
        Write-Log "Imagen $ImageName creada exitosamente" 'Success'
        return $true
    } finally {
        Pop-Location
    }
}

# Main Script
function Main {
    Clear-Host
    
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║        DEPLOYMENT AUTOMÁTICO INNOAD FASE 4 (PowerShell)        ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    # SECCIÓN 1: Verificaciones
    if (-not $SkipVerification) {
        Write-Log "SECCIÓN 1: Verificando herramientas..." 'Info'
        Write-Host ""
        
        $allOk = $true
        
        if (-not (Test-Tool "Docker" "docker" "--version")) { $allOk = $false }
        if (-not (Test-Tool "Java" "java" "-version")) { $allOk = $false }
        if (-not (Test-Tool "Maven" "mvn" "--version")) { $allOk = $false }
        if (-not (Test-Tool "Node.js" "node" "--version")) { $allOk = $false }
        if (-not (Test-Tool "npm" "npm" "--version")) { $allOk = $false }
        
        Write-Host ""
        
        if (-not $allOk) {
            Write-Log "No todas las herramientas están disponibles" 'Error'
            Write-Log "Ejecuta: 00-verificar-todo.bat para más detalles" 'Warning'
            exit 1
        }
        
        Write-Log "Todas las herramientas verificadas" 'Success'
        Write-Host ""
    }
    
    # SECCIÓN 2: Compilación Maven
    Write-Log "SECCIÓN 2: Compilación Maven..." 'Info'
    Write-Host ""
    
    $StartTime = Get-Date
    
    if (-not (Build-Maven)) {
        exit 1
    }
    
    Write-Host ""
    
    # SECCIÓN 3: Compilación npm
    Write-Log "SECCIÓN 3: Compilación npm..." 'Info'
    Write-Host ""
    
    if (-not (Build-Npm)) {
        exit 1
    }
    
    Write-Host ""
    
    # SECCIÓN 4: Docker
    Write-Log "SECCIÓN 4: Construcción Docker..." 'Info'
    Write-Host ""
    
    $BackendDir = "C:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend"
    $FrontendDir = "C:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend"
    
    if (-not (Build-Docker -Name "backend" -Path $BackendDir)) {
        exit 1
    }
    
    Write-Host ""
    
    if (-not (Build-Docker -Name "frontend" -Path $FrontendDir)) {
        exit 1
    }
    
    Write-Host ""
    
    # SECCIÓN 5: Verificar imágenes
    Write-Log "Imágenes Docker construidas:" 'Info'
    Write-Host ""
    
    & docker images | Select-String "innoad"
    
    Write-Host ""
    
    # SECCIÓN 6: Resumen
    $EndTime = Get-Date
    $Duration = $EndTime - $StartTime
    
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                    RESUMEN - DEPLOYMENT                        ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    Write-Log "Compilación: ✓ COMPLETADA" 'Success'
    Write-Log "Docker:      ✓ COMPLETADA" 'Success'
    Write-Log "Tiempo:      $($Duration.TotalMinutes.ToString('F1')) minutos" 'Success'
    
    Write-Host ""
    Write-Log "Imágenes listas:" 'Info'
    Write-Host "  • innoad-backend:v2.0" -ForegroundColor Green
    Write-Host "  • innoad-frontend:v2.0" -ForegroundColor Green
    
    Write-Host ""
    Write-Log "Pasos manuales restantes:" 'Warning'
    Write-Host "  1. Ejecutar: 02-push-to-azure.bat" -ForegroundColor Yellow
    Write-Host "  2. Ejecutar: 03-execute-sql.bat" -ForegroundColor Yellow
    Write-Host "  3. Ejecutar: 04-deploy-to-azure-app-service.bat" -ForegroundColor Yellow
    Write-Host "  4. Ejecutar: 05-deploy-frontend-netlify.bat" -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "Ver documentación:" -ForegroundColor Cyan
    Write-Host "  • GUIA_EJECUCION_RAPIDA.md" -ForegroundColor Cyan
    Write-Host "  • DEPLOYMENT_SCRIPTS_DOCUMENTACION.md" -ForegroundColor Cyan
    
    Write-Host ""
}

# Ejecutar main
try {
    Main
} catch {
    Write-Log "Error fatal: $_" 'Error'
    exit 1
}

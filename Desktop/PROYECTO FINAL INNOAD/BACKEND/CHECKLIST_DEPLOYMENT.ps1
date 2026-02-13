#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Checklist interactivo para deployment INNOAD Fase 4
.DESCRIPTION
    Guía interactiva que verifica cada paso antes de proceder
#>

Clear-Host

$Checklist = @(
    @{
        Step = 1
        Name = "Verificación de herramientas"
        Description = "Verifica que tienes Docker, Java, Maven, Node.js"
        Command = "00-verificar-todo.bat"
    },
    @{
        Step = 2
        Name = "Compilación y Docker local"
        Description = "Compila backend y frontend, construye imágenes Docker"
        Command = "01-build-docker-local.bat"
    },
    @{
        Step = 3
        Name = "Enviar a Azure Registry"
        Description = "Sube imágenes a Azure Container Registry"
        Command = "02-push-to-azure.bat"
    },
    @{
        Step = 4
        Name = "Ejecutar SQL en Azure"
        Description = "Ejecuta schema-fase4.sql en Azure SQL Database"
        Command = "03-execute-sql.bat"
    },
    @{
        Step = 5
        Name = "Deploy backend en App Service"
        Description = "Actualiza App Service con nueva imagen Docker"
        Command = "04-deploy-to-azure-app-service.bat"
    },
    @{
        Step = 6
        Name = "Deploy frontend en Netlify"
        Description = "Sube frontend compilado a Netlify"
        Command = "05-deploy-frontend-netlify.bat"
    }
)

$Completed = @()

function Show-Header {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║       CHECKLIST INTERACTIVO - DEPLOYMENT INNOAD FASE 4            ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Progress {
    Write-Host "PROGRESO: $($Completed.Count)/$($Checklist.Count) pasos completados" -ForegroundColor Yellow
    Write-Host ""
}

function Show-Checklist {
    Write-Host "┌─────────────────────────────────────────────────────────────────────┐" -ForegroundColor White
    Write-Host "│ PASOS DE DEPLOYMENT                                                 │" -ForegroundColor White
    Write-Host "└─────────────────────────────────────────────────────────────────────┘" -ForegroundColor White
    Write-Host ""
    
    foreach ($item in $Checklist) {
        $status = if ($item.Step -in $Completed) { "✓" } else { "○" }
        $color = if ($item.Step -in $Completed) { "Green" } else { "White" }
        
        Write-Host "  $status [$($item.Step)] $($item.Name)" -ForegroundColor $color
        Write-Host "     $($item.Description)" -ForegroundColor Gray
        Write-Host ""
    }
}

function Show-Menu {
    Write-Host "┌─────────────────────────────────────────────────────────────────────┐" -ForegroundColor Cyan
    Write-Host "│ OPCIONES                                                            │" -ForegroundColor Cyan
    Write-Host "└─────────────────────────────────────────────────────────────────────┘" -ForegroundColor Cyan
    Write-Host ""
    
    $nextStep = ($Checklist | Where-Object { $_.Step -notin $Completed } | Select-Object -First 1)
    
    if ($nextStep) {
        Write-Host "  [E] Ejecutar paso $($nextStep.Step): $($nextStep.Name)" -ForegroundColor Green
        Write-Host "  [S] Ver siguiente paso sin ejecutar" -ForegroundColor Yellow
    } else {
        Write-Host "  [F] Ver deployment completado" -ForegroundColor Green
    }
    
    Write-Host "  [V] Ver documentación" -ForegroundColor Cyan
    Write-Host "  [R] Reiniciar checklist" -ForegroundColor Yellow
    Write-Host "  [Q] Salir" -ForegroundColor Red
    Write-Host ""
}

function Execute-Step {
    param([int]$StepNum)
    
    $step = $Checklist | Where-Object { $_.Step -eq $StepNum }
    
    if (-not $step) {
        Write-Host "Paso $StepNum no encontrado" -ForegroundColor Red
        return
    }
    
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║ Ejecutando: $($step.Name.PadRight(60)) ║" -ForegroundColor Yellow
    Write-Host "╚════════════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "Ejecutando: $($step.Command)" -ForegroundColor Cyan
    Write-Host ""
    
    & ./$($step.Command)
    
    $exitCode = $LASTEXITCODE
    
    Write-Host ""
    
    if ($exitCode -eq 0 -or $exitCode -eq $null) {
        Write-Host "✓ Paso $($step.Step) COMPLETADO" -ForegroundColor Green
        $Completed += $StepNum
    } else {
        Write-Host "✗ Error en paso $($step.Step). Código: $exitCode" -ForegroundColor Red
        Write-Host ""
        Write-Host "Opciones:" -ForegroundColor Yellow
        Write-Host "  - Revisa el error anterior" -ForegroundColor Gray
        Write-Host "  - Ejecuta nuevamente: $($step.Command)" -ForegroundColor Gray
        Write-Host "  - Consulta: GUIA_EJECUCION_RAPIDA.md" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "Presiona Enter para continuar..." -ForegroundColor Gray
    Read-Host
}

function Show-Documentation {
    Write-Host ""
    Write-Host "┌─────────────────────────────────────────────────────────────────────┐" -ForegroundColor Cyan
    Write-Host "│ DOCUMENTACIÓN DISPONIBLE                                            │" -ForegroundColor Cyan
    Write-Host "└─────────────────────────────────────────────────────────────────────┘" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "  [1] GUIA_EJECUCION_RAPIDA.md" -ForegroundColor Yellow
    Write-Host "      Guía paso a paso con ejemplos y solución de problemas" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "  [2] DEPLOYMENT_SCRIPTS_DOCUMENTACION.md" -ForegroundColor Yellow
    Write-Host "      Documentación técnica completa de los scripts" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "  [3] INICIO_DEPLOYMENT.txt" -ForegroundColor Yellow
    Write-Host "      Guía visual de inicio rápido" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "  [4] database-schema-fase4.sql" -ForegroundColor Yellow
    Write-Host "      Script SQL con schema de base de datos" -ForegroundColor Gray
    Write-Host ""
    
    $choice = Read-Host "¿Cuál documento deseas abrir? (1-4 o Enter para volver)"
    
    $docs = @{
        "1" = "GUIA_EJECUCION_RAPIDA.md"
        "2" = "DEPLOYMENT_SCRIPTS_DOCUMENTACION.md"
        "3" = "INICIO_DEPLOYMENT.txt"
        "4" = "database-schema-fase4.sql"
    }
    
    if ($docs[$choice]) {
        Invoke-Item $docs[$choice]
    }
}

function Show-Completion {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                  ✓ DEPLOYMENT COMPLETADO                          ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Todos los pasos han sido ejecutados exitosamente:" -ForegroundColor Green
    Write-Host ""
    
    foreach ($item in $Checklist) {
        Write-Host "  ✓ $($item.Name)" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Verificación final:" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "  1. Backend responde en:" -ForegroundColor Cyan
    Write-Host "     curl https://[app].azurewebsites.net/api/ubicaciones/ciudades" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "  2. Frontend disponible en:" -ForegroundColor Cyan
    Write-Host "     https://[tu-sitio].netlify.app" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "  3. Base de datos contiene datos:" -ForegroundColor Cyan
    Write-Host "     SELECT COUNT(*) FROM ciudades;" -ForegroundColor Gray
    Write-Host ""
}

# MAIN LOOP
Show-Header

do {
    Show-Progress
    Show-Checklist
    Show-Menu
    
    $choice = Read-Host "Selecciona una opción (E/S/V/R/Q)"
    
    switch ($choice.ToUpper()) {
        "E" {
            $nextStep = $Checklist | Where-Object { $_.Step -notin $Completed } | Select-Object -First 1
            if ($nextStep) {
                Execute-Step $nextStep.Step
            } else {
                Write-Host "Todos los pasos están completados" -ForegroundColor Green
            }
        }
        "S" {
            $nextStep = $Checklist | Where-Object { $_.Step -notin $Completed } | Select-Object -First 1
            if ($nextStep) {
                Clear-Host
                Show-Header
                Write-Host "Siguiente paso:" -ForegroundColor Yellow
                Write-Host ""
                Write-Host "  [$($nextStep.Step)] $($nextStep.Name)" -ForegroundColor Green
                Write-Host "  $($nextStep.Description)" -ForegroundColor White
                Write-Host ""
                Write-Host "  Comando: $($nextStep.Command)" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "Presiona Enter para volver al menú..." -ForegroundColor Gray
                Read-Host
            }
        }
        "V" {
            Clear-Host
            Show-Header
            Show-Documentation
            Clear-Host
            Show-Header
        }
        "F" {
            if ($Completed.Count -eq $Checklist.Count) {
                Clear-Host
                Show-Completion
                break
            } else {
                Write-Host "Falta completar pasos. Continúa con el flujo." -ForegroundColor Yellow
            }
        }
        "R" {
            $Completed = @()
            Clear-Host
            Show-Header
        }
        "Q" {
            Write-Host "Saliendo..." -ForegroundColor Yellow
            break
        }
        default {
            Write-Host "Opción no válida" -ForegroundColor Red
        }
    }
    
    Write-Host ""
} while ($choice.ToUpper() -ne "Q" -and $choice.ToUpper() -ne "F")

Write-Host ""
Write-Host "¡Gracias por usar INNOAD Deployment!" -ForegroundColor Cyan
Write-Host ""

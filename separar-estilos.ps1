# Script para separar estilos CSS de componentes Angular
$componentes = @(
    "src\app\modulos\dashboard\componentes\dashboard.component.ts",
    "src\app\modulos\campanas\componentes\lista-campanas.component.ts",
    "src\app\modulos\asistente-ia\componentes\boton-asistente-global.component.ts",
    "src\app\modulos\asistente-ia\componentes\asistente-ia.component.ts",
    "src\app\shared\componentes\navegacion-autenticada.component.ts",
    "src\app\modulos\admin\componentes\dashboard-admin.component.ts",
    "src\app\modulos\admin\componentes\gestion-usuarios.component.ts",
    "src\app\modulos\admin\componentes\logs-auditoria.component.ts",
    "src\app\modulos\admin\componentes\monitoreo-sistema.component.ts",
    "src\app\modulos\admin\componentes\control-mantenimiento.component.ts",
    "src\app\modulos\sin-permisos\componentes\sin-permisos.component.ts",
    "src\app\modulos\publicacion\componentes\publicar-contenido.component.ts",
    "src\app\modulos\publica\componentes\landing.component.ts",
    "src\app\modulos\player\componentes\player.component.ts",
    "src\app\modulos\mantenimiento\componentes\mantenimiento.component.ts",
    "src\app\modulos\pantallas\componentes\lista-pantallas.component.ts",
    "src\app\modulos\contenidos\componentes\biblioteca-contenidos.component.ts",
    "src\app\modulos\reportes\componentes\dashboard-reportes.component.ts"
)

Write-Host "Procesando componentes..." -ForegroundColor Cyan

foreach ($comp in $componentes) {
    $fullPath = Join-Path $PSScriptRoot $comp
    
    if (Test-Path $fullPath) {
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($comp)
        $dirName = Split-Path $comp -Parent
        $scssPath = Join-Path $PSScriptRoot "$dirName\$baseName.scss"
        
        Write-Host "  $baseName" -ForegroundColor Yellow
        
        # Si ya existe el archivo SCSS, actualizar el componente TS
        if (Test-Path $scssPath) {
            $content = Get-Content $fullPath -Raw
            
            # Reemplazar styles por styleUrls
            if ($content -match "styles: \[") {
                $content = $content -replace "styles: \[`r?`n\s+`.+?`\]", "styleUrls: ['./$baseName.scss']"
                Set-Content -Path $fullPath -Value $content -NoNewline
                Write-Host "    Actualizado a styleUrls" -ForegroundColor Green
            }
        }
    }
}

Write-Host "`nProceso completado!" -ForegroundColor Green

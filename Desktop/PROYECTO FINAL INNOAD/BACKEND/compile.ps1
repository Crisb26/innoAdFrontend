$ErrorActionPreference = 'Stop'
$projectPath = "c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend"
Set-Location $projectPath

# Kill any existing Maven processes
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment for cleanup
Start-Sleep -Seconds 2

# Run Maven compile
Write-Host "Iniciando compilacion..."
$process = Start-Process -FilePath "mvn" -ArgumentList "clean","compile","-DskipTests","-B" -NoNewWindow -PassThru
$process.WaitForExit()

Write-Host "Compilacion completada con codigo: $($process.ExitCode)"

# Check if compilation was successful
if ($process.ExitCode -eq 0) {
    Write-Host "BUILD EXITOSO"
    $classCount = (Get-ChildItem -Path "target\classes\com" -Recurse -Include "*.class" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "Total archivos .class compilados: $classCount"
} else {
    Write-Host "BUILD FALLO"
}


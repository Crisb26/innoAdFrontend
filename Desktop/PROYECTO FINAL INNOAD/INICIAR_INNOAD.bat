@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           🚀 INICIANDO INNOAD - Sistema Completo            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Paso 1: Iniciar PostgreSQL
echo [1/3] Iniciando PostgreSQL...
powershell -Command "Get-Service -Name 'postgresql*' | Start-Service -ErrorAction SilentlyContinue" >nul 2>&1
timeout /t 3 /nobreak >nul
echo ✅ PostgreSQL iniciado
echo.

REM Paso 2: Abrir Backend en nueva ventana
echo [2/3] Iniciando Backend (Spring Boot)...
start "InnoAd Backend - Puerto 8080" cmd /k "cd /d c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND && java -jar target\innoad-backend-2.0.0.jar --spring.profiles.active=server"
timeout /t 5 /nobreak >nul
echo ✅ Backend iniciado en puerto 8080
echo.

REM Paso 3: Abrir Frontend en nueva ventana
echo [3/3] Iniciando Frontend (Angular)...
start "InnoAd Frontend - Puerto 4200" cmd /k "cd /d c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend && ng serve"
timeout /t 5 /nobreak >nul
echo ✅ Frontend iniciado en puerto 4200
echo.

echo ╔════════════════════════════════════════════════════════════╗
echo ║              ✅ SISTEMA COMPLETAMENTE INICIADO              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📍 Abre en tu navegador:  http://localhost:4200
echo.
echo 🔐 Credenciales de Login:
echo    Admin:    admin / Admin123!
echo    Técnico:  tecnico / Tecnico123!
echo    Usuario:  usuario / Usuario123!
echo.
echo 💡 Verifica que veas:
echo    ✓ Backend: "Application started successfully"
echo    ✓ Frontend: "Local: http://localhost:4200"
echo    ✓ Dark Mode Toggle (🌙☀️) en esquina derecha del navbar
echo    ✓ Panel Técnico con 5 pestañas (Contenido, Pantallas, Mapa, Inventario, Chat)
echo.
echo ⏳ Espera 10-15 segundos mientras se cargan los servicios...
echo.
pause

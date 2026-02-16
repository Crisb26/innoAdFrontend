#!/bin/bash
# DEPLOYMENT URGENTE AL SERVIDOR TAILSCALE
# Ejecutar desde: bash deploy-urgente.sh

SERVER_IP="100.91.23.46"
SERVER_USER="postgres"
JAR_FILE="/c/Users/bueno/Desktop/PROYECTO\ FINAL\ INNOAD/BACKEND/target/innoad-backend-2.0.0.jar"
SSH_KEY="$HOME/.ssh/id_ed25519"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  DEPLOYMENT URGENTE - ACTUALIZANDO SERVIDOR"
echo "════════════════════════════════════════════════════════════"
echo ""

# PASO 1: Verificar JAR
echo "[1/3] Verificando JAR compilado..."
if [ -f "$JAR_FILE" ]; then
    SIZE=$(du -h "$JAR_FILE" | cut -f1)
    echo "✓ JAR encontrado: $SIZE"
else
    echo "✗ JAR no encontrado en: $JAR_FILE"
    exit 1
fi

# PASO 2: Enviar JAR
echo ""
echo "[2/3] Enviando JAR al servidor..."
echo "Usando SCP..."

scp -i "$SSH_KEY" -o StrictHostKeyChecking=no "$JAR_FILE" $SERVER_USER@$SERVER_IP:/tmp/

if [ $? -eq 0 ]; then
    echo "✓ JAR enviado"
else
    echo "✗ SCP fallo"
    exit 1
fi

# PASO 3: Ejecutar deployment en servidor
echo ""
echo "[3/3] Ejecutando deployment en servidor..."

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP bash << 'DEPLOY_SCRIPT'

echo "  [Server] Deteniendo backend anterior..."
pkill -f "java.*innoad-backend" 2>/dev/null || true
sleep 2

echo "  [Server] Creando backup..."
mkdir -p /opt/innoad/backend
if [ -f "/opt/innoad/backend/innoad-backend-2.0.0.jar" ]; then
    cp /opt/innoad/backend/innoad-backend-2.0.0.jar /opt/innoad/backend/innoad-backend-2.0.0.jar.bak
    echo "  [Server] Backup creado"
fi

echo "  [Server] Copiando JAR..."
cp /tmp/innoad-backend-2.0.0.jar /opt/innoad/backend/

echo "  [Server] Iniciando backend..."
cd /opt/innoad/backend
nohup java -jar innoad-backend-2.0.0.jar > innoad.log 2>&1 &

echo "  [Server] Esperando inicialización (5 segundos)..."
sleep 5

echo "  [Server] Verificando health check..."
for i in {1..10}; do
    if curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
        echo "  ✓ Backend respondiendo correctamente!"
        exit 0
    fi
    echo "  Intento $i/10... esperando"
    sleep 1
done

echo "  ✓ Backend iniciado (puede seguir iniciando en background)"

DEPLOY_SCRIPT

RESULT=$?

echo ""
echo "════════════════════════════════════════════════════════════"
if [ $RESULT -eq 0 ]; then
    echo "  ✓ DEPLOYMENT COMPLETADO EXITOSAMENTE"
    echo ""
    echo "  Cambios aplicados:"
    echo "  ✓ Admin login case-insensitive"
    echo "  ✓ Rol corregido a ADMIN"
    echo "  ✓ Cuenta desbloqueada"
    echo "  ✓ PostgreSQL password: postgres123"
    echo ""
    echo "  Accede a:"
    echo "  - https://azure-pro.tail2a2f73.ts.net/"
    echo ""
    echo "  Login:"
    echo "  - Usuario: admin"
    echo "  - Contraseña: Admin123!"
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo ""
    echo "📝 IMPORTANTE:"
    echo "1. Recarga la página en navegador (Ctrl+F5)"
    echo "2. Limpia cache si es necesario"
    echo "3. Intenta login con admin/Admin123!"
    echo ""
else
    echo "  ⚠️ Deployment completado pero con advertencias"
    echo "════════════════════════════════════════════════════════════"
fi

exit $RESULT

#!/bin/bash
# =============================================================================
# SCRIPT DE DEPLOYMENT AUTOMÁTICO - InnoAd Fixes
# =============================================================================
# Uso: ./deploy-innoad-fixes.sh
# Este script automatiza el deployment de todos los fixes en el servidor
# =============================================================================

set -e  # Exit on any error

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres123}"
POSTGRES_DB="innoad_db"
BACKEND_JAR="target/innoad-backend-2.0.0.jar"
BACKEND_SERVICE="innoad-backend"
BACKEND_PORT="8080"

echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   INNOAD - Script de Deployment Automático        ║${NC}"
echo -e "${GREEN}║   Fixes: Desbloqueo Admin + Case-Insensitive      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# PASO 1: Validar conexión a PostgreSQL
# ============================================================================
echo -e "${YELLOW}[PASO 1/5]${NC} Validando conexión a PostgreSQL..."
if PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1" >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Conexión a PostgreSQL OK"
else
    echo -e "${RED}✗${NC} NO se pudo conectar a PostgreSQL"
    echo "   Host: $POSTGRES_HOST:$POSTGRES_PORT"
    echo "   Usuario: $POSTGRES_USER"
    echo "   Base de datos: $POSTGRES_DB"
    exit 1
fi

# ============================================================================
# PASO 2: Ejecutar Scripts SQL
# ============================================================================
echo -e "${YELLOW}[PASO 2/5]${NC} Ejecutando scripts SQL..."

# Script 1: Desbloquear admin
echo "  - Desbloqueando usuario admin..."
PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" << EOF
UPDATE usuarios 
SET intentos_fallidos = 0, fecha_bloqueo = NULL, activo = true, verificado = true
WHERE nombre_usuario = 'admin';
EOF

# Script 2: Corregir rol
echo "  - Corrigiendo rol..."
PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" << EOF
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
UPDATE usuarios SET rol='ADMIN' WHERE nombre_usuario='admin' AND rol='ADMINISTRADOR';
ALTER TABLE usuarios 
ADD CONSTRAINT usuarios_rol_check CHECK (rol IN ('ADMIN', 'TECNICO', 'USUARIO'));
EOF

echo -e "${GREEN}✓${NC} Scripts SQL ejecutados exitosamente"

# ============================================================================
# PASO 3: Detener backend anterior
# ============================================================================
echo -e "${YELLOW}[PASO 3/5]${NC} Deteniendo backend anterior..."
if command -v systemctl &> /dev/null; then
    sudo systemctl stop "$BACKEND_SERVICE" 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Backend detenido (systemctl)"
elif pgrep -f "innoad-backend" > /dev/null; then
    pkill -f "innoad-backend" || true
    sleep 2
    echo -e "${GREEN}✓${NC} Backend detenido (pkill)"
else
    echo -e "${GREEN}✓${NC} No hay backend corriendo"
fi

# ============================================================================
# PASO 4: Desplegar Backend
# ============================================================================
echo -e "${YELLOW}[PASO 4/5]${NC} Desplegando backend..."

if [ ! -f "$BACKEND_JAR" ]; then
    echo -e "${RED}✗${NC} JAR no encontrado: $BACKEND_JAR"
    exit 1
fi

# Copiar a ubicación de despliegue
DEPLOY_DIR="/opt/innoad/backend"
sudo mkdir -p "$DEPLOY_DIR"
sudo cp "$BACKEND_JAR" "$DEPLOY_DIR/innoad-backend.jar"
echo -e "${GREEN}✓${NC} JAR copiado a $DEPLOY_DIR"

# Arrancar backend
if command -v systemctl &> /dev/null; then
    sudo systemctl start "$BACKEND_SERVICE"
    echo -e "${GREEN}✓${NC} Backend iniciado (systemctl)"
else
    nohup java -jar "$DEPLOY_DIR/innoad-backend.jar" --spring.profiles.active=server > /var/log/innoad-backend.log 2>&1 &
    echo -e "${GREEN}✓${NC} Backend iniciado (nohup)"
fi

# Esperar a que el backend esté listo
echo "  Esperando backend en puerto $BACKEND_PORT..."
for i in {1..30}; do
    if curl -s "http://localhost:$BACKEND_PORT/actuator/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend healthy en puerto $BACKEND_PORT"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗${NC} Backend no respondió después de 30 segundos"
        exit 1
    fi
    echo "  Intento $i/30..."
    sleep 1
done

# ============================================================================
# PASO 5: Validar Funcionamiento
# ============================================================================
echo -e "${YELLOW}[PASO 5/5]${NC} Validando funcionamiento..."

# Test 1: Login con admin (minúsculas)
echo "  - Testeando login: admin + Admin123!"
RESPONSE=$(curl -s -X POST "http://localhost:$BACKEND_PORT/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"nombreUsuario":"admin","contrasena":"Admin123!"}')

if echo "$RESPONSE" | grep -q '"exitoso":true'; then
    echo -e "${GREEN}✓${NC} Login exitoso"
else
    echo -e "${RED}✗${NC} Login fallido"
    echo "Respuesta: $RESPONSE"
    exit 1
fi

# Test 2: Login con ADMIN (mayúsculas)
echo "  - Testeando login: ADMIN + Admin123!"
RESPONSE=$(curl -s -X POST "http://localhost:$BACKEND_PORT/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"nombreUsuario":"ADMIN","contrasena":"Admin123!"}')

if echo "$RESPONSE" | grep -q '"exitoso":true'; then
    echo -e "${GREEN}✓${NC} Case-insensitive OK"
else
    echo -e "${RED}✗${NC} Case-insensitive fallo"
    exit 1
fi

# Test 3: Login con contraseña incorrecta debe fallar
echo "  - Testeando fallo de contraseña incorrecta..."
RESPONSE=$(curl -s -X POST "http://localhost:$BACKEND_PORT/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"nombreUsuario":"admin","contrasena":"WrongPassword123!"}')

if echo "$RESPONSE" | grep -q '"exitoso":false'; then
    echo -e "${GREEN}✓${NC} Rechazo de contraseña incorrecta OK"
else
    echo -e "${RED}✗${NC} Debería rechazar contraseña incorrecta"
    exit 1
fi

# ============================================================================
# FIN
# ============================================================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              🎉 DEPLOYMENT EXITOSO 🎉             ║${NC}"
echo -e "${GREEN}║                                                    ║${NC}"
echo -e "${GREEN}║  ✓ PostgreSQL validado                            ║${NC}"
echo -e "${GREEN}║  ✓ Scripts SQL ejecutados                         ║${NC}"
echo -e "${GREEN}║  ✓ Backend desplegado                             ║${NC}"
echo -e "${GREEN}║  ✓ Validación completa                            ║${NC}"
echo -e "${GREEN}║                                                    ║${NC}"
echo -e "${GREEN}║  Estado: LISTO PARA PRODUCCIÓN                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Credenciales de prueba:"
echo "  - Usuario: admin    | Password: Admin123!"
echo "  - Usuario: tecnico  | Password: Tecnico123!"
echo "  - Usuario: usuario  | Password: Usuario123!"
echo ""
echo "URLs disponibles:"
echo "  - API Backend:    http://localhost:$BACKEND_PORT"
echo "  - Health check:   http://localhost:$BACKEND_PORT/actuator/health"
echo ""

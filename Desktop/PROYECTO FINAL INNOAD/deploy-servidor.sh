#!/bin/bash
# ============================================================================
# SCRIPT DE DESPLIEGUE - SERVIDOR CASERO INNOAD
# ============================================================================
# Ejecutar con: chmod +x deploy-servidor.sh && ./deploy-servidor.sh
# ============================================================================

set -e

echo "========================================"
echo "  InnoAd - Despliegue Servidor Casero"
echo "========================================"
echo ""

# Verificar que Docker y Docker Compose están instalados
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker no está instalado."
    echo "Instala Docker: https://docs.docker.com/engine/install/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "ERROR: Docker Compose no está instalado."
    exit 1
fi

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    echo "AVISO: No existe archivo .env"
    echo ""
    echo "Creando .env desde .env.server.example..."
    cp .env.server.example .env
    echo ""
    echo "IMPORTANTE: Edita el archivo .env con tus valores reales:"
    echo "  nano .env"
    echo ""
    echo "Valores que DEBES cambiar:"
    echo "  - DB_PASSWORD"
    echo "  - JWT_SECRET (genera con: openssl rand -base64 64)"
    echo "  - ADMIN_PASSWORD"
    echo "  - FRONTEND_URL (la IP de este servidor)"
    echo "  - SERVER_PUBLIC_URL (la IP de este servidor)"
    echo ""
    echo "Después de editar, ejecuta este script de nuevo."
    exit 0
fi

# Verificar que el .env tiene valores reales (no los por defecto)
if grep -q "CAMBIAR_" .env 2>/dev/null; then
    echo "ERROR: Tu archivo .env todavía tiene valores por defecto (CAMBIAR_...)"
    echo "Edita .env y cambia todos los valores marcados con CAMBIAR_"
    echo "  nano .env"
    exit 1
fi

echo "1. Archivo .env encontrado"

# Detectar la IP del servidor
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "desconocida")
echo "2. IP del servidor: $SERVER_IP"

# Verificar si los puertos están libres
echo "3. Verificando puertos..."
for port in 80 8080 5433; do
    if ss -tlnp | grep -q ":$port " 2>/dev/null; then
        echo "   AVISO: Puerto $port ya está en uso"
    else
        echo "   Puerto $port: libre"
    fi
done

echo ""
echo "4. Construyendo e iniciando contenedores..."
echo "   (esto puede tardar varios minutos la primera vez)"
echo ""

# Usar docker compose (v2) o docker-compose (v1)
if docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Construir y levantar
$COMPOSE_CMD -f docker-compose.server.yml up -d --build

echo ""
echo "========================================"
echo "  DESPLIEGUE COMPLETADO"
echo "========================================"
echo ""
echo "  Frontend: http://$SERVER_IP"
echo "  Backend:  http://$SERVER_IP:8080"
echo "  BD:       localhost:5433"
echo ""
echo "  Ver logs:     $COMPOSE_CMD -f docker-compose.server.yml logs -f"
echo "  Parar todo:   $COMPOSE_CMD -f docker-compose.server.yml down"
echo "  Reiniciar:    $COMPOSE_CMD -f docker-compose.server.yml restart"
echo ""
echo "  Accede desde cualquier PC en tu red: http://$SERVER_IP"
echo "========================================"

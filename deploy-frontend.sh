#!/bin/bash
# Script de Despliegue Frontend InnoAd
# Usar con Git Bash en Windows

set -e  # Detener si hay error

echo "=========================================="
echo "  DESPLIEGUE FRONTEND INNOAD"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directorio del proyecto
PROYECTO_DIR="/c/Users/bueno/Desktop/PROYECTO FINAL INNOAD/innoadFrontend"

echo -e "${YELLOW}[1/6] Navegando al directorio del proyecto...${NC}"
cd "$PROYECTO_DIR"
pwd

echo ""
echo -e "${YELLOW}[2/6] Verificando Node.js y npm...${NC}"
node --version
npm --version

echo ""
echo -e "${YELLOW}[3/6] Instalando dependencias (si es necesario)...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm ci
else
    echo "Dependencias ya instaladas. Saltando..."
fi

echo ""
echo -e "${YELLOW}[4/6] Verificando Docker...${NC}"
docker --version
docker compose version

echo ""
echo -e "${YELLOW}[5/6] Deteniendo contenedores previos...${NC}"
docker compose -f docker-compose.external.yml down 2>/dev/null || echo "No hay contenedores previos"

echo ""
echo -e "${YELLOW}[6/6] Construyendo e iniciando frontend en Docker...${NC}"
echo "Modo: Frontend en Docker, Backend en localhost:8080"
docker compose -f docker-compose.external.yml up --build -d

echo ""
echo -e "${GREEN}=========================================="
echo "  DESPLIEGUE COMPLETADO"
echo "==========================================${NC}"
echo ""
echo -e "${GREEN}✓${NC} Frontend desplegado en: ${GREEN}http://localhost:8080${NC}"
echo -e "${GREEN}✓${NC} Backend esperado en:   ${GREEN}http://localhost:8080/api/v1${NC}"
echo ""
echo "Para ver logs:"
echo "  docker compose -f docker-compose.external.yml logs -f frontend"
echo ""
echo "Para detener:"
echo "  docker compose -f docker-compose.external.yml down"
echo ""
echo -e "${YELLOW}IMPORTANTE:${NC} Asegúrate de que el backend esté corriendo en localhost:8080"
echo ""

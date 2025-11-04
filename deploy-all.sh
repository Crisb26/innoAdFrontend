#!/bin/bash
# Script de Despliegue Completo (Frontend + Backend)
# Usar con Git Bash en Windows

set -e  # Detener si hay error

echo "=========================================="
echo "  DESPLIEGUE COMPLETO INNOAD"
echo "  Frontend + Backend con Docker Compose"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directorios
FRONTEND_DIR="/c/Users/bueno/Desktop/PROYECTO FINAL INNOAD/innoadFrontend"
BACKEND_DIR="/c/Users/bueno/Desktop/PROYECTO FINAL INNOAD/innoadBackend"

echo -e "${YELLOW}[1/5] Verificando Docker...${NC}"
docker --version
docker compose version

echo ""
echo -e "${YELLOW}[2/5] Verificando directorios...${NC}"

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}✗ Frontend no encontrado en: $FRONTEND_DIR${NC}"
    exit 1
else
    echo -e "${GREEN}✓${NC} Frontend encontrado"
fi

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${YELLOW}⚠ Backend no encontrado en: $BACKEND_DIR${NC}"
    echo -e "${YELLOW}  Usando configuración externa (backend en host)${NC}"
    USE_EXTERNAL=true
else
    echo -e "${GREEN}✓${NC} Backend encontrado"
    USE_EXTERNAL=false
fi

echo ""
echo -e "${YELLOW}[3/5] Deteniendo contenedores previos...${NC}"
cd "$FRONTEND_DIR"
docker compose down 2>/dev/null || echo "No hay contenedores previos"
docker compose -f docker-compose.external.yml down 2>/dev/null || echo "No hay contenedores externos previos"

echo ""
if [ "$USE_EXTERNAL" = true ]; then
    echo -e "${YELLOW}[4/5] Construyendo frontend (modo externo)...${NC}"
    echo "Backend debe estar corriendo en localhost:8080"
    docker compose -f docker-compose.external.yml build
    
    echo ""
    echo -e "${YELLOW}[5/5] Iniciando frontend...${NC}"
    docker compose -f docker-compose.external.yml up -d
    
    echo ""
    echo -e "${GREEN}=========================================="
    echo "  DESPLIEGUE COMPLETADO (MODO EXTERNO)"
    echo "==========================================${NC}"
    echo ""
    echo -e "${GREEN}✓${NC} Frontend: ${GREEN}http://localhost:8080${NC}"
    echo -e "${YELLOW}⚠${NC} Backend: ${YELLOW}Debe estar en http://localhost:8080${NC}"
else
    echo -e "${YELLOW}[4/5] Construyendo frontend y backend...${NC}"
    docker compose build
    
    echo ""
    echo -e "${YELLOW}[5/5] Iniciando servicios...${NC}"
    docker compose up -d
    
    echo ""
    echo -e "${GREEN}=========================================="
    echo "  DESPLIEGUE COMPLETADO"
    echo "==========================================${NC}"
    echo ""
    echo -e "${GREEN}✓${NC} Frontend: ${GREEN}http://localhost:8080${NC}"
    echo -e "${GREEN}✓${NC} Backend:  ${GREEN}http://localhost:8081${NC}"
fi

echo ""
echo "Ver estado:"
echo "  docker compose ps"
echo ""
echo "Ver logs:"
echo "  docker compose logs -f"
echo ""
echo "Detener todo:"
echo "  docker compose down"
echo ""

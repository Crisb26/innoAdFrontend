#!/bin/bash
# Script de Despliegue Frontend InnoAd (Desarrollo Local con Proxy)
# Usar con Git Bash en Windows

set -e  # Detener si hay error

echo "=========================================="
echo "  DESARROLLO LOCAL FRONTEND INNOAD"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directorio del proyecto
PROYECTO_DIR="/c/Users/bueno/Desktop/PROYECTO FINAL INNOAD/innoadFrontend"

echo -e "${YELLOW}[1/4] Navegando al directorio del proyecto...${NC}"
cd "$PROYECTO_DIR"
pwd

echo ""
echo -e "${YELLOW}[2/4] Verificando Node.js y npm...${NC}"
node --version
npm --version

echo ""
echo -e "${YELLOW}[3/4] Instalando dependencias (si es necesario)...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm ci
else
    echo "Dependencias ya instaladas. Saltando..."
fi

echo ""
echo -e "${GREEN}=========================================="
echo "  INICIANDO SERVIDOR DE DESARROLLO"
echo "==========================================${NC}"
echo ""
echo -e "${GREEN}✓${NC} Servidor Angular iniciará en: ${GREEN}http://localhost:4200${NC}"
echo -e "${GREEN}✓${NC} Proxy API/WebSocket a:      ${GREEN}http://localhost:8080${NC}"
echo ""
echo -e "${YELLOW}IMPORTANTE:${NC} Asegúrate de que el backend esté corriendo en localhost:8080"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""
echo -e "${YELLOW}[4/4] Iniciando servidor con proxy...${NC}"
echo ""

# Iniciar servidor Angular con proxy
npm run iniciar:proxy

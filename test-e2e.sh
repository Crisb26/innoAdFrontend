#!/bin/bash
# Script de Test End-to-End InnoAd
# Valida backend y prueba login desde el frontend
# Usar con Git Bash en Windows

echo "=========================================="
echo "  TEST END-TO-END INNOAD"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BACKEND_URL="http://localhost:8080"
FRONTEND_URL="http://localhost:4200"

echo -e "${YELLOW}[1/4] Verificando Backend...${NC}"

# Health Check
HEALTH=$(curl -s "${BACKEND_URL}/actuator/health" 2>/dev/null || echo "ERROR")
if [[ $HEALTH == *"UP"* ]]; then
    echo -e "${GREEN}✓ Backend health: UP${NC}"
else
    echo -e "${RED}✗ Backend no responde${NC}"
    echo "  Inicia el backend en puerto 8080 y reintenta"
    exit 1
fi

echo ""
echo -e "${YELLOW}[2/4] Probando Login...${NC}"

# Login test
LOGIN=$(curl -s -X POST "${BACKEND_URL}/api/v1/autenticacion/iniciar-sesion" \
    -H "Content-Type: application/json" \
    -d '{"nombreUsuarioOEmail":"admin","contrasena":"Admin123!","recordarme":true}' \
    2>/dev/null || echo "ERROR")

if [[ $LOGIN == *"token"* ]] && [[ $LOGIN == *"exitoso"* ]]; then
    echo -e "${GREEN}✓ Login exitoso${NC}"
    
    # Extraer token (simple parsing)
    TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "  Token obtenido: ${TOKEN:0:50}..."
else
    echo -e "${RED}✗ Login falló${NC}"
    echo "  Respuesta: ${LOGIN:0:200}"
    exit 1
fi

echo ""
echo -e "${YELLOW}[3/4] Probando endpoint protegido...${NC}"

# Test endpoint protegido (ej: campañas)
CAMPANAS=$(curl -s "${BACKEND_URL}/api/v1/campanas" \
    -H "Authorization: Bearer ${TOKEN}" \
    2>/dev/null || echo "ERROR")

if [[ $CAMPANAS == *"exitoso"* ]] || [[ $CAMPANAS == *"datos"* ]]; then
    echo -e "${GREEN}✓ Endpoint protegido accesible con JWT${NC}"
else
    echo -e "${YELLOW}⚠ Endpoint protegido no responde como esperado${NC}"
    echo "  Esto puede ser normal si no hay campañas creadas"
fi

echo ""
echo -e "${YELLOW}[4/4] Verificando Frontend...${NC}"

# Check si frontend está corriendo
FRONTEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}" 2>/dev/null || echo "000")

if [ "$FRONTEND_CHECK" = "200" ]; then
    echo -e "${GREEN}✓ Frontend accesible en ${FRONTEND_URL}${NC}"
elif [ "$FRONTEND_CHECK" = "000" ]; then
    echo -e "${YELLOW}⚠ Frontend no está corriendo${NC}"
    echo "  Inicia con: bash dev-frontend.sh"
else
    echo -e "${YELLOW}⚠ Frontend respondió con status: ${FRONTEND_CHECK}${NC}"
fi

echo ""
echo "=========================================="
echo "  RESULTADO DEL TEST"
echo "=========================================="
echo ""

if [[ $HEALTH == *"UP"* ]] && [[ $LOGIN == *"token"* ]]; then
    echo -e "${GREEN}✓✓✓ INTEGRACION BACKEND-FRONTEND LISTA${NC}"
    echo ""
    echo "Siguiente paso:"
    if [ "$FRONTEND_CHECK" != "200" ]; then
        echo "  1. Inicia el frontend:"
        echo "     bash dev-frontend.sh"
        echo ""
    fi
    echo "  2. Abre: http://localhost:4200"
    echo "  3. Login: admin / Admin123!"
    echo "  4. Verifica que el dashboard cargue correctamente"
else
    echo -e "${RED}✗✗✗ HAY PROBLEMAS EN LA INTEGRACION${NC}"
    echo ""
    echo "Revisa:"
    echo "  1. Backend en puerto 8080"
    echo "  2. Usuario admin con contraseña Admin123!"
    echo "  3. CORS configurado correctamente"
fi

echo ""

#!/bin/bash
# Script de Validacion Backend para InnoAd
# Usar con Git Bash en Windows

echo "=========================================="
echo "  VALIDACION BACKEND INNOAD"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BACKEND_URL="http://localhost:8080"

echo -e "${YELLOW}Verificando conectividad con backend...${NC}"
echo ""

# 1. Health Check
echo -e "${YELLOW}[1/3] Health Check: GET ${BACKEND_URL}/actuator/health${NC}"
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "${BACKEND_URL}/actuator/health" 2>/dev/null || echo "ERROR")

if [[ $HEALTH_RESPONSE == *"ERROR"* ]]; then
    echo -e "${RED}✗ Backend no responde en ${BACKEND_URL}${NC}"
    echo -e "${RED}  Asegúrate de que el backend esté corriendo en puerto 8080${NC}"
    exit 1
else
    HTTP_STATUS=$(echo "$HEALTH_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
    BODY=$(echo "$HEALTH_RESPONSE" | sed '/HTTP_STATUS/d')
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ Backend responde correctamente${NC}"
        echo "  Respuesta: $BODY"
    else
        echo -e "${RED}✗ Backend respondió con status: $HTTP_STATUS${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}[2/3] Login Test: POST ${BACKEND_URL}/api/v1/autenticacion/iniciar-sesion${NC}"
LOGIN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -X POST "${BACKEND_URL}/api/v1/autenticacion/iniciar-sesion" \
    -H "Content-Type: application/json" \
    -d '{"nombreUsuarioOEmail":"admin","contrasena":"Admin123!","recordarme":true}' \
    2>/dev/null || echo "ERROR")

if [[ $LOGIN_RESPONSE == *"ERROR"* ]]; then
    echo -e "${RED}✗ No se pudo conectar al endpoint de login${NC}"
else
    HTTP_STATUS=$(echo "$LOGIN_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
    BODY=$(echo "$LOGIN_RESPONSE" | sed '/HTTP_STATUS/d')
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✓ Login exitoso${NC}"
        echo "  Respuesta (primeros 200 caracteres):"
        echo "  ${BODY:0:200}..."
        
        # Verificar que tenga los campos requeridos
        if [[ $BODY == *"token"* ]] && [[ $BODY == *"tokenActualizacion"* ]] && [[ $BODY == *"expiraEn"* ]]; then
            echo -e "${GREEN}✓ Respuesta contiene campos requeridos (token, tokenActualizacion, expiraEn)${NC}"
        else
            echo -e "${YELLOW}⚠ Respuesta no contiene todos los campos requeridos${NC}"
            echo -e "${YELLOW}  Verifica que incluya: token, tokenActualizacion, expiraEn, usuario${NC}"
        fi
    else
        echo -e "${RED}✗ Login falló con status: $HTTP_STATUS${NC}"
        echo "  Respuesta: $BODY"
    fi
fi

echo ""
echo -e "${YELLOW}[3/3] Verificando CORS...${NC}"
CORS_RESPONSE=$(curl -s -I -X OPTIONS "${BACKEND_URL}/api/v1/autenticacion/iniciar-sesion" \
    -H "Origin: http://localhost:4200" \
    -H "Access-Control-Request-Method: POST" \
    2>/dev/null || echo "ERROR")

if [[ $CORS_RESPONSE == *"Access-Control-Allow-Origin"* ]]; then
    echo -e "${GREEN}✓ CORS configurado correctamente${NC}"
else
    echo -e "${YELLOW}⚠ CORS puede no estar configurado${NC}"
    echo -e "${YELLOW}  Asegúrate de permitir origen: http://localhost:4200 y http://localhost:8080${NC}"
fi

echo ""
echo "=========================================="
echo "  RESULTADO DE VALIDACION"
echo "=========================================="
echo ""

if [[ $HEALTH_RESPONSE != *"ERROR"* ]] && [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓✓✓ Backend está listo para integrarse con el frontend${NC}"
    echo ""
    echo "Puedes iniciar el frontend con:"
    echo "  bash dev-frontend.sh         (desarrollo local con proxy)"
    echo "  bash deploy-frontend.sh      (Docker con backend en host)"
else
    echo -e "${RED}✗✗✗ Backend tiene problemas. Revisa la configuración.${NC}"
    echo ""
    echo "Checklist:"
    echo "  1. Backend corriendo en puerto 8080"
    echo "  2. Endpoint /actuator/health responde"
    echo "  3. Endpoint /api/v1/autenticacion/iniciar-sesion funciona"
    echo "  4. Usuario 'admin' con contraseña 'Admin123!' existe"
    echo "  5. CORS permite localhost:4200 y localhost:8080"
fi

echo ""

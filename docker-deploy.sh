#!/bin/bash
# Script para construir y publicar imagen Docker de InnoAd Frontend
# Uso: ./docker-deploy.sh [versión]

set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuración
DOCKER_USERNAME="${DOCKER_USERNAME:-tu-usuario}"
IMAGE_NAME="innoad-frontend"
VERSION="${1:-latest}"
BUILD_CONFIG="${BUILD_CONFIG:-production}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  InnoAd Frontend - Docker Deploy${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Función para manejar errores
handle_error() {
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
}

# Paso 1: Verificar que Docker está instalado
echo -e "${YELLOW}🔍 Verificando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    handle_error "Docker no está instalado. Por favor instálalo primero."
fi
echo -e "${GREEN}✓ Docker encontrado${NC}"
echo ""

# Paso 2: Construir la imagen
echo -e "${YELLOW}🔨 Construyendo imagen Docker...${NC}"
echo "Imagen: $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
echo "Build Config: $BUILD_CONFIG"
echo ""

docker build \
    --build-arg BUILD_CONFIGURATION=$BUILD_CONFIG \
    -t $IMAGE_NAME:$VERSION \
    -t $IMAGE_NAME:latest \
    . || handle_error "Falló la construcción de la imagen"

echo -e "${GREEN}✓ Imagen construida exitosamente${NC}"
echo ""

# Paso 3: Mostrar tamaño de la imagen
echo -e "${YELLOW}📊 Información de la imagen:${NC}"
docker images $IMAGE_NAME:$VERSION
echo ""

# Paso 4: Etiquetar para Docker Hub
echo -e "${YELLOW}🏷️  Etiquetando imagen para Docker Hub...${NC}"
docker tag $IMAGE_NAME:$VERSION $DOCKER_USERNAME/$IMAGE_NAME:$VERSION
docker tag $IMAGE_NAME:$VERSION $DOCKER_USERNAME/$IMAGE_NAME:latest
echo -e "${GREEN}✓ Imagen etiquetada${NC}"
echo ""

# Paso 5: Login a Docker Hub
echo -e "${YELLOW}🔐 Iniciando sesión en Docker Hub...${NC}"
docker login || handle_error "Falló el login a Docker Hub"
echo -e "${GREEN}✓ Login exitoso${NC}"
echo ""

# Paso 6: Push a Docker Hub
echo -e "${YELLOW}📤 Subiendo imagen a Docker Hub...${NC}"
echo "Subiendo $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
docker push $DOCKER_USERNAME/$IMAGE_NAME:$VERSION || handle_error "Falló el push de la versión $VERSION"
echo ""

echo "Subiendo $DOCKER_USERNAME/$IMAGE_NAME:latest"
docker push $DOCKER_USERNAME/$IMAGE_NAME:latest || handle_error "Falló el push de latest"
echo -e "${GREEN}✓ Imagen subida exitosamente${NC}"
echo ""

# Paso 7: Limpiar imágenes antiguas (opcional)
echo -e "${YELLOW}🧹 ¿Deseas limpiar imágenes antiguas? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    docker image prune -f
    echo -e "${GREEN}✓ Limpieza completada${NC}"
fi
echo ""

# Resumen final
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Deploy Completado Exitosamente${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Imagen publicada: ${BLUE}$DOCKER_USERNAME/$IMAGE_NAME:$VERSION${NC}"
echo -e "También disponible como: ${BLUE}$DOCKER_USERNAME/$IMAGE_NAME:latest${NC}"
echo ""
echo -e "Para usar la imagen en otro servidor:"
echo -e "${BLUE}docker pull $DOCKER_USERNAME/$IMAGE_NAME:$VERSION${NC}"
echo -e "${BLUE}docker run -d -p 80:80 $DOCKER_USERNAME/$IMAGE_NAME:$VERSION${NC}"
echo ""

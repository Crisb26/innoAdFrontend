# ======================================
# ETAPA 1: Build - Construcción de la aplicación
# ======================================
FROM node:20-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias con optimización para producción
RUN npm install --production=false && \
    npm cache clean --force

# Copiar el código fuente
COPY . .

# Construir la aplicación Angular para producción
# El argumento BUILD_CONFIGURATION permite elegir el ambiente
ARG BUILD_CONFIGURATION=production
RUN npm run construir || npm run construir:compose

# ======================================
# ETAPA 2: Runtime - Servidor Nginx ligero
# ======================================
FROM nginx:alpine

# Metadatos de la imagen
LABEL maintainer="InnoAd Team"
LABEL version="2.0.0"
LABEL description="InnoAd Frontend - Sistema de Gestión de Publicidad Digital"

# Copiar archivos construidos desde la etapa de build
COPY --from=build /app/dist/innoad-frontend/browser /usr/share/nginx/html

# Eliminar configuración default de Nginx y copiar la personalizada
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto 80
EXPOSE 80

# Health check para verificar que el contenedor está funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]

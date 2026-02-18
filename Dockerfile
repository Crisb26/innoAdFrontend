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

# Construir la aplicación Angular
# El argumento BUILD_CONFIGURATION permite elegir el ambiente (production o compose)
ARG BUILD_CONFIGURATION=production
RUN if [ "$BUILD_CONFIGURATION" = "compose" ]; then \
      npm run construir:compose; \
    else \
      npm run construir; \
    fi

# ======================================
# ETAPA 2: Runtime - Servidor Nginx
# ======================================
FROM nginx:alpine

# Metadatos de la imagen
LABEL maintainer="InnoAd Team"
LABEL version="2.0.0"
LABEL description="InnoAd Frontend - Sistema de Gestión de Publicidad Digital"

# Instalar wget para healthcheck
RUN apk add --no-cache wget

# Copiar archivos construidos desde la etapa de build
COPY --from=build /app/dist/innoad-frontend/browser /usr/share/nginx/html

# Copiar la configuración personalizada
COPY nginx.conf /etc/nginx/nginx.conf

# Remover configuración default
RUN rm -f /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Health check para verificar que el contenedor está funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# CMD por defecto de nginx
CMD ["nginx", "-g", "daemon off;"]

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]

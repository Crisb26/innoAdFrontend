# Etapa 1: Construcción
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Permitir elegir configuración de build (production por defecto) para soportar perfiles como 'compose'
ARG BUILD_CONFIGURATION=production
RUN npx ng build --configuration $BUILD_CONFIGURATION

# Etapa 2: Producción con Nginx
FROM nginx:alpine

COPY --from=builder /app/dist/innoad-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

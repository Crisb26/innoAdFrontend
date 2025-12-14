# InnoAd Display Manager - Cliente Raspberry Pi

Sistema profesional de gestión de pantallas digitales para Raspberry Pi, completamente integrado con el backend de InnoAd.

## 🎯 Características

### Funcionalidades Principales
- ✅ **Sincronización automática** de contenidos desde backend
- ✅ **Reproducción inteligente** de videos e imágenes
- ✅ **Monitoreo de sistema** (CPU, RAM, temperatura)
- ✅ **Control remoto** desde dashboard web
- ✅ **Gestión de campañas** con programación temporal
- ✅ **Registro de analytics** de reproducción
- ✅ **Recuperación automática** ante fallos
- ✅ **Sistema de caché** para offline
- ✅ **Heartbeat/Health check** cada 30 segundos

### Arquitectura
```
┌─────────────────────────────────────────┐
│   BACKEND INNOAD (Spring Boot)          │
│   REST API + WebSocket                  │
└────────────────┬────────────────────────┘
                 │ HTTP + JWT
                 │
┌────────────────▼────────────────────────┐
│   RASPBERRY PI                          │
│  ┌──────────────────────────────────┐  │
│  │ DisplayManagerPrincipal          │  │
│  │ - ClienteBackendInnoAd           │  │
│  │ - GestorContenidos               │  │
│  │ - ReprodoctorMultimedia          │  │
│  │ - MonitorSistema                 │  │
│  │ - Programador                    │  │
│  └──────────────────────────────────┘  │
│            │              │             │
│            ▼              ▼             │
│      OMXPlayer      /var/cache/innoad  │
│    (Reproducción)     (Almacenamiento) │
└─────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   FRONTEND ANGULAR                      │
│   GestorRaspberryPiComponent            │
│   - Panel de control                    │
│   - Monitoreo en tiempo real            │
│   - Control remoto                      │
└─────────────────────────────────────────┘
```

## 📋 Requisitos Previos

### Hardware
- Raspberry Pi 4 o superior (2GB RAM mínimo, 4GB recomendado)
- Tarjeta microSD de 32GB
- Fuente de alimentación 5V/3A
- Salida HDMI para pantalla

### Software
- Raspberry Pi OS (Bullseye o Bookworm)
- Python 3.7+
- Conexión a internet/red LAN
- Acceso SSH habilitado

## 🚀 Instalación Rápida

### 1. En Raspberry Pi

```bash
# Descarga el script de instalación
wget https://tu-servidor/install-rpi.sh
chmod +x install-rpi.sh

# Ejecuta la instalación
sudo ./install-rpi.sh
```

### 2. Configuración

```bash
# Edita la configuración
sudo nano /etc/innoad/display.json
```

**Ejemplo de configuración:**
```json
{
  "id": "RPI-SALON-001",
  "nombre": "Pantalla Salón Principal",
  "ubicacion": "Entrada",
  "resolucion": "1920x1080",
  "url_backend": "https://innoad.tudominio.com/api",
  "token_api": "tu-jwt-token-aqui",
  "intervalo_sincronizacion": 300,
  "modo_simulacion": false
}
```

### 3. Obtener Token JWT

```bash
# Desde el dashboard admin
# 1. Ir a Administración → API Keys
# 2. Crear nueva clave para Pantalla/Display
# 3. Copiar el token JWT
```

### 4. Iniciar Servicio

```bash
# Iniciar el servicio
sudo systemctl start innoad-display

# Ver logs en tiempo real
journalctl -u innoad-display -f

# Habilitar inicio automático
sudo systemctl enable innoad-display

# Verificar estado
sudo systemctl status innoad-display
```

## 📱 Monitoreo Remoto desde Frontend

### Dashboard de Pantallas

El frontend proporciona un panel completo para:

1. **Listar todas las pantallas** con estado en tiempo real
2. **Visualizar métricas** de cada pantalla:
   - CPU, Memoria, Temperatura
   - Dirección IP, Uptime
   - Contenido reproduciendo

3. **Controles remotos**:
   - Reproducir contenido específico
   - Test de pantalla (patrón de colores)
   - Recargar contenidos
   - Reiniciar pantalla
   - Eliminar pantalla

4. **Operaciones en lote**:
   - Sincronizar todas las pantallas
   - Reiniciar todas simultáneamente

### Acceso al Dashboard

```
http://innoad.tudominio.com/admin/pantallas
```

## 🔧 Comandos Útiles

### Ver logs de aplicación
```bash
sudo journalctl -u innoad-display -n 50 -f
```

### Ver logs del sistema
```bash
dmesg | tail -20
```

### Monitoreo de recursos en vivo
```bash
watch -n 1 'free -h && echo "---" && ps aux | grep innoad'
```

### Reiniciar manualmente
```bash
sudo systemctl restart innoad-display
```

### Ver dirección IP
```bash
hostname -I
```

### Verificar conectividad con backend
```bash
curl -H "Authorization: Bearer TU_TOKEN" \
     http://backend:8080/api/pantallas/RPI-SALON-001
```

## 📊 Flujo de Sincronización

```
1. DisplayManager inicia
   ↓
2. Se conecta al backend con JWT
   ↓
3. Se registra como pantalla activa
   ↓
4. Obtiene contenidos asignados
   ↓
5. Obtiene campañas activas
   ↓
6. Descarga contenidos faltantes
   ↓
7. Inicia reproducción según programación
   ↓
8. Monitorea cada 30s y reporta estado
   ↓
9. Sincroniza nuevamente cada 5 minutos (configurable)
```

## 🔐 Seguridad

- **JWT Authentication**: Todos los requests incluyen token Bearer
- **HTTPS**: Comunicación encriptada con backend
- **Validación de certificados**: SSL/TLS para producción
- **Rate limiting**: Protección contra abuso

### Configurar HTTPS

```json
{
  "url_backend": "https://innoad.tudominio.com/api",
  "ssl_verify": true,
  "certificado_ca": "/etc/ssl/certs/ca-bundle.crt"
}
```

## 🐛 Troubleshooting

### Pantalla no conecta con backend

```bash
# 1. Verificar conectividad
ping google.com

# 2. Verificar DNS
nslookup innoad.tudominio.com

# 3. Verificar token
grep token_api /etc/innoad/display.json

# 4. Ver logs
journalctl -u innoad-display -f
```

### Alto uso de CPU

```bash
# Verificar procesos
ps aux | grep innoad

# Reducir intervalo de sincronización en config.json
"intervalo_sincronizacion": 600  # 10 minutos en lugar de 5
```

### Memoria llena

```bash
# Limpiar caché de contenidos
rm -rf /var/cache/innoad/*

# Verificar espacio en disco
df -h

# Opcionalmente, limpiar logs
journalctl --vacuum=100M
```

### Pantalla no reproduce video

```bash
# Verificar OMXPlayer instalado
which omxplayer

# Verificar permisos
ls -la /opt/innoad-display-manager.py

# Probar reproducción manual
omxplayer -o hdmi /ruta/video.mp4
```

## 📈 Monitoreo de Producción

### Métricas recomendadas

```bash
# CPU promedio
mpstat 1 10 | tail -1

# Temperatura
vcgencmd measure_temp

# Uso de disco
du -sh /var/cache/innoad

# Uptime
uptime
```

### Alertas recomendadas (en backend)

- CPU > 85% durante 5 minutos
- Temperatura > 75°C
- Sin sincronización en > 10 minutos
- Libre en disco < 500MB

## 🔄 Actualización del Cliente

```bash
# Descargar nueva versión
wget https://tu-servidor/innoad-display-manager.py.new

# Parar servicio
sudo systemctl stop innoad-display

# Actualizar
sudo cp innoad-display-manager.py.new /opt/innoad-display-manager.py

# Iniciar
sudo systemctl start innoad-display

# Verificar
sudo systemctl status innoad-display
```

## 📝 Logs de Ejemplo

### Inicio exitoso
```
2024-01-15 10:23:45 - InnoAdDisplay - INFO - DisplayManager inicializado: RPI-SALON-001
2024-01-15 10:23:46 - InnoAdDisplay - INFO - Iniciando DisplayManager InnoAd...
2024-01-15 10:23:47 - InnoAdDisplay - INFO - Obtenidos 5 contenidos del backend
2024-01-15 10:23:48 - InnoAdDisplay - INFO - Obtenidas 2 campañas activas
2024-01-15 10:23:49 - InnoAdDisplay - INFO - Contenido descargado: CONTENT-001 -> /var/cache/innoad/CONTENT-001
2024-01-15 10:23:50 - InnoAdDisplay - INFO - Reproduciendo: /var/cache/innoad/CONTENT-001 (tipo: video)
```

## 🎨 Personalización

### Cambiar resolución
```json
{
  "resolucion": "3840x2160"  // 4K
}
```

### Cambiar velocidad de sincronización
```json
{
  "intervalo_sincronizacion": 600  // 10 minutos
}
```

### Modo prueba/simulación
```json
{
  "modo_simulacion": true  // No reproduce videos reales, solo simula
}
```

## 📞 Soporte

Para problemas:
1. Revisar logs: `journalctl -u innoad-display -f`
2. Verificar conectividad: `ping backend`
3. Contactar soporte con: ID de pantalla + últimos 100 logs
4. Repositorio: https://github.com/innoad/display-manager

## 📄 Licencia

InnoAd Display Manager © 2024. Todos los derechos reservados.

# 🍓 Guía de Configuración Raspberry Pi para InnoAd

Esta guía te ayudará a configurar una Raspberry Pi como pantalla digital para el sistema InnoAd.

## 📋 Tabla de Contenidos

1. [Requisitos](#requisitos)
2. [Instalación del Sistema Operativo](#instalación-del-sistema-operativo)
3. [Configuración Inicial](#configuración-inicial)
4. [Instalación del Software](#instalación-del-software)
5. [Configuración del Player](#configuración-del-player)
6. [Inicio Automático](#inicio-automático)
7. [Mantenimiento](#mantenimiento)
8. [Solución de Problemas](#solución-de-problemas)

## 🛠️ Requisitos

### Hardware
- **Raspberry Pi 3 o superior** (Recomendado: Raspberry Pi 4 con 4GB RAM)
- **Tarjeta microSD** de al menos 16GB (Clase 10 o superior)
- **Fuente de alimentación** oficial de Raspberry Pi (5V 3A para Pi 4)
- **Cable HDMI** (o micro HDMI para Pi 4)
- **Monitor/Pantalla** con entrada HDMI
- **Teclado y Mouse** (solo para configuración inicial)
- **Conexión a Internet** (WiFi o Ethernet)

### Software Necesario
- Raspberry Pi OS Lite o Desktop
- Chromium Browser (navegador)
- Node.js (opcional, para desarrollo)

## 💿 Instalación del Sistema Operativo

### Opción 1: Raspberry Pi Imager (Recomendado)

1. **Descargar Raspberry Pi Imager:**
   - Windows/Mac/Linux: https://www.raspberrypi.com/software/

2. **Instalar el SO:**
   ```bash
   # Insertar tarjeta microSD
   # Abrir Raspberry Pi Imager
   # Seleccionar: Raspberry Pi OS (64-bit) Desktop
   # Seleccionar la tarjeta microSD
   # Click en "Write"
   ```

3. **Configuración Avanzada (⚙️ icono):**
   ```
   ✓ Habilitar SSH
   ✓ Configurar usuario y contraseña
   ✓ Configurar WiFi
   ✓ Configurar zona horaria
   ```

### Opción 2: Manual

1. Descargar imagen de https://www.raspberrypi.com/software/operating-systems/
2. Usar Balena Etcher para flashear la tarjeta SD
3. Configurar SSH y WiFi manualmente

## ⚙️ Configuración Inicial

### 1. Primer Arranque

```bash
# Insertar tarjeta SD en Raspberry Pi
# Conectar monitor, teclado, mouse
# Conectar alimentación
# Esperar a que arranque (1-2 minutos)
```

### 2. Actualizar el Sistema

```bash
sudo apt update
sudo apt upgrade -y
sudo reboot
```

### 3. Configurar Raspberry Pi

```bash
sudo raspi-config
```

**Configuraciones recomendadas:**
- `System Options` → `Boot / Auto Login` → `Desktop Autologin`
- `Display Options` → `Screen Blanking` → `No` (Desactivar apagado de pantalla)
- `Performance Options` → `GPU Memory` → `256` (Para mejor rendimiento gráfico)
- `Localisation Options` → Configurar zona horaria y teclado

## 📦 Instalación del Software

### 1. Instalar Chromium y Dependencias

```bash
# Instalar Chromium
sudo apt install -y chromium-browser unclutter

# Instalar herramientas adicionales
sudo apt install -y xdotool x11-xserver-utils
```

### 2. Configurar Chromium para Kiosk Mode

Crear script de inicio:

```bash
nano ~/innoad-player.sh
```

Contenido del script:

```bash
#!/bin/bash

# Configuración
PANTALLA_CODIGO="TU_CODIGO_PANTALLA"
TOKEN_DISPOSITIVO="TU_TOKEN_DISPOSITIVO"
URL_PLAYER="https://tudominio.com/player"

# Esperar a que la red esté lista
sleep 10

# Deshabilitar screensaver y suspensión
xset s off
xset -dpms
xset s noblank

# Ocultar cursor del mouse
unclutter -idle 0.1 &

# Iniciar Chromium en modo kiosk
chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-translate \
  --no-first-run \
  --disable-features=TranslateUI \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --autoplay-policy=no-user-gesture-required \
  --check-for-update-interval=31536000 \
  "${URL_PLAYER}?codigo=${PANTALLA_CODIGO}&token=${TOKEN_DISPOSITIVO}" &

# Actualizar cada 6 horas (reiniciar navegador)
while true; do
  sleep 21600
  pkill chromium
  sleep 5
  chromium-browser \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    "${URL_PLAYER}?codigo=${PANTALLA_CODIGO}&token=${TOKEN_DISPOSITIVO}" &
done
```

Dar permisos de ejecución:

```bash
chmod +x ~/innoad-player.sh
```

### 3. Probar el Script

```bash
# Ejecutar manualmente para probar
~/innoad-player.sh
```

## 🚀 Inicio Automático

### Método 1: Autostart (Recomendado para Desktop)

```bash
# Crear directorio si no existe
mkdir -p ~/.config/autostart

# Crear archivo de autostart
nano ~/.config/autostart/innoad-player.desktop
```

Contenido:

```ini
[Desktop Entry]
Type=Application
Name=InnoAd Player
Exec=/home/pi/innoad-player.sh
X-GNOME-Autostart-enabled=true
```

### Método 2: Systemd Service (Para mayor control)

```bash
sudo nano /etc/systemd/system/innoad-player.service
```

Contenido:

```ini
[Unit]
Description=InnoAd Digital Signage Player
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
Environment=DISPLAY=:0
Environment=XAUTHORITY=/home/pi/.Xauthority
ExecStart=/home/pi/innoad-player.sh
Restart=always
RestartSec=10

[Install]
WantedBy=graphical.target
```

Habilitar el servicio:

```bash
sudo systemctl enable innoad-player.service
sudo systemctl start innoad-player.service
```

Ver estado:

```bash
sudo systemctl status innoad-player.service
```

## 🔧 Configuración Avanzada

### Rotación de Pantalla

Para pantallas en vertical:

```bash
sudo nano /boot/config.txt
```

Agregar al final:

```ini
# Rotar 90 grados (vertical)
display_rotate=1

# Otras opciones:
# display_rotate=0  # Normal
# display_rotate=1  # 90 grados
# display_rotate=2  # 180 grados
# display_rotate=3  # 270 grados
```

### Configuración de Red Estática

```bash
sudo nano /etc/dhcpcd.conf
```

Agregar:

```conf
interface eth0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=8.8.8.8 8.8.4.4
```

### Desactivar WiFi y Bluetooth (Para mayor estabilidad)

```bash
sudo nano /boot/config.txt
```

Agregar:

```ini
# Desactivar WiFi y Bluetooth
dtoverlay=disable-wifi
dtoverlay=disable-bt
```

## 📊 Monitoreo y Mantenimiento

### Script de Monitoreo

Crear script para verificar estado:

```bash
nano ~/check-status.sh
```

Contenido:

```bash
#!/bin/bash

echo "=== Estado del Sistema InnoAd ==="
echo ""
echo "Fecha/Hora: $(date)"
echo "Temperatura CPU: $(vcgencmd measure_temp)"
echo "Uso de Memoria:"
free -h
echo ""
echo "Procesos Chromium:"
ps aux | grep chromium | grep -v grep
echo ""
echo "Conectividad:"
ping -c 3 google.com
```

### Reinicio Programado

Agregar reinicio diario a las 4 AM:

```bash
sudo crontab -e
```

Agregar línea:

```cron
0 4 * * * /sbin/shutdown -r now
```

### Actualización Automática

```bash
sudo crontab -e
```

Agregar:

```cron
0 3 * * 0 apt update && apt upgrade -y
```

## 🔒 Seguridad

### Cambiar Contraseña Predeterminada

```bash
passwd
```

### Configurar Firewall

```bash
sudo apt install ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Actualizar Regularmente

```bash
# Crear script de actualización
sudo nano /usr/local/bin/update-system.sh
```

Contenido:

```bash
#!/bin/bash
apt update
apt upgrade -y
apt autoremove -y
reboot
```

## 🆘 Solución de Problemas

### La pantalla se apaga

```bash
# Editar config de LXDE
nano ~/.config/lxsession/LXDE-pi/autostart
```

Agregar:

```
@xset s off
@xset -dpms
@xset s noblank
```

### Chromium no inicia

```bash
# Ver logs
journalctl -u innoad-player.service -f

# Reiniciar servicio
sudo systemctl restart innoad-player.service

# Limpiar cache de Chromium
rm -rf ~/.config/chromium/Default/Cache/*
```

### No hay conexión a Internet

```bash
# Verificar conexión
ping google.com

# Reiniciar red
sudo systemctl restart dhcpcd

# Verificar configuración WiFi
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf
```

### Audio no funciona

```bash
# Forzar salida HDMI
sudo raspi-config
# Advanced Options → Audio → Force HDMI
```

### Pantalla parpadea o tiene problemas

```bash
sudo nano /boot/config.txt
```

Agregar:

```ini
# Forzar modo HDMI
hdmi_force_hotplug=1
hdmi_drive=2
```

## 📝 Registro de Pantalla en el Sistema

### 1. Desde el Panel de Administración

1. Ir a `https://tudominio.com/pantallas`
2. Click en "Agregar Pantalla"
3. Completar formulario con datos de ubicación
4. Copiar el **Código de Pantalla** y **Token**
5. Usar estos valores en el script `innoad-player.sh`

### 2. Prueba del Player

Antes de configurar en producción, probar con:

```
https://tudominio.com/player?prueba=true
```

Esto cargará contenido de prueba sin necesidad de autenticación.

## 🎨 Personalización

### Agregar Logo de Inicio

```bash
# Cambiar splash screen
sudo apt install fbi
sudo nano /etc/systemd/system/splashscreen.service
```

### Modo Oscuro

```bash
# Configurar tema oscuro en Chromium
chromium-browser --force-dark-mode
```

## 📊 Comandos Útiles

```bash
# Ver temperatura
vcgencmd measure_temp

# Ver voltaje
vcgencmd measure_volts

# Ver frecuencia CPU
vcgencmd measure_clock arm

# Ver uso de GPU
vcgencmd get_mem gpu

# Reiniciar
sudo reboot

# Apagar
sudo shutdown -h now

# Ver logs del sistema
sudo journalctl -xe

# Ver procesos
htop

# Espacio en disco
df -h
```

## 🔄 Actualización del Software

Para actualizar la configuración del player:

```bash
cd ~
nano innoad-player.sh
# Hacer cambios necesarios
chmod +x innoad-player.sh
sudo systemctl restart innoad-player.service
```

## 📞 Soporte

Para soporte adicional:
- Email: soporte@innoad.com
- Documentación: https://docs.innoad.com
- GitHub: https://github.com/innoad/player

## 🎯 Checklist de Configuración

- [ ] Sistema operativo instalado y actualizado
- [ ] Configuración de red (WiFi o Ethernet)
- [ ] Chromium instalado
- [ ] Script de player creado y probado
- [ ] Inicio automático configurado
- [ ] Pantalla registrada en el sistema
- [ ] Código y token configurados en el script
- [ ] Prueba de reproducción exitosa
- [ ] Configuración de reinicio automático
- [ ] Monitoreo configurado
- [ ] Documentación de ubicación física

## ✅ Validación Final

Antes de desplegar en producción, verificar:

1. ✓ La pantalla inicia automáticamente al encender
2. ✓ El contenido se reproduce correctamente
3. ✓ La conexión a internet es estable
4. ✓ No hay parpadeos o problemas visuales
5. ✓ El sistema reporta estado al servidor
6. ✓ Las actualizaciones automáticas funcionan
7. ✓ El reinicio programado funciona

## 🚀 Despliegue en Producción

Una vez validado todo:

1. Desconectar teclado y mouse
2. Montar la Raspberry Pi en su ubicación final
3. Conectar a la pantalla de visualización
4. Conectar alimentación
5. Verificar que inicia correctamente
6. Monitorear durante las primeras 24 horas

---

**¡Felicitaciones!** Tu pantalla digital InnoAd está lista para operar. 🎉

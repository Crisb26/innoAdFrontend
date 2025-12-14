#!/bin/bash

# InnoAd Display Manager - Script de instalación en Raspberry Pi
# Este script configura todo lo necesario para ejecutar el cliente InnoAd

set -e

echo "========================================"
echo "   InnoAd Display Manager - Setup"
echo "========================================"

# Actualizar sistema
echo "[1/6] Actualizando sistema..."
sudo apt-get update
sudo apt-get upgrade -y

# Instalar dependencias Python
echo "[2/6] Instalando Python3 y pip..."
sudo apt-get install -y python3 python3-pip python3-venv

# Instalar psutil y requests
echo "[3/6] Instalando dependencias Python..."
pip3 install --upgrade pip
pip3 install psutil requests

# Instalar OMXPlayer (reproductor de video)
echo "[4/6] Instalando OMXPlayer..."
sudo apt-get install -y omxplayer

# Crear directorio de cache y logs
echo "[5/6] Creando directorios..."
sudo mkdir -p /var/cache/innoad
sudo mkdir -p /etc/innoad
sudo mkdir -p /var/log
sudo chown -R pi:pi /var/cache/innoad
sudo chown -R pi:pi /etc/innoad

# Copiar archivos
echo "[6/6] Configurando aplicación..."
sudo cp innoad-display-manager.py /opt/innoad-display-manager.py
sudo cp display-config.json /etc/innoad/display.json
sudo chmod +x /opt/innoad-display-manager.py

# Crear servicio systemd
sudo tee /etc/systemd/system/innoad-display.service > /dev/null <<EOF
[Unit]
Description=InnoAd Display Manager
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
ExecStart=/usr/bin/python3 /opt/innoad-display-manager.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable innoad-display

echo ""
echo "========================================"
echo "   Instalación completada!"
echo "========================================"
echo ""
echo "Próximos pasos:"
echo "1. Editar configuración: sudo nano /etc/innoad/display.json"
echo "2. Iniciar servicio: sudo systemctl start innoad-display"
echo "3. Ver logs: journalctl -u innoad-display -f"
echo ""

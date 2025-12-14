#!/usr/bin/env python3
"""
InnoAd Raspberry Pi Display Manager
Cliente inteligente para gestionar pantallas digitales
Conecta con backend InnoAd para sincronización de contenidos y control
"""

import os
import sys
import json
import time
import requests
import threading
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
import subprocess
import psutil
import socket

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/innoad-display.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('InnoAdDisplay')


class ConfiguracionDisplay:
    """Gestiona la configuración del display"""
    
    def __init__(self, archivo_config: str = '/etc/innoad/display.json'):
        self.archivo_config = archivo_config
        self.cargar_configuracion()
    
    def cargar_configuracion(self):
        """Carga configuración desde archivo JSON"""
        try:
            with open(self.archivo_config, 'r') as f:
                config = json.load(f)
                self.id_pantalla = config.get('id', 'RPI-INNOAD-001')
                self.nombre = config.get('nombre', 'Pantalla InnoAd')
                self.ubicacion = config.get('ubicacion', 'Desconocida')
                self.resolucion = config.get('resolucion', '1920x1080')
                self.url_backend = config.get('url_backend', 'http://localhost:8080/api')
                self.token_api = config.get('token_api', '')
                self.intervalo_sincronizacion = config.get('intervalo_sincronizacion', 300)  # 5 minutos
                logger.info(f"Configuración cargada: {self.id_pantalla}")
        except FileNotFoundError:
            logger.warning(f"Archivo de configuración no encontrado: {self.archivo_config}")
            self._crear_configuracion_default()
    
    def _crear_configuracion_default(self):
        """Crea configuración por defecto"""
        self.id_pantalla = 'RPI-INNOAD-001'
        self.nombre = 'Pantalla InnoAd'
        self.ubicacion = 'Ubicación Desconocida'
        self.resolucion = '1920x1080'
        self.url_backend = 'http://localhost:8080/api'
        self.token_api = ''
        self.intervalo_sincronizacion = 300
        logger.info("Usando configuración por defecto")
    
    def guardar(self):
        """Guarda la configuración actual"""
        Path(self.archivo_config).parent.mkdir(parents=True, exist_ok=True)
        config = {
            'id': self.id_pantalla,
            'nombre': self.nombre,
            'ubicacion': self.ubicacion,
            'resolucion': self.resolucion,
            'url_backend': self.url_backend,
            'token_api': self.token_api,
            'intervalo_sincronizacion': self.intervalo_sincronizacion
        }
        with open(self.archivo_config, 'w') as f:
            json.dump(config, f, indent=2)
        logger.info(f"Configuración guardada: {self.archivo_config}")


class ClienteBackendInnoAd:
    """Cliente para comunicarse con el backend de InnoAd"""
    
    def __init__(self, url_base: str, token: str, id_pantalla: str):
        self.url_base = url_base.rstrip('/')
        self.token = token
        self.id_pantalla = id_pantalla
        self.headers = {
            'Authorization': f'Bearer {token}' if token else '',
            'Content-Type': 'application/json',
            'X-Display-ID': id_pantalla,
            'X-Client': 'innoad-display-rpi'
        }
        self.timeout = 30
    
    def obtener_contenidos(self) -> List[Dict[str, Any]]:
        """Obtiene contenidos asignados a esta pantalla"""
        try:
            url = f"{self.url_base}/pantallas/{self.id_pantalla}/contenidos"
            response = requests.get(url, headers=self.headers, timeout=self.timeout)
            response.raise_for_status()
            contenidos = response.json().get('data', [])
            logger.info(f"Obtenidos {len(contenidos)} contenidos del backend")
            return contenidos
        except requests.exceptions.RequestException as e:
            logger.error(f"Error obteniendo contenidos: {e}")
            return []
    
    def obtener_campanas_activas(self) -> List[Dict[str, Any]]:
        """Obtiene campañas activas para esta pantalla"""
        try:
            url = f"{self.url_base}/campanas/activas?pantalla={self.id_pantalla}"
            response = requests.get(url, headers=self.headers, timeout=self.timeout)
            response.raise_for_status()
            campanas = response.json().get('data', [])
            logger.info(f"Obtenidas {len(campanas)} campañas activas")
            return campanas
        except requests.exceptions.RequestException as e:
            logger.error(f"Error obteniendo campañas: {e}")
            return []
    
    def reportar_estado(self, estado: Dict[str, Any]) -> bool:
        """Reporta estado de la pantalla al backend"""
        try:
            url = f"{self.url_base}/pantallas/{self.id_pantalla}/estado"
            payload = {
                'estado': 'activa',
                'timestamp': datetime.now().isoformat(),
                'metricas': estado
            }
            response = requests.post(url, json=payload, headers=self.headers, timeout=self.timeout)
            response.raise_for_status()
            logger.info("Estado reportado al backend")
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"Error reportando estado: {e}")
            return False
    
    def registrar_reproduccion(self, id_contenido: str, duracion: int) -> bool:
        """Registra la reproducción de un contenido"""
        try:
            url = f"{self.url_base}/analytics/reproduccion"
            payload = {
                'id_pantalla': self.id_pantalla,
                'id_contenido': id_contenido,
                'timestamp': datetime.now().isoformat(),
                'duracion': duracion
            }
            response = requests.post(url, json=payload, headers=self.headers, timeout=self.timeout)
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"Error registrando reproducción: {e}")
            return False


class GestorContenidos:
    """Gestiona descarga y almacenamiento de contenidos"""
    
    def __init__(self, directorio_base: str = '/var/cache/innoad'):
        self.directorio_base = directorio_base
        Path(self.directorio_base).mkdir(parents=True, exist_ok=True)
    
    def descargar_contenido(self, url: str, id_contenido: str, tipo: str) -> Optional[str]:
        """Descarga un contenido desde el backend"""
        try:
            ruta_local = Path(self.directorio_base) / f"{id_contenido}"
            ruta_local.parent.mkdir(parents=True, exist_ok=True)
            
            response = requests.get(url, stream=True, timeout=60)
            response.raise_for_status()
            
            with open(ruta_local, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            
            logger.info(f"Contenido descargado: {id_contenido} -> {ruta_local}")
            return str(ruta_local)
        except Exception as e:
            logger.error(f"Error descargando contenido {id_contenido}: {e}")
            return None
    
    def limpiar_contenidos_antiguos(self, horas: int = 24):
        """Limpia contenidos no utilizados"""
        try:
            ahora = time.time()
            for archivo in Path(self.directorio_base).glob('*'):
                edad = ahora - archivo.stat().st_mtime
                if edad > (horas * 3600):
                    archivo.unlink()
                    logger.info(f"Contenido antiguo eliminado: {archivo.name}")
        except Exception as e:
            logger.error(f"Error limpiando contenidos: {e}")


class ReprodoctorMultimedia:
    """Gestiona la reproducción de contenidos en pantalla"""
    
    def __init__(self, modo_simulacion: bool = False):
        self.modo_simulacion = modo_simulacion
        self.proceso_actual: Optional[subprocess.Popen] = None
        self.contenido_actual: Optional[str] = None
    
    def reproducir(self, ruta_archivo: str, tipo_contenido: str) -> bool:
        """Inicia reproducción de un archivo"""
        try:
            logger.info(f"Reproduciendo: {ruta_archivo} (tipo: {tipo_contenido})")
            
            if self.modo_simulacion:
                logger.info("[SIMULACIÓN] Reproducción iniciada")
                return True
            
            # Usar OMXPlayer en Raspberry Pi (instalado por defecto)
            if tipo_contenido in ['video', 'imagen']:
                comando = ['omxplayer', '-o', 'hdmi', '--win', '0,0,1920,1080', ruta_archivo]
                self.proceso_actual = subprocess.Popen(comando)
                self.contenido_actual = ruta_archivo
                logger.info(f"Proceso reproducción iniciado: PID {self.proceso_actual.pid}")
                return True
            
            return False
        except Exception as e:
            logger.error(f"Error iniciando reproducción: {e}")
            return False
    
    def detener(self):
        """Detiene la reproducción actual"""
        try:
            if self.proceso_actual and self.proceso_actual.poll() is None:
                self.proceso_actual.terminate()
                self.proceso_actual.wait(timeout=5)
                logger.info("Reproducción detenida")
        except Exception as e:
            logger.error(f"Error deteniendo reproducción: {e}")
    
    def obtener_estado(self) -> Dict[str, Any]:
        """Obtiene estado de reproducción actual"""
        return {
            'reproduciendo': self.proceso_actual is not None and self.proceso_actual.poll() is None,
            'contenido_actual': self.contenido_actual,
            'timestamp': datetime.now().isoformat()
        }


class MonitorSistema:
    """Monitorea recursos del sistema"""
    
    @staticmethod
    def obtener_metricas() -> Dict[str, Any]:
        """Obtiene métricas de sistema"""
        try:
            memoria = psutil.virtual_memory()
            cpu = psutil.cpu_percent(interval=1)
            disco = psutil.disk_usage('/')
            
            return {
                'cpu_percent': cpu,
                'memoria_porcento': memoria.percent,
                'memoria_disponible_mb': memoria.available // (1024 * 1024),
                'temperatura': MonitorSistema._obtener_temperatura(),
                'disco_disponible_gb': disco.free / (1024**3),
                'ip_local': MonitorSistema._obtener_ip_local(),
                'uptime_segundos': int(time.time() - psutil.boot_time())
            }
        except Exception as e:
            logger.error(f"Error obteniendo métricas: {e}")
            return {}
    
    @staticmethod
    def _obtener_temperatura() -> Optional[float]:
        """Obtiene temperatura de CPU (Raspberry Pi específico)"""
        try:
            with open('/sys/class/thermal/thermal_zone0/temp', 'r') as f:
                temp_raw = int(f.read().strip())
                return temp_raw / 1000.0  # Convertir de milidegrees a grados
        except:
            return None
    
    @staticmethod
    def _obtener_ip_local() -> str:
        """Obtiene dirección IP local"""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return "Desconocida"


class Programador:
    """Maneja programación de contenidos en horarios"""
    
    def __init__(self, campanas: List[Dict[str, Any]]):
        self.campanas = campanas
        self.secuencia_actual: List[Dict[str, Any]] = []
        self.actualizar_secuencia()
    
    def actualizar_secuencia(self):
        """Actualiza secuencia basada en horarios de campañas"""
        ahora = datetime.now()
        self.secuencia_actual = []
        
        for campana in self.campanas:
            inicio = datetime.fromisoformat(campana.get('fecha_inicio', ''))
            fin = datetime.fromisoformat(campana.get('fecha_fin', ''))
            
            if inicio <= ahora <= fin:
                self.secuencia_actual.extend(campana.get('contenidos', []))
                logger.info(f"Campaña activa agregada a secuencia: {campana.get('nombre')}")
    
    def obtener_siguiente(self) -> Optional[Dict[str, Any]]:
        """Obtiene siguiente contenido a reproducir"""
        if self.secuencia_actual:
            return self.secuencia_actual[0]
        return None


class DisplayManagerPrincipal:
    """Orquestador principal del gestor de pantalla"""
    
    def __init__(self, archivo_config: str = '/etc/innoad/display.json'):
        self.configuracion = ConfiguracionDisplay(archivo_config)
        self.cliente_backend = ClienteBackendInnoAd(
            self.configuracion.url_backend,
            self.configuracion.token_api,
            self.configuracion.id_pantalla
        )
        self.gestor_contenidos = GestorContenidos()
        self.reproductor = ReprodoctorMultimedia(modo_simulacion=True)  # Simulación por defecto
        self.monitor_sistema = MonitorSistema()
        self.programador: Optional[Programador] = None
        
        self.activo = True
        self.hilo_sincronizacion: Optional[threading.Thread] = None
        self.hilo_monitoreo: Optional[threading.Thread] = None
        
        logger.info(f"DisplayManager inicializado: {self.configuracion.id_pantalla}")
    
    def iniciar(self):
        """Inicia el gestor de pantalla"""
        logger.info("Iniciando DisplayManager InnoAd...")
        
        # Hilo de sincronización con backend
        self.hilo_sincronizacion = threading.Thread(target=self._loop_sincronizacion, daemon=True)
        self.hilo_sincronizacion.start()
        
        # Hilo de monitoreo
        self.hilo_monitoreo = threading.Thread(target=self._loop_monitoreo, daemon=True)
        self.hilo_monitoreo.start()
        
        # Loop principal de reproducción
        self._loop_reproduccion()
    
    def _loop_sincronizacion(self):
        """Loop de sincronización con backend"""
        while self.activo:
            try:
                time.sleep(self.configuracion.intervalo_sincronizacion)
                
                # Obtener contenidos y campañas
                contenidos = self.cliente_backend.obtener_contenidos()
                campanas = self.cliente_backend.obtener_campanas_activas()
                
                # Actualizar programador
                self.programador = Programador(campanas)
                
                # Descargar nuevos contenidos
                for contenido in contenidos:
                    if not Path(self.gestor_contenidos.directorio_base / contenido['id']).exists():
                        self.gestor_contenidos.descargar_contenido(
                            contenido['url'],
                            contenido['id'],
                            contenido['tipo']
                        )
                
                logger.info("Sincronización completada")
            except Exception as e:
                logger.error(f"Error en loop de sincronización: {e}")
    
    def _loop_monitoreo(self):
        """Loop de monitoreo de sistema"""
        while self.activo:
            try:
                time.sleep(60)  # Cada minuto
                metricas = self.monitor_sistema.obtener_metricas()
                metricas.update(self.reproductor.obtener_estado())
                
                self.cliente_backend.reportar_estado(metricas)
            except Exception as e:
                logger.error(f"Error en loop de monitoreo: {e}")
    
    def _loop_reproduccion(self):
        """Loop principal de reproducción"""
        while self.activo:
            try:
                # Obtener siguiente contenido
                siguiente = self.programador.obtener_siguiente() if self.programador else None
                
                if siguiente:
                    ruta = Path(self.gestor_contenidos.directorio_base) / siguiente['id']
                    if ruta.exists():
                        if self.reproductor.reproducir(str(ruta), siguiente['tipo']):
                            # Registrar reproducción
                            duracion = siguiente.get('duracion', 0)
                            self.cliente_backend.registrar_reproduccion(siguiente['id'], duracion)
                            
                            # Esperar a que termine
                            time.sleep(duracion + 2 if duracion else 5)
                        else:
                            time.sleep(2)
                    else:
                        logger.warning(f"Archivo no encontrado: {ruta}")
                        time.sleep(2)
                else:
                    time.sleep(1)
            except KeyboardInterrupt:
                self.detener()
            except Exception as e:
                logger.error(f"Error en loop de reproducción: {e}")
                time.sleep(5)
    
    def detener(self):
        """Detiene el gestor"""
        logger.info("Deteniendo DisplayManager...")
        self.activo = False
        self.reproductor.detener()


def main():
    """Punto de entrada principal"""
    try:
        manager = DisplayManagerPrincipal()
        manager.iniciar()
    except Exception as e:
        logger.error(f"Error fatal: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()

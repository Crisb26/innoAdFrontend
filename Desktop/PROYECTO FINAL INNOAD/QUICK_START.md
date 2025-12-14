# ⚡ QUICK START - COMANDOS RÁPIDOS

## 🚀 OPCIÓN A: Frontend HTTP Services (15-45 min)

### 1️⃣ Crear ServicioPantallas
```bash
# Archivo: src/app/core/servicios/pantallas.servicio.ts

# Copiar de GUIA_INTEGRACION_COMPLETA.md
# → Sección "Servicios HTTP a crear" → "ServicioPantallas"

# Luego:
ng serve --proxy-config proxy.conf.json
# Verificar en http://localhost:4200/pantallas
```

### 2️⃣ Crear ServicioCampanas
```bash
# Archivo: src/app/core/servicios/campanas.servicio.ts

# Copiar de GUIA_INTEGRACION_COMPLETA.md
# → Sección "Servicios HTTP a crear" → "ServicioCampanas"

# Luego:
ng serve --proxy-config proxy.conf.json
# Verificar en http://localhost:4200/campanas
```

### 3️⃣ Crear ServicioReportes
```bash
# Archivo: src/app/core/servicios/reportes.servicio.ts

# Copiar de GUIA_INTEGRACION_COMPLETA.md
# → Sección "Servicios HTTP a crear" → "ServicioReportes"

# Luego:
ng serve --proxy-config proxy.conf.json
# Verificar en http://localhost:4200/reportes
```

### 4️⃣ Actualizar componentes para usar servicios

#### lista-pantallas.component.ts
```typescript
// Línea 1: Añadir import
import { ServicioPantallas } from '../../../core/servicios/pantallas.servicio';

// En constructor:
constructor(private servicio: ServicioPantallas) {}

// En ngOnInit:
ngOnInit() {
  this.cargarPantallas();
}

cargarPantallas() {
  this.servicio.obtenerTodas(this.pagina, this.tamanio, this.filtro)
    .subscribe({
      next: (pantallas) => {
        this.pantallas$.next(pantallas);
      },
      error: (error) => console.error('Error:', error)
    });
}

// Copiar métodos:
crear(pantalla: Pantalla) { 
  this.servicio.crear(pantalla)
    .subscribe(() => this.cargarPantallas()); 
}

actualizar(pantalla: Pantalla) { 
  this.servicio.actualizar(pantalla)
    .subscribe(() => this.cargarPantallas()); 
}

eliminar(id: string) { 
  this.servicio.eliminar(id)
    .subscribe(() => this.cargarPantallas()); 
}
```

#### lista-campanas.component.ts
```typescript
// Similar a pantallas
// Copiar el patrón anterior pero con ServicioCampanas
// Métodos: obtenerTodas(), crear(), actualizar(), eliminar(), duplicar()
```

#### dashboard-reportes.component.ts
```typescript
// Similar a pantallas
// Copiar el patrón anterior pero con ServicioReportes
// Métodos: obtenerDashboard(), exportarPDF(), exportarCSV()
// Constructor: agregarSelector de período
```

### 5️⃣ Probar conectividad
```bash
# Terminal 1: Backend
cd BACKEND/innoadBackend
mvn spring-boot:run

# Terminal 2: Frontend
cd FRONTEND/innoadFrontend
ng serve --proxy-config proxy.conf.json

# Abrir Chrome DevTools (F12)
# → Network tab
# → Navegar a /contenidos, /pantallas, /campanas, /reportes
# → Ver requests HTTP
# → Verificar status 200
```

---

## 🎬 OPCIÓN B: Raspberry Pi (20-30 min)

### 1️⃣ Preparar archivos en RPi
```bash
# En tu Raspberry Pi (o transferir los archivos)

# Crear directorio
mkdir ~/innoad-setup
cd ~/innoad-setup

# Copiar archivos:
# - innoad-display-manager.py
# - display-config.json
# - install-rpi.sh
# - requirements-rpi.txt

# Dar permisos
chmod +x install-rpi.sh
chmod +x innoad-display-manager.py
```

### 2️⃣ Ejecutar instalación
```bash
sudo ./install-rpi.sh

# Esperará a completar:
# ✓ Sistema actualizado
# ✓ Python + pip instalados
# ✓ Dependencias (psutil, requests) instaladas
# ✓ OMXPlayer instalado
# ✓ Directorios creados
# ✓ Servicio systemd configurado
```

### 3️⃣ Configurar
```bash
# Editar configuración
sudo nano /etc/innoad/display.json

# EDITAR ESTOS CAMPOS:
# - "id": Cambiar a un nombre único (ej: "RPI-SALON-001")
# - "nombre": Nombre visible (ej: "Pantalla Entrada")
# - "ubicacion": Ubicación física (ej: "Lobby")
# - "url_backend": URL del backend (ej: "http://192.168.1.100:8080/api")
# - "token_api": Tu token JWT de autenticación

# Guardar: Ctrl+X, Y, Enter
```

### 4️⃣ Obtener JWT Token
```bash
# Opción 1: Desde API backend
curl -X POST http://tu-backend:8080/api/autenticacion/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"display","contraseña":"contraseña"}'
# Copiar el token devuelto

# Opción 2: Desde panel admin
# Ir a http://innoad.tudominio.com/admin
# → Administración → API Keys
# → Crear nueva clave para "Pantalla/Display"
# → Copiar token JWT
```

### 5️⃣ Iniciar servicio
```bash
# Iniciar
sudo systemctl start innoad-display

# Ver logs en vivo
sudo journalctl -u innoad-display -f

# Si ve logs tipo:
# "DisplayManager inicializado: RPI-SALON-001"
# "Obtenidos 5 contenidos del backend"
# "Reproduciendo: /var/cache/innoad/CONTENT-001"
# → ¡ESTÁ FUNCIONANDO! ✅

# Salir de logs: Ctrl+C
```

### 6️⃣ Verificar estado
```bash
# Ver estado del servicio
sudo systemctl status innoad-display

# Debería mostrar:
# ● innoad-display.service - InnoAd Display Manager
#    Loaded: loaded (/etc/systemd/system/innoad-display.service)
#    Active: active (running)

# Ver último log
sudo journalctl -u innoad-display -n 20

# Ver procesos
ps aux | grep innoad

# Conectividad con backend
curl -H "Authorization: Bearer $TOKEN" \
     http://192.168.1.100:8080/api/pantallas/RPI-SALON-001
```

### 7️⃣ Acceder al dashboard
```
http://innoad.tudominio.com/admin/pantallas

# Debería ver:
- Tu Raspberry Pi listada con ID "RPI-SALON-001"
- Estado: "activa" (verde)
- Métricas: CPU, RAM, Temperatura
- Botones: Test, Recargar, Reiniciar, Eliminar, Editar

# Probar botones:
- Clic en "📺 Test" → Debería mostrar patrón de colores en pantalla
- Clic en "🔄 Recargar" → RPi sincroniza contenidos
- Clic en "⚡ Reiniciar" → RPi se reinicia
```

---

## 🔧 Comandos Útiles RPi

### Ver logs
```bash
# Tiempo real
sudo journalctl -u innoad-display -f

# Últimas 50 líneas
sudo journalctl -u innoad-display -n 50

# Filtrar por error
sudo journalctl -u innoad-display | grep ERROR

# Ver logs del sistema
sudo journalctl -n 100 | tail -50
```

### Estado del sistema
```bash
# CPU y memoria
top -bn1 | head -20

# O más simple
free -h && echo "---" && ps aux | grep innoad

# Temperatura
vcgencmd measure_temp

# IP
hostname -I

# Uptime
uptime

# Espacio disco
df -h
```

### Gestionar servicio
```bash
# Iniciar
sudo systemctl start innoad-display

# Parar
sudo systemctl stop innoad-display

# Reiniciar
sudo systemctl restart innoad-display

# Estado
sudo systemctl status innoad-display

# Ver logs
sudo systemctl status -l innoad-display

# Deshabilitar auto-inicio (si necesita)
sudo systemctl disable innoad-display

# Habilitar auto-inicio
sudo systemctl enable innoad-display
```

### Editar configuración
```bash
# Editar
sudo nano /etc/innoad/display.json

# Ver
cat /etc/innoad/display.json

# Validar JSON
python3 -m json.tool /etc/innoad/display.json
```

### Limpiar caché
```bash
# Ver tamaño
du -sh /var/cache/innoad

# Limpiar
sudo rm -rf /var/cache/innoad/*

# Luego:
sudo systemctl restart innoad-display
```

### Verificar conectividad
```bash
# Ping al backend
ping 192.168.1.100

# DNS
nslookup innoad.tudominio.com

# Curl con JWT
TOKEN="tu-jwt-token-aqui"
curl -H "Authorization: Bearer $TOKEN" \
     http://192.168.1.100:8080/api/pantallas/RPI-SALON-001

# Debería devolver JSON con datos de la pantalla
```

---

## 🧪 Testing Rápido

### Test Frontend (Opción A)
```bash
# 1. Verificar backend está corriendo
curl http://localhost:8080/api/v1/contenidos
# Debería devolver JSON

# 2. Iniciar frontend
cd FRONTEND/innoadFrontend
ng serve --proxy-config proxy.conf.json

# 3. Abrir navegador
http://localhost:4200

# 4. Ir a /contenidos
# Debería cargar lista de contenidos del backend

# 5. Intentar crear un contenido
# Llenar formulario y guardar
# Debería recargar lista

# 6. Abrir DevTools (F12)
# Network tab → filter "contenidos"
# Verificar que se hacen requests HTTP (no mock data)
```

### Test Raspberry Pi (Opción B)
```bash
# 1. Ver logs
sudo journalctl -u innoad-display -f

# 2. En otra terminal, ver métricas
watch -n 5 'vcgencmd measure_temp && echo "---" && free -h'

# 3. Desde dashboard, hacer un test
# Ir a http://innoad.tudominio.com/admin/pantallas
# Clic en "📺 Test" en tu RPi

# 4. Verificar en logs:
# "Test enviado a pantalla: RPI-SALON-001"

# 5. Pantalla debería mostrar patrón de colores

# 6. Probar Recargar
# Clic en "🔄 Recargar"
# Ver logs:
# "Sincronización completada"

# 7. Probar Reiniciar
# Clic en "⚡ Reiniciar"
# RPi se reiniciará (desaparecerá del dashboard 30 segundos)
```

---

## 📊 Documentación Rápida

### Donde están los archivos
```
BACKEND/
└── innoadBackend/
    └── pom.xml (ACTUALIZADO)

FRONTEND/
└── innoadFrontend/
    ├── package.json (ACTUALIZADO - Angular 19.2.17)
    └── src/app/
        ├── modulos/
        │   ├── contenidos/ (✅ COMPLETO)
        │   ├── pantallas/ (✅ COMPLETO)
        │   ├── campanas/ (✅ COMPLETO)
        │   ├── reportes/ (✅ COMPLETO)
        │   └── mantenimiento/
        │       └── gestor-raspberrypi.component.ts (✅ NUEVO)
        │
        └── core/
            ├── servicios/
            │   ├── contenidos.servicio.ts (✅ VERIFICADO)
            │   └── raspberrypi.servicio.ts (✅ NUEVO)
            │
            └── interceptores/
                └── auth.interceptor.ts (✅ VERIFICADO)

PROYECTO FINAL INNOAD/
├── innoad-display-manager.py (✅ NUEVO - 700 líneas)
├── display-config.json (✅ NUEVO)
├── install-rpi.sh (✅ NUEVO)
├── requirements-rpi.txt (✅ NUEVO)
├── README-DISPLAY-MANAGER.md (✅ NUEVO - 700 líneas)
├── GUIA_INTEGRACION_COMPLETA.md (✅ NUEVO - 500 líneas)
├── RESUMEN_FINAL_COMPLETO.md (✅ NUEVO)
├── RESUMEN_VISUAL_FINAL.md (✅ NUEVO)
├── INDICE_GENERAL.md (✅ NUEVO)
└── QUICK_START.md (Este archivo)
```

### Documentación por necesidad
```
❓ "Quiero implementar servicios HTTP"
→ Lee: GUIA_INTEGRACION_COMPLETA.md (secciones 2-4)
→ Usa plantillas de código en sección "Servicios HTTP a crear"

❓ "Quiero instalar Raspberry Pi"
→ Lee: README-DISPLAY-MANAGER.md (secciones 1-4)
→ Sigue comandos en "Instalación Rápida"

❓ "Quiero ver qué se entregó"
→ Lee: RESUMEN_VISUAL_FINAL.md
→ O: RESUMEN_FINAL_COMPLETO.md

❓ "No sé por dónde empezar"
→ Lee: INDICE_GENERAL.md
→ O: Este archivo (QUICK_START.md)

❓ "Necesito comandos específicos"
→ Este archivo tiene todos los comandos

❓ "Tengo un error/problema"
→ Busca en: README-DISPLAY-MANAGER.md → "Troubleshooting"
→ O: GUIA_INTEGRACION_COMPLETA.md → "Pruebas de Conectividad"
```

---

## ✅ Checklist Implementación

### Opción A: Servicios HTTP
- [ ] Crear ServicioPantallas
- [ ] Crear ServicioCampanas
- [ ] Crear ServicioReportes
- [ ] Actualizar lista-pantallas.component.ts
- [ ] Actualizar lista-campanas.component.ts
- [ ] Actualizar dashboard-reportes.component.ts
- [ ] Probar en http://localhost:4200
- [ ] Verificar Network tab en DevTools (requests HTTP)
- [ ] Verificar que los datos vienen del backend

### Opción B: Raspberry Pi
- [ ] Preparar archivos en RPi
- [ ] Ejecutar ./install-rpi.sh
- [ ] Editar /etc/innoad/display.json
- [ ] Obtener JWT token del backend
- [ ] Iniciar: sudo systemctl start innoad-display
- [ ] Verificar logs: journalctl -u innoad-display -f
- [ ] Acceder al dashboard http://innoad.tudominio.com/admin/pantallas
- [ ] Probar botón Test (📺)
- [ ] Probar botón Recargar (🔄)
- [ ] Probar botón Reiniciar (⚡)

---

## 🎯 Tiempo Estimado

| Tarea | Tiempo | Dificultad |
|-------|--------|-----------|
| Crear 3 servicios HTTP | 30 min | Bajo |
| Actualizar 3 componentes | 30 min | Bajo |
| Pruebas HTTP | 15 min | Bajo |
| **Total Opción A** | **1.25 h** | **Bajo** |
| Instalar RPi (si script funciona) | 5 min | Muy Bajo |
| Configurar RPi | 5 min | Muy Bajo |
| Obtener JWT | 5 min | Muy Bajo |
| Verificar en dashboard | 5 min | Muy Bajo |
| **Total Opción B** | **20 min** | **Muy Bajo** |
| **TOTAL AMBAS** | **1.75 h** | **Bajo** |

---

## 🆘 Si algo va mal

### Frontend no conecta con backend
```bash
# 1. Verificar backend está corriendo
curl http://localhost:8080/api/v1/contenidos

# 2. Verificar proxy.conf.json existe
cat FRONTEND/innoadFrontend/proxy.conf.json

# 3. Reiniciar ng serve con proxy
ng serve --proxy-config proxy.conf.json

# 4. Abrir DevTools (F12) → Network
# → Buscar requests a /api
# → Verificar que van a http://localhost:8080/api
```

### RPi no sincroniza
```bash
# 1. Ver logs
sudo journalctl -u innoad-display -f

# 2. Verificar token es válido
# Token no debe estar expirado

# 3. Verificar URL backend es accesible
ping 192.168.1.100  # O tu IP

# 4. Probar conectividad manualmente
TOKEN="tu-token"
curl -H "Authorization: Bearer $TOKEN" \
     http://192.168.1.100:8080/api/pantallas

# 5. Si falla, revisar:
# - IP correcta?
# - Puerto correcto (8080)?
# - Token válido?
# - Backend está corriendo?
```

### Servicio no inicia
```bash
# Ver error específico
sudo systemctl status innoad-display

# Si dice "Failed to start"
# Ver logs detallados
sudo journalctl -u innoad-display -n 50

# Posibles problemas:
# - Python no instalado: sudo apt install python3
# - Dependencias faltando: pip install -r requirements-rpi.txt
# - Permisos: sudo chown pi:pi /etc/innoad/display.json
# - Puerto ocupado: sudo netstat -tulpn | grep 8080
```

---

## 📚 Referencia Rápida de URLs

### Desarrollo Local
```
Backend:           http://localhost:8080
Frontend:          http://localhost:4200
Backend API:       http://localhost:8080/api
Proxy (frontend):  /api → http://localhost:8080/api
```

### Producción
```
Backend:           https://innoad.tudominio.com (o IP:8080)
Frontend:          https://innoad.tudominio.com
Backend API:       https://innoad.tudominio.com/api
Dashboard RPi:     https://innoad.tudominio.com/admin/pantallas
```

---

## 💡 Tips Profesionales

```
💡 Frontend: Usar Chrome DevTools (F12) para debugar
   → Console: ver errores
   → Network: ver requests HTTP
   → Storage: ver localStorage (token)

💡 Backend: Usar logs para entender qué pasa
   → tail -f logs/innoad.log | grep ERROR
   → Ver SQL queries ejecutadas

💡 RPi: Siempre ver logs cuando algo falla
   → journalctl -u innoad-display -f

💡 Seguridad: Cambiar token_api del config.json antes de producción
   → No dejar tokens de desarrollo en producción

💡 Performance: Si CPU está alto en RPi
   → Aumentar intervalo_sincronizacion (ej: 600 = 10 min)
   → Reducir tamaño de videos/imágenes

💡 Debugging: Si no puedes ver qué pasa
   → Terminal 1: Backend logs (tail -f)
   → Terminal 2: RPi logs (journalctl -f)
   → Terminal 3: Frontend (ng serve)
   → Ver los 3 simultáneamente
```

---

**¡LISTO PARA EMPEZAR! 🚀**

Elige:
- **Opción A** (1.25h): Servicios HTTP
- **Opción B** (20min): Raspberry Pi
- **Ambas** (1.75h): Todo el sistema

¡Mucho éxito! 💜

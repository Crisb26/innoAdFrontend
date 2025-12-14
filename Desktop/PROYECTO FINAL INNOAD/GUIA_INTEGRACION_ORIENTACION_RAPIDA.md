# 🔗 Guía Rápida de Integración - Orientación de Pantallas

## 📱 ¿Qué es?

La funcionalidad de **orientación de pantalla** permite que cada pantalla digital (Raspberry Pi) muestre contenido en dos modos:

- **📺 Horizontal (16:9)**: Formato estándar, ideal para televisores
- **📱 Vertical (9:16)**: Formato para redes sociales y contenido móvil

---

## 🎯 Implementación Rápida

### **1. Frontend (Angular) - ✅ YA HECHO**

#### ¿Qué se hizo?
```typescript
// Modelo actualizado
orientacion: 'horizontal' | 'vertical'

// Formulario con selector
<select formControlName="orientacion">
  <option value="horizontal">📺 Horizontal</option>
  <option value="vertical">📱 Vertical</option>
</select>

// Lista muestra orientación con badges coloreados
// Detalles incluyen información de orientación
```

#### Archivos modificados:
- `formulario-pantalla.component.ts`
- `lista-pantallas.component.ts`
- `detalle-pantalla.component.ts`
- Archivos SCSS correspondientes

---

### **2. Backend (Spring Boot) - 📋 PRÓXIMO**

#### Pasos rápidos:

**Paso 1: Crear Enum**
```java
// src/main/java/com/innoad/pantalla/enums/OrientacionPantalla.java
public enum OrientacionPantalla {
    HORIZONTAL("16:9"),
    VERTICAL("9:16");
}
```

**Paso 2: Actualizar Entidad**
```java
@Entity
public class Pantalla {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrientacionPantalla orientacion = OrientacionPantalla.HORIZONTAL;
}
```

**Paso 3: SQL Migration**
```sql
ALTER TABLE pantallas 
ADD COLUMN orientacion VARCHAR(20) NOT NULL DEFAULT 'HORIZONTAL';
```

**Paso 4: Actualizar DTO**
```java
@Data
public class CrearPantallaRequest {
    private OrientacionPantalla orientacion = OrientacionPantalla.HORIZONTAL;
}
```

**Paso 5: Service & Controller**
```java
// Usar orientacion en métodos de CRUD
pantalla.setOrientacion(request.getOrientacion());
```

✅ **Tiempo estimado: 2-3 horas**

---

### **3. Raspberry Pi (Python) - 🖥️ PRÓXIMO**

#### Código para DisplayManager:

```python
class DisplayManager:
    
    def __init__(self):
        self.orientacion = self.config.get('orientacion', 'horizontal')
    
    def obtener_parametros_omxplayer(self):
        """Retorna parámetros de rotación para OMXPlayer"""
        params = []
        
        if self.orientacion.lower() == 'vertical':
            # Rotar 90 grados para vertical
            params.extend(['-r', 'pointer 90'])
        else:
            # Normal (horizontal)
            params.extend(['-r', 'pointer 0'])
        
        return params
    
    def reproducir_contenido(self, archivo):
        """Reproduce con rotación aplicada"""
        cmd = ['omxplayer']
        cmd.extend(self.obtener_parametros_omxplayer())
        cmd.append(archivo)
        
        subprocess.run(cmd)
    
    def cambiar_orientacion(self, nueva_orientacion):
        """Cambia orientación dinámicamente"""
        if nueva_orientacion in ['horizontal', 'vertical']:
            self.orientacion = nueva_orientacion
            self.guardar_config()
            print(f"Orientación cambiada a: {nueva_orientacion}")
```

✅ **Tiempo estimado: 1-2 horas**

---

## 🌊 Flujo de Datos Completo

```
┌─────────────────────┐
│  Usuario en Angular │
│  Selecciona Orient. │
│   "Vertical"        │
└──────────┬──────────┘
           │
           ▼ HTTP PUT
┌─────────────────────────────────────────┐
│  Backend Spring Boot                     │
│  PUT /api/pantallas/{id}                │
│  Recibe: orientacion: "VERTICAL"        │
└──────────┬──────────────────────────────┘
           │
           ▼ Guardar en BD
┌─────────────────────────────────────────┐
│  PostgreSQL                              │
│  UPDATE pantallas SET orientacion='V'   │
└──────────┬──────────────────────────────┘
           │
           ▼ WebSocket Notification
┌─────────────────────────────────────────┐
│  Raspberry Pi (Python)                  │
│  Recibe cambio de orientación          │
│  cambiar_orientacion('vertical')       │
└──────────┬──────────────────────────────┘
           │
           ▼ Próximo contenido
┌─────────────────────────────────────────┐
│  OMXPlayer                              │
│  omxplayer -r pointer 90 [archivo]     │
└──────────┬──────────────────────────────┘
           │
           ▼ Pantalla física
┌─────────────────────────────────────────┐
│  📱 Contenido vertical sin barras       │
│     (Aprovecha toda la pantalla)        │
└─────────────────────────────────────────┘
```

---

## 📊 Ejemplo Real: Campaña Vertical

### **Escenario:**
Tu cliente quiere mostrar un video de TikTok en una pantalla de una sala de espera.

### **Pasos:**

1. **En Angular:**
   ```
   ✓ Crear nueva pantalla
   ✓ Nombre: "Pantalla Sala Espera"
   ✓ Resolución: 1920x1080 (pantalla física normal)
   ✓ Orientación: VERTICAL ← AQUÍ
   ✓ Guardar
   ```

2. **Backend valida:**
   ```
   ✓ Recibe enum VERTICAL
   ✓ Guarda en tabla pantallas
   ✓ Notifica cambio
   ```

3. **Python RPi:**
   ```
   ✓ Recibe notificación
   ✓ Carga config con "orientacion": "vertical"
   ✓ Siguiente video se reproduce con -r pointer 90
   ```

4. **Resultado:**
   ```
   📱 Video TikTok se ve completo
   📱 Sin barras negras laterales
   📱 Impacto visual máximo
   ```

---

## 🔌 Integración con Servicios Actuales

### **ServicioPantallas (Angular)**
```typescript
actualizarPantalla(id: string, datos: Partial<Pantalla>) {
  // Ahora puede incluir: { orientacion: 'vertical' }
  return this.http.put(`/api/pantallas/${id}`, datos);
}
```

### **PantallaService (Java)**
```java
public Pantalla actualizarPantalla(String id, UpdatePantallaDTO dto) {
    Pantalla p = repo.findById(id).orElseThrow();
    p.setOrientacion(dto.getOrientacion()); // ← NUEVO
    return repo.save(p);
}
```

### **DisplayManager (Python)**
```python
def sincronizar_desde_backend(self):
    respuesta = self.cliente_backend.obtener_pantalla(self.id)
    # respuesta contiene: {"orientacion": "vertical"}
    self.cambiar_orientacion(respuesta['orientacion'])
```

---

## 🧪 Probando la Funcionalidad

### **Test en Frontend**
```bash
# Abrir Developer Tools (F12)
# En Angular:
> this.pantalla.orientacion = 'vertical'
> Debería mostrar badge naranja en la lista
```

### **Test en Backend (Postman)**
```json
PUT http://localhost:8080/api/pantallas/123
Content-Type: application/json

{
  "nombre": "Pantalla Test",
  "orientacion": "VERTICAL",
  "resolucion": "1920x1080"
}

Response:
{
  "id": "123",
  "orientacion": "VERTICAL",
  ...
}
```

### **Test en Raspberry Pi**
```bash
# SSH a la RPi
ssh pi@raspberrypi.local

# Editar config
nano /etc/innoad/display-config.json
# Cambiar "orientacion": "horizontal" → "vertical"

# Reiniciar servicio
sudo systemctl restart innoad-display-manager

# Verificar logs
sudo journalctl -u innoad-display-manager -f

# Debería ver: "Orientación cambiada a: vertical"
```

---

## ⚙️ Configuración

### **JSON de Configuración (RPi)**
```json
{
  "id_pantalla": "PANTALLA-001",
  "nombre": "Pantalla Entrada",
  "orientacion": "horizontal",
  "resolucion": "1920x1080",
  "tipo_pantalla": "LED",
  "api_backend": "http://localhost:8080",
  "intervalo_sincronizacion": 30
}
```

### **Environment Variables (Opcional)**
```bash
# .env backend
PANTALLA_ORIENTACION_DEFAULT=HORIZONTAL

# display-config.json
"orientacion": "${PANTALLA_ORIENTACION_DEFAULT}"
```

---

## 🚨 Troubleshooting

### **Problema: Orientación no se aplica en RPi**

**Solución 1:** Verificar config
```bash
cat /etc/innoad/display-config.json | grep orientacion
# Debería mostrar: "orientacion": "vertical"
```

**Solución 2:** Verificar OMXPlayer
```bash
# Probar rotación manualmente
omxplayer -r pointer 90 /ruta/al/video.mp4
```

**Solución 3:** Revisar logs
```bash
sudo journalctl -u innoad-display-manager -f
# Buscar: "Orientación cambiada a:"
```

### **Problema: Badge no se muestra en Angular**

**Solución:**
```typescript
// Verificar que el dato existe
console.log(pantalla.orientacion); // debe ser 'horizontal' o 'vertical'

// Actualizar HTML
<span class="orientacion-badge" [ngClass]="pantalla.orientacion">
  {{ pantalla.orientacion === 'horizontal' ? '📺 Horizontal' : '📱 Vertical' }}
</span>
```

---

## 📈 Métricas de Éxito

| Métrica | Objetivo | Estado |
|---------|----------|--------|
| Frontend implementado | 100% | ✅ Completado |
| Backend ready-to-implement | 100% | ✅ Documentado |
| RPi integration ready | 100% | ✅ Documentado |
| Tests definidos | 100% | ✅ Ejemplos incluidos |
| Documentación | 100% | ✅ 1000+ líneas |

---

## 🎯 Checklist de Implementación Completa

**Backend (2-3 horas):**
- [ ] Crear enum OrientacionPantalla
- [ ] Actualizar entidad Pantalla
- [ ] Migración SQL ejecutada
- [ ] DTOs actualizados
- [ ] Service implementado
- [ ] Controller funcional
- [ ] Tests creados
- [ ] Base de datos sincronizada

**RPi (1-2 horas):**
- [ ] Actualizar display-config.json
- [ ] Modificar DisplayManager
- [ ] Agregar métodos de rotación
- [ ] Prueba en dispositivo real
- [ ] Logs configurados

**Integración (1 hora):**
- [ ] Frontend conectado a backend
- [ ] WebSocket enviando cambios
- [ ] Python sincronizando
- [ ] End-to-end testing

**Total:** ~5 horas para completar

---

## 🔗 Documentación Relacionada

1. **ORIENTACION_PANTALLA_GUIDE.md** - Guía detallada (350+ líneas)
2. **ORIENTACION_BACKEND_IMPLEMENTATION.md** - Backend ready-to-code (400+ líneas)
3. **RESUMEN_ORIENTACION_IMPLEMENTADA.md** - Resumen ejecutivo
4. **Esta guía** - Quick start y reference

---

## 💡 Pro Tips

1. **Use WebSocket para actualizaciones en tiempo real**
   - Cambios se ven inmediatamente en RPi
   - No esperar a próxima sincronización

2. **Agregue feature flag para testing**
   ```java
   @Value("${feature.orientacion.enabled:true}")
   private boolean orientacionEnabled;
   ```

3. **Monitore rotación fallida**
   ```python
   try:
       subprocess.run(cmd)
   except Exception as e:
       alertar_admin(f"Error de rotación: {e}")
   ```

4. **Haga backup de config antes de cambiar**
   ```python
   shutil.copy('display-config.json', 'display-config.json.bak')
   ```

---

## 📞 Preguntas Frecuentes

**P: ¿Se aplica inmediatamente al cambiar?**
R: No, en el próximo contenido a reproducir. Si quieres inmediato, usa WebSocket.

**P: ¿Afecta el rendimiento?**
R: No, la rotación es a nivel de driver de video, muy eficiente.

**P: ¿Qué pasa si la pantalla no soporta rotación?**
R: El comando ejecutará pero sin efecto visual. Verificar soporte HDMI.

**P: ¿Puedo rotar solo en ciertos horarios?**
R: Sí, agrega lógica en DisplayManager según horario.

**P: ¿Se pierde la orientación si reinicio RPi?**
R: No, se guarda en `display-config.json`.

---

**Última actualización:** Enero 2025
**Versión:** 1.0 - Quick Start
**Tiempo estimado total:** 5 horas (Frontend 45min + Backend 2-3h + RPi 1-2h)

# 🔧 QUICK REFERENCE - HTTP Services Integration

## ⚡ Referencia Rápida para Uso de Servicios

### 1. Inyectar PantallasService en Componente

```typescript
import { PantallasService, RespuestaPantalla } from '../../../core/servicios/pantallas.service';

export class MiComponente {
  constructor(private pantallasService: PantallasService) {}
}
```

### 2. Obtener Lista de Pantallas

```typescript
// Opción A: Via Observable (Recomendado)
this.pantallasService.pantallas$.subscribe(pantallas => {
  console.log('Pantallas actualizadas:', pantallas);
});

// Opción B: Via Signal
pantallas = signal<RespuestaPantalla[]>([]);

constructor(private pantallasService: PantallasService) {
  this.pantallasService.pantallas$.subscribe(p => this.pantallas.set(p));
}

// Opción C: Getter directo
const pantallasActuales = this.pantallasService.getPantallasActuales();
```

### 3. Crear Pantalla

```typescript
const solicitud = {
  nombre: 'Pantalla Lobby',
  ubicacion: 'Recepción',
  resolucion: '1920x1080',
  orientacion: 'HORIZONTAL',  // ← IMPORTANTE: MAYUSCULAS
  descripcion: 'Pantalla entrada'
};

// Opción A: HTTP directo + manejar respuesta
this.pantallasService.crearPantalla(solicitud).subscribe(
  response => {
    if (response.exitoso) {
      console.log('Pantalla creada:', response.datos);
    }
  },
  error => console.error('Error:', error)
);

// Opción B: Método combinado (HTTP + actualizar BehaviorSubject)
this.pantallasService.crearYActualizar(solicitud);
// → Automáticamente carga y actualiza lista
```

### 4. Editar Pantalla

```typescript
const id = 1;
const solicitud = {
  nombre: 'Pantalla Lobby Actualizado',
  ubicacion: 'Recepción',
  resolucion: '1920x1080',
  orientacion: 'VERTICAL',  // ← Cambiar orientacion
  descripcion: 'Pantalla entrada'
};

// Opción A: HTTP directo
this.pantallasService.actualizarPantalla(id, solicitud).subscribe(response => {
  if (response.exitoso) {
    this.pantallasService.cargarPantallas(); // Refrescar lista
  }
});

// Opción B: Método combinado
this.pantallasService.actualizarYActualizar(id, solicitud);
```

### 5. Eliminar Pantalla

```typescript
const id = 1;

this.pantallasService.eliminarPantalla(id).subscribe(response => {
  if (response.exitoso) {
    this.pantallasService.cargarPantallas(); // Refrescar
  }
});

// O con método combinado:
this.pantallasService.eliminarYActualizar(id);
```

### 6. Filtrar/Buscar

```typescript
// En tu componente
busqueda = '';
estadoFiltro = 'todos';

filtrarPantallas(): RespuestaPantalla[] {
  return this.pantallasService.getPantallasActuales().filter(p =>
    (this.estadoFiltro === 'todos' || p.estado === this.estadoFiltro) &&
    (p.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
     p.ubicacion.toLowerCase().includes(this.busqueda.toLowerCase()))
  );
}
```

---

## 🎯 Valores Enum Correctos

### Orientación
```typescript
orientacion: 'HORIZONTAL' | 'VERTICAL'

// ✅ CORRECTO:
{ orientacion: 'HORIZONTAL' }
{ orientacion: 'VERTICAL' }

// ❌ INCORRECTO:
{ orientacion: 'horizontal' }  // minúsculas
{ orientacion: 'vertical' }    // minúsculas
{ orientacion: 'Horizontal' }  // mixtas
```

### Estado
```typescript
estado: 'ACTIVA' | 'INACTIVA' | 'SINCRONIZANDO' | 'ERROR'

// ✅ CORRECTO:
p.estado === 'ACTIVA'
p.estado === 'INACTIVA'

// ❌ INCORRECTO:
p.estado === 'activa'      // minúsculas
p.estado === 'Activa'      // mixtas
```

---

## 🐛 Debugging

### 1. Verificar si servicio está inyectado

```typescript
console.log('Servicio pantallas:', this.pantallasService);
// Debe mostrar: PantallasService {...}

console.log('Pantallas actuales:', this.pantallasService.getPantallasActuales());
// Debe mostrar: RespuestaPantalla[]
```

### 2. Ver peticiones HTTP

```
DevTools → F12 → Network tab
→ Filtrar "XHR" (XMLHttpRequest)
→ Buscar "pantallas"
→ Ver Request/Response
```

### 3. Ver estado del BehaviorSubject

```typescript
this.pantallasService.pantallas$.subscribe(p => {
  console.log('BehaviorSubject actualizado:', p);
});
```

### 4. Ver errores HTTP

```typescript
this.pantallasService.crearPantalla(solicitud).subscribe(
  response => console.log('Éxito:', response),
  error => {
    console.error('Error HTTP:', error);
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.error('Error:', error.error);
  }
);
```

### 5. Verificar JWT Token

```typescript
// En Console:
localStorage.getItem('jwt_token')
// Debe retornar un token como: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ Checklist Antes de Usar

- [ ] ¿PantallasService inyectado en constructor?
- [ ] ¿Importado RespuestaPantalla, SolicitudPantalla?
- [ ] ¿Backend está corriendo en http://localhost:8080?
- [ ] ¿JWT Token es válido?
- [ ] ¿Valores enum en MAYUSCULAS? (HORIZONTAL, ACTIVA, etc)
- [ ] ¿DevTools F12 abierto para debugging?

---

## 📡 Endpoints Disponibles

```
GET    /api/v1/pantallas          → obtenerPantallas()
GET    /api/v1/pantallas/{id}     → obtenerPantalla(id)
POST   /api/v1/pantallas          → crearPantalla(solicitud)
PUT    /api/v1/pantallas/{id}     → actualizarPantalla(id, solicitud)
DELETE /api/v1/pantallas/{id}     → eliminarPantalla(id)

GET    /api/v1/contenidos         → obtenerContenidos()
GET    /api/v1/contenidos/{id}    → obtenerContenido(id)
POST   /api/v1/contenidos         → crearContenido(solicitud)
PUT    /api/v1/contenidos/{id}    → actualizarContenido(id, solicitud)
DELETE /api/v1/contenidos/{id}    → eliminarContenido(id)
```

---

## 🔒 Headers Automáticos

El servicio automáticamente agrega:
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

NO necesitas agregarlos manualmente.

---

## 💾 Guardar Cambios Localmente

```typescript
// Para testing sin backend:
const pantallasLocal = localStorage.getItem('pantallas');
if (pantallasLocal) {
  const pantallas = JSON.parse(pantallasLocal);
  console.log(pantallas);
}
```

---

## 🆘 Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| 401 Unauthorized | Token expirado | Login nuevamente |
| 403 Forbidden | No tienes permisos | Verifica usuario |
| 404 Not Found | Endpoint no existe | Revisa URL |
| 500 Server Error | Error en backend | Ver logs del servidor |
| CORS error | Backend bloqueado | Revisa @CrossOrigin |
| 'orientacion is undefined' | Campo no en solicitud | Agrega orientacion |

---

## 📚 Referencias

- `INTEGRACION_FRONTEND_BACKEND.md` - Documentación completa
- `TASK_2_COMPLETED.md` - Detalles de implementación
- `ESTADO_PROYECTO.md` - Overview del proyecto

---

**Última actualización:** Task 2 Completed
**Versión:** 1.0

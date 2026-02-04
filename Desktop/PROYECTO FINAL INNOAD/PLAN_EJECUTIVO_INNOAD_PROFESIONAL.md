# 🚀 PLAN EJECUTIVO - INNOAD PROFESIONAL 2.0
**Fecha**: 1 de Enero de 2026  
**Objetivo**: Crear plataforma IoT de señalización digital **PROFESIONAL Y HERMOSA**  
**Stack**: Spring Boot 3.5.8 + Angular 18 + PostgreSQL + Docker  
**Metodología**: Git → Cambios → Docker → Producción

---

## 📊 ESTADO ACTUAL vs OBJETIVO

### Estado Actual (Fase 4)
```
✅ Backend: 4 módulos (Campaña, Pantalla, Contenido, Mantenimiento)
✅ Frontend: 14 módulos funcionales
✅ Autenticación: JWT funcionando
✅ Base de datos: PostgreSQL configurada
❌ Pagos: NO implementado
❌ Bugs: 9 críticos sin arreglar
❌ UI/UX: Básico, no profesional
❌ Sistema de roles: Incompleto
❌ Agente de servicio: Simple chatbot
```

### Objetivo Final
```
✅ Backend: 4 módulos + Pagos + Permisos avanzados
✅ Frontend: 14 módulos + Mercado Pago + UI/UX espectacular
✅ Sistema de roles: ADMIN, TÉCNICO, OPERADOR, USUARIO
✅ Mantenimiento: Profesional con interfaz hermosa
✅ Agente de servicio: Inteligente, entrenado, multi-rol
✅ Dashboard: Analytics en tiempo real
✅ Reportes: PDF + CSV + Gráficos avanzados
✅ Hardware: API lista para Raspberry Pi
✅ Docker: Funcional y listo para producción
```

---

## 🎯 FASES DE IMPLEMENTACIÓN

### **FASE 1: BUGS CRÍTICOS** (2-3 horas)

#### 1.1 Formulario Campaña - Layout desalineado
- **Archivo**: `src/app/modulos/campanas/componentes/formulario-campana.component.scss`
- **Problema**: Modal corrido, fechas desalineadas
- **Solución**: 
  - Revisar CSS del modal
  - Alinear grid con flexbox
  - Responsivo en móvil

#### 1.2 Seleccionar Pantallas - Falta opción 2
- **Archivo**: `src/app/modulos/campanas/componentes/formulario-campana.component.ts`
- **Problema**: Dropdown con opciones [1, 3, 5, 8, 10+] - FALTA 2
- **Solución**:
  - Agregar opción "2 pantallas" en dropdown
  - Actualizar validación backend
  - Probar con 2 pantallas

#### 1.3 Crear Pantalla - No se guarda
- **Archivos**:
  - Frontend: `src/app/modulos/pantallas/**`
  - Backend: `ControladorPantallas.java`
- **Problema**: Formulario lleno pero no crea
- **Solución**:
  - Debug request/response
  - Añadir logging
  - Validar endpoint POST

#### 1.4 Crear Contenido - Error al guardar
- **Archivos**:
  - Frontend: `src/app/modulos/contenidos/**`
  - Backend: `/modules/contenidos/**`
- **Problema**: Upload OK, pero falla al crear
- **Solución**:
  - Verificar servicio de upload
  - Validar endpoint POST
  - Manejo de errores

#### 1.5 Ver Gráficos - Logout automático
- **Problema**: Error 401 no capturado
- **Archivos**:
  - Frontend: `src/app/core/interceptores/error.interceptor.ts`
  - Backend: Endpoint `/api/v1/graficos`
- **Solución**:
  - Mejorar interceptor 401
  - Refresh de token automático
  - Retry logic

#### 1.6 Publicar Ahora - Mismo error
- **Solución**: Same fix como gráficos

#### 1.7 Descargar PDF - Error "No disponible"
- **Problema**: Endpoint diferente o no implementado
- **Solución**:
  - Verificar `/api/v1/reportes/pdf`
  - Implementar con Apache POI si falta
  - Testing descarga

#### 1.8 CSV sin todos los datos
- **Solución**:
  - Revisar query de generación
  - Agregar paginación correcta
  - Incluir todos los registros

#### 1.9 IA/Chatbot - Crear campaña logout
- **Problema**: Permiso denegado (403/401)
- **Solución**:
  - Verificar permisos por rol
  - Actualizar rutas en guardias

---

### **FASE 2: SISTEMA DE MANTENIMIENTO PROFESIONAL** (1-2 horas)

#### 2.1 Componente de Mantenimiento Avanzado
```typescript
// Crear: src/app/modulos/admin/componentes/mantenimiento-admin.component.ts
- Contraseña: Cris93022611184 (hasheado en BD)
- Interfaz hermosa con:
  - Animación de engranajes
  - Countdown timer
  - Colores futuristas
  - Mensaje personalizado
  - Contador de usuarios conectados
```

#### 2.2 Backend - Endpoints de Mantenimiento
```java
// Crear: com.innoad.modules.mantenimiento.controller
POST   /api/v1/mantenimiento/activar
POST   /api/v1/mantenimiento/desactivar
GET    /api/v1/mantenimiento/estado
GET    /api/v1/mantenimiento/usuarios-conectados
POST   /api/v1/mantenimiento/verificar-contrasena
```

#### 2.3 Página de Mantenimiento Pública
```
- Visible cuando está activo
- Mensaje personalizado
- Countdown
- Colores futuristas (Púrpura, Azul, Gradientes)
- Sin acceso a ninguna función
```

---

### **FASE 3: SISTEMA DE PERMISOS POR ROL** (1-2 horas)

#### 3.1 Roles Definidos
```
ADMINISTRADOR:
  ✅ Todo (crear, editar, eliminar todo)
  ✅ Acceso a mantenimiento
  ✅ Gestionar usuarios y roles
  ✅ Entrenar agente

TÉCNICO:
  ✅ Ver campañas
  ✅ Crear/editar/eliminar pantallas
  ✅ Ver contenidos (no crear)
  ✅ Reportes básicos
  ❌ No mantenimiento
  ❌ No entrenar agente

OPERADOR:
  ✅ Ver mis campañas
  ✅ Ver mis pantallas
  ✅ Ver mis contenidos
  ✅ Usar agente
  ✅ Reportes básicos
  ❌ No crear
  ❌ No acceso técnico

USUARIO:
  ✅ Usar agente
  ✅ Ver publicaciones
  ✅ Acceso limitado a player
  ❌ Todo lo demás
```

#### 3.2 Implementación
```typescript
// Actualizar: RolGuard.ts
// Actualizar: Each component/service to check permissions
// Backend: @PreAuthorize("hasRole('ADMIN')")
```

---

### **FASE 4: SISTEMA DE PAGOS - MERCADO PAGO** (2-3 horas)

#### 4.1 Backend - Integración MP
```java
// Crear: com.innoad.modules.pagos.controller.ControladorPagos
// Crear: com.innoad.modules.pagos.service.ServicioPagos
// Crear: com.innoad.modules.pagos.domain.Pago
// Crear: com.innoad.modules.pagos.dto.PagoDTO

POST   /api/v1/pagos/crear-preferencia
POST   /api/v1/pagos/webhook
GET    /api/v1/pagos/estado/{id}
GET    /api/v1/pagos/mis-pagos

Entidad Pago:
- id: Long
- usuario: Usuario
- monto: Double
- moneda: "ARS" (Pesos argentinos)
- estado: "PENDIENTE", "APROBADO", "RECHAZADO"
- metodosPago: "tarjeta_credito", "tarjeta_debito", "efectivo_mp"
- referencia: String (ID Mercado Pago)
- descripcion: String
- fechaCreacion: LocalDateTime
- fechaPago: LocalDateTime
```

#### 4.2 Frontend - Zona de Pagos Profesional
```typescript
// Crear: src/app/modulos/pagos/
  ├─ componentes/
  │  ├─ checkout.component.ts
  │  ├─ estado-pago.component.ts
  │  ├─ mis-pagos.component.ts
  │  └─ carrito.component.ts
  ├─ servicios/
  │  └─ pago.service.ts
  ├─ modelos/
  │  └─ pago.model.ts
  └─ pagos.routes.ts

Pantalla de Checkout:
- Mostrar items a pagar
- Seleccionar método (tarjeta/efectivo)
- Validar datos
- Integrar SDK Mercado Pago
- Botón "Ir a Pagar"
```

#### 4.3 Configuración Mercado Pago
```typescript
// environment.ts
export const environment = {
  mercadoPago: {
    publicKey: 'tu-clave-publica',
    apiKey: 'tu-api-key',
    sandbox: true // false en producción
  }
};

// pom.xml - Agregar dependencia
<dependency>
  <groupId>com.mercadopago</groupId>
  <artifactId>sdk-java</artifactId>
  <version>2.1.6</version>
</dependency>
```

#### 4.4 Costos y Comisiones
```
Mercado Pago cobra:
- Tarjeta crédito: 3.5% + 0.60 ARS
- Tarjeta débito: 1.99% + 0.60 ARS
- Efectivo: Variable

Opciones:
A) Gratis para usuarios (absorber costo)
B) Pasar costo al usuario (mostrar monto final)
C) Modelo freemium (límite sin pago)

RECOMENDACIÓN: Opción B (transparencia)
```

---

### **FASE 5: AGENTE DE SERVICIO INTELIGENTE** (2-3 horas)

#### 5.1 Componente del Agente
```typescript
// Crear: src/app/modulos/agente-servicio/
  ├─ componentes/
  │  ├─ agente-chat.component.ts (interfaz)
  │  ├─ historial-conversaciones.component.ts
  │  └─ entrenar-agente.component.ts
  ├─ servicios/
  │  └─ agente.service.ts
  ├─ modelos/
  │  └─ conversacion.model.ts
  └─ agente-servicio.routes.ts
```

#### 5.2 Funcionalidades del Agente
```
1. Responder FAQ
   - "¿Cómo creo una campaña?"
   - "¿Cuántas pantallas puedo tener?"
   - "¿Cómo pago?"

2. Guiar en creación
   - "Voy a ayudarte a crear una campaña"
   - Step-by-step guidance

3. Soporte técnico
   - "¿Tienes problemas?"
   - "Error 404 means..."

4. Escalado a humano
   - "Necesitas soporte? Espera..."
   - Alert al equipo de soporte

5. Historial
   - Guardar todas las conversaciones
   - Resumir por usuario/rol
```

#### 5.3 Entrenamiento (YAML)
```yaml
# training-data.yml
intents:
  - intent: crear_campana
    examples:
      - "¿Cómo creo una campaña?"
      - "Quiero hacer una campaña nueva"
      - "Ayuda con campaña"
    responses:
      - "Te guiaré paso a paso..."
  
  - intent: pagar
    examples:
      - "¿Cómo pago?"
      - "Métodos de pago"
      - "Quiero pagar"
    responses:
      - "Aceptamos tarjeta, débito y efectivo..."
```

#### 5.4 Personalización por Rol
```typescript
// Respuestas diferentes según rol
if (usuarioRol === 'ADMIN') {
  // Mostrar opciones de administración
}
if (usuarioRol === 'TECNICO') {
  // Mostrar soporte técnico
}
if (usuarioRol === 'USUARIO') {
  // Mostrar uso básico
}
```

---

### **FASE 6: UI/UX HERMOSA Y PROFESIONAL** (2-3 horas)

#### 6.1 Mejoras Visuales
```scss
// Colores futuristas
$primary: #6366f1 (Índigo)
$secondary: #a855f7 (Púrpura)
$accent: #ec4899 (Rosa)
$background: #0f172a (Azul oscuro)
$surface: #1e293b (Gris azulado)

// Gradientes
$gradient-primary: linear-gradient(135deg, #6366f1 0%, #a855f7 100%)
$gradient-accent: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)

// Efectos
- Blur backgrounds
- Glass morphism (backdrop-filter)
- Sombras suaves
- Bordes redondeados
- Animaciones smooth
```

#### 6.2 Componentes Mejorados
```
1. Login
   - Animación de entrada
   - Loading spinner bonito
   - Validaciones visuales (✓ usuario existe)
   - Fondo degradado

2. Formularios
   - Validaciones en tiempo real
   - Colores rojo/verde/amarillo
   - Mensajes de error claros
   - Focus efectos

3. Botones
   - Ripple effect
   - Hover effects
   - Transiciones suaves
   - Diferentes variantes (primary, secondary, danger)

4. Tablas
   - Filas alternadas
   - Hover effect
   - Sorting visual
   - Paginación clara

5. Cards
   - Sombra suave
   - Hover efecto de elevación
   - Contenido bien organizado
   - Iconos atractivos

6. Modals
   - Backdrop blur
   - Animación de entrada
   - Botones claros
   - Close fácil

7. Notificaciones
   - Toast elegante
   - Colores por tipo (éxito/error/info/warning)
   - Auto-dismiss con animación
   - Posición fija

8. Loading States
   - Skeleton screens
   - Spinners bonitos
   - Barras de progreso
   - Feedback claro
```

#### 6.3 Animaciones
```typescript
// Angular animations
@Component({
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in')
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(30px)', opacity: 0 }),
        animate('500ms ease-out')
      ])
    ])
  ]
})
```

---

### **FASE 7: API PARA RASPBERRY PI** (1-2 horas)

#### 7.1 Endpoints para RPi
```java
// Crear: com.innoad.modules.hardware.controller.ControladorRaspberryPi

GET    /api/v1/hardware/pantallas/{id}
GET    /api/v1/hardware/pantalla/{id}/contenido
GET    /api/v1/hardware/pantalla/{id}/campana-activa
POST   /api/v1/hardware/pantalla/{id}/heartbeat
POST   /api/v1/hardware/pantalla/{id}/error-log
GET    /api/v1/hardware/pantalla/{id}/actualización

Response format para RPi:
{
  "id": 1,
  "ubicacion": "Puerta Principal",
  "resolucion": "1920x1080",
  "contenido": {
    "tipo": "video",
    "url": "https://...",
    "duracion": 60
  },
  "campana": {
    "titulo": "Summer Sale",
    "fechaInicio": "2026-01-05",
    "fechaFin": "2026-01-31"
  }
}
```

#### 7.2 Autenticación RPi
```java
// Token especial para dispositivos
Token: RASPBERRY_PI_<UUID>
Válido por: 30 días
Renovable automaticamente con heartbeat
```

---

### **FASE 8: TESTING COMPLETO** (1-2 horas)

- ✅ Tests unitarios para pagos
- ✅ Tests para agente de servicio
- ✅ Tests de permisos por rol
- ✅ Tests del sistema de mantenimiento
- ✅ Integración con Mercado Pago (sandbox)

---

### **FASE 9: DOCKERIZACIÓN Y DEPLOYMENT** (1 hora)

#### 9.1 Docker Compose actualizado
```yaml
version: '3.8'
services:
  innoad-backend:
    build: ./innoadBackend
    ports: ['8080:8080']
    environment:
      DATABASE_URL: jdbc:postgresql://db:5432/innoad
      MERCADO_PAGO_KEY: ${MERCADO_PAGO_KEY}
  
  innoad-frontend:
    build: ./innoadFrontend
    ports: ['4200:4200']
  
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: innoad
      POSTGRES_PASSWORD: innoad123
    volumes: ['pgdata:/var/lib/postgresql/data']
  
  pgadmin:
    image: dpage/pgadmin4
    ports: ['5050:80']

volumes:
  pgdata:
```

#### 9.2 Workflow
```bash
# En este PC
1. Hago cambios en código
2. git add .
3. git commit -m "Feature: pagos + agente"
4. git push

# En PC con Docker
5. git pull
6. docker-compose down
7. docker-compose up --build
8. Ver cambios en http://localhost:4200
```

---

## 📋 CHECKLIST FINAL

### FASE 1: BUGS
- [ ] Layout campaña
- [ ] Opción 2 pantallas
- [ ] Crear pantalla
- [ ] Crear contenido
- [ ] Gráficos (logout)
- [ ] Publicar (logout)
- [ ] PDF reportes
- [ ] CSV datos completos
- [ ] IA/Chatbot permisos

### FASE 2: MANTENIMIENTO
- [ ] Componente frontend
- [ ] Endpoints backend
- [ ] Página pública mantenimiento
- [ ] Interfaz hermosa

### FASE 3: PERMISOS
- [ ] RolGuard actualizado
- [ ] Permisos por endpoint
- [ ] Ocultar opciones en UI

### FASE 4: PAGOS
- [ ] Dependencias Maven
- [ ] Entidad Pago + DTO
- [ ] Controlador y servicio
- [ ] Frontend checkout
- [ ] Integración Mercado Pago
- [ ] Testing

### FASE 5: AGENTE
- [ ] Componente principal
- [ ] Servicio de IA
- [ ] Entrenamiento básico
- [ ] Historial conversaciones
- [ ] Personalización por rol

### FASE 6: UI/UX
- [ ] Colores profesionales
- [ ] Animaciones
- [ ] Componentes mejorados
- [ ] Responsive design
- [ ] Testing visual

### FASE 7: HARDWARE
- [ ] Endpoints para RPi
- [ ] Autenticación dispositivos
- [ ] Documentación API

### FASE 8: TESTING
- [ ] Unit tests
- [ ] Integration tests
- [ ] End-to-end

### FASE 9: DOCKER
- [ ] Docker compose
- [ ] Build images
- [ ] Testing en Docker

---

## 🎯 ESTIMACIÓN

| Fase | Horas | Complejidad |
|------|-------|-------------|
| 1. Bugs | 2-3 | Media |
| 2. Mantenimiento | 1-2 | Baja |
| 3. Permisos | 1-2 | Media |
| 4. Pagos | 2-3 | Alta |
| 5. Agente | 2-3 | Alta |
| 6. UI/UX | 2-3 | Media |
| 7. Hardware | 1-2 | Media |
| 8. Testing | 1-2 | Media |
| 9. Docker | 1 | Baja |
| **TOTAL** | **14-21 horas** | **Media/Alta** |

---

## 🚀 EMPEZAMOS?

**¿Por dónde quieres que empiece?**

Opciones:
1. **RÁPIDA**: Empezar por bugs (Fase 1) - 2-3 horas
2. **COMPLETA**: Todas las fases en orden
3. **PAGOS PRIMERO**: Implementar pagos primero (Fase 4)
4. **UI HERMOSA PRIMERO**: Mejorar visual (Fase 6)
5. **CUSTOM**: Dime tu prioridad

**Yo recomiendo**: Bugs → Permisos → Pagos → UI → Agente

---

**¿Listo para empezar?** 🚀


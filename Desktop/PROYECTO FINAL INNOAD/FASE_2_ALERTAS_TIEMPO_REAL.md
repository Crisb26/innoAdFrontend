# FASE 2 - Sistema de Alertas en Tiempo Real con WebSocket

## 📊 Estado: EN DESARROLLO ✅

### Objetivos Completados

#### Backend ✅
1. **Modelos de Datos**
   - `TipoAlerta.java` - Enumeración de tipos (CRITICA, ADVERTENCIA, INFO, EXITO)
   - `EstadoAlerta.java` - Enumeración de estados (ACTIVA, RESUELTA, IGNORADA, ESCALADA, EN_INVESTIGACION)
   - `Alerta.java` - Entidad JPA con campos completos
   - `AlertaDTO.java` - DTO para transferencia de datos

2. **Persistencia**
   - `RepositorioAlerta.java` - Interfaz JPA con queries especializadas
   - `fase-2-alertas-tiempo-real.sql` - Schema completo con:
     - Tabla `alertas_sistema` con índices optimizados
     - Tabla `auditoria_alertas` para historial
     - Tabla `plantillas_alertas` para reutilización
     - Vistas para reportes
     - Triggers para auditoría automática
     - Datos iniciales

3. **Servicios**
   - `ServicioAlerta.java` - Lógica CRUD y operaciones especializadas:
     - `crearAlerta()` - Crear con detalles JSON
     - `obtenerAlertasActivas()` - Listar activas
     - `obtenerAlertasCriticas()` - Alertas críticas
     - `resolverAlerta()` - Marcar como resuelta
     - `escalarAlerta()` - Aumentar prioridad
     - `ignorarAlerta()` - Ignorar alerta
     - `obtenerEstadisticas()` - Métricas

4. **Controladores REST**
   - `ControladorAlerta.java` - Endpoints REST:
     - `GET /api/v1/mantenimiento/alertas/activas` - Alertas activas
     - `GET /api/v1/mantenimiento/alertas/criticas` - Críticas
     - `GET /api/v1/mantenimiento/alertas` - Con paginación y filtros
     - `GET /api/v1/mantenimiento/alertas/{id}` - Detalle
     - `POST /api/v1/mantenimiento/alertas` - Crear
     - `PUT /api/v1/mantenimiento/alertas/{id}/resolver` - Resolver
     - `PUT /api/v1/mantenimiento/alertas/{id}/escalar` - Escalar
     - `PUT /api/v1/mantenimiento/alertas/{id}/ignorar` - Ignorar
     - `GET /api/v1/mantenimiento/alertas/estadisticas/general` - Stats

5. **WebSocket**
   - `ConfiguracionWebSocket.java` - Configuración STOMP:
     - Broker en `/topic` y `/queue`
     - Endpoint `/ws/alertas`
     - CORS configurado
   - `ControladorWebSocketAlertas.java` - Controlador WebSocket:
     - Suscripción a `/topic/alertas`
     - Suscripción a `/topic/alertas/criticas`
     - Métodos de notificación en tiempo real
     - Publicación en canales específicos por dispositivo

#### Frontend ✅
1. **Servicio WebSocket**
   - `websocket-alertas.servicio.ts` - Integración STOMP:
     - Conexión automática al inicializar
     - Suscripción a múltiples canales
     - Signal-based reactive state
     - Observable patterns
     - Reconexión automática
     - Métodos: `resolverAlerta()`, `escalarAlerta()`, `ignorarAlerta()`

2. **Componente Centro de Alertas**
   - `centro-alertas-tiempo-real.component.ts` - Componente principal (350+ líneas):
     - Signals para estado reactivo
     - Computed para filtrados
     - Filtros por tipo, estado, búsqueda
     - Estadísticas en tiempo real
     - Modales para resolver/detalles
     - Integración completa con WebSocket
     - Notificaciones visuales

3. **Templates Separados**
   - `centro-alertas-tiempo-real.component.html` - Template completo (200+ líneas):
     - Header con estado de conexión
     - Estadísticas rápidas (4 cards)
     - Filtros con 3 opciones
     - Lista de alertas con acciones contextuales
     - Modal para resolver
     - Modal para detalles
     - Responsive design

4. **Estilos Separados**
   - `centro-alertas-tiempo-real.component.scss` - Estilos profesionales (400+ líneas):
     - Diseño moderno con gradientes
     - Cards con efectos hover
     - Colores por tipo de alerta
     - Animaciones fluidas
     - Media queries para móvil
     - Accesibilidad

5. **Integración en Rutas**
   - Actualizada `mantenimiento.routes.ts`:
     - Nueva ruta: `/mantenimiento/alertas-tiempo-real`
     - Lazy loading habilitado

6. **Actualización de Servicios**
   - Integración `ServicioMantenimientoAvanzado` con WebSocket

### Estructura de Archivo

```
Backend:
├── src/main/java/com/innoad/modules/mantenimiento/
│   ├── dto/
│   │   └── AlertaDTO.java
│   ├── dominio/
│   │   ├── TipoAlerta.java
│   │   ├── EstadoAlerta.java
│   │   └── Alerta.java
│   ├── repositorio/
│   │   └── RepositorioAlerta.java
│   ├── servicio/
│   │   └── ServicioAlerta.java
│   └── controlador/
│       ├── ControladorAlerta.java
│       └── ControladorWebSocketAlertas.java
├── config/
│   └── ConfiguracionWebSocket.java
└── fase-2-alertas-tiempo-real.sql

Frontend:
├── src/app/core/servicios/
│   └── websocket-alertas.servicio.ts
└── src/app/modulos/mantenimiento/componentes/
    ├── centro-alertas-tiempo-real.component.ts
    ├── centro-alertas-tiempo-real.component.html
    └── centro-alertas-tiempo-real.component.scss
```

### Características Implementadas

#### En Tiempo Real ⚡
- ✅ Conexión WebSocket STOMP
- ✅ Suscripción a múltiples canales
- ✅ Publicación de alertas en vivo
- ✅ Reconexión automática
- ✅ Notificaciones visuales

#### Centro de Alertas 🎯
- ✅ Vista principal con estadísticas
- ✅ Filtros avanzados (tipo, estado, búsqueda)
- ✅ Lista ordenada por prioridad
- ✅ Acciones contextuales (resolver, escalar, ignorar)
- ✅ Modales informativos
- ✅ Historial de cambios
- ✅ Responsive design

#### Gestión de Alertas 🔧
- ✅ CRUD completo
- ✅ Estados avanzados
- ✅ Escalamiento de prioridad
- ✅ Auditoría automática
- ✅ Plantillas reutilizables
- ✅ Detalles JSON flexible

#### Seguridad 🔐
- ✅ Autenticación JWT
- ✅ Autorización por roles
- ✅ Auditoría de cambios
- ✅ Validación de datos

### Cómo Usar

#### Acceso a la Interface
```
URL: https://innoad.netlify.app/mantenimiento/alertas-tiempo-real
Roles requeridos: ADMINISTRADOR, TECNICO
```

#### Crear una Alerta (Backend)
```java
ServicioAlerta servicioAlerta; // Inyectado

Alerta alerta = servicioAlerta.crearAlerta(
    TipoAlerta.CRITICA,
    "Fallo de Conexión",
    "El dispositivo RPI-001 no responde",
    "RaspberryPi",
    4,
    "RPI-001",
    Map.of("temperatura", 45, "voltaje", 3.2)
);
```

#### Resolver una Alerta (Frontend)
```typescript
this.servicioWebSocketAlertas.resolverAlerta(
    1, // ID alerta
    'usuario@example.com',
    'Se reconectó el dispositivo'
).subscribe(
    alerta => console.log('Resuelta:', alerta)
);
```

#### Escuchar Alertas en Tiempo Real
```typescript
this.servicioWebSocketAlertas.nuevaAlerta$().subscribe(alerta => {
    if (alerta) {
        console.log('Nueva alerta:', alerta);
    }
});
```

### Próximas Fases

#### FASE 3 - Notificaciones Push 📱
- Implementar service workers
- Notificaciones del navegador
- Sonidos de alerta
- Badge count

#### FASE 4 - Dashboards por Rol 👥
- Vista personalizada por ADMINISTRADOR
- Vista personalizada por TECNICO
- Vista personalizada por DESARROLLADOR
- Permisos granulares

#### FASE 5 - Integración con Raspberry Pi 🍓
- Conexión directa a sensores
- Lecturas en tiempo real
- Control remoto de dispositivos
- Almacenamiento local de logs

### Technologías Utilizadas

**Backend:**
- Spring Boot 3.5.8
- Spring WebSocket (STOMP)
- JPA/Hibernate
- PostgreSQL
- Jackson (JSON)

**Frontend:**
- Angular 18
- RxJS
- SockJS + STOMP
- Bootstrap 5
- SCSS

### Testing

#### Endpoints de Prueba
```bash
# Obtener alertas activas
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8080/api/v1/mantenimiento/alertas/activas"

# Obtener críticas
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8080/api/v1/mantenimiento/alertas/criticas"

# Crear alerta
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tipo":"CRITICA","titulo":"Test","origen":"TEST","prioridad":5}' \
  "http://localhost:8080/api/v1/mantenimiento/alertas"
```

### Notas de Implementación

1. **WebSocket**: Usa SockJS + STOMP para máxima compatibilidad
2. **Database**: Optimizada con índices para búsquedas rápidas
3. **Signals**: Implementado con Angular 18 Signals para reactividad
4. **Responsive**: Diseño mobile-first con breakpoints
5. **Accessibilidad**: Colores significativos + iconos + descripciones

---
**Última actualización:** 15 de diciembre de 2024
**Estatus:** ✅ COMPLETADO Y FUNCIONAL

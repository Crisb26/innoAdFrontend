## PLAN DE CONECTIVIDAD FRONTEND-BACKEND
**Fecha**: 2026-01-02
**Status**: En Progreso

### OBJETIVOS
1. ✅ Identificar todos los botones en el frontend
2. ⏳ Mapear botones a endpoints del backend
3. ⏳ Verificar que endpoints existan en backend
4. ⏳ Verificar autenticación (JWT tokens)
5. ⏳ Crear endpoints faltantes
6. ⏳ Crear modales/ventanas faltantes

---

## ENDPOINTS POR MÓDULO

### DASHBOARD
- **GET** `/api/dashboard/datos` - Obtener datos del dashboard
- **GET** `/api/estadisticas` - Obtener estadísticas
- **GET** `/api/dashboard/mis-publicidades` - Obtener publicidades del usuario
- **GET** `/api/dashboard/resumen` - Resumen del dashboard

### PUBLICACIONES
- **POST** `/api/publicaciones/crear` - Crear publicación
- **POST** `/api/publicaciones/{id}/guardar-borrador` - Guardar como borrador
- **POST** `/api/publicaciones/{id}/enviar-aprobacion` - Enviar para aprobación
- **GET** `/api/publicaciones/{id}` - Obtener detalles publicación
- **GET** `/api/publicaciones/mis` - Obtener mis publicaciones
- **DELETE** `/api/publicaciones/{id}` - Eliminar publicación

### UBICACIONES
- **GET** `/api/ubicaciones/ciudades` - Listar ciudades
- **GET** `/api/ubicaciones/ciudades/{ciudadId}/lugares` - Listar lugares de ciudad
- **GET** `/api/ubicaciones/lugares/{lugarId}/pisos` - Listar pisos de lugar
- **POST** `/api/ubicaciones/seleccionar` - Guardar ubicaciones seleccionadas

### CONTENIDOS
- **POST** `/api/contenidos/crear` - Crear contenido
- **PUT** `/api/contenidos/{id}` - Editar contenido
- **DELETE** `/api/contenidos/{id}` - Eliminar contenido
- **GET** `/api/contenidos/{id}` - Obtener detalles

### CHAT
- **POST** `/api/chat/enviar` - Enviar mensaje
- **GET** `/api/chat/historial/{conversacionId}` - Obtener historial
- **POST** `/api/chat/solicitar-tecnico` - Solicitar soporte técnico
- **WebSocket** `/ws/chat` - Conexión WebSocket para chat

### ASISTENTE-IA
- **POST** `/api/asistente-ia/procesar-pregunta` - Procesar pregunta ✅
- **GET** `/api/asistente-ia/historial` - Obtener historial
- **POST** `/api/asistente-ia/exportar` - Exportar respuesta
- **GET** `/api/asistente-ia/sugerencias` - Obtener sugerencias

### MANTENIMIENTO
- **WebSocket** `/ws/mantenimiento/alertas` - Alertas en tiempo real
- **GET** `/api/mantenimiento/alertas` - Listar alertas
- **GET** `/api/mantenimiento/alertas/{id}` - Obtener detalles de alerta
- **POST** `/api/mantenimiento/alertas/{id}/resolver` - Resolver alerta
- **POST** `/api/mantenimiento/alertas/{id}/escalar` - Escalar alerta
- **POST** `/api/mantenimiento/alertas/{id}/ignorar` - Ignorar alerta
- **POST** `/api/mantenimiento/reconectar` - Reconectar WebSocket

### PAGOS
- **GET** `/api/pagos/historial` - Obtener historial de pagos
- **POST** `/api/pagos/procesar` - Procesar pago
- **GET** `/api/pagos/{id}` - Obtener detalles de pago

### REPORTES
- **GET** `/api/reportes` - Listar reportes
- **GET** `/api/reportes/{id}` - Obtener reporte
- **POST** `/api/reportes/generar` - Generar reporte
- **GET** `/api/graficos` - Obtener datos para gráficos

---

## MAPEO DE BOTONES A ENDPOINTS

### USUARIO DASHBOARD
| Botón | Acción | Endpoint Esperado | Status |
|-------|--------|-------------------|--------|
| Crear Publicidad | irACrearPublicidad() | GET `/api/ubicaciones/ciudades` | ⏳ |
| Mis Publicidades | irAMisPublicidades() | GET `/api/publicaciones/mis` | ⏳ |
| Estadísticas | irAEstadisticas() | GET `/api/estadisticas` | ⏳ |
| Facturación | irAFacturacion() | GET `/api/pagos/historial` | ⏳ |
| Logout | logout() | POST `/api/auth/logout` | ⏳ |
| Ver Detalles | verDetalles(pub.id) | GET `/api/publicaciones/{id}` | ⏳ |

### PUBLICACION CREAR
| Botón | Acción | Endpoint Esperado | Status |
|-------|--------|-------------------|--------|
| Cambiar Archivo | fileInput.click() | (Frontend only) | ✅ |
| Seleccionar Ubicaciones | irASeleccionarUbicaciones() | GET `/api/ubicaciones/ciudades` | ⏳ |
| Guardar Borrador | guardarBorrador() | POST `/api/publicaciones/borrador` | ⏳ |
| Enviar Aprobación | enviarAprobacion() | POST `/api/publicaciones/aprobar` | ⏳ |
| Volver | volver() | (Frontend only) | ✅ |

### SELECCIONAR UBICACIONES
| Botón | Acción | Endpoint Esperado | Status |
|-------|--------|-------------------|--------|
| Seleccionar Ciudad | seleccionarCiudad() | (Frontend only) | ✅ |
| Seleccionar Piso | seleccionarPiso() | (Frontend only) | ✅ |
| Quitar Ubicación | quitarUbicacion() | (Frontend only) | ✅ |
| Limpiar | limpiarUbicaciones() | (Frontend only) | ✅ |
| Continuar | continuar() | POST `/api/ubicaciones/seleccionar` | ⏳ |

### MANTENIMIENTO - ALERTAS
| Botón | Acción | Endpoint Esperado | Status |
|-------|--------|-------------------|--------|
| Resolver | abrirModalResolver() | POST `/api/mantenimiento/alertas/{id}/resolver` | ⏳ |
| Escalar | escalarAlerta() | POST `/api/mantenimiento/alertas/{id}/escalar` | ⏳ |
| Ignorar | ignorarAlerta() | POST `/api/mantenimiento/alertas/{id}/ignorar` | ⏳ |
| Ver Detalles | mostrarDetalles() | GET `/api/mantenimiento/alertas/{id}` | ⏳ |
| Confirmar Resolver | confirmarResolver() | POST `/api/mantenimiento/alertas/{id}/resolver` | ⏳ |

### CHAT
| Botón | Acción | Endpoint Esperado | Status |
|-------|--------|-------------------|--------|
| Enviar Mensaje | enviarMensaje() | POST `/api/chat/enviar` o WebSocket | ⏳ |
| Cerrar Chat | cerrarChat() | (Frontend only) | ✅ |

### ASISTENTE-IA
| Botón | Acción | Endpoint Esperado | Status |
|-------|--------|-------------------|--------|
| Procesar Pregunta | procesarPregunta() | POST `/api/asistente-ia/procesar-pregunta` | ✅ Implementado |
| Reutilizar Respuesta | reutilizarRespuesta() | (Frontend only) | ✅ |
| Descargar Respuesta | descargarRespuesta() | GET `/api/asistente-ia/exportar` | ⏳ |
| Limpiar Historial | limpiarHistorial() | (Frontend only) | ✅ |
| Toggle Historial | toggleHistorial() | (Frontend only) | ✅ |

---

## TAREAS PENDIENTES

### Verificación de Endpoints (Alta Prioridad)
- [ ] Verificar que `/api/ubicaciones/ciudades` existe y retorna datos correctos
- [ ] Verificar que `/api/publicaciones/mis` existe
- [ ] Verificar que `/api/estadisticas` existe
- [ ] Verificar que `/api/pagos/historial` existe
- [ ] Verificar que `/api/mantenimiento/alertas` existe (WebSocket)
- [ ] Verificar autenticación JWT en todos los endpoints

### Creación de Endpoints Faltantes (Alta Prioridad)
- [ ] POST `/api/publicaciones/borrador` - Guardar borrador
- [ ] POST `/api/publicaciones/aprobar` - Enviar a aprobación
- [ ] GET `/api/asistente-ia/exportar` - Descargar respuesta IA
- [ ] POST `/api/ubicaciones/seleccionar` - Guardar ubicaciones

### Creación de Modales (Media Prioridad)
- [ ] Modal de confirmar resolver alerta (Mantenimiento)
- [ ] Modal de detalles de alerta
- [ ] Modal de detalles de publicidad
- [ ] Modal de confirmación de eliminar

### Testing de Conectividad (Media Prioridad)
- [ ] Probar cada endpoint con JWT token
- [ ] Verificar payloads request/response
- [ ] Verificar guards de rol funcionan
- [ ] Verificar WebSockets (Chat, Mantenimiento)

---

## ESTADO ACTUAL BACKEND
- Maven Status: 🔄 Compilando... (espera)
- Imports arreglados: ✅ 9 archivos (dominio → domain, repositorio → repository, servicio → service)
- Carpetas antiguas eliminadas: ✅ (dominio/, repositorio/, servicio/)
- Módulos consolidados a inglés: ✅ IA module

---

## PROXIMOS PASOS
1. ⏳ Esperar a que Maven termine compilación
2. ⏳ Revisar errores de compilación restantes
3. ⏳ Crear endpoints faltantes
4. ⏳ Crear/actualizar modales en frontend
5. ⏳ Testing de conectividad completa

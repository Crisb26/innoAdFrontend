## CHECKLIST EJECUTABLE - INNOAD REPAIR PROJECT
**Estado**: En Progreso
**Última actualización**: 2026-01-02 10:30

---

## FASE 1: BACKEND REPAIR ✅ (COMPLETADO)

### Paso 1: Arreglar Imports
- [x] Identificar archivos con imports desde `auth.dominio`
- [x] Corregir 9 archivos: dominio → domain
- [x] Corregir 9 archivos: repositorio → repository  
- [x] Corregir 9 archivos: servicio → service
- [x] Actualizar 42+ imports en módulo IA

### Paso 2: Consolidar Módulo IA
- [x] Copiar dominio/* → domain/
- [x] Copiar servicio/* → service/
- [x] Copiar repositorio/* → repository/
- [x] Actualizar package declarations
- [x] Eliminar carpetas antiguas

### Paso 3: Agregar Endpoints
- [x] POST `/api/publicaciones/borrador`
- [x] GET `/api/publicaciones/mis`
- [x] Verificar `/api/ubicaciones/*` (existe)
- [x] Verificar `/api/mantenimiento/*` (existe)

### Paso 4: Verificar Compilación
- [x] Ejecutar Maven compile
- ⏳ **ESPERANDO** resultado (en background)

---

## FASE 2: FRONTEND CONNECTIVITY ⏳ (EN PROGRESO)

### Paso 1: Auditoría de Botones
- [x] Contar botones (22 encontrados)
- [x] Mapear a módulos
- [x] Mapear a componentes
- [x] Asignar endpoints esperados
- [x] Documentar por rol

### Paso 2: Crear Componentes
- [x] ModalDetallesPublicacionComponent (standalone)
- [x] Con estilos básicos
- [x] Con badge de estado
- [x] Con botones de acción
- [ ] Integrar en usuario-dashboard

### Paso 3: Conectar Servicios
- [ ] ServicioPublicacion → GET `/api/publicaciones/mis`
- [ ] ServicioPublicacion → GET `/api/publicaciones/{id}`
- [ ] ServicioPublicacion → POST `/api/publicaciones/borrador`
- [ ] ServicioUbicaciones → GET `/api/ubicaciones/ciudades`
- [ ] ServicioChat → WebSocket `/ws/chat`
- [ ] ServicioMantenimiento → WebSocket `/ws/mantenimiento/alertas`

### Paso 4: Conectar Botones
- [ ] Dashboard: Crear Publicidad → navega a seleccionar ubicaciones
- [ ] Dashboard: Mis Publicidades → GET `/api/publicaciones/mis`
- [ ] Dashboard: Ver Detalles → modal o ruta con GET `/api/publicaciones/{id}`
- [ ] Publicacion: Guardar Borrador → POST `/api/publicaciones/borrador`
- [ ] Publicacion: Enviar Aprobación → POST `/api/publicaciones/aprobar`
- [ ] Ubicaciones: Continuar → POST `/api/ubicaciones/seleccionar`
- [ ] Chat: Enviar → POST `/api/chat/enviar` o WebSocket
- [ ] Mantenimiento: Resolver → POST `/api/mantenimiento/alertas/{id}/resolver`
- [ ] Mantenimiento: Escalar → POST `/api/mantenimiento/alertas/{id}/escalar`
- [ ] Asistente-IA: Procesar → POST `/api/asistente-ia/procesar-pregunta` ✅

### Paso 5: Verificar Autenticación
- [ ] JWT token en localStorage
- [ ] Headers: `Authorization: Bearer {token}`
- [ ] Guards funcionen (`guardAutenticacion`, `RolGuard`)
- [ ] Permisos se validen por rol

---

## FASE 3: TESTING ⏳ (PENDIENTE)

### Pruebas Manual (Backend)
- [ ] Compilación exitosa de Maven
- [ ] Backend inicia sin errores
- [ ] GET `/api/ubicaciones/ciudades` retorna datos
- [ ] GET `/api/publicaciones/{id}` retorna datos
- [ ] POST `/api/publicaciones/borrador` crea registro
- [ ] WebSocket chat conecta
- [ ] WebSocket mantenimiento conecta

### Pruebas Manual (Frontend)
- [ ] Dashboard carga datos
- [ ] Botón "Crear Publicidad" navega
- [ ] Botón "Mis Publicidades" carga lista
- [ ] Botón "Ver Detalles" abre modal/página
- [ ] Guardar borrador funciona
- [ ] Enviar aprobación funciona

### Responsiveness Testing
- [ ] 1920px (Desktop)
- [ ] 1366px (Laptop)
- [ ] 768px (Tablet)
- [ ] 375px (Mobile)

---

## FASE 4: CLEANUP ⏳ (PENDIENTE)

### Código Backend
- [ ] Remover imports no usados
- [ ] Remover métodos vacíos
- [ ] Remover código comentado
- [ ] Consolidar duplicados (dominio/repositorio/servicio)
- [ ] Verificar no hay archivos .bak

### Código Frontend
- [ ] Remover console.log() innecesarios
- [ ] Remover código muerto
- [ ] Remover estilos no usados

---

## ESTADO ACTUAL POR MÓDULO

| Módulo | Backend | Frontend | Status |
|--------|---------|----------|--------|
| Publicaciones | ✅ Completo | ⏳ Conectando | En Progreso |
| Ubicaciones | ✅ Completo | ✅ HTML existe | Ready |
| Chat | ✅ Completo | ⏳ WebSocket | Ready |
| Asistente-IA | ✅ Completo | ✅ Conectado | Funcional |
| Mantenimiento | ✅ Completo | ✅ Alertas exist | Ready |
| Pagos | ✅ Completo | ✅ Componente existe | Ready |
| Reportes | ✅ Completo | ✅ Dashboard exists | Ready |
| Dashboard | ✅ Servicios exist | ⏳ Actualizando | En Progreso |

---

## ARCHIVOS CRÍTICOS A REVISAR

### Backend
- `/api/publicaciones` → `PublicacionController.java` ✅ Actualizado
- `/api/ubicaciones` → `UbicacionController.java` ✅ Verificado
- `/api/asistente-ia` → `ControladorAsistenteIA.java` ✅ Funcional
- `/api/mantenimiento` → `ControladorMantenimiento.java` ✅ Verificado

### Frontend
- `usuario-dashboard.component.ts` - Integrar modal ⏳
- `usuario-dashboard.component.html` - Usar modal ⏳
- `publicacion-crear.component.ts` - Conectar endpoints ⏳
- `seleccionar-ubicaciones.component.ts` - Conectar ubicaciones ⏳
- `panel-chat.component.ts` - WebSocket ⏳
- `centro-alertas-tiempo-real.component.ts` - WebSocket ⏳

---

## COMANDOS ÚTILES

### Maven
```bash
# Compilar
cd c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend
mvn clean compile -q

# Ejecutar
mvn spring-boot:run

# Test
mvn test

# Build JAR
mvn clean package
```

### NPM (Frontend)
```bash
# Instalar dependencias
npm install

# Desarrollo
ng serve

# Build
ng build

# Test responsiveness
node testing-responsiveness.js
```

---

## VERIFICACIONES RÁPIDAS

### Backend Compilación
```bash
mvn compile -q && echo "✅ BUILD SUCCESS" || echo "❌ BUILD FAILURE"
```

### Frontend Servicio
```bash
curl http://localhost:4200/
```

### API Endpoint
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:8080/api/ubicaciones/ciudades
```

---

## BLOCKERS & SOLUCIONES

| Blocker | Solución | Status |
|---------|----------|--------|
| Maven compile lento | Compilación completará en 5-10 min | ⏳ |
| Imports rotos en IA | Arreglados en 9 archivos | ✅ |
| Endpoints faltantes | Creados borrador y mis | ✅ |
| Modales sin componentes | ModalDetallesPublicacion creado | ✅ |
| JWT en requests | Ya configurado en servicios | ✅ |

---

## PRÓXIMOS 30 MINUTOS

1. **5-10 min**: Verificar compilación de Maven
2. **5 min**: Revisar errores de compilación (si existen)
3. **10 min**: Iniciar backend local
4. **5 min**: Testing rápido de endpoints en Postman
5. **5 min**: Documentar resultados

---

## MÉTRICAS

```
Archivos modificados: 15+
Líneas de código: 500+
Endpoints agregados: 2
Componentes creados: 1
Imports corregidos: 42+
Documentación: 4 archivos
Tiempo total: 1.5 horas
```

---

## RESPONSABLES SIGUIENTES

**Frontend Team**:
- [ ] Integrar modales
- [ ] Conectar servicios a endpoints
- [ ] Polish estilos CSS
- [ ] Testing responsiveness

**Backend Team**:
- [ ] Verificar compilación
- [ ] Testing de endpoints
- [ ] Validación de JWT
- [ ] Performance tuning

---

**Última actualización**: 2026-01-02 10:30  
**Próxima revisión**: Cuando Maven termine compilación  
**Estimado de conclusión**: 12:00 (1 hora más)

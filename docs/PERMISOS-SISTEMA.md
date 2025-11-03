# Sistema de Permisos - InnoAd Frontend

## Permisos Implementados por Módulo

### Campañas
- `CAMPANAS_VER` - Ver listado de campañas
- `CAMPANAS_CREAR` - Crear nuevas campañas
- `CAMPANAS_EDITAR` - Editar campañas existentes
- `CAMPANAS_ELIMINAR` - Eliminar campañas

### Pantallas
- `PANTALLAS_VER` - Ver listado de pantallas
- `PANTALLAS_ADMINISTRAR` - Administrar dispositivos
- `PANTALLAS_CREAR` - Registrar nuevas pantallas
- `PANTALLAS_EDITAR` - Editar configuración de pantallas
- `PANTALLAS_ELIMINAR` - Eliminar pantallas

### Contenidos
- `CONTENIDOS_VER` - Ver biblioteca de contenidos
- `CONTENIDOS_CREAR` - Subir nuevos contenidos
- `CONTENIDOS_EDITAR` - Editar contenidos existentes
- `CONTENIDOS_ELIMINAR` - Eliminar contenidos

### Reportes y Estadísticas
- `REPORTES_VER` - Ver reportes y análisis
- `ESTADISTICAS_VER` - Ver estadísticas generales
- `REPORTES_EXPORTAR` - Exportar reportes

### Panel de Administración
- `ADMIN_PANEL_VER` - Acceso al panel de administración
- `USUARIOS_VER` - Ver usuarios del sistema
- `USUARIOS_CREAR` - Crear nuevos usuarios
- `USUARIOS_EDITAR` - Editar usuarios
- `USUARIOS_ELIMINAR` - Eliminar usuarios

## Configuración de Permisos por Rol

### Rol: Administrador
**Nivel de acceso:** Total

Permisos asignados:
- Todos los permisos del sistema
- Acceso administrativo completo
- Sin restricciones

**Nota:** El rol Administrador tiene acceso automático a todos los módulos sin necesidad de permisos específicos.

### Rol: Empresa
**Nivel de acceso:** Gestión de campañas y contenidos

Permisos recomendados:
- `CAMPANAS_VER`
- `CAMPANAS_CREAR`
- `CAMPANAS_EDITAR`
- `CONTENIDOS_VER`
- `CONTENIDOS_CREAR`
- `CONTENIDOS_EDITAR`
- `PANTALLAS_VER`
- `REPORTES_VER`
- `ESTADISTICAS_VER`

**Restricciones:**
- No puede eliminar campañas ni contenidos (requiere aprobación admin)
- No puede administrar pantallas (solo visualización)
- No puede gestionar usuarios

### Rol: Usuario
**Nivel de acceso:** Solo lectura

Permisos recomendados:
- `CAMPANAS_VER`
- `CONTENIDOS_VER`
- `PANTALLAS_VER`
- `ESTADISTICAS_VER`

**Restricciones:**
- Solo lectura en todos los módulos
- No puede crear, editar ni eliminar
- No puede acceder a reportes avanzados

## Implementación en el Backend

El backend debe validar estos permisos en los endpoints correspondientes:

### Ejemplo de estructura Usuario en backend:

```json
{
  "id": 1,
  "nombreUsuario": "admin",
  "email": "admin@innoad.com",
  "rol": {
    "id": 1,
    "nombre": "Administrador"
  },
  "permisos": [
    { "id": 1, "nombre": "ADMIN_PANEL_VER" },
    { "id": 2, "nombre": "CAMPANAS_VER" },
    { "id": 3, "nombre": "CAMPANAS_CREAR" },
    { "id": 4, "nombre": "CAMPANAS_EDITAR" },
    { "id": 5, "nombre": "CAMPANAS_ELIMINAR" },
    { "id": 6, "nombre": "PANTALLAS_VER" },
    { "id": 7, "nombre": "PANTALLAS_ADMINISTRAR" },
    { "id": 8, "nombre": "CONTENIDOS_VER" },
    { "id": 9, "nombre": "CONTENIDOS_CREAR" },
    { "id": 10, "nombre": "REPORTES_VER" },
    { "id": 11, "nombre": "ESTADISTICAS_VER" }
  ]
}
```

## Validación en el Frontend

El frontend valida permisos en dos niveles:

### 1. Guards de Rutas (app.routes.ts)

Cada ruta protegida valida permisos usando `guardPermisos`:

```typescript
{
  path: 'campanas',
  canActivate: [guardAutenticacion, guardPermisos],
  data: { permisos: ['CAMPANAS_VER', 'CAMPANAS_CREAR'] }
}
```

**Lógica:** El usuario necesita tener AL MENOS UNO de los permisos especificados.

### 2. Directivas en Componentes (futuro)

Se puede crear una directiva `*tienePermiso` para ocultar elementos UI:

```html
<button *tienePermiso="'CAMPANAS_ELIMINAR'" (click)="eliminar()">
  Eliminar
</button>
```

## Usuarios Semilla (Backend)

El backend debe crear estos usuarios al iniciar:

### Usuario 1: Administrador
```typescript
{
  nombreUsuario: "admin",
  email: "admin@innoad.com",
  contrasena: "Admin123!",
  rol: "Administrador",
  permisos: [todos los permisos del sistema]
}
```

### Usuario 2: Empresa
```typescript
{
  nombreUsuario: "empresa",
  email: "empresa@innoad.com",
  contrasena: "Empresa123!",
  rol: "Empresa",
  permisos: [
    "CAMPANAS_VER", "CAMPANAS_CREAR", "CAMPANAS_EDITAR",
    "CONTENIDOS_VER", "CONTENIDOS_CREAR", "CONTENIDOS_EDITAR",
    "PANTALLAS_VER", "REPORTES_VER", "ESTADISTICAS_VER"
  ]
}
```

### Usuario 3: Usuario Estándar
```typescript
{
  nombreUsuario: "usuario",
  email: "usuario@innoad.com",
  contrasena: "Usuario123!",
  rol: "Usuario",
  permisos: [
    "CAMPANAS_VER", "CONTENIDOS_VER",
    "PANTALLAS_VER", "ESTADISTICAS_VER"
  ]
}
```

## Flujo de Validación

1. Usuario intenta acceder a una ruta (ej: `/campanas`)
2. `guardAutenticacion` verifica que esté logueado
3. `guardPermisos` verifica que tenga AL MENOS UNO de los permisos en `data.permisos`
4. Si no tiene permisos → Redirige a `/sin-permisos`
5. Si tiene permisos → Permite el acceso

## Endpoints del Backend que Deben Validar Permisos

### Campañas
- `GET /api/v1/campanas` → Requiere `CAMPANAS_VER`
- `POST /api/v1/campanas` → Requiere `CAMPANAS_CREAR`
- `PUT /api/v1/campanas/{id}` → Requiere `CAMPANAS_EDITAR`
- `DELETE /api/v1/campanas/{id}` → Requiere `CAMPANAS_ELIMINAR`

### Pantallas
- `GET /api/v1/pantallas` → Requiere `PANTALLAS_VER`
- `POST /api/v1/pantallas` → Requiere `PANTALLAS_ADMINISTRAR`
- `PUT /api/v1/pantallas/{id}` → Requiere `PANTALLAS_ADMINISTRAR`
- `DELETE /api/v1/pantallas/{id}` → Requiere `PANTALLAS_ADMINISTRAR`

### Contenidos
- `GET /api/v1/contenidos` → Requiere `CONTENIDOS_VER`
- `POST /api/v1/contenidos` → Requiere `CONTENIDOS_CREAR`
- `PUT /api/v1/contenidos/{id}` → Requiere `CONTENIDOS_EDITAR`
- `DELETE /api/v1/contenidos/{id}` → Requiere `CONTENIDOS_ELIMINAR`

### Reportes
- `GET /api/v1/estadisticas/dashboard` → Requiere `ESTADISTICAS_VER`
- `GET /api/v1/estadisticas/campanas/{id}` → Requiere `REPORTES_VER`
- `POST /api/v1/estadisticas/exportar` → Requiere `REPORTES_EXPORTAR`

## Notas Importantes

1. **Administradores tienen acceso total:** El método `tienePermiso()` en el frontend retorna `true` automáticamente para usuarios con rol "Administrador".

2. **Validación en ambos lados:** Aunque el frontend valida permisos, el backend DEBE validarlos también por seguridad.

3. **Permisos dinámicos:** Los permisos se cargan desde el backend en el objeto `usuario.permisos[]` al hacer login.

4. **Cache de permisos:** Los permisos se almacenan en localStorage/sessionStorage junto con los datos del usuario.

5. **Refresh de permisos:** Al refrescar el token, los permisos se mantienen. Si cambian los permisos del usuario, debe cerrar sesión y volver a iniciar.

## Testing de Permisos

Para probar el sistema de permisos:

1. Iniciar sesión con cada tipo de usuario
2. Intentar acceder a cada módulo
3. Verificar que la redirección a `/sin-permisos` funcione correctamente
4. Verificar que el backend rechace peticiones sin permisos (401 o 403)

## Próximos Pasos

- [ ] Backend: Implementar validación de permisos en endpoints
- [ ] Backend: Crear usuarios semilla con permisos correctos
- [ ] Frontend: Crear directiva `*tienePermiso` para UI
- [ ] Frontend: Ocultar botones/acciones según permisos del usuario
- [ ] Testing: Pruebas unitarias de guards de permisos

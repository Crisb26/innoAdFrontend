# 📚 Documentación Compodoc - Frontend Angular

## 🚀 Generar Documentación del Frontend

### Instalación

```bash
cd c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend
npm install @compodoc/compodoc --save-dev
```

### Generar Documentación

```bash
# Generar documentación estática
npx compodoc -p tsconfig.app.json -d docs

# O si instalaste globalmente
compodoc -p tsconfig.app.json -d docs
```

### Visualizar Documentación

```bash
# Servir en localhost:8080
npx compodoc -s
```

Luego abre: **http://localhost:8080**

---

## 📋 Estructura Documentada

La documentación automática incluye:
- ✅ Todos los componentes Angular
- ✅ Servicios
- ✅ Guardias
- ✅ Interceptores
- ✅ Modelos/Interfaces
- ✅ Módulos
- ✅ Pipes
- ✅ Directivas

---

## 📝 Comentarios para Documentación

Usa comentarios JSDoc en tu código:

```typescript
/**
 * Componente de gestión de campañas
 * 
 * Permite crear, editar, eliminar y pausar campañas publicitarias.
 * 
 * @example
 * <app-campanas [usuarioId]="123"></app-campanas>
 */
export class CampanasComponent {
  /**
   * ID del usuario propietario de las campañas
   */
  @Input() usuarioId: number;
  
  /**
   * Emitido cuando se crea una nueva campaña
   * @event campaniaCreada
   */
  @Output() campaniaCreada = new EventEmitter<Campana>();
}
```

---

## 🔍 Explorar en Compodoc

1. **Overview** - Resumen del proyecto
2. **Modules** - Módulos Angular
3. **Components** - Lista de componentes
4. **Services** - Servicios disponibles
5. **Guards** - Guardias de ruta
6. **Interceptors** - Interceptores HTTP
7. **Directives** - Directivas personalizadas
8. **Pipes** - Pipes personalizados
9. **Classes** - Clases generales
10. **Interfaces** - Interfaces TypeScript

---

## 📊 Documentación de Componentes Clave

### ModuloAutenticacion
- `AutenticacionComponent` - Login y registro
- `ServicioAutenticacion` - Lógica de autenticación
- `GuardiaAutenticacion` - Protege rutas privadas

### ModuloCampanas
- `CampanasComponent` - Listado de campañas
- `EditorCampanaComponent` - Crear/editar campaña
- `ServicioCampanas` - API de campañas

### ModuloChat
- `ChatComponent` - Chat con IA
- `ServicioChat` - Llamadas a IA (OpenAI)

### ModuloAdmin
- `AdminComponent` - Panel administrativo
- `MonitoreoConexionesComponent` - Monitoreo de usuarios
- `ServicioAdmin` - Endpoints administrativos

---

## 🔗 Enlazar Frontend ↔ Backend

**Frontend Swagger (Compodoc)**: `http://localhost:4200/docs` (después de generar)
**Backend Swagger (SpringDoc)**: `http://localhost:8080/swagger-ui.html`

Ambas documentaciones están enlazadas: cada endpoint del frontend consume APIs documentadas del backend.

---

## ✨ Exportar Documentación

```bash
# HTML estático (por defecto)
compodoc -p tsconfig.app.json -d docs

# Acceder a la documentación
# Copia la carpeta 'docs' a cualquier servidor web
# O abre docs/index.html en el navegador
```

---

## 🎯 Verificación Rápida

```bash
# Ver estructura de módulos
compodoc -p tsconfig.app.json --json

# Generar y servir en puerto personalizado
compodoc -s -p 8082
```

---

**Nota:** Compodoc genera documentación a partir de:
- Nombres de archivos
- Comentarios JSDoc
- Tipos TypeScript
- Decoradores Angular (@Component, @Injectable, etc)

Sin cambios en el código, ya tendrás documentación automática.

# 🔐 GUÍA RÁPIDA: Implementación de Permisos Frontend

## 📋 Resumen Ejecutivo

Esta guía implementa el sistema de permisos en Angular 18 para InnoAd. Incluye:
- ✅ Servicio centralizado de permisos
- ✅ Guards para protección de rutas
- ✅ Directivas para control de UI
- ✅ Pipes para templates
- ✅ Interceptadores para auditoría

---

## 🚀 Quick Start (10 minutos)

### 1. Crear Servicio de Permisos

**Archivo**: `src/app/core/servicios/permisos.servicio.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface Permiso {
  id: number;
  codigo: string;
  descripcion: string;
  categoria: string;
}

interface Rol {
  id: number;
  nombre: string;
  nivelAcceso: number;
  permisos: Permiso[];
}

interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: Rol;
}

@Injectable({
  providedIn: 'root'
})
export class PermisosServicio {
  private permisosCache = new Map<string, boolean>();
  private usuarioActual: Usuario | null = null;
  private cargando = false;

  constructor(private http: HttpClient) {
    this.cargarPermisos();
  }

  /**
   * Cargar permisos del usuario actual del backend
   */
  async cargarPermisos(): Promise<void> {
    if (this.cargando) return;
    
    this.cargando = true;
    try {
      const permisos = await firstValueFrom(
        this.http.get<string[]>('/api/permisos/mis-permisos')
      );
      
      this.permisosCache.clear();
      permisos.forEach(codigo => {
        this.permisosCache.set(codigo, true);
      });
    } catch (error) {
      console.error('Error cargando permisos:', error);
    } finally {
      this.cargando = false;
    }
  }

  /**
   * Verificar si usuario tiene permiso específico - O(1)
   */
  tienePermiso(codigo: string): boolean {
    return this.permisosCache.has(codigo);
  }

  /**
   * Verificar si usuario tiene ALGUNO de los permisos
   */
  tieneAlgunPermiso(...codigos: string[]): boolean {
    return codigos.some(codigo => this.tienePermiso(codigo));
  }

  /**
   * Verificar si usuario tiene TODOS los permisos
   */
  tieneTodosPermisos(...codigos: string[]): boolean {
    return codigos.every(codigo => this.tienePermiso(codigo));
  }

  /**
   * Obtener todos los permisos del usuario
   */
  obtenerPermisos(): string[] {
    return Array.from(this.permisosCache.keys());
  }

  /**
   * Verificar rol específico
   */
  tieneRol(nombreRol: string): boolean {
    return this.usuarioActual?.rol?.nombre === nombreRol;
  }

  /**
   * Verificar nivel de acceso
   */
  tieneMinimoNivelAcceso(nivel: number): boolean {
    return (this.usuarioActual?.rol?.nivelAcceso ?? 0) >= nivel;
  }

  /**
   * Recargar permisos (útil después de cambios)
   */
  recargar(): Promise<void> {
    return this.cargarPermisos();
  }
}
```

### 2. Crear Guard de Permisos

**Archivo**: `src/app/core/guards/permisos.guard.ts`

```typescript
import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { PermisosServicio } from '../servicios/permisos.servicio';
import { NotifyXService } from '../servicios/notifyx.servicio';

@Injectable({
  providedIn: 'root'
})
export class PermisosGuard implements CanActivate {
  constructor(
    private permisosServicio: PermisosServicio,
    private router: Router,
    private notifyX: NotifyXService
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    // Leer permisos requeridos de la ruta
    const permisosRequeridos = route.data['permisos'] as string[];
    const modo = route.data['modo'] as 'todos' | 'alguno' || 'todos';

    if (!permisosRequeridos || permisosRequeridos.length === 0) {
      return true; // Sin restricción
    }

    // Validar según modo
    const tieneAcceso = modo === 'todos'
      ? this.permisosServicio.tieneTodosPermisos(...permisosRequeridos)
      : this.permisosServicio.tieneAlgunPermiso(...permisosRequeridos);

    if (!tieneAcceso) {
      this.notifyX.error(
        'Acceso Denegado',
        `No tienes permisos para acceder a esta sección`
      );
      this.router.navigate(['/sin-permisos']);
      return false;
    }

    return true;
  }
}
```

### 3. Crear Directiva de Permisos

**Archivo**: `src/app/shared/directivas/permiso.directiva.ts`

```typescript
import { 
  Directive, 
  Input, 
  TemplateRef, 
  ViewContainerRef,
  OnInit
} from '@angular/core';
import { PermisosServicio } from '../../core/servicios/permisos.servicio';

@Directive({
  selector: '[appPermiso]',
  standalone: true
})
export class PermisoDirectiva implements OnInit {
  private permisos: string[] = [];

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permisosServicio: PermisosServicio
  ) {}

  @Input()
  set appPermiso(permisos: string | string[]) {
    this.permisos = Array.isArray(permisos) ? permisos : [permisos];
    this.actualizar();
  }

  @Input()
  set appPermisoModo(modo: 'todos' | 'alguno') {
    this.actualizar();
  }

  ngOnInit() {
    this.actualizar();
  }

  private actualizar() {
    const tieneAcceso = this.permisosServicio.tieneAlgunPermiso(...this.permisos);
    
    if (tieneAcceso) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
```

### 4. Crear Pipe de Permisos

**Archivo**: `src/app/shared/pipes/tiene-permiso.pipe.ts`

```typescript
import { Pipe, PipeTransform } from '@angular/core';
import { PermisosServicio } from '../../core/servicios/permisos.servicio';

@Pipe({
  name: 'tienePermiso',
  standalone: true
})
export class TienePermisoPipe implements PipeTransform {
  constructor(private permisosServicio: PermisosServicio) {}

  transform(codigo: string): boolean {
    return this.permisosServicio.tienePermiso(codigo);
  }
}
```

### 5. Actualizar Rutas con Guards

**Archivo**: `src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { PermisosGuard } from './core/guards/permisos.guard';
import { AutenticacionGuard } from './core/guards/autenticacion.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AutenticacionGuard]
  },
  {
    path: 'admin/usuarios',
    component: GestionUsuariosComponent,
    canActivate: [AutenticacionGuard, PermisosGuard],
    data: {
      permisos: ['USUARIOS_VER'],
      modo: 'todos'
    }
  },
  {
    path: 'admin/roles',
    component: GestionRolesComponent,
    canActivate: [AutenticacionGuard, PermisosGuard],
    data: {
      permisos: ['ROLES_VER'],
      modo: 'todos'
    }
  },
  {
    path: 'campanas',
    component: ListaCampanasComponent,
    canActivate: [AutenticacionGuard, PermisosGuard],
    data: {
      permisos: ['CAMPANAS_VER', 'CAMPANAS_VER_PROPIAS'],
      modo: 'alguno' // Usuario puede ver si tiene alguno
    }
  },
  {
    path: 'contenidos',
    component: ListaContenidosComponent,
    canActivate: [AutenticacionGuard, PermisosGuard],
    data: {
      permisos: ['CONTENIDOS_VER'],
      modo: 'todos'
    }
  }
];
```

### 6. Usar en Componentes

**Archivo**: `src/app/modulos/campanas/lista-campanas.component.ts`

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermisoDirectiva } from '../../shared/directivas/permiso.directiva';
import { PermisosServicio } from '../../core/servicios/permisos.servicio';

@Component({
  selector: 'app-lista-campanas',
  standalone: true,
  imports: [CommonModule, PermisoDirectiva],
  template: `
    <div class="container">
      <h1>Campañas</h1>

      <!-- Solo si tiene permiso CREAR -->
      <button 
        *appPermiso="'CAMPANAS_CREAR'"
        (click)="crearCampana()"
        class="btn btn-primary">
        ➕ Nueva Campaña
      </button>

      <!-- Tabla de campañas -->
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let campana of campanas">
            <td>{{ campana.nombre }}</td>
            <td>{{ campana.estado }}</td>
            <td>
              <!-- Botón Editar -->
              <button 
                *appPermiso="'CAMPANAS_EDITAR'"
                (click)="editarCampana(campana.id)"
                class="btn btn-sm btn-warning">
                ✏️ Editar
              </button>

              <!-- Botón Publicar -->
              <button 
                *appPermiso="'CAMPANAS_PUBLICAR'"
                (click)="publicarCampana(campana.id)"
                class="btn btn-sm btn-success">
                📤 Publicar
              </button>

              <!-- Botón Eliminar -->
              <button 
                *appPermiso="'CAMPANAS_ELIMINAR'"
                (click)="eliminarCampana(campana.id)"
                class="btn btn-sm btn-danger">
                🗑️ Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class ListaCampanasComponent {
  campanas: any[] = [];

  constructor(private permisosServicio: PermisosServicio) {
    this.cargarCampanas();
  }

  cargarCampanas() {
    // Lógica de carga
  }

  crearCampana() {
    if (!this.permisosServicio.tienePermiso('CAMPANAS_CREAR')) {
      console.error('Permiso denegado');
      return;
    }
    // Crear campaña
  }

  editarCampana(id: number) {
    if (!this.permisosServicio.tienePermiso('CAMPANAS_EDITAR')) {
      console.error('Permiso denegado');
      return;
    }
    // Editar campaña
  }

  publicarCampana(id: number) {
    if (!this.permisosServicio.tienePermiso('CAMPANAS_PUBLICAR')) {
      console.error('Permiso denegado');
      return;
    }
    // Publicar campaña
  }

  eliminarCampana(id: number) {
    if (!this.permisosServicio.tienePermiso('CAMPANAS_ELIMINAR')) {
      console.error('Permiso denegado');
      return;
    }
    // Eliminar campaña
  }
}
```

---

## 📊 Enumeración de Permisos

**Archivo**: `src/app/core/constantes/permisos.constantes.ts`

```typescript
export enum CODIGOS_PERMISOS {
  // SISTEMA
  MODO_MANTENIMIENTO_VER = 'MODO_MANTENIMIENTO_VER',
  MODO_MANTENIMIENTO_ACTIVAR = 'MODO_MANTENIMIENTO_ACTIVAR',
  CONFIGURACION_SISTEMA = 'CONFIGURACION_SISTEMA',
  LOGS_AUDITORIA_VER = 'LOGS_AUDITORIA_VER',
  LOGS_AUDITORIA_EXPORTAR = 'LOGS_AUDITORIA_EXPORTAR',
  BACKUPS_VER = 'BACKUPS_VER',
  BACKUPS_CREAR = 'BACKUPS_CREAR',
  BACKUPS_RESTAURAR = 'BACKUPS_RESTAURAR',

  // USUARIOS
  USUARIOS_VER = 'USUARIOS_VER',
  USUARIOS_CREAR = 'USUARIOS_CREAR',
  USUARIOS_EDITAR = 'USUARIOS_EDITAR',
  USUARIOS_ELIMINAR = 'USUARIOS_ELIMINAR',
  USUARIOS_CAMBIAR_ROL = 'USUARIOS_CAMBIAR_ROL',
  USUARIOS_DESACTIVAR = 'USUARIOS_DESACTIVAR',
  USUARIOS_EXPORTAR = 'USUARIOS_EXPORTAR',
  PERFIL_VER_PROPIO = 'PERFIL_VER_PROPIO',
  PERFIL_EDITAR_PROPIO = 'PERFIL_EDITAR_PROPIO',
  PERFIL_CAMBIAR_CONTRASENA = 'PERFIL_CAMBIAR_CONTRASENA',
  PERFIL_VER_OTROS = 'PERFIL_VER_OTROS',

  // CAMPAÑAS
  CAMPANAS_VER = 'CAMPANAS_VER',
  CAMPANAS_VER_PROPIAS = 'CAMPANAS_VER_PROPIAS',
  CAMPANAS_CREAR = 'CAMPANAS_CREAR',
  CAMPANAS_EDITAR = 'CAMPANAS_EDITAR',
  CAMPANAS_ELIMINAR = 'CAMPANAS_ELIMINAR',
  CAMPANAS_PUBLICAR = 'CAMPANAS_PUBLICAR',
  CAMPANAS_DESPUBLICAR = 'CAMPANAS_DESPUBLICAR',
  CAMPANAS_PROGRAMAR = 'CAMPANAS_PROGRAMAR',
  CAMPANAS_CLONAR = 'CAMPANAS_CLONAR',

  // CONTENIDOS
  CONTENIDOS_VER = 'CONTENIDOS_VER',
  CONTENIDOS_VER_PROPIOS = 'CONTENIDOS_VER_PROPIOS',
  CONTENIDOS_CREAR = 'CONTENIDOS_CREAR',
  CONTENIDOS_EDITAR = 'CONTENIDOS_EDITAR',
  CONTENIDOS_ELIMINAR = 'CONTENIDOS_ELIMINAR',
  CONTENIDOS_SUBIR_MULTIMEDIA = 'CONTENIDOS_SUBIR_MULTIMEDIA',
  CONTENIDOS_APROBAR = 'CONTENIDOS_APROBAR',
  CONTENIDOS_RECHAZAR = 'CONTENIDOS_RECHAZAR',
  CONTENIDOS_VER_VERSIONES = 'CONTENIDOS_VER_VERSIONES',
  CONTENIDOS_EXPORTAR = 'CONTENIDOS_EXPORTAR',

  // PANTALLAS
  PANTALLAS_VER = 'PANTALLAS_VER',
  PANTALLAS_CREAR = 'PANTALLAS_CREAR',
  PANTALLAS_EDITAR = 'PANTALLAS_EDITAR',
  PANTALLAS_ELIMINAR = 'PANTALLAS_ELIMINAR',
  PANTALLAS_ASIGNAR_CONTENIDO = 'PANTALLAS_ASIGNAR_CONTENIDO',
  PANTALLAS_PROGRAMAR = 'PANTALLAS_PROGRAMAR',
  PANTALLAS_MONITOREAR = 'PANTALLAS_MONITOREAR',
  PANTALLAS_CONTROL_REMOTO = 'PANTALLAS_CONTROL_REMOTO',

  // REPORTES
  REPORTES_VER = 'REPORTES_VER',
  REPORTES_VER_PROPIOS = 'REPORTES_VER_PROPIOS',
  REPORTES_CREAR = 'REPORTES_CREAR',
  REPORTES_PERSONALIZADO = 'REPORTES_PERSONALIZADO',
  REPORTES_EXPORTAR_PDF = 'REPORTES_EXPORTAR_PDF',
  REPORTES_EXPORTAR_CSV = 'REPORTES_EXPORTAR_CSV',
  REPORTES_PROGRAMAR_ENVIO = 'REPORTES_PROGRAMAR_ENVIO',
  ESTADISTICAS_VER = 'ESTADISTICAS_VER',
  ESTADISTICAS_TIEMPO_REAL = 'ESTADISTICAS_TIEMPO_REAL',

  // INTEGRACIONES
  INTEGRACIONES_VER = 'INTEGRACIONES_VER',
  INTEGRACIONES_CREAR = 'INTEGRACIONES_CREAR',
  INTEGRACIONES_EDITAR = 'INTEGRACIONES_EDITAR',
  INTEGRACIONES_ELIMINAR = 'INTEGRACIONES_ELIMINAR',
  API_KEYS_VER = 'API_KEYS_VER',
  API_KEYS_CREAR = 'API_KEYS_CREAR',
  API_KEYS_REGENERAR = 'API_KEYS_REGENERAR'
}
```

---

## 🛠️ Checklist de Implementación

- [ ] **Servicio**
  - [ ] Crear `PermisosServicio`
  - [ ] Método `tienePermiso(codigo)`
  - [ ] Método `tieneAlgunPermiso(...codigos)`
  - [ ] Método `tieneTodosPermisos(...codigos)`
  - [ ] Cache de permisos con Map

- [ ] **Guard**
  - [ ] Crear `PermisosGuard`
  - [ ] Validar permisos requeridos en `route.data`
  - [ ] Soportar modo "todos" y "alguno"
  - [ ] Redirigir a `/sin-permisos` si no autorizado

- [ ] **Directiva**
  - [ ] Crear `*appPermiso` directiva
  - [ ] @Input para código de permiso
  - [ ] @Input para modo (todos/alguno)
  - [ ] Mostrar/ocultar elemento según permiso

- [ ] **Pipe**
  - [ ] Crear `tienePermiso` pipe
  - [ ] Uso en templates: `{{ 'CODIGO' | tienePermiso }}`

- [ ] **Rutas**
  - [ ] Actualizar `app.routes.ts` con `PermisosGuard`
  - [ ] Agregar `data: { permisos: [...], modo: 'todos' }`
  - [ ] Probar protección en cada ruta

- [ ] **Componentes**
  - [ ] Importar `PermisoDirectiva`
  - [ ] Usar `*appPermiso` en botones/links
  - [ ] Validar permisos en métodos también
  - [ ] Mostrar UI condicional por rol

- [ ] **Constantes**
  - [ ] Crear enum `CODIGOS_PERMISOS`
  - [ ] Importar en servicios y componentes
  - [ ] Usar strings tipados en lugar de hardcoded

---

## 🧪 Pruebas

### Unit Testing

```typescript
describe('PermisosServicio', () => {
  let servicio: PermisosServicio;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PermisosServicio],
      imports: [HttpClientTestingModule]
    });
    servicio = TestBed.inject(PermisosServicio);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('debe cargar permisos del backend', async () => {
    await servicio.cargarPermisos();
    
    const req = httpMock.expectOne('/api/permisos/mis-permisos');
    expect(req.request.method).toBe('GET');
    req.flush(['USUARIOS_VER', 'USUARIOS_CREAR']);

    expect(servicio.tienePermiso('USUARIOS_VER')).toBe(true);
  });

  it('tienePermiso debe retornar false para permisos no asignados', async () => {
    await servicio.cargarPermisos();
    const req = httpMock.expectOne('/api/permisos/mis-permisos');
    req.flush(['USUARIOS_VER']);

    expect(servicio.tienePermiso('USUARIOS_ELIMINAR')).toBe(false);
  });

  it('tieneAlgunPermiso debe retornar true si tiene alguno', async () => {
    await servicio.cargarPermisos();
    const req = httpMock.expectOne('/api/permisos/mis-permisos');
    req.flush(['USUARIOS_VER']);

    expect(servicio.tieneAlgunPermiso('USUARIOS_VER', 'USUARIOS_CREAR')).toBe(true);
  });
});
```

### Testing Manual

1. **Login con diferentes roles**
   ```
   - superadmin@innoad.com → Ver todas las opciones
   - admin@innoad.com → Ver opciones de admin
   - gerente@innoad.com → Ver solo campañas
   - operador@innoad.com → Ver solo contenidos/pantallas
   - usuario@innoad.com → Ver opciones de lectura
   ```

2. **Probar guards**
   ```
   - Intentar navegar a /admin/usuarios sin permisos
   - Debe redirigir a /sin-permisos
   - Botones deshabilitados según rol
   ```

3. **Cambiar rol y verificar**
   ```
   - Cambiar rol de usuario en admin panel
   - Actualizar permisos con F5
   - Verificar que se actualizó el acceso
   ```

---

## ⚠️ Troubleshooting

### Problema: Permisos no se cargan en startup

**Causa**: `PermisosServicio` se inicializa antes del login

**Solución**: Llamar `cargarPermisos()` después del login
```typescript
// En AuthService.login()
async login(email: string, password: string) {
  const response = await firstValueFrom(
    this.http.post('/api/auth/login', { email, password })
  );
  
  // Guardar token
  localStorage.setItem('token', response.token);
  
  // Cargar permisos del usuario
  await this.permisosServicio.cargarPermisos();
  
  return response;
}
```

### Problema: Directiva no actualiza

**Causa**: No se recargan permisos después de cambio de rol

**Solución**: Recargar manualmente
```typescript
// En componente después de cambiar rol
async cambiarRol() {
  // ... cambiar rol en backend
  await this.permisosServicio.recargar();
  // UI se actualizará automáticamente
}
```

### Problema: Cache incorrecto

**Causa**: Permisos en caché no coinciden con backend

**Solución**: Limpiar cache en logout
```typescript
// En AuthService.logout()
logout() {
  localStorage.removeItem('token');
  this.permisosServicio.limpiar(); // Nuevo método
  this.router.navigate(['/login']);
}
```

---

## 📱 Uso en Templates

```html
<!-- Mostrar solo si tiene permiso -->
<button *appPermiso="'USUARIOS_CREAR'" 
        (click)="crear()">
  Crear Usuario
</button>

<!-- Múltiples permisos (alguno) -->
<div *appPermiso="['CAMPANAS_CREAR', 'CAMPANAS_EDITAR']">
  Control de Campañas
</div>

<!-- Con pipe -->
<span *ngIf="'USUARIOS_VER' | tienePermiso">
  Vista Completa
</span>

<!-- Clase condicional -->
<button [disabled]="!('USUARIOS_ELIMINAR' | tienePermiso)">
  Eliminar
</button>
```

---

## 📞 Próximos Pasos

1. Implementar servicio + guard + directiva + pipe
2. Actualizar rutas con guards y data de permisos
3. Agregar validación en componentes
4. Probar con diferentes roles
5. Implementar interceptador de auditoría

---

**Status**: ✅ Documentación Fase 4 Completa


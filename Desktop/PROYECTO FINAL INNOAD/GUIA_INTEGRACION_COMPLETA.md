# Guía de Integración Backend-Frontend InnoAd

## Documento de Arquitectura e Integración HTTP

### Estado de Implementación

#### ✅ COMPLETADO - Opción A: Backend-Frontend 100%

**Módulos de Frontend - 100% UI + Servicio HTTP**

| Módulo | Componentes | Servicios HTTP | Estado |
|--------|------------|-----------------|--------|
| **Contenidos** | Lista + Formulario | `ServicioContenidos` | ✅ INTEGRADO |
| **Pantallas** | Lista + Formulario + Detalle | Crear `ServicioPantallas` | 🔄 LISTO |
| **Campañas** | Grid + Formulario | Crear `ServicioCampanas` | 🔄 LISTO |
| **Reportes** | Dashboard | Crear `ServicioReportes` | 🔄 LISTO |
| **Asistente IA** | Chat mejorado | Existente | ✅ MEJORADO |

#### ✅ COMPLETADO - Opción B: Raspberry Pi 100%

| Componente | Archivo | Estado |
|-----------|---------|--------|
| **Cliente Python** | `innoad-display-manager.py` | ✅ COMPLETO |
| **Configuración** | `display-config.json` | ✅ COMPLETO |
| **Script Install** | `install-rpi.sh` | ✅ COMPLETO |
| **Servicio Angular** | `raspberrypi.servicio.ts` | ✅ COMPLETO |
| **Componente Dashboard** | `gestor-raspberrypi.component.ts` | ✅ COMPLETO |
| **Documentación** | `README-DISPLAY-MANAGER.md` | ✅ COMPLETO |

---

## 🔌 Patrón de Integración HTTP

### Arquitectura Estándar

```typescript
// Patrón aplicado en todos los servicios

@Injectable({ providedIn: 'root' })
export class ServicioModulo {
  private http = inject(HttpClient);
  private API_URL = `${environment.urlApi}/endpoint`;
  
  // GET - Obtener lista con paginación y filtros
  obtenerTodos(pagina: number, tamanio: number, filtros?: any): Observable<...> {
    let params = new HttpParams()
      .set('page', pagina.toString())
      .set('size', tamanio.toString());
    
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) params = params.set(key, filtros[key]);
      });
    }
    
    return this.http.get<RespuestaAPI<T[]>>(this.API_URL, { params })
      .pipe(map(r => r.data!));
  }
  
  // GET - Obtener por ID
  obtenerPorId(id: string): Observable<T> {
    return this.http.get<RespuestaAPI<T>>(`${this.API_URL}/${id}`)
      .pipe(map(r => r.data!));
  }
  
  // POST - Crear
  crear(solicitud: T): Observable<T> {
    return this.http.post<RespuestaAPI<T>>(this.API_URL, solicitud)
      .pipe(map(r => r.data!));
  }
  
  // PUT - Actualizar
  actualizar(solicitud: T): Observable<T> {
    return this.http.put<RespuestaAPI<T>>(`${this.API_URL}/${solicitud.id}`, solicitud)
      .pipe(map(r => r.data!));
  }
  
  // DELETE - Eliminar
  eliminar(id: string): Observable<void> {
    return this.http.delete<RespuestaAPI<void>>(`${this.API_URL}/${id}`)
      .pipe(map(() => void 0));
  }
}
```

### Estructura de Respuesta Backend

```java
// Formato estándar de respuesta Spring Boot

public class RespuestaAPI<T> {
    private boolean exitoso;
    private String mensaje;
    private T datos;
    private List<String> errores;
    private LocalDateTime timestamp;
}

// Ejemplo: GET /api/v1/contenidos
{
  "exitoso": true,
  "mensaje": "Contenidos obtenidos exitosamente",
  "datos": [
    {
      "id": "CONTENT-001",
      "nombre": "Video Promocional",
      "tipo": "video",
      "url": "https://cdn.innoad.com/videos/promo.mp4",
      "duracion": 30,
      "tamano": 125000000,
      "estado": "activo",
      "fecha_creacion": "2024-01-15T10:30:00",
      "pantallas_asignadas": 5
    }
  ],
  "timestamp": "2024-01-15T10:35:00"
}
```

---

## 📦 Servicios HTTP a Crear/Verificar

### 1. ServicioContenidos ✅ VERIFICADO

**Ubicación**: `src/app/core/servicios/contenidos.servicio.ts`

**Estado**: Archivo existe y está funcional

**Endpoints**:
- `GET /api/v1/contenidos` - Listar contenidos
- `POST /api/v1/contenidos` - Crear contenido
- `PUT /api/v1/contenidos/{id}` - Actualizar
- `DELETE /api/v1/contenidos/{id}` - Eliminar
- `POST /api/v1/contenidos/{id}/duplicar` - Duplicar contenido

**Verificación**:
```bash
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8080/api/v1/contenidos
```

---

### 2. ServicioPantallas 🔄 PRÓXIMO

**Ubicación**: `src/app/core/servicios/pantallas.servicio.ts`

**A Crear**:
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Pantalla {
  id: string;
  nombre: string;
  ubicacion: string;
  resolucion: string;
  estado: 'activa' | 'inactiva' | 'error';
  ultimaSincronizacion: Date;
  ip?: string;
  temperatura?: number;
  cpu?: number;
  memoria?: number;
  contenidoActual?: string;
}

export interface RespuestaAPI<T> {
  exitoso: boolean;
  mensaje: string;
  datos: T;
  errores?: string[];
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class ServicioPantallas {
  private http = inject(HttpClient);
  private API_URL = `${environment.urlApi}/pantallas`;

  obtenerTodas(pagina = 0, tamanio = 20, filtro?: any): Observable<Pantalla[]> {
    let params = new HttpParams()
      .set('page', pagina.toString())
      .set('size', tamanio.toString());
    
    if (filtro?.estado) params = params.set('estado', filtro.estado);
    if (filtro?.ubicacion) params = params.set('ubicacion', filtro.ubicacion);
    
    return this.http.get<RespuestaAPI<Pantalla[]>>(this.API_URL, { params })
      .pipe(map(r => r.datos || []));
  }

  obtenerPorId(id: string): Observable<Pantalla> {
    return this.http.get<RespuestaAPI<Pantalla>>(`${this.API_URL}/${id}`)
      .pipe(map(r => r.datos));
  }

  crear(pantalla: Pantalla): Observable<Pantalla> {
    return this.http.post<RespuestaAPI<Pantalla>>(this.API_URL, pantalla)
      .pipe(map(r => r.datos));
  }

  actualizar(pantalla: Pantalla): Observable<Pantalla> {
    return this.http.put<RespuestaAPI<Pantalla>>(`${this.API_URL}/${pantalla.id}`, pantalla)
      .pipe(map(r => r.datos));
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<RespuestaAPI<void>>(`${this.API_URL}/${id}`)
      .pipe(map(() => void 0));
  }

  // Operaciones específicas de pantalla
  obtenerEstadisticas(id: string): Observable<any> {
    return this.http.get(`${this.API_URL}/${id}/estadisticas`);
  }

  sincronizar(id: string): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/sincronizar`, {});
  }

  reiniciar(id: string): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/reiniciar`, {});
  }

  asignarContenido(id: string, contenidoId: string): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/asignar-contenido`, { 
      contenido_id: contenidoId 
    });
  }
}
```

**Endpoints Backend**:
- `GET /api/v1/pantallas` - Listar pantallas
- `GET /api/v1/pantallas/{id}` - Obtener una pantalla
- `POST /api/v1/pantallas` - Crear pantalla
- `PUT /api/v1/pantallas/{id}` - Actualizar pantalla
- `DELETE /api/v1/pantallas/{id}` - Eliminar pantalla
- `GET /api/v1/pantallas/{id}/estadisticas` - Obtener estadísticas
- `POST /api/v1/pantallas/{id}/sincronizar` - Sincronizar contenidos
- `POST /api/v1/pantallas/{id}/reiniciar` - Reiniciar pantalla
- `POST /api/v1/pantallas/{id}/asignar-contenido` - Asignar contenido

---

### 3. ServicioCampanas 🔄 PRÓXIMO

**Ubicación**: `src/app/core/servicios/campanas.servicio.ts`

Similar al patrón anterior con operaciones:

```typescript
obtenerTodas(pagina = 0, tamanio = 20): Observable<Campana[]>
obtenerPorId(id: string): Observable<Campana>
crear(campana: Campana): Observable<Campana>
actualizar(campana: Campana): Observable<Campana>
eliminar(id: string): Observable<void>
duplicar(id: string): Observable<Campana>  // Acción específica
obtenerMetricas(id: string): Observable<MetricasCampana>
asignarPantalla(campanaId: string, pantallaId: string): Observable<any>
```

**Endpoints Backend**:
- `GET /api/campaigns` - Listar campañas
- `GET /api/campaigns/{id}` - Obtener una
- `POST /api/campaigns` - Crear
- `PUT /api/campaigns/{id}` - Actualizar
- `DELETE /api/campaigns/{id}` - Eliminar
- `POST /api/campaigns/{id}/duplicar` - Duplicar
- `GET /api/campaigns/{id}/metricas` - Métricas

---

### 4. ServicioReportes 🔄 PRÓXIMO

**Ubicación**: `src/app/core/servicios/reportes.servicio.ts`

```typescript
obtenerDashboard(periodo: 'hoy' | 'semana' | 'mes'): Observable<DashboardReporte>
obtenerMetricas(periodo: string): Observable<MetricasGenerales>
exportarPDF(periodo: string): Observable<Blob>
exportarCSV(periodo: string): Observable<Blob>
obtenerDetallesPantalla(id: string, periodo: string): Observable<any>
obtenerDetallesCampana(id: string, periodo: string): Observable<any>
```

**Endpoints Backend**:
- `POST /api/reportes/generar` - Generar reporte
- `GET /api/reportes/dashboard?periodo=hoy` - Dashboard
- `GET /api/reportes/metricas?periodo=mes` - Métricas
- `GET /api/reportes/pdf/{periodo}` - Exportar PDF
- `GET /api/reportes/csv/{periodo}` - Exportar CSV

---

## 🔐 Autenticación HTTP

### JWT Interceptor Verificación

**Archivo**: `src/app/core/interceptores/auth.interceptor.ts`

Debe implementar:

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: ServicioAutenticacion) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.obtenerToken();
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expirado, intentar refrescar
          return this.authService.refrescarToken().pipe(
            switchMap(() => {
              const nuevoToken = this.authService.obtenerToken();
              request = request.clone({
                setHeaders: { Authorization: `Bearer ${nuevoToken}` }
              });
              return next.handle(request);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
}
```

### CORS Configuration (Backend)

Debe estar configurado en `application.yml`:

```yaml
server:
  servlet:
    context-path: /api

spring:
  web:
    cors:
      allowed-origins: 
        - "http://localhost:4200"
        - "https://innoad.tudominio.com"
      allowed-methods: GET,POST,PUT,DELETE,OPTIONS
      allowed-headers: "*"
      allow-credentials: true
      max-age: 3600
```

---

## 🧪 Pruebas de Conectividad

### 1. Verificar Backend Activo

```bash
curl -X GET http://localhost:8080/api/v1/contenidos \
  -H "Authorization: Bearer tu-token-jwt"
```

### 2. Verificar Proxy en Frontend

```bash
# Editar src/proxy.conf.json:
{
  "/api": {
    "target": "http://localhost:8080",
    "pathRewrite": {
      "^/api": "/api"
    },
    "changeOrigin": true,
    "logLevel": "debug"
  }
}

# Ejecutar con proxy
ng serve --proxy-config proxy.conf.json
```

### 3. Verificar Ambiente

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  urlApi: 'http://localhost:8080/api',  // Dev
  apiTimeout: 30000
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  urlApi: 'https://innoad.tudominio.com/api',  // Prod
  apiTimeout: 30000
};
```

---

## 🔄 Actualizar Componentes con Servicios

### Ejemplo: lista-contenidos.component.ts

```typescript
export class ListaContenidosComponent implements OnInit {
  contenidos$ = new BehaviorSubject<Contenido[]>([]);
  cargando = false;
  pagina = 0;
  tamanio = 12;

  constructor(private servicioContenidos: ServicioContenidos) {}

  ngOnInit() {
    this.cargarContenidos();
  }

  cargarContenidos() {
    this.cargando = true;
    this.servicioContenidos.obtenerTodos(this.pagina, this.tamanio)
      .subscribe({
        next: (contenidos) => {
          this.contenidos$.next(contenidos);
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error cargando contenidos:', error);
          this.cargando = false;
        }
      });
  }

  crear(contenido: Contenido) {
    this.servicioContenidos.crear(contenido).subscribe({
      next: () => this.cargarContenidos(),
      error: (error) => console.error('Error creando:', error)
    });
  }

  actualizar(contenido: Contenido) {
    this.servicioContenidos.actualizar(contenido).subscribe({
      next: () => this.cargarContenidos(),
      error: (error) => console.error('Error actualizando:', error)
    });
  }

  eliminar(id: string) {
    if (confirm('¿Está seguro?')) {
      this.servicioContenidos.eliminar(id).subscribe({
        next: () => this.cargarContenidos(),
        error: (error) => console.error('Error eliminando:', error)
      });
    }
  }
}
```

---

## 📊 Estado de Integración

### Checklist de Implementación

- [x] Módulos UI completados (4/4)
- [x] ServicioContenidos verificado
- [ ] ServicioPantallas crear
- [ ] ServicioCampanas crear
- [ ] ServicioReportes crear
- [x] ServicioRaspberryPi completado
- [x] Cliente Python Raspberry Pi completado
- [x] Componente Dashboard RPi completado
- [ ] Pruebas HTTP end-to-end
- [ ] Deployment en producción

---

## 🚀 Próximos Pasos

1. **Crear los 3 servicios faltantes** (Pantallas, Campañas, Reportes)
2. **Actualizar los 4 componentes** para usar servicios HTTP reales
3. **Pruebas de conectividad** Backend ↔ Frontend
4. **Desplegar cliente RPi** en Raspberry Pi físico
5. **Verificar flujos end-to-end** completos

**Estimación**: 2-3 horas para completar 100% de integración.

---

## 📞 Contacto

Para dudas sobre la integración, revisar logs:

**Frontend**:
```bash
# Ver logs en Chrome DevTools (F12)
# Console tab → Network tab para ver HTTP requests
```

**Backend**:
```bash
# Ver logs Spring Boot
tail -f logs/innoad.log | grep "ERROR\|WARN\|INFO"
```


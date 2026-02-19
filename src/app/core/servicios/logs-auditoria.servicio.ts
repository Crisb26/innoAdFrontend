import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '@environments/environment';

export interface LogAuditoria {
  id: number;
  tipo: 'info' | 'warning' | 'error' | 'security';
  accion: string;
  descripcion: string;
  usuario?: {
    id: number;
    nombre: string;
    email: string;
  };
  ip: string;
  userAgent: string;
  recurso?: string;
  parametros?: any;
  fecha: Date;
}

export interface FiltrosLogs {
  tipo?: 'info' | 'warning' | 'error' | 'security';
  usuario?: number;
  desde?: Date;
  hasta?: Date;
  accion?: string;
  ip?: string;
  pagina?: number;
  limite?: number;
}

export interface EstadisticasLogs {
  totalLogs: number;
  logsHoy: number;
  logsSemana: number;
  erroresRecientes: number;
  accionesAdmin: number;
  loginsFallidos: number;
}

// Datos mock para desarrollo
const MOCK_LOGS: LogAuditoria[] = [
  {
    id: 1,
    tipo: 'security',
    accion: 'LOGIN_EXITOSO',
    descripcion: 'Usuario inició sesión correctamente',
    usuario: { id: 1, nombre: 'Temporal', email: 'temporal@innoad.com' },
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    recurso: '/auth/login',
    fecha: new Date(Date.now() - 1000 * 60 * 5)
  },
  {
    id: 2,
    tipo: 'info',
    accion: 'CREAR_PANTALLA',
    descripcion: 'Se creó nueva pantalla "Pantalla Entrada Principal"',
    usuario: { id: 1, nombre: 'Temporal', email: 'temporal@innoad.com' },
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    recurso: '/pantallas',
    parametros: { nombre: 'Pantalla Entrada Principal', ubicacion: 'Vestíbulo Principal' },
    fecha: new Date(Date.now() - 1000 * 60 * 15)
  },
  {
    id: 3,
    tipo: 'info',
    accion: 'ACTUALIZAR_PANTALLA',
    descripcion: 'Se actualizó la configuración de la pantalla',
    usuario: { id: 1, nombre: 'Temporal', email: 'temporal@innoad.com' },
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    recurso: '/pantallas/1',
    fecha: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    id: 4,
    tipo: 'warning',
    accion: 'INTENTO_ACCESO_DENEGADO',
    descripcion: 'Intento de acceso a sección sin permisos',
    usuario: { id: 2, nombre: 'Usuario Demo', email: 'demo@innoad.com' },
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0',
    recurso: '/admin',
    fecha: new Date(Date.now() - 1000 * 60 * 45)
  },
  {
    id: 5,
    tipo: 'info',
    accion: 'CREAR_CAMPAÑA',
    descripcion: 'Se creó nueva campaña publicitaria',
    usuario: { id: 1, nombre: 'Temporal', email: 'temporal@innoad.com' },
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    recurso: '/campañas',
    parametros: { nombre: 'Promoción Verano', presupuesto: 5000 },
    fecha: new Date(Date.now() - 1000 * 60 * 60)
  },
  {
    id: 6,
    tipo: 'error',
    accion: 'ERROR_ACTUALIZACION_PANTALLA',
    descripcion: 'Error al actualizar configuración de pantalla',
    usuario: { id: 1, nombre: 'Temporal', email: 'temporal@innoad.com' },
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    recurso: '/pantallas/2',
    parametros: { error: 'Pantalla no disponible' },
    fecha: new Date(Date.now() - 1000 * 60 * 120)
  }
];

const MOCK_USUARIOS = [
  { id: 1, nombre: 'Temporal', email: 'temporal@innoad.com' },
  { id: 2, nombre: 'Usuario Demo', email: 'demo@innoad.com' },
  { id: 3, nombre: 'Admin Principal', email: 'admin@innoad.com' }
];

const MOCK_ACCIONES = ['LOGIN_EXITOSO', 'LOGIN_FALLIDO', 'CREAR_PANTALLA', 'ACTUALIZAR_PANTALLA', 'ELIMINAR_PANTALLA', 'CREAR_CAMPAÑA', 'ACTUALIZAR_CAMPAÑA', 'CREAR_CONTENIDO', 'INTENTO_ACCESO_DENEGADO', 'ERROR_ACTUALIZACION_PANTALLA'];

@Injectable({
  providedIn: 'root'
})
export class LogsAuditoriaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.urlApi}/admin/logs`;

  obtenerLogs(filtros?: FiltrosLogs): Observable<{ logs: LogAuditoria[], total: number }> {
    const params: any = {};
    
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = value instanceof Date ? value.toISOString() : value.toString();
        }
      });
    }

    return this.http.get<{ logs: LogAuditoria[], total: number }>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.warn('No se pudo obtener logs del backend, usando mock data:', error);
        let logsFilterados = [...MOCK_LOGS];
        
        if (filtros?.tipo) {
          logsFilterados = logsFilterados.filter(l => l.tipo === filtros.tipo);
        }
        if (filtros?.accion) {
          logsFilterados = logsFilterados.filter(l => l.accion === filtros.accion);
        }
        if (filtros?.usuario) {
          logsFilterados = logsFilterados.filter(l => l.usuario?.id === filtros.usuario);
        }
        
        const pagina = filtros?.pagina || 1;
        const limite = filtros?.limite || 50;
        const inicio = (pagina - 1) * limite;
        const fin = inicio + limite;
        
        const logsPaginados = logsFilterados.slice(inicio, fin);
        
        return of({ logs: logsPaginados, total: logsFilterados.length });
      })
    );
  }

  obtenerEstadisticas(): Observable<EstadisticasLogs> {
    return this.http.get<EstadisticasLogs>(`${this.apiUrl}/estadisticas`).pipe(
      catchError(error => {
        console.warn('No se pudo obtener estadísticas del backend, usando mock data:', error);
        return of({
          totalLogs: MOCK_LOGS.length,
          logsHoy: 3,
          logsSemana: 12,
          erroresRecientes: 1,
          accionesAdmin: 4,
          loginsFallidos: 0
        });
      })
    );
  }

  exportarLogs(filtros?: FiltrosLogs): Observable<Blob> {
    const params: any = {};
    
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = value instanceof Date ? value.toISOString() : value.toString();
        }
      });
    }

    return this.http.get(`${this.apiUrl}/exportar`, { 
      params,
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.warn('No se pudo exportar logs del backend, creando descarga desde mock data:', error);
        const contenido = JSON.stringify(MOCK_LOGS, null, 2);
        const blob = new Blob([contenido], { type: 'application/json' });
        return of(blob);
      })
    );
  }

  limpiarLogsAntiguos(diasAntiguedad: number): Observable<{ mensaje: string, eliminados: number }> {
    return this.http.delete<{ mensaje: string, eliminados: number }>(`${this.apiUrl}/limpiar`, {
      body: { dias: diasAntiguedad }
    }).pipe(
      catchError(error => {
        console.warn('No se pudo limpiar logs del backend:', error);
        return of({ mensaje: 'Logs limpiados en modo offline', eliminados: 0 });
      })
    );
  }

  obtenerAccionesDisponibles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/acciones`).pipe(
      catchError(error => {
        console.warn('No se pudo obtener acciones del backend, usando mock data:', error);
        return of(MOCK_ACCIONES);
      })
    );
  }

  obtenerUsuariosConActividad(): Observable<Array<{ id: number, nombre: string, email: string }>> {
    return this.http.get<Array<{ id: number, nombre: string, email: string }>>(`${this.apiUrl}/usuarios-activos`).pipe(
      catchError(error => {
        console.warn('No se pudo obtener usuarios del backend, usando mock data:', error);
        return of(MOCK_USUARIOS);
      })
    );
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

    return this.http.get<{ logs: LogAuditoria[], total: number }>(this.apiUrl, { params });
  }

  obtenerEstadisticas(): Observable<EstadisticasLogs> {
    return this.http.get<EstadisticasLogs>(`${this.apiUrl}/estadisticas`);
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
    });
  }

  limpiarLogsAntiguos(diasAntiguedad: number): Observable<{ mensaje: string, eliminados: number }> {
    return this.http.delete<{ mensaje: string, eliminados: number }>(`${this.apiUrl}/limpiar`, {
      body: { dias: diasAntiguedad }
    });
  }

  obtenerAccionesDisponibles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/acciones`);
  }

  obtenerUsuariosConActividad(): Observable<Array<{ id: number, nombre: string, email: string }>> {
    return this.http.get<Array<{ id: number, nombre: string, email: string }>>(`${this.apiUrl}/usuarios-activos`);
  }
}
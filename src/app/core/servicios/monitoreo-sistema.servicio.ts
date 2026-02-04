import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface EstadoSistema {
  cpu: {
    porcentajeUso: number;
    nucleos: number;
    temperatura?: number;
  };
  memoria: {
    total: number; // MB
    usado: number; // MB
    libre: number; // MB
    porcentajeUso: number;
  };
  disco: {
    total: number; // GB
    usado: number; // GB
    libre: number; // GB
    porcentajeUso: number;
  };
  servidor: {
    estado: 'operativo' | 'mantenimiento' | 'error';
    uptime: number; // segundos
    version: string;
    ultimoReinicio: Date;
  };
  baseDatos: {
    estado: 'conectada' | 'desconectada' | 'error';
    conexiones: number;
    tamano: number; // MB
    tiempoRespuesta: number; // ms
  };
  almacenamiento: {
    espacioTotal: number; // GB
    espacioUsado: number; // GB
    espacioDisponible: number; // GB
    porcentajeUso: number;
  };
  servicios: {
    nombre: string;
    estado: 'activo' | 'inactivo' | 'error';
    ultimaVerificacion: Date;
    puerto?: number;
  }[];
}

export interface ConfiguracionSistema {
  monitoreo: {
    intervaloActualizacion: number; // segundos
    alertasHabilitadas: boolean;
    mantenerHistorial: number; // días
  };
  alertas: {
    umbralCpu: number; // porcentaje
    umbralMemoria: number; // porcentaje
    umbralDisco: number; // porcentaje
    emailNotificaciones: string[];
  };
  respaldos: {
    automaticos: boolean;
    frecuencia: 'diaria' | 'semanal' | 'mensual';
    horaEjecucion: string;
    retencion: number; // días
  };
  mantenimiento: {
    habilitado: boolean;
    mensaje?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
  };
  notificaciones: {
    email: boolean;
    push: boolean;
    webhook?: string;
  };
  seguridad: {
    intentosMaximos: number;
    tiempoBloqueo: number; // minutos
    forzarHTTPS: boolean;
    sessionTimeout: number; // minutos
  };
  uploads: {
    tamanosMaximos: {
      imagen: number; // MB
      video: number; // MB
      documento: number; // MB
    };
    tiposPermitidos: {
      imagenes: string[];
      videos: string[];
      documentos: string[];
    };
  };
  rendimiento: {
    cacheTiempo: number; // segundos
    compresionImagenes: boolean;
    optimizacionAutomatica: boolean;
  };
}

export interface EstadisticasRendimiento {
  cpu: { timestamp: Date; valor: number }[];
  memoria: { timestamp: Date; valor: number }[];
  disco: { timestamp: Date; valor: number }[];
  peticiones: { timestamp: Date; cantidad: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class MonitoreoSistemaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.urlApi}/admin/sistema`;

  obtenerEstadoSistema(): Observable<EstadoSistema> {
    return this.http.get<EstadoSistema>(`${this.apiUrl}/estado`);
  }

  obtenerConfiguracion(): Observable<ConfiguracionSistema> {
    return this.http.get<ConfiguracionSistema>(`${this.apiUrl}/configuracion`);
  }

  actualizarConfiguracion(config: Partial<ConfiguracionSistema>): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.apiUrl}/configuracion`, config);
  }

  reiniciarServicio(servicio: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/servicios/${servicio}/reiniciar`, {});
  }

  limpiarCache(): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/cache/limpiar`, {});
  }

  optimizarBaseDatos(): Observable<{ mensaje: string, resultado: string }> {
    return this.http.post<{ mensaje: string, resultado: string }>(`${this.apiUrl}/base-datos/optimizar`, {});
  }

  /**
   * Obtener estadísticas de rendimiento para gráficos
   */
  obtenerEstadisticasRendimiento(periodo: 'hora' | 'dia' | 'semana' | 'mes'): Observable<EstadisticasRendimiento> {
    return this.http.get<EstadisticasRendimiento>(`${this.apiUrl}/estadisticas/rendimiento`, {
      params: { periodo }
    });
  }

  /**
   * Crear respaldo manual del sistema
   */
  crearRespaldo(): Observable<{ mensaje: string; archivoRespaldo: string; tamano: number }> {
    return this.http.post<{ mensaje: string; archivoRespaldo: string; tamano: number }>(
      `${this.apiUrl}/respaldos/crear`, 
      {}
    );
  }

  crearBackup(): Observable<{ mensaje: string, archivo: string }> {
    return this.http.post<{ mensaje: string, archivo: string }>(`${this.apiUrl}/backup`, {});
  }

  obtenerBackups(): Observable<Array<{ nombre: string, fecha: Date, tamano: number }>> {
    return this.http.get<Array<{ nombre: string, fecha: Date, tamano: number }>>(`${this.apiUrl}/backups`);
  }

  restaurarBackup(nombreArchivo: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/backup/restaurar`, { archivo: nombreArchivo });
  }

  // Monitoreo en tiempo real cada 30 segundos
  monitoreoTiempoReal(): Observable<EstadoSistema> {
    return interval(30000).pipe(
      switchMap(() => this.obtenerEstadoSistema())
    );
  }

  verificarSalud(): Observable<{ estado: 'saludable' | 'advertencia' | 'critico', detalles: string[] }> {
    return this.http.get<{ estado: 'saludable' | 'advertencia' | 'critico', detalles: string[] }>(`${this.apiUrl}/salud`);
  }

  obtenerMetricas(periodo: '1h' | '24h' | '7d' | '30d'): Observable<{
    cpu: Array<{ timestamp: Date, valor: number }>;
    memoria: Array<{ timestamp: Date, valor: number }>;
    disco: Array<{ timestamp: Date, valor: number }>;
    conexiones: Array<{ timestamp: Date, valor: number }>;
  }> {
    return this.http.get<any>(`${this.apiUrl}/metricas`, { params: { periodo } });
  }
}
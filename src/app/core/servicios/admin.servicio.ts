import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  fechaCreacion: Date;
  ultimoAcceso?: Date;
}

export interface LogAuditoria {
  id: number;
  usuario: string;
  accion: string;
  recurso: string;
  fecha: Date;
  resultado: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminServicio {
  private readonly API_URL = `${environment.urlApi}/admin`;
  private usuarios$ = new BehaviorSubject<Usuario[]>([]);
  private logs$ = new BehaviorSubject<LogAuditoria[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * Obtener lista de usuarios del sistema
   */
  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.API_URL}/usuarios`)
      .pipe(
        tap(usuarios => this.usuarios$.next(usuarios))
      );
  }

  /**
   * Obtener observable de usuarios
   */
  obtenerUsuarios$(): Observable<Usuario[]> {
    return this.usuarios$.asObservable();
  }

  /**
   * Cambiar estado de un usuario
   */
  cambiarEstadoUsuario(usuarioId: number, nuevoEstado: string): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${this.API_URL}/usuarios/${usuarioId}/estado`,
      { estado: nuevoEstado }
    );
  }

  /**
   * Resetear contraseña de usuario
   */
  resetearContraseña(usuarioId: number): Observable<any> {
    return this.http.post(
      `${this.API_URL}/usuarios/${usuarioId}/resetear-password`,
      {}
    );
  }

  /**
   * Obtener logs de auditoría
   */
  obtenerLogs(pagina: number = 0, size: number = 20): Observable<any> {
    return this.http.get<any>(
      `${this.API_URL}/logs?page=${pagina}&size=${size}`
    ).pipe(
      tap(respuesta => this.logs$.next(respuesta.content))
    );
  }

  /**
   * Obtener observable de logs
   */
  obtenerLogs$(): Observable<LogAuditoria[]> {
    return this.logs$.asObservable();
  }

  /**
   * Activar modo mantenimiento
   */
  activarModoMantenimiento(motivo: string): Observable<any> {
    return this.http.post(
      `${this.API_URL}/mantenimiento/activar`,
      { motivo }
    );
  }

  /**
   * Desactivar modo mantenimiento
   */
  desactivarModoMantenimiento(): Observable<any> {
    return this.http.post(
      `${this.API_URL}/mantenimiento/desactivar`,
      {}
    );
  }

  /**
   * Obtener estado del sistema
   */
  obtenerEstadoSistema(): Observable<any> {
    return this.http.get(`${this.API_URL}/monitoreo/sistema`);
  }

  /**
   * Obtener métricas del sistema
   */
  obtenerMetricas(): Observable<any> {
    return this.http.get(`${this.API_URL}/monitoreo/metricas`);
  }

  /**
   * Obtener configuración del sistema
   */
  obtenerConfiguracion(): Observable<any> {
    return this.http.get(`${this.API_URL}/configuracion`);
  }

  /**
   * Actualizar configuración del sistema
   */
  actualizarConfiguracion(config: any): Observable<any> {
    return this.http.put(`${this.API_URL}/configuracion`, config);
  }

  /**
   * Ejecutar backup del sistema
   */
  ejecutarBackup(): Observable<any> {
    return this.http.post(`${this.API_URL}/backup/ejecutar`, {});
  }

  /**
   * Limpiar caché del sistema
   */
  limpiarCache(): Observable<any> {
    return this.http.post(`${this.API_URL}/cache/limpiar`, {});
  }
}

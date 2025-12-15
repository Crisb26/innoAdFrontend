import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface EstadoMantenimiento {
  activo: boolean;
  ultimaActualizacion: Date | string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly apiUrl = environment.api.baseUrl;
  private readonly mantenimientoUrl = `${this.apiUrl}/admin/mantenimiento`;
  
  // Estado en memoria como fallback
  private estadoMantenimiento: EstadoMantenimiento = {
    activo: false,
    ultimaActualizacion: new Date()
  };

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el estado actual del modo mantenimiento
   */
  obtenerEstadoMantenimiento(): Observable<EstadoMantenimiento> {
    // Intenta obtener del backend, si no existe, devuelve estado en memoria
    return new Observable(observer => {
      this.http.get<EstadoMantenimiento>(`${this.mantenimientoUrl}/estado`)
        .subscribe({
          next: (estado) => {
            this.estadoMantenimiento = estado;
            observer.next(estado);
            observer.complete();
          },
          error: () => {
            // Si el endpoint no existe, devuelve estado en memoria
            observer.next(this.estadoMantenimiento);
            observer.complete();
          }
        });
    });
  }

  /**
   * Actualiza el estado del modo mantenimiento
   */
  actualizarEstadoMantenimiento(estado: EstadoMantenimiento): Observable<EstadoMantenimiento> {
    return new Observable(observer => {
      this.http.post<EstadoMantenimiento>(`${this.mantenimientoUrl}/actualizar`, estado)
        .subscribe({
          next: (respuesta) => {
            this.estadoMantenimiento = respuesta;
            observer.next(respuesta);
            observer.complete();
          },
          error: () => {
            // Si el endpoint no existe, actualiza estado en memoria
            this.estadoMantenimiento = estado;
            observer.next(estado);
            observer.complete();
          }
        });
    });
  }

  /**
   * Obtiene el estado en memoria (útil para verificaciones rápidas)
   */
  obtenerEstadoLocal(): EstadoMantenimiento {
    return this.estadoMantenimiento;
  }

  /**
   * Verifica si el modo mantenimiento está activo
   */
  esMantenimientoActivo(): boolean {
    return this.estadoMantenimiento.activo;
  }
}

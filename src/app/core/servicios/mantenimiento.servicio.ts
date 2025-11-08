import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface SolicitudMantenimiento {
  codigoSeguridad: string;
  mensaje?: string;
  fechaFinEstimada?: string;
}

export interface EstadoMantenimiento {
  exitoso: boolean;
  mensaje: string;
  datos: boolean; // true si está en mantenimiento
}

@Injectable({
  providedIn: 'root'
})
export class ServicioMantenimiento {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.urlApi}/admin/mantenimiento`;

  /**
   * Obtiene el estado actual del modo mantenimiento
   */
  obtenerEstado(): Observable<EstadoMantenimiento> {
    return this.http.get<EstadoMantenimiento>(`${this.apiUrl}/estado`);
  }

  /**
   * Activa el modo mantenimiento
   */
  activarMantenimiento(data: SolicitudMantenimiento): Observable<any> {
    return this.http.post(`${this.apiUrl}/activar`, data);
  }

  /**
   * Desactiva el modo mantenimiento
   */
  desactivarMantenimiento(codigoSeguridad: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/desactivar`, { codigoSeguridad });
  }
}
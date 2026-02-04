import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface EstadoMantenimiento {
  activo: boolean;
  data: {
    id: number;
    motivo: string;
    fechaInicio: string;
    fechaFin: string;
    permiteLectura: boolean;
    restriccionesActivas: {
      graficos: boolean;
      publicacion: boolean;
      descargas: boolean;
    };
  };
}

export interface VerificacionContrasena {
  autorizado: boolean;
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServicioMantenimiento {
  private readonly apiUrl = `${environment.api.baseUrl}/v1/mantenimiento`;

  constructor(private http: HttpClient) {}

  obtenerEstado(): Observable<EstadoMantenimiento> {
    return this.http.get<EstadoMantenimiento>(`${this.apiUrl}/estado`);
  }

  verificarContrasena(password: string): Observable<VerificacionContrasena> {
    return this.http.post<VerificacionContrasena>(`${this.apiUrl}/verificar-acceso`, {
      contrasena: password
    });
  }

  obtenerUltimo(): Observable<EstadoMantenimiento> {
    return this.http.get<EstadoMantenimiento>(`${this.apiUrl}/ultimo`);
  }
}

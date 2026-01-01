import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

export interface VerificacionContraseña {
  autorizado: boolean;
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServicioMantenimiento {
  private readonly apiUrl = `${environment.apiUrl}/v1/mantenimiento`;

  constructor(private http: HttpClient) {}

  obtenerEstado(): Observable<EstadoMantenimiento> {
    return this.http.get<EstadoMantenimiento>(`${this.apiUrl}/estado`);
  }

  verificarContraseña(password: string): Observable<VerificacionContraseña> {
    return this.http.post<VerificacionContraseña>(`${this.apiUrl}/verificar-acceso`, {
      contrasena: password
    });
  }

  obtenerUltimo(): Observable<EstadoMantenimiento> {
    return this.http.get<EstadoMantenimiento>(`${this.apiUrl}/ultimo`);
  }
}

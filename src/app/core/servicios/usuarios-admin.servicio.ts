import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface UsuarioAdmin {
  id: number;
  nombreCompleto: string;
  nombreUsuario: string;
  email: string;
  telefono?: string;
  rol: {
    id: string;
    nombre: string;
    nivel: number;
  };
  activo: boolean;
  verificado: boolean;
  ultimoAcceso?: Date;
  fechaCreacion: Date;
  totalCampanas: number;
  totalContenidos: number;
}

export interface EstadisticasUsuarios {
  totalUsuarios: number;
  usuariosActivos: number;
  usuariosVerificados: number;
  administradores: number;
  usuariosNuevosHoy: number;
  usuariosNuevosSemana: number;
}

export interface AccionUsuario {
  accion: 'activar' | 'desactivar' | 'verificar' | 'cambiar-rol' | 'eliminar';
  usuarioId: number;
  parametros?: any;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosAdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.urlApi}/admin/usuarios`;

  obtenerUsuarios(): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(this.apiUrl);
  }

  obtenerEstadisticas(): Observable<EstadisticasUsuarios> {
    return this.http.get<EstadisticasUsuarios>(`${this.apiUrl}/estadisticas`);
  }

  buscarUsuarios(termino: string): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(`${this.apiUrl}/buscar`, {
      params: { q: termino }
    });
  }

  activarUsuario(usuarioId: number): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.apiUrl}/${usuarioId}/activar`, {});
  }

  desactivarUsuario(usuarioId: number, razon?: string): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.apiUrl}/${usuarioId}/desactivar`, { razon });
  }

  verificarUsuario(usuarioId: number): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.apiUrl}/${usuarioId}/verificar`, {});
  }

  cambiarRol(usuarioId: number, nuevoRol: string): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.apiUrl}/${usuarioId}/rol`, { rol: nuevoRol });
  }

  eliminarUsuario(usuarioId: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${usuarioId}`);
  }

  obtenerDetalleUsuario(usuarioId: number): Observable<UsuarioAdmin> {
    return this.http.get<UsuarioAdmin>(`${this.apiUrl}/${usuarioId}`);
  }
}
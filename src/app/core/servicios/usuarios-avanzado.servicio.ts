import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Usuario, RespuestaAPI } from '@core/modelos';

export interface ActualizacionPerfil {
  email?: string;
  telefono?: string;
  direccion?: string;
  nombreCompleto?: string;
  avatarUrl?: string;
}

export interface RespuestaActualizacion {
  exitoso: boolean;
  mensaje: string;
  usuario?: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class ServicioUsuariosAvanzado {
  private readonly http = inject(HttpClient);
  
  private readonly BASE_URL = `${environment.apiUrl}/usuarios`;
  private readonly USUARIOS_CACHE_KEY = 'usuarios_cache';
  
  // Signals
  private usuariosSignal = signal<Usuario[]>([]);
  private cargandoSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  public readonly usuarios = this.usuariosSignal.asReadonly();
  public readonly cargando = this.cargandoSignal.asReadonly();
  public readonly error = this.errorSignal.asReadonly();
  public readonly totalUsuarios = computed(() => this.usuariosSignal().length);

  // Cache
  private cache$ = new BehaviorSubject<Usuario[]>([]);

  constructor() {
    this.cargarCacheLocal();
  }

  /**
   * Carga usuarios desde el cache local
   */
  private cargarCacheLocal(): void {
    try {
      const cache = localStorage.getItem(this.USUARIOS_CACHE_KEY);
      if (cache) {
        const usuarios = JSON.parse(cache);
        this.usuariosSignal.set(usuarios);
        this.cache$.next(usuarios);
      }
    } catch (e) {
      console.warn('Error cargando cache local:', e);
    }
  }

  /**
   * Obtiene todos los usuarios (admin)
   */
  public obtenerUsuarios(filtro?: { rol?: string; estado?: string }): Observable<RespuestaAPI<Usuario[]>> {
    this.cargandoSignal.set(true);
    return this.http.get<RespuestaAPI<Usuario[]>>(this.BASE_URL, { params: filtro }).pipe(
      tap(respuesta => {
        if (respuesta.exito && respuesta.datos) {
          this.usuariosSignal.set(respuesta.datos);
          this.cache$.next(respuesta.datos);
          localStorage.setItem(this.USUARIOS_CACHE_KEY, JSON.stringify(respuesta.datos));
          this.errorSignal.set(null);
        }
        this.cargandoSignal.set(false);
      }),
      catchError(err => {
        this.errorSignal.set('Error al obtener usuarios');
        this.cargandoSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Obtiene un usuario por ID
   */
  public obtenerUsuario(id: number): Observable<RespuestaAPI<Usuario>> {
    return this.http.get<RespuestaAPI<Usuario>>(`${this.BASE_URL}/${id}`).pipe(
      catchError(err => {
        this.errorSignal.set('Error al obtener usuario');
        return throwError(() => err);
      })
    );
  }

  /**
   * Actualiza el perfil del usuario actual
   */
  public actualizarPerfil(datosActualizacion: ActualizacionPerfil): Observable<RespuestaActualizacion> {
    this.cargandoSignal.set(true);
    return this.http.put<RespuestaActualizacion>(
      `${this.BASE_URL}/perfil/actualizar`,
      datosActualizacion
    ).pipe(
      tap(respuesta => {
        if (respuesta.exitoso && respuesta.usuario) {
          this.actualizarUsuarioEnCache(respuesta.usuario);
          this.errorSignal.set(null);
        } else {
          this.errorSignal.set(respuesta.mensaje || 'Error al actualizar perfil');
        }
        this.cargandoSignal.set(false);
      }),
      catchError(err => {
        const mensaje = err.error?.mensaje || 'Error al actualizar el perfil';
        this.errorSignal.set(mensaje);
        this.cargandoSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Sube el avatar del usuario
   */
  public subirAvatar(archivo: File): Observable<RespuestaAPI<{ urlAvatar: string }>> {
    const formData = new FormData();
    formData.append('archivo', archivo);

    this.cargandoSignal.set(true);
    return this.http.post<RespuestaAPI<{ urlAvatar: string }>>(
      `${this.BASE_URL}/avatar/subir`,
      formData
    ).pipe(
      tap(respuesta => {
        if (respuesta.exito) {
          this.errorSignal.set(null);
        }
        this.cargandoSignal.set(false);
      }),
      catchError(err => {
        this.errorSignal.set('Error al subir avatar');
        this.cargandoSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Cambia la contraseña del usuario
   */
  public cambiarContrasena(contrasenaActual: string, contrasenaNueva: string): Observable<RespuestaAPI<void>> {
    this.cargandoSignal.set(true);
    return this.http.post<RespuestaAPI<void>>(
      `${this.BASE_URL}/contrasena/cambiar`,
      { contrasenaActual, contrasenaNueva }
    ).pipe(
      tap(respuesta => {
        if (respuesta.exito) {
          this.errorSignal.set(null);
        }
        this.cargandoSignal.set(false);
      }),
      catchError(err => {
        this.errorSignal.set('Error al cambiar contraseña');
        this.cargandoSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Crea un nuevo usuario (admin)
   */
  public crearUsuario(usuario: Partial<Usuario>): Observable<RespuestaAPI<Usuario>> {
    this.cargandoSignal.set(true);
    return this.http.post<RespuestaAPI<Usuario>>(
      `${this.BASE_URL}`,
      usuario
    ).pipe(
      tap(respuesta => {
        if (respuesta.exito && respuesta.datos) {
          const usuariosActuales = this.usuariosSignal();
          this.usuariosSignal.set([...usuariosActuales, respuesta.datos]);
          this.cache$.next(this.usuariosSignal());
          this.errorSignal.set(null);
        }
        this.cargandoSignal.set(false);
      }),
      catchError(err => {
        this.errorSignal.set('Error al crear usuario');
        this.cargandoSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Actualiza un usuario (admin)
   */
  public actualizarUsuario(id: number, datos: Partial<Usuario>): Observable<RespuestaAPI<Usuario>> {
    this.cargandoSignal.set(true);
    return this.http.put<RespuestaAPI<Usuario>>(
      `${this.BASE_URL}/${id}`,
      datos
    ).pipe(
      tap(respuesta => {
        if (respuesta.exito && respuesta.datos) {
          this.actualizarUsuarioEnCache(respuesta.datos);
          this.errorSignal.set(null);
        }
        this.cargandoSignal.set(false);
      }),
      catchError(err => {
        this.errorSignal.set('Error al actualizar usuario');
        this.cargandoSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Elimina un usuario (admin)
   */
  public eliminarUsuario(id: number): Observable<RespuestaAPI<void>> {
    this.cargandoSignal.set(true);
    return this.http.delete<RespuestaAPI<void>>(
      `${this.BASE_URL}/${id}`
    ).pipe(
      tap(respuesta => {
        if (respuesta.exito) {
          const usuariosActuales = this.usuariosSignal();
          this.usuariosSignal.set(usuariosActuales.filter(u => u.id !== id));
          this.cache$.next(this.usuariosSignal());
          this.errorSignal.set(null);
        }
        this.cargandoSignal.set(false);
      }),
      catchError(err => {
        this.errorSignal.set('Error al eliminar usuario');
        this.cargandoSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Actualiza un usuario en la cache local
   */
  private actualizarUsuarioEnCache(usuario: Usuario): void {
    const usuariosActuales = this.usuariosSignal();
    const index = usuariosActuales.findIndex(u => u.id === usuario.id);
    if (index !== -1) {
      usuariosActuales[index] = usuario;
      this.usuariosSignal.set([...usuariosActuales]);
      localStorage.setItem(this.USUARIOS_CACHE_KEY, JSON.stringify(usuariosActuales));
    }
  }

  /**
   * Limpia la cache
   */
  public limpiarCache(): void {
    localStorage.removeItem(this.USUARIOS_CACHE_KEY);
    this.usuariosSignal.set([]);
  }
}

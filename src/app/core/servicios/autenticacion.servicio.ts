import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, of, timer } from 'rxjs';
import { tap, catchError, map, switchMap, retry } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { 
  Usuario, 
  RespuestaLogin, 
  SolicitudLogin, 
  SolicitudRegistro,
  SolicitudCambioContrasena,
  SolicitudRecuperarContrasena,
  SolicitudRestablecerContrasena,
  RespuestaAPI
} from '@core/modelos';

/**
 * Servicio de Autenticación para InnoAd
 * Maneja el inicio de sesión, registro, tokens y estado de autenticación
 */
@Injectable({
  providedIn: 'root'
})
export class ServicioAutenticacion {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  private readonly API_URL = `${environment.urlApi}/autenticacion`;
  private readonly TOKEN_KEY = 'innoad_token';
  private readonly REFRESH_TOKEN_KEY = 'innoad_refresh_token';
  private readonly USUARIO_KEY = 'innoad_usuario';
  private readonly EXPIRA_KEY = 'innoad_token_expira'; // epoch ms
  
  // Signals para gestión reactiva del estado
  private usuarioActualSignal = signal<Usuario | null>(this.cargarUsuarioDesdeStorage());
  private tokenActualSignal = signal<string | null>(this.cargarTokenDesdeStorage());
  private cargandoSignal = signal<boolean>(false);
  
  // Signals públicos computados
  public readonly usuarioActual = this.usuarioActualSignal.asReadonly();
  public readonly estaAutenticado = computed(() => !!this.usuarioActualSignal() && !!this.tokenActualSignal() && this.tokenNoExpirado());
  public readonly cargando = this.cargandoSignal.asReadonly();
  public readonly esAdministrador = computed(() => this.usuarioActualSignal()?.rol.nombre === 'Administrador');
  public readonly permisos = computed(() => this.usuarioActualSignal()?.permisos.map(p => p.nombre) || []);
  
  // Subject para actualización automática del token
  private refrescarTokenSub = new BehaviorSubject<boolean>(false);
  private programacionRefresco?: any; // guardar referencia a suscripción de timer
  
  constructor() {
    this.inicializarRefrescoAutomaticoToken();
  }
  
  /**
   * Inicia sesión con credenciales de usuario
   */
  iniciarSesion(solicitud: SolicitudLogin): Observable<RespuestaLogin> {
    this.cargandoSignal.set(true);
    
    return this.http.post<RespuestaAPI<RespuestaLogin>>(`${this.API_URL}/iniciar-sesion`, solicitud)
      .pipe(
        map(respuesta => {
          if (!respuesta.exitoso || !respuesta.datos) {
            throw new Error(respuesta.mensaje || 'Error al iniciar sesión');
          }
          return respuesta.datos;
        }),
        tap(datos => {
          this.guardarSesion(datos, solicitud.recordarme);
          this.usuarioActualSignal.set(datos.usuario);
          this.tokenActualSignal.set(datos.token);
          this.programarRefrescoConExpira(datos.expiraEn);
          this.cargandoSignal.set(false);
        }),
        catchError(error => {
          this.cargandoSignal.set(false);
          return throwError(() => this.manejarError(error));
        })
      );
  }
  
  /**
   * Registra un nuevo usuario en el sistema
   */
  registrarse(solicitud: SolicitudRegistro): Observable<RespuestaLogin> {
    this.cargandoSignal.set(true);
    
    return this.http.post<RespuestaAPI<RespuestaLogin>>(`${this.API_URL}/registrarse`, solicitud)
      .pipe(
        map(respuesta => {
          if (!respuesta.exitoso || !respuesta.datos) {
            throw new Error(respuesta.mensaje || 'Error al registrarse');
          }
          return respuesta.datos;
        }),
        tap(datos => {
          this.guardarSesion(datos, false);
          this.usuarioActualSignal.set(datos.usuario);
          this.tokenActualSignal.set(datos.token);
          this.cargandoSignal.set(false);
        }),
        catchError(error => {
          this.cargandoSignal.set(false);
          return throwError(() => this.manejarError(error));
        })
      );
  }
  
  /**
   * Cierra la sesión del usuario actual
   */
  cerrarSesion(): void {
    this.http.post(`${this.API_URL}/cerrar-sesion`, {})
      .pipe(catchError(() => of(null)))
      .subscribe();
    
    this.limpiarSesion();
    this.usuarioActualSignal.set(null);
    this.tokenActualSignal.set(null);
    this.router.navigate(['/autenticacion/iniciar-sesion']);
  }
  
  /**
   * Refresca el token de acceso usando el refresh token
   */
  refrescarToken(): Observable<RespuestaLogin> {
    const refreshToken = this.obtenerRefreshTokenDesdeStorage();
    
    if (!refreshToken) {
      return throwError(() => new Error('No hay refresh token disponible'));
    }
    
    return this.http.post<RespuestaAPI<RespuestaLogin>>(
      `${this.API_URL}/refrescar-token`,
      { tokenActualizacion: refreshToken }
    ).pipe(
      map(respuesta => {
        if (!respuesta.exitoso || !respuesta.datos) {
          throw new Error('Error al refrescar token');
        }
        return respuesta.datos;
      }),
      tap(datos => {
        this.guardarTokenAcceso(datos.token);
        this.programarRefrescoConExpira(datos.expiraEn);
      }),
      catchError(error => {
        this.cerrarSesion();
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Recupera la contrasena enviando un email
   */
  recuperarContrasena(solicitud: SolicitudRecuperarContrasena): Observable<void> {
    return this.http.post<RespuestaAPI<void>>(`${this.API_URL}/recuperar-contrasena`, solicitud)
      .pipe(
        map(respuesta => {
          if (!respuesta.exitoso) {
            throw new Error(respuesta.mensaje || 'Error al recuperar contrasena');
          }
        }),
        catchError(error => throwError(() => this.manejarError(error)))
      );
  }
  
  /**
   * Restablece la contrasena con el token recibido por email
   */
  restablecerContrasena(solicitud: SolicitudRestablecerContrasena): Observable<void> {
    return this.http.post<RespuestaAPI<void>>(`${this.API_URL}/restablecer-contrasena`, solicitud)
      .pipe(
        map(respuesta => {
          if (!respuesta.exitoso) {
            throw new Error(respuesta.mensaje || 'Error al restablecer contrasena');
          }
        }),
        catchError(error => throwError(() => this.manejarError(error)))
      );
  }
  
  /**
   * Cambia la contrasena del usuario actual
   */
  cambiarContrasena(solicitud: SolicitudCambioContrasena): Observable<void> {
    return this.http.put<RespuestaAPI<void>>(`${this.API_URL}/cambiar-contrasena`, solicitud)
      .pipe(
        map(respuesta => {
          if (!respuesta.exitoso) {
            throw new Error(respuesta.mensaje || 'Error al cambiar contrasena');
          }
        }),
        catchError(error => throwError(() => this.manejarError(error)))
      );
  }
  
  /**
   * Verifica si el usuario tiene un permiso específico
   */
  tienePermiso(nombrePermiso: string): boolean {
    const usuario = this.usuarioActualSignal();
    if (!usuario) return false;
    
    return usuario.permisos.some(p => p.nombre === nombrePermiso) ||
           usuario.rol.nombre === 'Administrador';
  }
  
  /**
   * Verifica si el usuario tiene alguno de los permisos especificados
   */
  tieneAlgunPermiso(nombresPermisos: string[]): boolean {
    return nombresPermisos.some(permiso => this.tienePermiso(permiso));
  }
  
  /**
   * Verifica si el usuario tiene todos los permisos especificados
   */
  tieneTodosLosPermisos(nombresPermisos: string[]): boolean {
    return nombresPermisos.every(permiso => this.tienePermiso(permiso));
  }
  
  /**
   * Obtiene el token actual
   */
  obtenerToken(): string | null {
    return this.tokenActualSignal();
  }
  
  /**
   * Actualiza los datos del usuario actual
   */
  actualizarUsuarioActual(usuario: Usuario): void {
    this.usuarioActualSignal.set(usuario);
    localStorage.setItem(this.USUARIO_KEY, JSON.stringify(usuario));
  }
  
  // Métodos privados
  
  private guardarSesion(datos: RespuestaLogin, recordar: boolean): void {
    const storage = recordar ? localStorage : sessionStorage;

    storage.setItem(this.TOKEN_KEY, datos.token);
    storage.setItem(this.REFRESH_TOKEN_KEY, datos.tokenActualizacion);
    storage.setItem(this.USUARIO_KEY, JSON.stringify(datos.usuario));
    storage.setItem(this.EXPIRA_KEY, (Date.now() + datos.expiraEn * 1000).toString());

    // Señal para refresco (si se usa en otras partes)
    this.refrescarTokenSub.next(true);
  }
  
  private limpiarSesion(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USUARIO_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.USUARIO_KEY);
    sessionStorage.removeItem(this.EXPIRA_KEY);
    
    this.refrescarTokenSub.next(false);
    if (this.programacionRefresco) {
      this.programacionRefresco.unsubscribe?.();
      this.programacionRefresco = undefined;
    }
  }
  
  private cargarUsuarioDesdeStorage(): Usuario | null {
    const usuarioJson = localStorage.getItem(this.USUARIO_KEY) || 
                       sessionStorage.getItem(this.USUARIO_KEY);
    
    if (usuarioJson) {
      try {
        return JSON.parse(usuarioJson);
      } catch {
        return null;
      }
    }
    
    return null;
  }
  
  private cargarTokenDesdeStorage(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || 
           sessionStorage.getItem(this.TOKEN_KEY);
  }
  
  private inicializarRefrescoAutomaticoToken(): void {
    // Si ya hay sesión al iniciar (recarga), reprogramar según expiración almacenada
    const expira = this.cargarExpiracionDesdeStorage();
    if (expira && this.tokenNoExpirado()) {
      const segundosRestantes = Math.max(0, Math.floor((expira - Date.now()) / 1000));
      this.programarRefrescoConExpira(segundosRestantes);
    }
  }

  private cargarExpiracionDesdeStorage(): number | null {
    const expira = localStorage.getItem(this.EXPIRA_KEY) || sessionStorage.getItem(this.EXPIRA_KEY);
    return expira ? Number(expira) : null;
  }

  private obtenerRefreshTokenDesdeStorage(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) || sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private guardarTokenAcceso(token: string): void {
    // Mantener storage coherente: si el token actual estaba en sessionStorage, actualizar allí; si no, en localStorage
    if (sessionStorage.getItem(this.TOKEN_KEY) !== null) {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    } else {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
    this.tokenActualSignal.set(token);
  }

  private programarRefrescoConExpira(expiraEnSegundos: number): void {
    // Refrescar cuando falten ~60s para expirar
    const margen = 60; // segundos
    const disparoEnMs = Math.max(0, (expiraEnSegundos - margen) * 1000);

    // Guardar nueva expiración absoluta
    const expiraAbs = Date.now() + expiraEnSegundos * 1000;
    if (sessionStorage.getItem(this.TOKEN_KEY) !== null) {
      sessionStorage.setItem(this.EXPIRA_KEY, expiraAbs.toString());
    } else {
      localStorage.setItem(this.EXPIRA_KEY, expiraAbs.toString());
    }

    // Cancelar programación anterior
    if (this.programacionRefresco) {
      this.programacionRefresco.unsubscribe?.();
    }

    this.programacionRefresco = timer(disparoEnMs)
      .pipe(
        switchMap(() => this.refrescarToken().pipe(catchError(() => of(null))))
      )
      .subscribe();
  }

  private tokenNoExpirado(): boolean {
    const expira = this.cargarExpiracionDesdeStorage();
    if (!expira) return !!this.tokenActualSignal();
    return Date.now() < expira;
  }
  
  private manejarError(error: any): Error {
    let mensaje = 'Ha ocurrido un error inesperado';
    
    if (error.error?.mensaje) {
      mensaje = error.error.mensaje;
    } else if (error.message) {
      mensaje = error.message;
    }
    
    return new Error(mensaje);
  }
}

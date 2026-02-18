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
import { HttpBaseService } from './http-base.servicio';
import { ApiGatewayService } from './api-gateway.servicio';
import { API_ENDPOINTS } from '@core/config/api.config';

// Interfaces extendidas para funcionalidades avanzadas
interface LoginCredencialesAvanzadas extends SolicitudLogin {
  dispositivoConfianza?: boolean;
  ubicacion?: {
    ip?: string;
    ciudad?: string;
    pais?: string;
  };
  dispositivo?: {
    tipo: string;
    navegador: string;
    os: string;
    fingerprint?: string;
  };
}

interface SesionInfo {
  id: string;
  dispositivo: string;
  ip: string;
  ubicacion: string;
  fechaInicio: Date;
  ultimaActividad: Date;
  activa: boolean;
}

interface ConfiguracionSeguridad {
  dobleFactorActivo: boolean;
  notificacionesSeguridad: boolean;
  sesionesSimultaneas: number;
  tiempoExpiracion: number;
  dispositivosConfianza: string[];
}

/**
 * Servicio de Autenticación para InnoAd
 * Maneja el inicio de sesión, registro, tokens y estado de autenticación
 */
@Injectable({
  providedIn: 'root'
})
export class ServicioAutenticacion {
  private readonly http = inject(HttpClient);
  private readonly httpBase = inject(HttpBaseService);
  private readonly apiGateway = inject(ApiGatewayService);
  private readonly router = inject(Router);
  
  // Constantes para localStorage
  private readonly TOKEN_KEY = 'innoad_access_token';
  private readonly REFRESH_TOKEN_KEY = 'innoad_refresh_token';
  private readonly USUARIO_KEY = 'innoad_usuario';
  private readonly EXPIRA_KEY = 'innoad_token_expira';
  private readonly SESIONES_KEY = 'innoad_sesiones';
  private readonly SEGURIDAD_KEY = 'innoad_configuracion_seguridad';
  
  // Signals para gestión reactiva del estado
  private usuarioActualSignal = signal<Usuario | null>(this.cargarUsuarioDesdeStorage());
  private tokenActualSignal = signal<string | null>(this.cargarTokenDesdeStorage());
  private cargandoSignal = signal<boolean>(false);
  
  // Signals públicos computados
  public readonly usuarioActual = this.usuarioActualSignal.asReadonly();
  public readonly estaAutenticado = computed(() => !!this.usuarioActualSignal() && !!this.tokenActualSignal() && this.tokenNoExpirado());
  public readonly cargando = this.cargandoSignal.asReadonly();
  public readonly esAdministrador = computed(() => {
    const usuario = this.usuarioActualSignal();
    if (!usuario) return false;
    const rol = usuario.rol as any;
    return rol?.nombre === 'ADMIN' || rol === 'ADMIN';
  });
  public readonly permisos = computed(() => {
    const permisos = this.usuarioActualSignal()?.permisos || [];
    return permisos.map(p => (p as any).nombre || p);
  });
  
  // Subject para actualización automática del token
  private refrescarTokenSub = new BehaviorSubject<boolean>(false);
  private programacionRefresco?: any; // guardar referencia a suscripción de timer
  
  // Nuevas propiedades avanzadas
  private readonly sesionesActivasSignal = signal<SesionInfo[]>([]);
  private readonly configuracionSeguridadSignal = signal<ConfiguracionSeguridad>(this.cargarConfiguracionSeguridad());
  private readonly intentosLoginFallidosSignal = signal<number>(0);
  private readonly cuentaBloqueadaSignal = signal<boolean>(false);
  
  // Signals públicos avanzados
  public readonly sesionesActivas = this.sesionesActivasSignal.asReadonly();
  public readonly configuracionSeguridad = this.configuracionSeguridadSignal.asReadonly();
  public readonly intentosLoginFallidos = this.intentosLoginFallidosSignal.asReadonly();
  public readonly cuentaBloqueada = this.cuentaBloqueadaSignal.asReadonly();
  public readonly tiempoRestanteToken = computed(() => this.calcularTiempoRestante());
  
  // Observables para eventos de seguridad
  public readonly eventoSeguridad$ = new BehaviorSubject<{tipo: string, datos: any} | null>(null);
  public readonly estadoConexion$ = new BehaviorSubject<boolean>(true);
  
  constructor() {
    this.inicializarRefrescoAutomaticoToken();
    this.inicializarMonitoreoSeguridad();
    // this.cargarSesionesActivas(); // Deshabilitado - endpoint no implementado en backend
    this.configurarInterceptores();
  }
  
  /**
   * Inicia sesión con credenciales de usuario
   */
  iniciarSesion(solicitud: SolicitudLogin): Observable<RespuestaLogin> {
    this.cargandoSignal.set(true);
    
    const loginUrl = this.apiGateway.getAuthUrl('/login');
    console.log('[]� Login URL:', loginUrl);
    console.log('[]� Datos enviados:', solicitud);
    
    // Transformar datos al formato que espera el backend (español)
    const datosBackend = {
      nombreUsuario: solicitud.nombreUsuarioOEmail,
      contrasena: solicitud.contrasena,
      recordarme: solicitud.recordarme
    };
    
    console.log('[]� Datos transformados para backend:', datosBackend);
    console.log('[]� JSON que se enviará:', JSON.stringify(datosBackend, null, 2));
    
    return this.http.post<any>(loginUrl, datosBackend)
      .pipe(
        map(respuesta => {
          console.log('[]� Respuesta completa del backend:', respuesta);
          
          // Compatibilidad: manejar formato antiguo y nuevo
          let datosLogin: RespuestaLogin;
          
          // Si la respuesta tiene el formato RespuestaAPI<RespuestaLogin>
          if (respuesta.exitoso !== undefined && respuesta.datos) {
            console.log('[]� Formato nuevo detectado (RespuestaAPI)');
            if (!respuesta.exitoso || !respuesta.datos) {
              console.error('[] Respuesta no exitosa o sin datos');
              throw new Error(respuesta.mensaje || 'Error al iniciar sesión');
            }
            datosLogin = respuesta.datos;
          }
          // Si la respuesta es directamente RespuestaAutenticacion (formato antiguo)
          else if (respuesta.token && respuesta.nombreUsuario) {
            console.log('[]� Formato antiguo detectado (RespuestaAutenticacion)');
            // Transformar al formato esperado
            datosLogin = {
              token: respuesta.token,
              tokenActualizacion: respuesta.tokenActualizacion || '',
              usuario: {
                id: respuesta.id || 0,
                nombreUsuario: respuesta.nombreUsuario,
                email: respuesta.email || '',
                nombreCompleto: respuesta.nombreCompleto || respuesta.nombreUsuario,
                rol: respuesta.rol || 'Usuario'
              },
              expiraEn: respuesta.expiraEn || 3600
            };
          } else {
            console.error('[] Formato de respuesta desconocido');
            throw new Error('Formato de respuesta inválido');
          }
          
          console.log('[] Datos extraídos correctamente:', datosLogin);
          return datosLogin;
        }),
        tap(datos => {
          console.log('[] Guardando sesión con datos:', datos);
          this.guardarSesion(datos, solicitud.recordarme);
          this.usuarioActualSignal.set(datos.usuario);
          this.tokenActualSignal.set(datos.token);
          this.programarRefrescoConExpira(datos.expiraEn);
          this.cargandoSignal.set(false);
        }),
        catchError(error => {
          console.error('[] Error capturado en catchError:', error);
          this.cargandoSignal.set(false);

          // Si la configuración permite autenticación offline, intentar usar usuarios locales
          try {
            if ((environment as any).offlineAuth?.enabled) {
              return this.intentarLoginOffline(solicitud as SolicitudLogin);
            }
          } catch (e) {
            // Ignorar y propagar el error
          }

          return throwError(() => this.manejarError(error));
        })
      );
  }
  
  /**
   * Registra un nuevo usuario en el sistema
   */
  registrarse(solicitud: SolicitudRegistro): Observable<RespuestaLogin> {
    this.cargandoSignal.set(true);
    
    return this.http.post<RespuestaAPI<RespuestaLogin>>(this.apiGateway.getAuthUrl('/registrarse'), solicitud)
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
    this.http.post(this.apiGateway.getAuthUrl('/logout'), {})
      .pipe(catchError(() => of(null)))
      .subscribe();
    
    this.limpiarSesion();
    this.usuarioActualSignal.set(null);
    this.tokenActualSignal.set(null);
    this.router.navigate(['/inicio']); // Redirigir a landing page en lugar de login
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
      this.apiGateway.getAuthUrl('/refresh'),
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
    return this.http.post<RespuestaAPI<void>>(this.apiGateway.getAuthUrl('/recuperar-contrasena'), solicitud)
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
    return this.http.post<RespuestaAPI<void>>(this.apiGateway.getAuthUrl('/restablecer-contrasena'), solicitud)
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
    return this.http.put<RespuestaAPI<void>>(this.apiGateway.getAuthUrl('/change-password'), solicitud)
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
   * Verifica el email del usuario usando el token
   */
  verificarEmail(token: string): Observable<void> {
    return this.http.get<RespuestaAPI<void>>(this.apiGateway.getAuthUrl('/verificar-email'), {
      params: { token }
    }).pipe(
      map(respuesta => {
        if (!respuesta.exitoso) {
          throw new Error(respuesta.mensaje || 'Error al verificar email');
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
    
    const permisos = usuario.permisos || [];
    return permisos.some(p => (p as any).nombre === nombrePermiso || (typeof p === 'string' && p === nombrePermiso)) ||
           (usuario.rol as any)?.nombre === 'ADMIN' || (typeof usuario.rol === 'string' && usuario.rol === 'ADMIN');
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
  
  private manejarError(error: any): Observable<never> {
    // Normalizar el error para preservar status/estructura pero garantizando un `message`
    let mensaje = 'Ocurrió un error en la solicitud.';

    if (error) {
      if (error.error) {
        // Muchos backends devuelven el mensaje en `error.error` o `error.error.message`
        if (typeof error.error === 'string') {
          mensaje = error.error;
        } else if (typeof error.error.message === 'string') {
          mensaje = error.error.message;
        }
      } else if (typeof error.message === 'string' && error.message.trim() !== '') {
        mensaje = error.message;
      }
    }

    const errorNormalizado: any = new Error(mensaje);

    // Conservar información útil del error HTTP original
    if (error && typeof error.status !== 'undefined') {
      errorNormalizado.status = error.status;
    }
    if (error && error.error) {
      errorNormalizado.error = error.error;
    }
    errorNormalizado.originalError = error;

    return throwError(() => errorNormalizado);
  }

  /**
   * Intentar login usando usuarios locales definidos en `environment.offlineAuth`
   */
  private intentarLoginOffline(solicitud: SolicitudLogin): Observable<RespuestaLogin> {
    const cfg: any = (environment as any).offlineAuth || { enabled: false, users: [] };
    const usuarios: any[] = cfg.users || [];

    const encontrado = usuarios.find(u =>
      (u.nombreUsuario === solicitud.nombreUsuarioOEmail || u.email === solicitud.nombreUsuarioOEmail) &&
      u.contrasena === solicitud.contrasena
    );

    if (!encontrado) {
      return throwError(() => new Error('Credenciales inválidas (modo offline)'));
    }

    const datosLogin: RespuestaLogin = {
      token: 'offline-' + btoa(encontrado.nombreUsuario + ':' + Date.now()).slice(0, 80),
      tokenActualizacion: '',
      usuario: {
        id: 0,
        nombreUsuario: encontrado.nombreUsuario,
        email: encontrado.email || '',
        nombreCompleto: encontrado.nombreCompleto || encontrado.nombreUsuario,
        rol: encontrado.rol || 'Usuario'
      } as any,
      expiraEn: Math.floor(((environment.auth && environment.auth.tokenExpiration) || (8 * 60 * 60 * 1000)) / 1000)
    };

    // Guardar sesión localmente
    this.guardarSesion(datosLogin, solicitud.recordarme || false);
    this.usuarioActualSignal.set(datosLogin.usuario);
    this.tokenActualSignal.set(datosLogin.token);
    this.programarRefrescoConExpira(datosLogin.expiraEn);

    return of(datosLogin);
  }

  // ===== MÉTODOS AVANZADOS DE AUTENTICACIÓN =====

  /**
   * Inicio de sesión avanzado con información del dispositivo
   */
  iniciarSesionAvanzado(credenciales: LoginCredencialesAvanzadas): Observable<RespuestaLogin> {
    this.cargandoSignal.set(true);
    
    // Agregar información del dispositivo automáticamente
    const credencialesCompletas = {
      ...credenciales,
      dispositivo: {
        tipo: this.detectarTipoDispositivo(),
        navegador: this.detectarNavegador(),
        os: this.detectarSistemaOperativo(),
        fingerprint: this.generarHuellaDispositivo(),
        ...credenciales.dispositivo
      },
      ubicacion: {
        ip: 'auto-detect',
        ...credenciales.ubicacion
      }
    };

    return this.httpBase.post<RespuestaLogin>(API_ENDPOINTS.auth.login, credencialesCompletas).pipe(
      tap(respuesta => {
        this.procesarRespuestaLogin(respuesta, credenciales.recordarme);
        this.resetearIntentosFallidos();
        this.registrarEventoSeguridad('login_exitoso', { dispositivo: credencialesCompletas.dispositivo });
      }),
      catchError(error => {
        this.manejarErrorLogin(error);
        return throwError(() => error);
      }),
      tap(() => this.cargandoSignal.set(false))
    );
  }

  /**
   * Obtener sesiones activas del usuario
   */
  obtenerSesionesActivas(): Observable<SesionInfo[]> {
    return this.httpBase.get<SesionInfo[]>(`${API_ENDPOINTS.auth.profile}/sessions`).pipe(
      tap(sesiones => this.sesionesActivasSignal.set(sesiones))
    );
  }

  /**
   * Cerrar sesión en dispositivo específico
   */
  cerrarSesionDispositivo(sessionId: string): Observable<boolean> {
    return this.httpBase.delete<boolean>(`${API_ENDPOINTS.auth.profile}/sessions/${sessionId}`).pipe(
      tap(() => {
        const sesiones = this.sesionesActivasSignal().filter(s => s.id !== sessionId);
        this.sesionesActivasSignal.set(sesiones);
        this.registrarEventoSeguridad('sesion_cerrada_remota', { sessionId });
      })
    );
  }

  /**
   * Cerrar todas las demás sesiones
   */
  cerrarTodasLasSesiones(): Observable<boolean> {
    return this.httpBase.delete<boolean>(`${API_ENDPOINTS.auth.profile}/sessions/others`).pipe(
      tap(() => {
        this.sesionesActivasSignal.set([]);
        this.registrarEventoSeguridad('todas_sesiones_cerradas', {});
      })
    );
  }

  /**
   * Cambiar contraseña con validaciones avanzadas
   */
  cambiarPasswordAvanzado(cambio: { passwordActual: string; passwordNuevo: string; confirmarPassword: string }): Observable<boolean> {
    // Validaciones del lado cliente
    if (cambio.passwordNuevo !== cambio.confirmarPassword) {
      return throwError(() => new Error('Las contraseñas no coinciden'));
    }

    if (cambio.passwordNuevo.length < 8) {
      return throwError(() => new Error('La contraseña debe tener al menos 8 caracteres'));
    }

    return this.httpBase.post<boolean>(API_ENDPOINTS.auth.changePassword, cambio).pipe(
      tap(() => {
        this.registrarEventoSeguridad('password_cambiado', {});
        // Opcional: cerrar otras sesiones por seguridad
        this.cerrarTodasLasSesiones().subscribe();
      })
    );
  }

  /**
   * Verificar fortaleza de contraseña
   */
  verificarFortalezaPassword(password: string): {
    puntuacion: number;
    nivel: 'muy_débil' | 'débil' | 'regular' | 'fuerte' | 'muy_fuerte';
    sugerencias: string[];
  } {
    let puntuacion = 0;
    const sugerencias: string[] = [];

    // Longitud
    if (password.length >= 8) puntuacion += 2;
    else sugerencias.push('Usa al menos 8 caracteres');

    if (password.length >= 12) puntuacion += 2;
    
    // Complejidad
    if (/[a-z]/.test(password)) puntuacion += 1;
    else sugerencias.push('Incluye letras minúsculas');
    
    if (/[A-Z]/.test(password)) puntuacion += 1;
    else sugerencias.push('Incluye letras mayúsculas');
    
    if (/[0-9]/.test(password)) puntuacion += 1;
    else sugerencias.push('Incluye números');
    
    if (/[^a-zA-Z0-9]/.test(password)) puntuacion += 2;
    else sugerencias.push('Incluye símbolos especiales');
    
    // Patrones comunes (penalización)
    if (/(.)\1{2,}/.test(password)) puntuacion -= 2;
    if (/123|abc|qwerty/i.test(password)) puntuacion -= 3;

    // Determinar nivel
    let nivel: 'muy_débil' | 'débil' | 'regular' | 'fuerte' | 'muy_fuerte';
    if (puntuacion <= 2) nivel = 'muy_débil';
    else if (puntuacion <= 4) nivel = 'débil';
    else if (puntuacion <= 6) nivel = 'regular';
    else if (puntuacion <= 8) nivel = 'fuerte';
    else nivel = 'muy_fuerte';

    return { puntuacion: Math.max(0, puntuacion), nivel, sugerencias };
  }

  /**
   * Configurar autenticación de doble factor
   */
  configurarDobleFactorAuth(activo: boolean): Observable<{ qrCode?: string; secreto?: string }> {
    return this.httpBase.post<{ qrCode?: string; secreto?: string }>(`${API_ENDPOINTS.auth.profile}/2fa`, { activo }).pipe(
      tap(() => {
        const config = this.configuracionSeguridadSignal();
        this.configuracionSeguridadSignal.set({
          ...config,
          dobleFactorActivo: activo
        });
        this.guardarConfiguracionSeguridad();
        this.registrarEventoSeguridad('2fa_configurado', { activo });
      })
    );
  }

  /**
   * Verificar token de doble factor
   */
  verificarDobleFactorAuth(codigo: string): Observable<boolean> {
    return this.httpBase.post<boolean>(`${API_ENDPOINTS.auth.profile}/2fa/verify`, { codigo });
  }

  /**
   * Obtener logs de actividad de seguridad
   */
  obtenerLogsSeguridad(limite: number = 50): Observable<any[]> {
    return this.httpBase.get<any[]>(`${API_ENDPOINTS.auth.profile}/security-logs`, {
      params: { limite: limite.toString() }
    });
  }

  // ===== MÉTODOS PRIVADOS AVANZADOS =====

  private inicializarMonitoreoSeguridad(): void {
    // Monitorear intentos de acceso sospechosos
    this.monitorearActividadSospechosa();
    
    // Verificar integridad de la sesión cada cierto tiempo
    timer(0, 60000).subscribe(() => {
      this.verificarIntegridadSesion();
    });
  }

  private cargarSesionesActivas(): void {
    if (this.estaAutenticado()) {
      this.obtenerSesionesActivas().subscribe({
        error: (error) => {
          // Silenciosamente ignorar el error si el endpoint no existe
          console.debug('Endpoint de sesiones activas no disponible:', error);
        }
      });
    }
  }

  private configurarInterceptores(): void {
    // Los interceptores ya están configurados globalmente
    // Aquí podríamos agregar lógica específica si es necesaria
  }

  private procesarRespuestaLogin(respuesta: RespuestaLogin, recordarme?: boolean): void {
    this.guardarSesion(respuesta, recordarme || false);
    this.usuarioActualSignal.set(respuesta.usuario);
    this.tokenActualSignal.set(respuesta.token);
    this.programarRefrescoConExpira(respuesta.expiraEn);
  }

  private manejarErrorLogin(error: any): void {
    this.incrementarIntentosFallidos();
    this.registrarEventoSeguridad('login_fallido', { error: error.message });
    
    // Bloquear cuenta después de 5 intentos fallidos
    if (this.intentosLoginFallidosSignal() >= 5) {
      this.cuentaBloqueadaSignal.set(true);
      this.registrarEventoSeguridad('cuenta_bloqueada', {});
      
      // Desbloquear después de 15 minutos
      timer(15 * 60 * 1000).subscribe(() => {
        this.cuentaBloqueadaSignal.set(false);
        this.resetearIntentosFallidos();
      });
    }
  }

  private incrementarIntentosFallidos(): void {
    const intentos = this.intentosLoginFallidosSignal() + 1;
    this.intentosLoginFallidosSignal.set(intentos);
    localStorage.setItem('innoad_intentos_fallidos', intentos.toString());
  }

  private resetearIntentosFallidos(): void {
    this.intentosLoginFallidosSignal.set(0);
    localStorage.removeItem('innoad_intentos_fallidos');
  }

  private registrarEventoSeguridad(tipo: string, datos: any): void {
    const evento = {
      tipo,
      datos,
      timestamp: new Date().toISOString(),
      usuario: this.usuarioActualSignal()?.id,
      dispositivo: this.generarHuellaDispositivo()
    };
    
    this.eventoSeguridad$.next({ tipo, datos: evento });
    
    // Enviar al backend si está autenticado
    if (this.estaAutenticado()) {
      this.httpBase.post('/system/audit/security-event', evento).subscribe({
        error: (error) => console.warn('Error registrando evento de seguridad:', error)
      });
    }
  }

  private detectarTipoDispositivo(): string {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|android/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private detectarNavegador(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Desconocido';
  }

  private detectarSistemaOperativo(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Desconocido';
  }

  private generarHuellaDispositivo(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('InnoAd fingerprint', 10, 10);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).slice(0, 32);
  }

  private monitorearActividadSospechosa(): void {
    // Detectar cambios en la huella del dispositivo
    const huellaActual = this.generarHuellaDispositivo();
    const huellaGuardada = localStorage.getItem('innoad_device_fingerprint');
    
    if (huellaGuardada && huellaGuardada !== huellaActual && this.estaAutenticado()) {
      this.registrarEventoSeguridad('dispositivo_cambiado', { 
        anterior: huellaGuardada, 
        actual: huellaActual 
      });
    }
    
    localStorage.setItem('innoad_device_fingerprint', huellaActual);
  }

  private verificarIntegridadSesion(): void {
    if (!this.estaAutenticado()) return;
    
    // Verificar que el token no haya sido modificado
    const token = this.tokenActualSignal();
    if (token && this.validarFormatoJWT(token)) {
      const payload = this.decodificarJWT(token);
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        this.registrarEventoSeguridad('token_expirado_detectado', {});
        this.cerrarSesion();
      }
    }
  }

  private validarFormatoJWT(token: string): boolean {
    return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/.test(token);
  }

  private decodificarJWT(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return {};
    }
  }

  private calcularTiempoRestante(): number {
    const expira = localStorage.getItem(this.EXPIRA_KEY);
    if (!expira) return 0;
    
    const tiempoRestante = parseInt(expira) - Date.now();
    return Math.max(0, Math.floor(tiempoRestante / 1000 / 60)); // minutos
  }

  private cargarConfiguracionSeguridad(): ConfiguracionSeguridad {
    const config = localStorage.getItem(this.SEGURIDAD_KEY);
    if (config) {
      try {
        return JSON.parse(config);
      } catch {
        // Si hay error parseando, usar valores por defecto
      }
    }
    
    return {
      dobleFactorActivo: false,
      notificacionesSeguridad: true,
      sesionesSimultaneas: 3,
      tiempoExpiracion: 8 * 60 * 60 * 1000, // 8 horas
      dispositivosConfianza: []
    };
  }

  private guardarConfiguracionSeguridad(): void {
    localStorage.setItem(this.SEGURIDAD_KEY, JSON.stringify(this.configuracionSeguridadSignal()));
  }

  // ==================== MÉTODOS PARA CÓDIGOS DE VERIFICACIÓN ====================

  /**
   * Solicita un código de verificación por email
   */
  solicitarCodigoVerificacion(email: string, tipo: 'REGISTRO' | 'RECUPERACION'): Observable<any> {
    return this.http.post(
      this.apiGateway.getAuthUrl('/solicitar-codigo'),
      { email, tipo }
    ).pipe(
      catchError(error => {
        console.error('Error solicitando código:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Registra un usuario con código de verificación
   */
  registrarConCodigo(datos: any): Observable<RespuestaLogin> {
    this.cargandoSignal.set(true);

    return this.http.post<RespuestaAPI<RespuestaLogin>>(
      this.apiGateway.getAuthUrl('/registrar-con-codigo'),
      datos
    ).pipe(
      map(respuesta => {
        if (!respuesta.exitoso || !respuesta.datos) {
          throw new Error(respuesta.mensaje || 'Error al registrar');
        }
        return respuesta.datos;
      }),
      tap(datosLogin => {
        this.guardarSesion(datosLogin, false);
        this.usuarioActualSignal.set(datosLogin.usuario);
        this.tokenActualSignal.set(datosLogin.token);
        this.cargandoSignal.set(false);
      }),
      catchError(error => {
        this.cargandoSignal.set(false);
        return throwError(() => this.manejarError(error));
      })
    );
  }

  /**
   * Recupera contraseña usando código de verificación
   */
  recuperarContraseñaConCodigo(datos: any): Observable<any> {
    return this.http.post(
      this.apiGateway.getAuthUrl('/recuperar-contrasena-con-codigo'),
      datos
    ).pipe(
      catchError(error => {
        console.error('Error recuperando contraseña:', error);
        return throwError(() => error);
      })
    );
  }
}
 

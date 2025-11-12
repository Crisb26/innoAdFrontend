import { Injectable, inject, signal } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, tap, shareReplay, catchError } from 'rxjs/operators';
import { HttpBaseService } from './http-base.servicio';
import { Usuario } from '../modelos/usuario.modelo';
import { API_ENDPOINTS } from '../config/api.config';

export interface FiltroUsuarios {
  busqueda?: string;
  rol?: string;
  activo?: boolean;
  fechaCreacionDesde?: Date;
  fechaCreacionHasta?: Date;
  ultimaActividad?: number; // días
  pagina?: number;
  limite?: number;
  ordenPor?: string;
  orden?: 'asc' | 'desc';
}

export interface CrearUsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: string;
  activo: boolean;
  configuracionNotificaciones?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  permisos?: string[];
  metadata?: Record<string, any>;
}

export interface ActualizarUsuarioRequest {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  rol?: string;
  activo?: boolean;
  configuracionNotificaciones?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  permisos?: string[];
  metadata?: Record<string, any>;
}

export interface RespuestaPaginadaUsuarios {
  usuarios: Usuario[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface EstadisticasUsuarios {
  total: number;
  activos: number;
  inactivos: number;
  nuevosUltimos7Dias: number;
  distribucionPorRol: { [rol: string]: number };
  actividadReciente: {
    fecha: string;
    nuevos: number;
    activos: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosServicio {
  private readonly httpBase = inject(HttpBaseService);

  // Signals para estado reactivo
  private readonly usuariosSignal = signal<Usuario[]>([]);
  private readonly usuarioSeleccionadoSignal = signal<Usuario | null>(null);
  private readonly estadisticasSignal = signal<EstadisticasUsuarios | null>(null);
  private readonly cargandoSignal = signal<boolean>(false);

  // Subjects para filtros y paginación
  private readonly filtrosSubject = new BehaviorSubject<FiltroUsuarios>({
    pagina: 1,
    limite: 20,
    ordenPor: 'fechaCreacion',
    orden: 'desc'
  });

  // Observables públicos
  readonly usuarios$ = this.usuariosSignal.asReadonly();
  readonly usuarioSeleccionado$ = this.usuarioSeleccionadoSignal.asReadonly();
  readonly estadisticas$ = this.estadisticasSignal.asReadonly();
  readonly cargando$ = this.cargandoSignal.asReadonly();
  readonly filtros$ = this.filtrosSubject.asObservable();

  constructor() {
    // Auto-cargar usuarios cuando cambian los filtros
    this.filtros$.subscribe(filtros => {
      this.cargarUsuarios(filtros);
    });
  }

  // ===== MÉTODOS PÚBLICOS =====

  /**
   * Obtener todos los usuarios con filtros
   */
  obtenerUsuarios(filtros?: FiltroUsuarios): Observable<RespuestaPaginadaUsuarios> {
    this.cargandoSignal.set(true);
    
    const params = this.construirParametrosConsulta(filtros);
    
    return this.httpBase.get<RespuestaPaginadaUsuarios>(API_ENDPOINTS.users.list, { params }).pipe(
      tap(respuesta => {
        this.usuariosSignal.set(respuesta.usuarios);
        this.cargandoSignal.set(false);
      }),
      catchError(error => {
        this.cargandoSignal.set(false);
        throw error;
      }),
      shareReplay(1)
    );
  }

  /**
   * Obtener usuario por ID
   */
  obtenerUsuarioPorId(id: string): Observable<Usuario> {
    return this.httpBase.get<Usuario>(`${API_ENDPOINTS.users.get}/${id}`, {
      cacheKey: `usuario_${id}`,
      cacheTTL: 5 * 60 * 1000 // 5 minutos
    }).pipe(
      tap(usuario => this.usuarioSeleccionadoSignal.set(usuario))
    );
  }

  /**
   * Crear nuevo usuario
   */
  crearUsuario(datos: CrearUsuarioRequest): Observable<Usuario> {
    this.cargandoSignal.set(true);
    
    return this.httpBase.post<Usuario>(API_ENDPOINTS.users.create, datos).pipe(
      tap(nuevoUsuario => {
        // Actualizar la lista local
        const usuariosActuales = this.usuariosSignal();
        this.usuariosSignal.set([nuevoUsuario, ...usuariosActuales]);
        this.cargandoSignal.set(false);
        
        // Invalidar cache relacionado
        this.httpBase.invalidarCache('usuarios_*');
      }),
      catchError(error => {
        this.cargandoSignal.set(false);
        throw error;
      })
    );
  }

  /**
   * Actualizar usuario existente
   */
  actualizarUsuario(id: string, datos: ActualizarUsuarioRequest): Observable<Usuario> {
    this.cargandoSignal.set(true);
    
    return this.httpBase.put<Usuario>(`${API_ENDPOINTS.users.update}/${id}`, datos).pipe(
      tap(usuarioActualizado => {
        // Actualizar en la lista local
        const usuarios = this.usuariosSignal().map(u => 
          u.id === id ? usuarioActualizado : u
        );
        this.usuariosSignal.set(usuarios);
        
        // Actualizar usuario seleccionado si coincide
        if (this.usuarioSeleccionadoSignal()?.id === id) {
          this.usuarioSeleccionadoSignal.set(usuarioActualizado);
        }
        
        this.cargandoSignal.set(false);
        
        // Invalidar cache relacionado
        this.httpBase.invalidarCache(`usuario_${id}`);
        this.httpBase.invalidarCache('usuarios_*');
      }),
      catchError(error => {
        this.cargandoSignal.set(false);
        throw error;
      })
    );
  }

  /**
   * Eliminar usuario
   */
  eliminarUsuario(id: string): Observable<boolean> {
    this.cargandoSignal.set(true);
    
    return this.httpBase.delete<boolean>(`${API_ENDPOINTS.users.delete}/${id}`).pipe(
      tap(eliminado => {
        if (eliminado) {
          // Remover de la lista local
          const usuarios = this.usuariosSignal().filter(u => u.id !== id);
          this.usuariosSignal.set(usuarios);
          
          // Limpiar selección si coincide
          if (this.usuarioSeleccionadoSignal()?.id === id) {
            this.usuarioSeleccionadoSignal.set(null);
          }
          
          // Invalidar cache relacionado
          this.httpBase.invalidarCache(`usuario_${id}`);
          this.httpBase.invalidarCache('usuarios_*');
        }
        this.cargandoSignal.set(false);
      }),
      catchError(error => {
        this.cargandoSignal.set(false);
        throw error;
      })
    );
  }

  /**
   * Cambiar estado activo/inactivo de usuario
   */
  cambiarEstadoUsuario(id: string, activo: boolean): Observable<Usuario> {
    return this.actualizarUsuario(id, { activo });
  }

  /**
   * Cambiar rol de usuario
   */
  cambiarRolUsuario(id: string, nuevoRol: string): Observable<Usuario> {
    return this.actualizarUsuario(id, { rol: nuevoRol });
  }

  /**
   * Obtener estadísticas de usuarios
   */
  obtenerEstadisticas(): Observable<EstadisticasUsuarios> {
    return this.httpBase.get<EstadisticasUsuarios>(API_ENDPOINTS.users.stats, {
      cacheKey: 'estadisticas_usuarios',
      cacheTTL: 10 * 60 * 1000 // 10 minutos
    }).pipe(
      tap(stats => this.estadisticasSignal.set(stats))
    );
  }

  /**
   * Buscar usuarios por término
   */
  buscarUsuarios(termino: string): Observable<Usuario[]> {
    if (!termino.trim()) {
      return this.httpBase.of([]);
    }
    
    return this.httpBase.get<Usuario[]>(API_ENDPOINTS.users.search, {
      params: { q: termino },
      cacheKey: `busqueda_usuarios_${termino}`,
      cacheTTL: 2 * 60 * 1000 // 2 minutos
    });
  }

  /**
   * Exportar usuarios a CSV/Excel
   */
  exportarUsuarios(formato: 'csv' | 'excel' = 'csv', filtros?: FiltroUsuarios): Observable<Blob> {
    const params = {
      ...this.construirParametrosConsulta(filtros),
      formato
    };
    
    return this.httpBase.get<Blob>(`${API_ENDPOINTS.users.export}`, {
      params,
      responseType: 'blob' as any
    });
  }

  /**
   * Importar usuarios desde archivo
   */
  importarUsuarios(archivo: File): Observable<{ exitosos: number; errores: any[] }> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    
    return this.httpBase.post<{ exitosos: number; errores: any[] }>(
      API_ENDPOINTS.users.import, 
      formData
    ).pipe(
      tap(() => {
        // Recargar usuarios después de importar
        this.recargarUsuarios();
      })
    );
  }

  /**
   * Enviar invitación por email
   */
  enviarInvitacion(email: string, rol: string): Observable<boolean> {
    return this.httpBase.post<boolean>(API_ENDPOINTS.users.invite, { email, rol });
  }

  /**
   * Obtener actividad reciente de un usuario
   */
  obtenerActividadUsuario(id: string, limite: number = 20): Observable<any[]> {
    return this.httpBase.get<any[]>(`${API_ENDPOINTS.users.get}/${id}/activity`, {
      params: { limite: limite.toString() },
      cacheKey: `actividad_usuario_${id}`,
      cacheTTL: 1 * 60 * 1000 // 1 minuto
    });
  }

  // ===== MÉTODOS DE FILTRADO Y PAGINACIÓN =====

  /**
   * Actualizar filtros
   */
  actualizarFiltros(nuevosFiltros: Partial<FiltroUsuarios>): void {
    const filtrosActuales = this.filtrosSubject.value;
    this.filtrosSubject.next({ ...filtrosActuales, ...nuevosFiltros });
  }

  /**
   * Resetear filtros a valores por defecto
   */
  resetearFiltros(): void {
    this.filtrosSubject.next({
      pagina: 1,
      limite: 20,
      ordenPor: 'fechaCreacion',
      orden: 'desc'
    });
  }

  /**
   * Ir a página específica
   */
  irAPagina(pagina: number): void {
    this.actualizarFiltros({ pagina });
  }

  /**
   * Cambiar tamaño de página
   */
  cambiarLimite(limite: number): void {
    this.actualizarFiltros({ limite, pagina: 1 });
  }

  // ===== MÉTODOS DE GESTIÓN DE ESTADO =====

  /**
   * Seleccionar usuario
   */
  seleccionarUsuario(usuario: Usuario | null): void {
    this.usuarioSeleccionadoSignal.set(usuario);
  }

  /**
   * Recargar usuarios con filtros actuales
   */
  recargarUsuarios(): void {
    const filtrosActuales = this.filtrosSubject.value;
    this.cargarUsuarios(filtrosActuales);
  }

  /**
   * Limpiar cache de usuarios
   */
  limpiarCache(): void {
    this.httpBase.invalidarCache('usuarios_*');
    this.httpBase.invalidarCache('usuario_*');
    this.httpBase.invalidarCache('estadisticas_usuarios');
  }

  // ===== MÉTODOS PRIVADOS =====

  private cargarUsuarios(filtros: FiltroUsuarios): void {
    this.obtenerUsuarios(filtros).subscribe({
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.cargandoSignal.set(false);
      }
    });
  }

  private construirParametrosConsulta(filtros?: FiltroUsuarios): any {
    if (!filtros) return {};
    
    const params: any = {};
    
    if (filtros.busqueda) params.busqueda = filtros.busqueda;
    if (filtros.rol) params.rol = filtros.rol;
    if (filtros.activo !== undefined) params.activo = filtros.activo.toString();
    if (filtros.fechaCreacionDesde) params.fechaDesde = filtros.fechaCreacionDesde.toISOString();
    if (filtros.fechaCreacionHasta) params.fechaHasta = filtros.fechaCreacionHasta.toISOString();
    if (filtros.ultimaActividad) params.ultimaActividad = filtros.ultimaActividad.toString();
    if (filtros.pagina) params.pagina = filtros.pagina.toString();
    if (filtros.limite) params.limite = filtros.limite.toString();
    if (filtros.ordenPor) params.ordenPor = filtros.ordenPor;
    if (filtros.orden) params.orden = filtros.orden;
    
    return params;
  }
}
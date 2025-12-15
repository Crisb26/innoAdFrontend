import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PermisosServicio {
  private usuarioActual$ = new BehaviorSubject<Usuario | null>(null);
  private rolesActuales$ = new BehaviorSubject<string[]>([]);
  private permisosActuales$ = new BehaviorSubject<string[]>([]);
  private readonly USUARIO_KEY = 'innoad_usuario';

  constructor() {
    this.cargarUsuarioActual();
  }

  /**
   * Cargar usuario actual desde localStorage/sessionStorage
   */
  cargarUsuarioActual(): void {
    const usuarioJson = localStorage.getItem(this.USUARIO_KEY) || 
                       sessionStorage.getItem(this.USUARIO_KEY);
    
    if (usuarioJson) {
      try {
        const usuario = JSON.parse(usuarioJson);
        this.usuarioActual$.next(usuario);
        
        // Extraer roles del usuario (manejar tanto 'rol' como 'roles')
        let roles: string[] = [];
        if (usuario.roles && Array.isArray(usuario.roles)) {
          roles = usuario.roles;
        } else if (usuario.rol) {
          // Si es un único rol, convertir a array
          roles = typeof usuario.rol === 'string' ? [usuario.rol] : [];
        }
        
        this.rolesActuales$.next(roles);
        this.cargarPermisos();
      } catch (error) {
        console.error('Error al cargar usuario desde storage:', error);
        this.usuarioActual$.next(null);
        this.rolesActuales$.next([]);
      }
    } else {
      this.usuarioActual$.next(null);
      this.rolesActuales$.next([]);
    }
  }

  /**
   * Cargar permisos según el rol
   */
  private cargarPermisos(): void {
    const roles = this.rolesActuales$.value;
    const permisos: string[] = [];

    // ADMINISTRADOR - Acceso total
    if (roles.includes('ADMINISTRADOR')) {
      permisos.push(
        // Panel admin
        'admin.ver', 'admin.dashboard', 'admin.usuarios', 'admin.roles',
        // Usuarios
        'usuarios.ver', 'usuarios.crear', 'usuarios.editar', 'usuarios.eliminar',
        // Campañas
        'campanas.ver', 'campanas.crear', 'campanas.editar', 'campanas.eliminar',
        // Contenidos
        'contenidos.ver', 'contenidos.crear', 'contenidos.editar', 'contenidos.eliminar', 'contenidos.aprobar',
        // Pantallas
        'pantallas.ver', 'pantallas.crear', 'pantallas.editar', 'pantallas.eliminar', 'pantallas.monitoreo',
        // Sistema
        'sistema.configurar', 'sistema.logs', 'sistema.monitoreo', 'sistema.mantenimiento',
        // Chats
        'chat.admin.clientes', 'chat.escribir.clientes', 'chat.cerrar.chat',
        // IA
        'ia.usar', 'ia.configurar',
        // Estadísticas
        'estadisticas.ver', 'estadisticas.exportar',
        // Alertas
        'alertas.publicaciones', 'alertas.daños', 'alertas.sistema'
      );
    }

    // TECNICO - Técnico con permisos de configuración
    if (roles.includes('TECNICO')) {
      permisos.push(
        // Panel técnico
        'tecnico.dashboard', 'tecnico.ventana-daños',
        // Campañas
        'campanas.ver', 'campanas.editar',
        // Contenidos
        'contenidos.ver', 'contenidos.aprobar',
        // Pantallas
        'pantallas.ver', 'pantallas.editar', 'pantallas.monitoreo',
        // Sistema
        'sistema.logs', 'sistema.monitoreo',
        // Chats
        'chat.usuarios.responder',
        // IA
        'ia.usar',
        // Estadísticas
        'estadisticas.ver',
        // Alertas
        'alertas.daños', 'alertas.sistema', 'alertas.publicaciones'
      );
    }

    // DESARROLLADOR - Acceso a herramientas y código
    if (roles.includes('DESARROLLADOR')) {
      permisos.push(
        // Panel developer
        'developer.dashboard', 'developer.codigo', 'developer.logs',
        // Campañas
        'campanas.ver',
        // Contenidos
        'contenidos.ver', 'contenidos.crear',
        // Pantallas
        'pantallas.ver',
        // Sistema
        'sistema.logs',
        // IA
        'ia.usar', 'ia.configurar',
        // Estadísticas
        'estadisticas.ver'
      );
    }

    // USUARIO - Usuario cliente
    if (roles.includes('USUARIO')) {
      permisos.push(
        // Panel usuario
        'usuario.dashboard', 'usuario.mis-publicaciones',
        // Publicación
        'publicacion.crear', 'publicacion.enviar.aprobacion', 'publicacion.ver.estado',
        // Campañas
        'campanas.ver',
        // Chats
        'chat.usuario.tecnico',
        // IA
        'ia.usar',
        // Estadísticas
        'estadisticas.ver.mis.datos',
        // Selección de ubicaciones
        'ubicacion.seleccionar'
      );
    }

    this.permisosActuales$.next(permisos);
  }

  /**
   * Verificar si tiene un permiso
   */
  tienePermiso(permiso: string): boolean {
    return this.permisosActuales$.value.includes(permiso);
  }

  /**
   * Verificar si tiene uno de varios permisos
   */
  tieneAlgunPermiso(...permisos: string[]): boolean {
    return permisos.some(p => this.tienePermiso(p));
  }

  /**
   * Verificar si tiene todos los permisos
   */
  tieneTodosPermisos(...permisos: string[]): boolean {
    return permisos.every(p => this.tienePermiso(p));
  }

  /**
   * Verificar si tiene un rol
   */
  tieneRol(rol: string): boolean {
    return this.rolesActuales$.value.includes(rol);
  }

  /**
   * Verificar si tiene uno de varios roles
   */
  tieneAlgunRol(...roles: string[]): boolean {
    return roles.some(r => this.tieneRol(r));
  }

  /**
   * Obtener usuario actual
   */
  obtenerUsuario$(): Observable<Usuario | null> {
    return this.usuarioActual$.asObservable();
  }

  /**
   * Obtener roles actuales
   */
  obtenerRoles$(): Observable<string[]> {
    return this.rolesActuales$.asObservable();
  }

  /**
   * Obtener permisos actuales
   */
  obtenerPermisos$(): Observable<string[]> {
    return this.permisosActuales$.asObservable();
  }

  /**
   * Recargar permisos (útil después de cambios)
   */
  recargar(): void {
    this.cargarUsuarioActual();
  }

  /**
   * Es admin?
   */
  esAdmin(): boolean {
    return this.tieneRol('ADMINISTRADOR');
  }

  /**
   * Es técnico?
   */
  esTecnico(): boolean {
    return this.tieneRol('TECNICO');
  }

  /**
   * Es developer?
   */
  esDeveloper(): boolean {
    return this.tieneRol('DESARROLLADOR');
  }

  /**
   * Es usuario cliente?
   */
  esUsuario(): boolean {
    return this.tieneRol('USUARIO');
  }
}

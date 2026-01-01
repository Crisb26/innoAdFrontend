import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ServicioAutenticacion } from './autenticacion.servicio';
import { 
  tienePermiso as _tienePermiso, 
  tieneAccesoRuta, 
  tieneJerarquiaMayor,
  Rol, 
  Permiso 
} from '../config/roles.config';

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  roles?: string[];
  rol?: string | { nombre: string };
}

/**
 * Servicio de Permisos - Gestiona validación de permisos y roles del usuario
 * Proporciona métodos para verificar acceso a funcionalidades específicas
 */
@Injectable({
  providedIn: 'root'
})
export class PermisosServicio {
  private servicioAutenticacion = inject(ServicioAutenticacion);
  private usuarioActual$ = new BehaviorSubject<Usuario | null>(null);
  private rolesActuales$ = new BehaviorSubject<string[]>([]);
  private permisosActuales$ = new BehaviorSubject<string[]>([]);
  private readonly USUARIO_KEY = 'innoad_usuario';

  constructor() {
    this.cargarUsuarioActual();
  }

  /**
   * Cargar usuario actual desde servicioAutenticacion
   */
  cargarUsuarioActual(): void {
    const usuario = this.servicioAutenticacion.usuarioActual();
    
    if (usuario) {
      this.usuarioActual$.next(usuario as any);
      
      // Extraer roles del usuario
      let roles: string[] = [];
      if (usuario.rol) {
        const rolUsuario = usuario.rol as any;
        const rolNombre = typeof rolUsuario === 'string' ? rolUsuario : rolUsuario.nombre;
        roles = [rolNombre];
      } else if ((usuario as any).roles && Array.isArray((usuario as any).roles)) {
        roles = (usuario as any).roles;
      }
      
      this.rolesActuales$.next(roles);
      this.cargarPermisos();
    } else {
      this.usuarioActual$.next(null);
      this.rolesActuales$.next([]);
      this.permisosActuales$.next([]);
    }
  }

  /**
   * Cargar permisos basado en roles
   */
  private cargarPermisos(): void {
    const roles = this.rolesActuales$.value;
    const permisos: Set<string> = new Set();

    // Por ahora, retorna array vacío (se puede expandir con lógica de permisos específicos)
    this.permisosActuales$.next(Array.from(permisos));
  }

  /**
   * Verifica si el usuario actual tiene un permiso específico
   */
  tienePermiso(permiso: Permiso): boolean {
    const usuario = this.usuarioActual$.value;
    if (!usuario?.rol) return false;

    const rolUsuario = usuario.rol as any;
    const rolNombre = (typeof rolUsuario === 'string' ? rolUsuario : rolUsuario.nombre) as Rol;

    return _tienePermiso(rolNombre, permiso);
  }

  /**
   * Verifica si el usuario tiene ALGUNO de los permisos especificados
   */
  tieneAlgunoPermiso(...permisos: Permiso[]): boolean {
    return permisos.some(p => this.tienePermiso(p));
  }

  /**
   * Verifica si el usuario tiene TODOS los permisos especificados
   */
  tieneTodosPermisos(...permisos: Permiso[]): boolean {
    return permisos.every(p => this.tienePermiso(p));
  }

  /**
   * Verifica si el usuario actual tiene un rol específico
   */
  tieneRol(rol: Rol | string): boolean {
    const roles = this.rolesActuales$.value;
    
    return roles.some(r => 
      r.toUpperCase() === (typeof rol === 'string' ? rol : rol).toUpperCase()
    );
  }

  /**
   * Verifica si el usuario tiene ALGUNO de los roles especificados
   */
  tieneAlgunRol(...roles: (Rol | string)[]): boolean {
    return roles.some(r => this.tieneRol(r));
  }

  /**
   * Verifica si el usuario es administrador
   */
  esAdministrador(): boolean {
    return this.tieneRol(Rol.ADMINISTRADOR);
  }

  /**
   * Verifica si el usuario es técnico
   */
  esTecnico(): boolean {
    return this.tieneRol(Rol.TECNICO);
  }

  /**
   * Verifica si el usuario es operador
   */
  esOperador(): boolean {
    return this.tieneRol(Rol.OPERADOR);
  }

  /**
   * Verifica si el usuario es usuario básico
   */
  esUsuario(): boolean {
    return this.tieneRol(Rol.USUARIO);
  }

  /**
   * Verifica si el usuario es técnico o superior
   */
  esTecnicoOSuperior(): boolean {
    const usuario = this.usuarioActual$.value;
    if (!usuario?.rol) return false;

    const rolUsuario = usuario.rol as any;
    const rolNombre = (typeof rolUsuario === 'string' ? rolUsuario : rolUsuario.nombre) as Rol;

    return tieneJerarquiaMayor(rolNombre, Rol.TECNICO);
  }

  /**
   * Verifica si el usuario puede acceder a una ruta específica
   */
  puedoAccederRuta(ruta: string): boolean {
    const usuario = this.usuarioActual$.value;
    if (!usuario?.rol) return false;

    const rolUsuario = usuario.rol as any;
    const rolNombre = (typeof rolUsuario === 'string' ? rolUsuario : rolUsuario.nombre) as Rol;

    return tieneAccesoRuta(rolNombre, ruta);
  }

  /**
   * Obtener usuario actual
   */
  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioActual$.value;
  }

  /**
   * Observable para usuario actual
   */
  obtenerUsuarioActual$(): Observable<Usuario | null> {
    return this.usuarioActual$.asObservable();
  }

  /**
   * Obtener roles actuales
   */
  obtenerRoles(): string[] {
    return this.rolesActuales$.value;
  }

  /**
   * Observable para roles actuales
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
   * Obtener el nombre del rol del usuario actual
   */
  obtenerNombreRol(): string {
    const roles = this.rolesActuales$.value;
    return roles.length > 0 ? roles[0] : 'DESCONOCIDO';
  }

  /**
   * Recargar permisos (útil después de cambios)
   */
  recargar(): void {
    this.cargarUsuarioActual();
  }

  /**
   * Es admin? (alias para esAdministrador)
   */
  esAdmin(): boolean {
    return this.esAdministrador();
  }

  /**
   * Es developer? (para compatibilidad con código existente)
   */
  esDeveloper(): boolean {
    return this.tieneRol('DESARROLLADOR');
  }
}
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

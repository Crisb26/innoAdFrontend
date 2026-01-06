import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanActivateChild,
} from '@angular/router';
import { PermisosServicio } from '../servicios/permisos.servicio';
import { ServicioAutenticacion } from '../servicios/autenticacion.servicio';
import { tienePermiso, tieneAccesoRuta, Rol, Permiso } from '../config/roles.config';
import NotifyX from 'notifyx';

/**
 * Guard de Rol - Valida acceso a rutas según el rol del usuario
 * Soporta validación por rol, permiso y acceso a ruta
 */
@Injectable({
  providedIn: 'root'
})
export class RolGuard implements CanActivate, CanActivateChild {
  constructor(
    private permisosServicio: PermisosServicio,
    private servicioAutenticacion: ServicioAutenticacion,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.verificarAcceso(route, state);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.verificarAcceso(route, state);
  }

  /**
   * Verifica si el usuario tiene acceso según los requisitos de la ruta
   */
  private verificarAcceso(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Verificar si el usuario está autenticado
    if (!this.servicioAutenticacion.estaAutenticado()) {
      this.router.navigate(['/autenticacion/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Obtener rol actual del usuario
    const usuario = this.servicioAutenticacion.usuarioActual();
    if (!usuario || !usuario.rol) {
      NotifyX.error('No se pudo determinar tu rol. Por favor, inicia sesión nuevamente.');
      this.router.navigate(['/autenticacion/login']);
      return false;
    }

    const rolUsuario = usuario.rol as any;
    const rolNombre = typeof rolUsuario === 'string' ? rolUsuario : rolUsuario.nombre;

    // Validación 1: Roles requeridos (si existen)
    if (route.data['roles'] && route.data['roles'].length > 0) {
      const rolesRequeridos: string[] = route.data['roles'];
      const tieneRolRequerido = rolesRequeridos.some(r => 
        r.toUpperCase() === rolNombre.toUpperCase()
      );

      if (!tieneRolRequerido) {
        NotifyX.warning('No tienes permiso para acceder a esta sección.', {
          duration: 3000,
          dismissible: true
        });
        this.router.navigate(['/sin-permisos']);
        return false;
      }
    }

    // Validación 2: Permisos específicos requeridos (si existen)
    if (route.data['permisos'] && route.data['permisos'].length > 0) {
      const permisosRequeridos: string[] = route.data['permisos'];
      const rol = (rolNombre as unknown) as Rol;
      
      const tieneTodosPermisos = permisosRequeridos.some(p => 
        tienePermiso(rol, p as Permiso)
      );

      if (!tieneTodosPermisos) {
        NotifyX.warning('No tienes los permisos necesarios para acceder a esta sección.', {
          duration: 3000,
          dismissible: true
        });
        this.router.navigate(['/sin-permisos']);
        return false;
      }
    }

    // Si no hay restricciones específicas, permitir acceso
    return true;
  }
}

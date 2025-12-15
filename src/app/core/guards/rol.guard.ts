import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanActivateChild,
} from '@angular/router';
import { PermisosServicio } from '../servicios/permisos.servicio';

@Injectable({
  providedIn: 'root'
})
export class RolGuard implements CanActivate, CanActivateChild {
  constructor(
    private permisosServicio: PermisosServicio,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.verificarAcceso(route);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.verificarAcceso(route);
  }

  private verificarAcceso(route: ActivatedRouteSnapshot): boolean {
    // Si no hay roles requeridos, permitir acceso
    if (!route.data['roles'] || route.data['roles'].length === 0) {
      return true;
    }

    const rolesRequeridos: string[] = route.data['roles'];
    const tieneAcceso = this.permisosServicio.tieneAlgunRol(...rolesRequeridos);

    if (!tieneAcceso) {
      this.router.navigate(['/sin-permisos']);
      return false;
    }

    return true;
  }
}

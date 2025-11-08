import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ServicioAutenticacion } from '../servicios/autenticacion.servicio';

export const guardPermisos: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  const authService = inject(ServicioAutenticacion);
  const router = inject(Router);
  if (!authService.estaAutenticado()) {
    router.navigate(['/autenticacion/iniciar-sesion'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  return true;
};

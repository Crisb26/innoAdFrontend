import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { ServicioAutenticacion } from '../servicios/autenticacion.servicio';

export const guardPermisos: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const servicioAuth = inject(ServicioAutenticacion);
  const router = inject(Router);
  
  const permisosRequeridos = route.data['permisos'] as string[];
  
  if (!permisosRequeridos || permisosRequeridos.length === 0) {
    return true;
  }
  
  if (servicioAuth.tieneAlgunPermiso(permisosRequeridos)) {
    return true;
  }
  
  router.navigate(['/sin-permisos']);
  return false;
};

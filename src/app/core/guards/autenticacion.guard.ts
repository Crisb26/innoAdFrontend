import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ServicioAutenticacion } from '../servicios/autenticacion.servicio';

/**
 * Guard de autenticación mejorado con verificación avanzada
 */
export const guardAutenticacion: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  const authService = inject(ServicioAutenticacion);
  const router = inject(Router);
  
  // Verificación rápida para tokens válidos
  if (authService.estaAutenticado()) {
    return true;
  }
  
  // No autenticado
  console.info('Usuario no autenticado, redirigiendo al login');
  router.navigate(['/autenticacion/iniciar-sesion'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

/**
 * Guard inverso para rutas que no requieren autenticación (como login)
 */
export const guardNoAutenticado: CanActivateFn = () => {
  const authService = inject(ServicioAutenticacion);
  const router = inject(Router);
  
  if (authService.estaAutenticado()) {
    // Ya está autenticado, redirigir al dashboard
    router.navigate(['/dashboard']);
    return false;
  }
  
  return true;
};

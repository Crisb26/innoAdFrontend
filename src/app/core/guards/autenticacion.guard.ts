import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ServicioAutenticacion } from '../servicios/autenticacion.servicio';

export const guardAutenticacion: CanActivateFn = () => {
  const servicioAuth = inject(ServicioAutenticacion);
  const router = inject(Router);
  
  if (servicioAuth.estaAutenticado()) {
    return true;
  }
  
  router.navigate(['/autenticacion/iniciar-sesion']);
  return false;
};

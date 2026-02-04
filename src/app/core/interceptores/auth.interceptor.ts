import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ServicioAutenticacion } from '../servicios/autenticacion.servicio';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const servicioAuth = inject(ServicioAutenticacion);
  const token = servicioAuth.obtenerToken();

  // No adjuntar token en endpoints de autenticación ni en actuator/health
  const esRutaAuth = req.url.includes('/auth/') || req.url.includes('/autenticacion/');
  const esHealth = req.url.includes('/actuator/health');
  const esPublico = req.url.includes('/public/');

  if (token && !esRutaAuth && !esHealth && !esPublico) {
    const clonedRequest = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(clonedRequest);
  }
  
  return next(req);
};

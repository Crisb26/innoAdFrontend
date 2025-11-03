import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ServicioAutenticacion } from '../servicios/autenticacion.servicio';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const servicioAuth = inject(ServicioAutenticacion);
  const token = servicioAuth.obtenerToken();
  
  if (token && !req.url.includes('/autenticacion/')) {
    const clonedRequest = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(clonedRequest);
  }
  
  return next(req);
};

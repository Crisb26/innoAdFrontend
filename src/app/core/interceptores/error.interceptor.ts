import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ServicioAutenticacion } from '../servicios/autenticacion.servicio';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const servicioAuth = inject(ServicioAutenticacion);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        servicioAuth.cerrarSesion();
      } else if (error.status === 503) {
        router.navigate(['/mantenimiento']);
      }
      return throwError(() => error);
    })
  );
};

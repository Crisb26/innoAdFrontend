import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, retry, retryWhen, delay } from 'rxjs';
import { ServicioAutenticacion } from '../servicios/autenticacion.servicio';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const servicioAuth = inject(ServicioAutenticacion);
  
  return next(req).pipe(
    retryWhen(errors =>
      errors.pipe(
        delay(1000),
        retry({ count: 2, delay: 1000 })
      )
    ),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token inválido o expirado
        console.warn('Token inválido o expirado. Cerrando sesión.');
        servicioAuth.cerrarSesion();
        router.navigate(['/autenticacion/login'], {
          queryParams: { returnUrl: router.routerState.root }
        });
      } else if (error.status === 403) {
        // Acceso denegado - permisos insuficientes
        router.navigate(['/sin-permisos']);
      } else if (error.status === 503) {
        // Sistema en mantenimiento
        router.navigate(['/mantenimiento']);
      } else if (error.status === 0) {
        // Error de conectividad
        console.error('Error de conectividad. Por favor verifica tu conexión de red.');
      }
      
      return throwError(() => ({
        status: error.status,
        message: error.message,
        error: error.error
      }));
    })
  );
};

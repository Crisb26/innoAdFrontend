import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, retry, delay, take } from 'rxjs';
import { ServicioAutenticacion } from '../servicios/autenticacion.servicio';
import NotifyX from 'notifyx';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const servicioAuth = inject(ServicioAutenticacion);
  
  return next(req).pipe(
    retry({ 
      count: 2, 
      delay: (error: HttpErrorResponse) => {
        // No reintentar en errores 401, 403, 404
        if ([401, 403, 404].includes(error.status)) {
          return throwError(() => error);
        }
        return delay(1000);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      const mensajeErrorDetallado = error.error?.mensaje || error.message || 'Error desconocido';
      
      if (error.status === 401) {
        // Token inválido o expirado - NO cerrar sesión automáticamente en gráficos
        console.warn('Token inválido o expirado (401):', mensajeErrorDetallado);
        
        // Intentar refrescar token
        servicioAuth.refrescarToken().pipe(take(1)).subscribe({
          next: () => {
            NotifyX.info('Sesión renovada. Por favor, reintenta tu acción.', {
              duration: 3000,
              dismissible: true
            });
            // El usuario puede reintentar su acción
          },
          error: () => {
            // Si no se puede refrescar, entonces cerrar sesión
            NotifyX.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', {
              duration: 3000,
              dismissible: true
            });
            servicioAuth.cerrarSesion();
            router.navigate(['/autenticacion/login'], {
              queryParams: { returnUrl: router.url }
            });
          }
        });
      } else if (error.status === 403) {
        // Acceso denegado - permisos insuficientes
        console.warn('Acceso denegado (403):', mensajeErrorDetallado);
        NotifyX.warning('No tienes permisos para realizar esta acción.', {
          duration: 3000,
          dismissible: true
        });
        router.navigate(['/sin-permisos']);
      } else if (error.status === 404) {
        // Recurso no encontrado
        console.warn('Recurso no encontrado (404):', mensajeErrorDetallado);
        NotifyX.error('El recurso solicitado no fue encontrado.', {
          duration: 2000,
          dismissible: true
        });
      } else if (error.status === 503) {
        // Sistema en mantenimiento
        console.warn('Sistema en mantenimiento (503)');
        NotifyX.error('El sistema está en mantenimiento. Por favor, intenta más tarde.', {
          duration: 3000,
          dismissible: true
        });
        router.navigate(['/mantenimiento']);
      } else if (error.status === 0) {
        // Error de conectividad
        console.error('Error de conectividad:', error.message);
        NotifyX.error('Error de conectividad. Por favor, verifica tu conexión de red.', {
          duration: 3000,
          dismissible: true
        });
      } else if (error.status >= 500) {
        // Error del servidor
        console.error('Error del servidor:', error.status, mensajeErrorDetallado);
        NotifyX.error(`Error del servidor (${error.status}). Por favor, intenta más tarde.`, {
          duration: 3000,
          dismissible: true
        });
      }
      
      return throwError(() => ({
        status: error.status,
        message: mensajeErrorDetallado,
        error: error.error
      }));
    })
  );
};

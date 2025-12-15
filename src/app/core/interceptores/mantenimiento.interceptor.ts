import { Injectable, inject } from '@angular/core';
import { 
  HttpInterceptor, 
  HttpRequest, 
  HttpHandler, 
  HttpEvent,
  HttpResponse,
  HttpErrorResponse 
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class MantenimientoInterceptor implements HttpInterceptor {
  private router = inject(Router);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si recibimos 503 (Service Unavailable), redirigir a mantenimiento
        if (error.status === 503) {
          const modalMantenimiento = error.error?.enMantenimiento ?? false;
          if (modalMantenimiento) {
            this.router.navigate(['/mantenimiento']);
            return throwError(() => error);
          }
        }

        // Si recibimos 403 (Forbidden) con mensaje de mantenimiento
        if (error.status === 403 && error.error?.mensaje?.includes('mantenimiento')) {
          this.router.navigate(['/mantenimiento']);
          return throwError(() => error);
        }

        return throwError(() => error);
      })
    );
  }
}

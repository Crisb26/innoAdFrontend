import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ServicioMantenimiento } from '@core/servicios/mantenimiento.servicio';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuardMantenimiento implements CanActivate {
  private router = inject(Router);
  private servicioMantenimiento = inject(ServicioMantenimiento);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // Si es la ruta de mantenimiento, permitir
    if (state.url.includes('mantenimiento')) {
      return true;
    }

    // Verificar si hay acceso de admin guardado
    const adminMantenimiento = localStorage.getItem('admin_mantenimiento');
    if (adminMantenimiento === 'true') {
      return true;
    }

    // Verificar estado del mantenimiento
    return this.servicioMantenimiento.obtenerEstado().pipe(
      map((estado) => {
        if (estado.datos) {
          // Está en mantenimiento, redirigir
          this.router.navigate(['/mantenimiento']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        // Si hay error al obtener estado, permitir el acceso
        return of(true);
      })
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AdminService } from '../servicios/admin.service';
import { AutenticacionServicio } from '../servicios/autenticacion.servicio';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuardMantenimiento implements CanActivate {
  private router = inject(Router);
  private adminService = inject(AdminService);
  private autenticacionServicio = inject(AutenticacionServicio);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // Si es la ruta de mantenimiento, permitir
    if (state.url.includes('/mantenimiento') || state.url.includes('admin/mantenimiento')) {
      return true;
    }

    // Obtener usuario actual
    const usuarioActual = this.autenticacionServicio.obtenerUsuarioActual();
    const esAdmin = usuarioActual?.roles?.includes('ADMIN') || usuarioActual?.rol === 'ADMIN';

    // Si es admin, permitir siempre
    if (esAdmin) {
      return true;
    }

    // Verificar si el modo mantenimiento está activo
    const esMantenimiento = this.adminService.esMantenimientoActivo();
    if (esMantenimiento) {
      // Redirigir a página de mantenimiento
      this.router.navigate(['/mantenimiento']);
      return false;
    }

    return true;
  }
}


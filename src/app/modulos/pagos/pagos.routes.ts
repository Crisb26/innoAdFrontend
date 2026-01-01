import { Routes } from '@angular/router';
import { guardAutenticacion } from '@core/guards/autenticacion.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [guardAutenticacion]
  },
  {
    path: 'confirmacion/:id',
    loadComponent: () => import('./componentes/confirmacion-pago.component').then(m => m.ConfirmacionPagoComponent),
    canActivate: [guardAutenticacion]
  },
  {
    path: 'historial',
    loadComponent: () => import('./componentes/historial-pagos.component').then(m => m.HistorialPagosComponent),
    canActivate: [guardAutenticacion]
  }
];

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/mantenimiento-panel.component')
      .then(m => m.MantenimientoPanelComponent)
  },
  {
    path: 'alertas-tiempo-real',
    loadComponent: () => import('./componentes/centro-alertas-tiempo-real.component')
      .then(m => m.CentroAlertasTiempoRealComponent)
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./componentes/configuracion-mantenimiento.component')
      .then(m => m.ConfiguracionMantenimientoComponent)
  },
  {
    path: 'raspberrypi',
    loadComponent: () => import('./componentes/gestor-raspberrypi.component')
      .then(m => m.GestorRaspberryPiComponent)
  },
  {
    path: 'alertas',
    loadComponent: () => import('./componentes/alertas-sistema.component')
      .then(m => m.AlertasSistemaComponent)
  },
  {
    path: 'historial',
    loadComponent: () => import('./componentes/historial-mantenimiento.component')
      .then(m => m.HistorialMantenimientoComponent)
  }
];

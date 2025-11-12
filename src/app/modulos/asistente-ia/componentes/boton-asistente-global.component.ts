import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsistenteIAServicio } from '@core/servicios/asistente-ia.servicio';
import { AsistenteIAComponent } from './asistente-ia.component';

@Component({
  selector: 'app-boton-asistente-global',
  standalone: true,
  imports: [CommonModule, AsistenteIAComponent],
  styleUrls: ['./boton-asistente-global.component.scss'],
  template: `
    <app-asistente-ia></app-asistente-ia>
  `
})
export class BotonAsistenteGlobalComponent {
  private readonly asistenteService = inject(AsistenteIAServicio);

  constructor() {
    // Inicializar el asistente cuando el componente se carga
    this.asistenteService.inicializar();
  }
}
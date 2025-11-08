import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsistenteIAServicio } from '@core/servicios/asistente-ia.servicio';
import { AsistenteIAComponent } from './asistente-ia.component';

@Component({
  selector: 'app-boton-asistente-global',
  standalone: true,
  imports: [CommonModule, AsistenteIAComponent],
  template: `
    <!-- El componente AsistenteIA ya incluye su botón flotante y panel -->
    <app-asistente-ia></app-asistente-ia>
  `,
  styles: [`
    /* Este componente no necesita estilos propios ya que AsistenteIA se encarga de todo */
  `]
})
export class BotonAsistenteGlobalComponent {
  private readonly asistenteService = inject(AsistenteIAServicio);

  constructor() {
    // Inicializar el asistente cuando el componente se carga
    this.asistenteService.inicializar();
  }
}
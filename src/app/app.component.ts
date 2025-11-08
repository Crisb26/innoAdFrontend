import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BotonAsistenteGlobalComponent } from '@modulos/asistente-ia/componentes/boton-asistente-global.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BotonAsistenteGlobalComponent],
  template: `
    <router-outlet></router-outlet>
    <!-- Asistente IA global disponible en toda la aplicación -->
    <app-boton-asistente-global></app-boton-asistente-global>
  `,
  styles: []
})
export class AppComponent {
  title = 'InnoAd - Sistema de Gestión de Publicidad Digital';
}

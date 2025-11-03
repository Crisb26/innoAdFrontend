import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-lista-campanas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="contenedor-principal">
      <h1 class="titulo-seccion">Gestión de Campanas</h1>
      <p>Módulo en desarrollo...</p>
      <a routerLink="/dashboard" class="boton-innoad">Volver al Dashboard</a>
    </div>
  `
})
export class ListaCampanasComponent {}

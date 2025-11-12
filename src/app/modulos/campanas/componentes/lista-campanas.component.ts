import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavegacionAutenticadaComponent } from '@shared/componentes/navegacion-autenticada.component';

@Component({
  selector: 'app-lista-campanas',
  standalone: true,
  imports: [CommonModule, RouterLink, NavegacionAutenticadaComponent],
  styleUrls: ['./lista-campanas.component.scss'],
  template: `
    <app-navegacion-autenticada></app-navegacion-autenticada>
    
    <div class="contenedor-principal">
      <h1 class="titulo-seccion">Gestión de Campañas</h1>
      <p>Módulo en desarrollo...</p>
      <p>Aquí podrás crear, editar y gestionar todas tus campañas publicitarias.</p>
      
      <div class="acciones-principales">
        <a routerLink="/campanas/crear" class="boton-primario">
          <span class="icono">➕</span>
          Nueva Campaña
        </a>
        <a routerLink="/dashboard" class="boton-secundario">
          <span class="icono">🏠</span>
          Volver al Dashboard
        </a>
      </div>
    </div>
  `
})
export class ListaCampanasComponent {}

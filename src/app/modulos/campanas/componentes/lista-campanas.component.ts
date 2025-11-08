import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavegacionAutenticadaComponent } from '@shared/componentes/navegacion-autenticada.component';

@Component({
  selector: 'app-lista-campanas',
  standalone: true,
  imports: [CommonModule, RouterLink, NavegacionAutenticadaComponent],
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
  `,
  styles: [`
    .contenedor-principal {
      min-height: 100vh;
      background: linear-gradient(135deg, var(--fondo-oscuro, #0f172a) 0%, var(--fondo-medio, #1e293b) 100%);
      padding: 2rem;
    }

    .titulo-seccion {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #00d9ff, #ff006a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-align: center;
      margin-bottom: 2rem;
      font-weight: 700;
    }

    .acciones-principales {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }

    .boton-primario, .boton-secundario {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .boton-primario {
      background: linear-gradient(135deg, var(--color-primario, #00d4ff), var(--color-secundario, #8b5cf6));
      color: white;
    }

    .boton-primario:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0, 212, 255, 0.3);
    }

    .boton-secundario {
      background: rgba(255, 255, 255, 0.1);
      color: var(--color-texto-claro, #b4b8d0);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .boton-secundario:hover {
      background: rgba(255, 255, 255, 0.2);
      color: var(--color-texto, #ffffff);
    }

    .icono {
      font-size: 1.1rem;
    }

    p {
      text-align: center;
      color: var(--color-texto-claro, #b4b8d0);
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }
  `]
})
export class ListaCampanasComponent {}

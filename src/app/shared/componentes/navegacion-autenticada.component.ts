import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ServicioAutenticacion } from '@core/servicios/autenticacion.servicio';

@Component({
  selector: 'app-navegacion-autenticada',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrls: ['./navegacion-autenticada.component.scss'],
  template: `
    <nav class="navbar-innoad">
      <div class="nav-content">
        <!-- Logo y Botón de Inicio -->
        <div class="nav-logo">
          <a routerLink="/inicio" class="logo-link">
            <div class="logo">
              <span class="logo-icon">🚀</span>
              <div class="logo-texto">
                <h1>InnoAd</h1>
                <span class="logo-subtitle">Publicidad Digital</span>
              </div>
            </div>
          </a>
        </div>

        <!-- Navegación Principal -->
        <div class="nav-links">
          <a routerLink="/dashboard" class="nav-item" routerLinkActive="active">
            <span class="nav-icon">🏠</span>
            Dashboard
          </a>
          <a routerLink="/campanas" class="nav-item" routerLinkActive="active">
            <span class="nav-icon">📢</span>
            Campañas
          </a>
          <a routerLink="/pantallas" class="nav-item" routerLinkActive="active">
            <span class="nav-icon">📺</span>
            Pantallas
          </a>
          <a routerLink="/contenidos" class="nav-item" routerLinkActive="active">
            <span class="nav-icon">🎨</span>
            Contenidos
          </a>
          @if (esAdministrador()) {
            <a routerLink="/admin" class="nav-item nav-admin" routerLinkActive="active">
              <span class="nav-icon">👑</span>
              Admin
            </a>
          }
        </div>

        <!-- Menu de Usuario -->
        <div class="user-menu" [class.open]="menuAbierto" (click)="toggleMenu()">
          <div class="user-button">
            <div class="user-avatar">
              {{ inicialUsuario() }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ nombreUsuario() }}</span>
              <span class="user-role">{{ rolUsuario() }}</span>
            </div>
            <span class="dropdown-arrow">▼</span>
          </div>

          <!-- Dropdown Menu -->
          @if (menuAbierto) {
            <div class="dropdown-menu">
              <a routerLink="/inicio" class="dropdown-item" (click)="cerrarMenu()">
                <span class="dropdown-icon">🌐</span>
                Página de Inicio
              </a>
              <a routerLink="/dashboard" class="dropdown-item" (click)="cerrarMenu()">
                <span class="dropdown-icon">📊</span>
                Mi Dashboard
              </a>
              <a routerLink="/publicar" class="dropdown-item" (click)="cerrarMenu()">
                <span class="dropdown-icon">📤</span>
                Publicar Contenido
              </a>
              <a routerLink="/reportes" class="dropdown-item" (click)="cerrarMenu()">
                <span class="dropdown-icon">📈</span>
                Mis Reportes
              </a>
              @if (esAdministrador()) {
                <hr class="dropdown-divider">
                <a routerLink="/admin" class="dropdown-item" (click)="cerrarMenu()">
                  <span class="dropdown-icon">👑</span>
                  Panel Admin
                </a>
              }
              <hr class="dropdown-divider">
              <button class="dropdown-item logout-item" (click)="cerrarSesion()">
                <span class="dropdown-icon">🚪</span>
                Cerrar Sesión
              </button>
            </div>
          }
        </div>
      </div>
    </nav>
  `
})
export class NavegacionAutenticadaComponent {
  private readonly servicioAuth = inject(ServicioAutenticacion);
  private readonly router = inject(Router);

  protected menuAbierto = false;

  protected nombreUsuario(): string {
    const usuario = this.servicioAuth.usuarioActual();
    return usuario?.nombreCompleto || usuario?.nombreUsuario || 'Usuario';
  }

  protected rolUsuario(): string {
    const usuario = this.servicioAuth.usuarioActual();
    return usuario?.rol?.nombre || 'Usuario';
  }

  protected inicialUsuario(): string {
    const nombre = this.nombreUsuario();
    return nombre.charAt(0).toUpperCase();
  }

  protected esAdministrador(): boolean {
    const usuario = this.servicioAuth.usuarioActual();
    return usuario?.rol?.nombre === 'Administrador' || false;
  }

  protected toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  protected cerrarMenu(): void {
    this.menuAbierto = false;
  }

  protected cerrarSesion(): void {
    this.servicioAuth.cerrarSesion();
    this.cerrarMenu();
  }
}
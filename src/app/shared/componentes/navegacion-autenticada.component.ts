import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ServicioAutenticacion } from '@core/servicios/autenticacion.servicio';

@Component({
  selector: 'app-navegacion-autenticada',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
  `,
  styles: [`
    .navbar-innoad {
      background: linear-gradient(135deg, var(--fondo-oscuro, #0f172a) 0%, var(--fondo-medio, #1e293b) 100%);
      border-bottom: 1px solid rgba(0, 212, 255, 0.2);
      padding: 0.75rem 0;
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(10px);
    }

    .nav-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    /* Logo */
    .nav-logo {
      flex-shrink: 0;
    }

    .logo-link {
      text-decoration: none;
      color: inherit;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      font-size: 2rem;
      filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.5));
    }

    .logo-texto h1 {
      font-size: 1.5rem;
      background: linear-gradient(135deg, #00d9ff, #ff006a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
      font-weight: 700;
    }

    .logo-subtitle {
      font-size: 0.7rem;
      color: var(--color-texto-claro, #b4b8d0);
      display: block;
      line-height: 1;
    }

    /* Navegación Principal */
    .nav-links {
      display: flex;
      gap: 1rem;
      flex: 1;
      justify-content: center;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      text-decoration: none;
      color: var(--color-texto-claro, #b4b8d0);
      font-weight: 500;
      transition: all 0.3s ease;
      border: 1px solid transparent;
    }

    .nav-item:hover {
      background: rgba(0, 212, 255, 0.1);
      color: var(--color-primario, #00d4ff);
      border-color: rgba(0, 212, 255, 0.3);
    }

    .nav-item.active {
      background: rgba(0, 212, 255, 0.15);
      color: var(--color-primario, #00d4ff);
      border-color: var(--color-primario, #00d4ff);
    }

    .nav-admin {
      background: rgba(245, 158, 11, 0.1);
      border-color: rgba(245, 158, 11, 0.3);
      color: #f59e0b;
    }

    .nav-admin:hover, .nav-admin.active {
      background: rgba(245, 158, 11, 0.2);
      border-color: #f59e0b;
      color: #f59e0b;
    }

    .nav-icon {
      font-size: 1.1rem;
    }

    /* Menu de Usuario */
    .user-menu {
      position: relative;
      cursor: pointer;
      user-select: none;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 1rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .user-button:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--color-primario, #00d4ff);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primario, #00d4ff), var(--color-secundario, #8b5cf6));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: white;
      font-size: 1.1rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .user-name {
      color: var(--color-texto, #ffffff);
      font-weight: 600;
      font-size: 0.9rem;
    }

    .user-role {
      color: var(--color-texto-claro, #b4b8d0);
      font-size: 0.75rem;
    }

    .dropdown-arrow {
      color: var(--color-texto-claro, #b4b8d0);
      font-size: 0.8rem;
      transition: transform 0.3s ease;
    }

    .user-menu.open .dropdown-arrow {
      transform: rotate(180deg);
    }

    /* Dropdown Menu */
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.5rem;
      min-width: 220px;
      background: var(--fondo-oscuro, #0f172a);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      padding: 0.5rem;
      z-index: 1001;
      animation: dropdownAppear 0.3s ease-out;
    }

    @keyframes dropdownAppear {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      text-decoration: none;
      color: var(--color-texto-claro, #b4b8d0);
      font-size: 0.9rem;
      transition: all 0.3s ease;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
    }

    .dropdown-item:hover {
      background: rgba(0, 212, 255, 0.1);
      color: var(--color-primario, #00d4ff);
    }

    .logout-item {
      color: #ff6b6b;
    }

    .logout-item:hover {
      background: rgba(255, 107, 107, 0.1);
      color: #ff6b6b;
    }

    .dropdown-icon {
      font-size: 1rem;
      width: 20px;
      text-align: center;
    }

    .dropdown-divider {
      border: none;
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 0.5rem 0;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .nav-links {
        gap: 0.5rem;
      }

      .nav-item {
        padding: 0.5rem 0.75rem;
        font-size: 0.9rem;
      }
    }

    @media (max-width: 768px) {
      .nav-content {
        padding: 0 1rem;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .nav-links {
        order: 3;
        width: 100%;
        justify-content: space-around;
        background: rgba(255, 255, 255, 0.05);
        padding: 0.5rem;
        border-radius: 8px;
        margin-top: 0.5rem;
      }

      .nav-item {
        padding: 0.5rem;
        font-size: 0.8rem;
      }

      .logo-texto h1 {
        font-size: 1.3rem;
      }

      .logo-subtitle {
        font-size: 0.6rem;
      }

      .user-info {
        display: none;
      }

      .dropdown-menu {
        right: 0;
        min-width: 200px;
      }
    }

    @media (max-width: 480px) {
      .nav-links {
        flex-wrap: wrap;
      }

      .nav-item {
        flex: 1;
        min-width: 80px;
        text-align: center;
        justify-content: center;
      }
    }
  `]
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
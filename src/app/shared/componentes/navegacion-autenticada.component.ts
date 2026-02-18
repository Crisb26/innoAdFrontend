import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AyudaService } from '@core/servicios/ayuda.servicio';
import { ServicioAutenticacion } from '@core/servicios/autenticacion.servicio';
import { EditarPerfilComponent } from './editar-perfil.component';

@Component({
  selector: 'app-navegacion-autenticada',
  standalone: true,
  imports: [CommonModule, RouterLink, EditarPerfilComponent],
  styleUrls: ['./navegacion-autenticada.component.scss'],
  template: `
    <nav class="navbar-innoad">
      <div class="nav-content">
        <!-- Logo (Sin enlace - no se puede salir desde aquí) -->
        <div class="nav-logo">
          <div class="logo">
            <span class="logo-icon"></span>
            <div class="logo-texto">
              <h1>InnoAd</h1>
              <span class="logo-subtitle">Publicidad Digital</span>
            </div>
          </div>
        </div>

        <!-- Navegación Principal (Filtrada por Rol) -->
        <div class="nav-links">
          <a routerLink="/dashboard" class="nav-item" routerLinkActive="active">
            <span class="nav-icon"></span>
            Dashboard
          </a>
          @if (tieneAccesoCampanas()) {
            <a routerLink="/campanas" class="nav-item" routerLinkActive="active">
              <span class="nav-icon"></span>
              Campañas
            </a>
          }
          @if (tieneAccesoPantallas()) {
            <a routerLink="/pantallas" class="nav-item" routerLinkActive="active">
              <span class="nav-icon"></span>
              Pantallas
            </a>
          }
          @if (tieneAccesoContenidos()) {
            <a routerLink="/contenidos" class="nav-item" routerLinkActive="active">
              <span class="nav-icon"></span>
              Contenidos
            </a>
          }
          @if (tieneAccesoReportes()) {
            <a routerLink="/reportes" class="nav-item" routerLinkActive="active">
              <span class="nav-icon"></span>
              Reportes
            </a>
          }
          @if (esAdministrador()) {
            <a routerLink="/admin" class="nav-item nav-admin" routerLinkActive="active">
              <span class="nav-icon"></span>
              Admin
            </a>
          }
        </div>

        

        <!-- Menu de Usuario -->
        <div class="user-menu" [class.open]="menuAbierto()" (click)="toggleMenu()">
          <div class="user-button">
            <div class="user-avatar">
              @if (avatarUrl()) {
                <img [src]="avatarUrl()" [alt]="nombreUsuario()" />
              } @else {
                <span class="avatar-text">{{ inicialUsuario() }}</span>
              }
            </div>
            <div class="user-info">
              <span class="user-name">{{ nombreUsuario() }}</span>
              <span class="user-role">{{ rolUsuario() }}</span>
            </div>
            <span class="dropdown-arrow" [class.rotated]="menuAbierto()">▼</span>
          </div>

          <!-- Dropdown Menu -->
          @if (menuAbierto()) {
            <div class="dropdown-menu" (click)="$event.stopPropagation()">
              <div class="dropdown-header">
                <div class="dropdown-avatar">
                  @if (avatarUrl()) {
                    <img [src]="avatarUrl()" [alt]="nombreUsuario()" />
                  } @else {
                    <span class="avatar-text">{{ inicialUsuario() }}</span>
                  }
                </div>
                <div class="dropdown-user-info">
                  <strong>{{ nombreUsuario() }}</strong>
                  <span>{{ emailUsuario() }}</span>
                  <span class="badge-role">{{ rolUsuario() }}</span>
                </div>
              </div>

              <hr class="dropdown-divider">

              <button class="dropdown-item" (click)="editarPerfil()">
                <span class="dropdown-icon"></span>
                Editar Mi Perfil
              </button>

              <hr class="dropdown-divider">

              <a routerLink="/dashboard" class="dropdown-item" (click)="cerrarMenu()">
                <span class="dropdown-icon"></span>
                Mi Dashboard
              </a>
              <a routerLink="/publicar" class="dropdown-item" (click)="cerrarMenu()">
                <span class="dropdown-icon"></span>
                Publicar Contenido
              </a>
              <a routerLink="/reportes" class="dropdown-item" (click)="cerrarMenu()">
                <span class="dropdown-icon"></span>
                Mis Reportes
              </a>
              @if (esAdministrador()) {
                <hr class="dropdown-divider">
                <a routerLink="/admin" class="dropdown-item" (click)="cerrarMenu()">
                  <span class="dropdown-icon"></span>
                  Panel Admin
                </a>
              }
              
              <hr class="dropdown-divider">
              
              <button class="dropdown-item logout-item" (click)="cerrarSesion()">
                <span class="dropdown-icon"></span>
                Cerrar Sesión
              </button>
            </div>
          }
        </div>
      </div>
    </nav>

    <!-- Modal de Editar Perfil -->
    @if (mostrarModalPerfil()) {
      <app-editar-perfil (cerrar)="cerrarModalPerfil()" />
    }
  `
})
export class NavegacionAutenticadaComponent implements OnInit {
  private readonly servicioAuth = inject(ServicioAutenticacion);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly ayuda = inject(AyudaService);
  

  protected readonly menuAbierto = signal(false);
  protected readonly mostrarModalPerfil = signal(false);

  protected nombreUsuario(): string {
    const usuario = this.servicioAuth.usuarioActual();
    return usuario?.nombreCompleto || usuario?.nombreUsuario || 'Usuario';
  }

  protected emailUsuario(): string {
    const usuario = this.servicioAuth.usuarioActual();
    return usuario?.email || '';
  }

  protected rolUsuario(): string {
    const usuario = this.servicioAuth.usuarioActual();
    const rol = usuario?.rol?.nombre || 'Usuario';
    return this.formatearNombreRol(rol);
  }

  private formatearNombreRol(rol: string): string {
    const rolesMap: { [key: string]: string } = {
      'Developer': 'Desarrollador',
      'developer': 'Desarrollador',
      'Admin': 'Administrador',
      'Administrador': 'Administrador',
      'administrador': 'Administrador',
      'Tecnico': 'Técnico',
      'tecnico': 'Técnico',
      'Usuario': 'Usuario',
      'usuario': 'Usuario',
      'User': 'Usuario',
      'user': 'Usuario'
    };
    return rolesMap[rol] || rol;
  }

  protected avatarUrl(): string | null {
    const usuario = this.servicioAuth.usuarioActual();
    return usuario?.avatarUrl || null;
  }

  protected inicialUsuario(): string {
    const nombre = this.nombreUsuario();
    return nombre.charAt(0).toUpperCase();
  }

  protected esAdministrador(): boolean {
    const usuario = this.servicioAuth.usuarioActual();
    return usuario?.rol?.nombre === 'Administrador' || false;
  }

  protected tieneAccesoCampanas(): boolean {
    const usuario = this.servicioAuth.usuarioActual();
    const rol = usuario?.rol?.nombre?.toUpperCase() || '';
    // ADMINISTRADOR, TECNICO, USUARIO pueden acceder
    return ['ADMINISTRADOR', 'TECNICO', 'USUARIO'].includes(rol);
  }

  protected tieneAccesoPantallas(): boolean {
    const usuario = this.servicioAuth.usuarioActual();
    const rol = usuario?.rol?.nombre?.toUpperCase() || '';
    // ADMINISTRADOR, TECNICO, USUARIO pueden acceder (USUARIO solo ve sus pantallas)
    return ['ADMINISTRADOR', 'TECNICO', 'USUARIO'].includes(rol);
  }

  protected tieneAccesoContenidos(): boolean {
    const usuario = this.servicioAuth.usuarioActual();
    const rol = usuario?.rol?.nombre?.toUpperCase() || '';
    // ADMINISTRADOR, TECNICO, USUARIO pueden acceder
    return ['ADMINISTRADOR', 'TECNICO', 'USUARIO'].includes(rol);
  }

  protected tieneAccesoReportes(): boolean {
    const usuario = this.servicioAuth.usuarioActual();
    const rol = usuario?.rol?.nombre?.toUpperCase() || '';
    // ADMIN, TECNICO, USUARIO pueden acceder
    return ['ADMINISTRADOR', 'ADMIN', 'TECNICO', 'USUARIO'].includes(rol);
  }

  protected toggleMenu(): void {
    this.menuAbierto.update(v => !v);
    console.log('Menu abierto:', this.menuAbierto());
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
    console.log('Menu cerrado');
  }

  protected editarPerfil(): void {
    this.mostrarModalPerfil.set(true);
    this.cerrarMenu();
  }

  protected cerrarModalPerfil(): void {
    this.mostrarModalPerfil.set(false);
  }

  protected cerrarSesion(): void {
    this.servicioAuth.cerrarSesion();
    this.cerrarMenu();
  }

  ngOnInit(): void {
    // Escuchar cambios de ruta y lanzar tour por primera vez según la ruta
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      const path = this.router.url.split('?')[0];
      // Rutas con tours de ejemplo. Mantener textos flotantes para no alterar templates.
      if (path.startsWith('/campanas')) {
        this.ayuda.startTourOnce('campanas', [
          { intro: 'Bienvenido al módulo de Campañas: aquí puedes crear y gestionar tus campañas publicitarias.' },
          { intro: 'Usa el botón "Crear Campaña" para abrir el formulario y configurar fechas, pantallas y descripción.' },
          { intro: 'Filtra y ordena tus campañas para encontrar rápidamente las activas o programadas.' }
        ], { showProgress: true });
      } else if (path.startsWith('/publicar') || path.startsWith('/publicacion')) {
        this.ayuda.startTourOnce('publicar', [
          { intro: 'Pantalla de publicación: aquí configuras contenido y ubicaciones donde se mostrará.' },
          { intro: 'Revisa las previsualizaciones antes de confirmar la publicación.' }
        ]);
      } else if (path.startsWith('/dashboard')) {
        this.ayuda.startTourOnce('dashboard', [
          { intro: 'Tu Dashboard muestra métricas clave y accesos rápidos a módulos importantes.' }
        ]);
      }
    });
  }

  
}
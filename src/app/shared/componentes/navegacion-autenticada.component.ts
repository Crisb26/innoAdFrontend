import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AyudaService } from '@core/servicios/ayuda.servicio';
import { ServicioAutenticacion } from '@core/servicios/autenticacion.servicio';
import { EditarPerfilComponent } from './editar-perfil.component';
import { ToggleTemaComponent } from './toggle-tema.component';
import { OnboardingTutorialComponent } from './onboarding-tutorial.component';

@Component({
  selector: 'app-navegacion-autenticada',
  standalone: true,
  imports: [CommonModule, RouterLink, EditarPerfilComponent, ToggleTemaComponent, OnboardingTutorialComponent],
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
          <a routerLink="/dashboard" class="nav-item" routerLinkActive="active" title="Tu dashboard personal">
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
            <a routerLink="/admin" class="nav-item nav-admin" routerLinkActive="active" title="Panel de administración del sistema">
              <span class="nav-icon"></span>
              Admin
            </a>
          }
        </div>

        <!-- Toggle Tema -->
        <app-toggle-tema></app-toggle-tema>

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

              @if (esTecnico()) {
                <hr class="dropdown-divider">
                <span class="dropdown-header-text">Funciones Técnico</span>
                <a routerLink="/pantallas" class="dropdown-item" (click)="cerrarMenu()">
                  <span class="dropdown-icon"></span>
                  Gestionar Pantallas
                </a>
                <a routerLink="/contenidos" class="dropdown-item" (click)="cerrarMenu()">
                  <span class="dropdown-icon"></span>
                  Revisar Contenidos
                </a>
              }

              @if (esUsuario()) {
                <hr class="dropdown-divider">
                <a routerLink="/contenidos/crear" class="dropdown-item" (click)="cerrarMenu()">
                  <span class="dropdown-icon"></span>
                  Subir Contenido
                </a>
              }

              <a routerLink="/reportes" class="dropdown-item" (click)="cerrarMenu()">
                <span class="dropdown-icon"></span>
                Mis Reportes
              </a>

              <a routerLink="/chat" class="dropdown-item" (click)="cerrarMenu()">
                <span class="dropdown-icon"></span>
                Soporte Técnico
              </a>

              @if (esAdministrador()) {
                <hr class="dropdown-divider">
                <span class="dropdown-header-text">Funciones Admin</span>
                <a routerLink="/admin" class="dropdown-item" (click)="cerrarMenu()">
                  <span class="dropdown-icon"></span>
                  Panel de Control
                </a>
                <a routerLink="/admin/usuarios" class="dropdown-item" (click)="cerrarMenu()">
                  <span class="dropdown-icon"></span>
                  Gestionar Usuarios
                </a>
                <a routerLink="/admin/roles" class="dropdown-item" (click)="cerrarMenu()">
                  <span class="dropdown-icon"></span>
                  Configurar Roles
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

    <!-- Tutorial de bienvenida para nuevos usuarios -->
    <app-onboarding-tutorial />
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
    const rol = this.obtenerRolNombre() || 'Usuario';
    return this.formatearNombreRol(rol);
  }

  private formatearNombreRol(rol: string): string {
    // Mapeo de roles del backend (ADMIN, TECNICO, USUARIO) a display
    const rolesMap: { [key: string]: string } = {
      'ADMIN': '👑 Administrador',
      'Admin': '👑 Administrador',
      'Administrador': '👑 Administrador',
      'administrador': '👑 Administrador',
      'TECNICO': '🔧 Técnico',
      'Tecnico': '🔧 Técnico',
      'tecnico': '🔧 Técnico',
      'Técnico': '🔧 Técnico',
      'USUARIO': '👤 Usuario',
      'Usuario': '👤 Usuario',
      'usuario': '👤 Usuario',
      'User': '👤 Usuario',
      'user': '👤 Usuario',
      'Developer': '👨‍💻 Desarrollador',
      'developer': '👨‍💻 Desarrollador'
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
    const rol = this.obtenerRolNombreUpper();
    return rol === 'ADMIN' || rol === 'ADMINISTRADOR';
  }

  protected esTecnico(): boolean {
    const rol = this.obtenerRolNombreUpper();
    return rol === 'TECNICO' || this.esAdministrador();
  }

  protected esUsuario(): boolean {
    const rol = this.obtenerRolNombreUpper();
    return rol === 'USUARIO' || this.esAdministrador();
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
    const rol = this.obtenerRolNombreUpper();
    // ADMIN, TECNICO, USUARIO pueden acceder
    return ['ADMINISTRADOR', 'ADMIN', 'TECNICO', 'USUARIO'].includes(rol);
  }

  private obtenerRolNombre(): string {
    const usuario: any = this.servicioAuth.usuarioActual();
    const rol = usuario?.rol;

    if (typeof rol === 'string') {
      return rol;
    }

    if (rol && typeof rol === 'object' && typeof rol.nombre === 'string') {
      return rol.nombre;
    }

    if (Array.isArray(usuario?.roles) && usuario.roles.length > 0) {
      return usuario.roles[0];
    }

    return '';
  }

  private obtenerRolNombreUpper(): string {
    return this.obtenerRolNombre().toUpperCase();
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
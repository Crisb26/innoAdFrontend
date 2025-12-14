import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ControlMantenimientoComponent } from './control-mantenimiento.component';
import { GestionUsuariosComponent } from './gestion-usuarios.component';
import { LogsAuditoriaComponent } from './logs-auditoria.component';
import { MonitoreoSistemaComponent } from './monitoreo-sistema.component';
import { ServicioAutenticacion } from '@core/servicios/autenticacion.servicio';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    ControlMantenimientoComponent,
    GestionUsuariosComponent,
    LogsAuditoriaComponent,
    MonitoreoSistemaComponent
  ],
  styleUrls: ['./dashboard-admin.component.scss'],
  template: `
    <div class="contenedor-dashboard-admin">
      <!-- Sección de Bienvenida -->
      <div class="seccion-bienvenida">
        <h1 class="titulo-bienvenida">¡Bienvenido, {{ usuarioActual() }}!</h1>
        <p class="subtitulo-bienvenida">Gestiona tu contenido digital de manera inteligente</p>
      </div>

      <!-- Header Admin -->
      <div class="header-admin">
        <div class="titulo-admin">
          <h1>👑 Panel de Administración</h1>
          <p>Control total del sistema InnoAd</p>
        </div>
        <div class="info-admin">
          <div class="badge-admin">Administrador</div>
          <div class="usuario-actual">{{ usuarioActual() }}</div>
        </div>
      </div>

      <!-- Control de Mantenimiento (Prioritario) -->
      <div class="seccion-critica">
        <app-control-mantenimiento></app-control-mantenimiento>
      </div>

      <!-- Navegación por Pestañas -->
      <div class="pestanas-admin">
        <button 
          class="pestana" 
          [class.activa]="pestanaActiva() === 'dashboard'"
          (click)="cambiarPestana('dashboard')"
        >
          📊 Dashboard
        </button>
        <button 
          class="pestana" 
          [class.activa]="pestanaActiva() === 'usuarios'"
          (click)="cambiarPestana('usuarios')"
        >
          👥 Usuarios
        </button>
        <button 
          class="pestana" 
          [class.activa]="pestanaActiva() === 'logs'"
          (click)="cambiarPestana('logs')"
        >
          📋 Logs
        </button>
        <button 
          class="pestana" 
          [class.activa]="pestanaActiva() === 'monitoreo'"
          (click)="cambiarPestana('monitoreo')"
        >
          🖥️ Monitoreo
        </button>
      </div>

      <!-- Contenido por Pestañas -->
      <div class="contenido-pestana">
        @if (pestanaActiva() === 'dashboard') {
          <!-- Dashboard Principal -->
          <div class="grid-admin">
            <!-- Estadísticas Rápidas -->
            <div class="tarjeta-admin tarjeta-estadisticas">
              <div class="header-tarjeta">
                <h3>📊 Estadísticas del Sistema</h3>
                <span class="badge-nuevo">En Tiempo Real</span>
              </div>
              <div class="contenido-estadisticas">
                <div class="stat-item">
                  <div class="stat-numero">{{ totalUsuarios() }}</div>
                  <div class="stat-label">Usuarios Totales</div>
                </div>
                <div class="stat-item">
                  <div class="stat-numero">{{ pantallasActivas() }}</div>
                  <div class="stat-label">Pantallas Activas</div>
                </div>
                <div class="stat-item">
                  <div class="stat-numero">{{ contenidosActivos() }}</div>
                  <div class="stat-label">Contenidos Activos</div>
                </div>
                <div class="stat-item">
                  <div class="stat-numero">{{ campanasActivas() }}</div>
                  <div class="stat-label">Campañas Activas</div>
                </div>
              </div>
              <button class="btn-detalle" routerLink="/reportes">
                Ver Reportes Completos →
              </button>
            </div>

        <!-- Gestión de Usuarios -->
        <div class="tarjeta-admin tarjeta-usuarios">
          <div class="header-tarjeta">
            <h3>Gestión de Usuarios</h3>
            <span class="badge-importante">Admin Only</span>
          </div>
          <div class="contenido-usuarios">
            <div class="acciones-usuarios">
              <button class="btn-accion btn-crear">
                <span class="icono"></span>
                Crear Usuario
              </button>
              <button class="btn-accion btn-buscar">
                <span class="icono"></span>
                Buscar Usuarios
              </button>
              <button class="btn-accion btn-roles">
                <span class="icono"></span>
                Gestionar Roles
              </button>
            </div>
            <div class="usuarios-recientes">
              <h4>Usuarios Recientes</h4>
              <div class="lista-usuarios">
                <!-- Placeholder para usuarios recientes -->
                <div class="usuario-item">
                  <div class="avatar-usuario">👤</div>
                  <div class="info-usuario">
                    <div class="nombre-usuario">Últimos registros aparecerán aquí</div>
                    <div class="rol-usuario">Al conectar con el backend</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Monitoreo de Pantallas -->
        <div class="tarjeta-admin tarjeta-pantallas">
          <div class="header-tarjeta">
            <h3>📺 Monitoreo de Pantallas</h3>
            <span class="badge-estado estado-online">{{ pantallasOnline() }} Online</span>
          </div>
          <div class="contenido-pantallas">
            <div class="mapa-pantallas">
              <div class="pantalla-status online">
                <div class="pantalla-icon">📱</div>
                <div class="pantalla-info">
                  <div class="pantalla-nombre">Pantalla Demo 1</div>
                  <div class="pantalla-estado">Online - Reproduciendo</div>
                </div>
              </div>
              <div class="pantalla-status offline">
                <div class="pantalla-icon">📱</div>
                <div class="pantalla-info">
                  <div class="pantalla-nombre">Pantalla Demo 2</div>
                  <div class="pantalla-estado">Offline - Sin conexión</div>
                </div>
              </div>
            </div>
            <div class="acciones-pantallas">
              <button class="btn-accion-pequeño" routerLink="/pantallas">
                Ver Todas
              </button>
              <button class="btn-accion-pequeño btn-refresh" (click)="actualizarDatos()">
                🔄 Actualizar
              </button>
            </div>
          </div>
        </div>

        <!-- Sistema de Auditoría -->
        <div class="tarjeta-admin tarjeta-auditoria">
          <div class="header-tarjeta">
            <h3>🔍 Auditoría y Logs</h3>
            <span class="badge-warning">{{ logsRecientes() }} Nuevos</span>
          </div>
          <div class="contenido-auditoria">
            <div class="logs-recientes">
              <div class="log-item">
                <div class="log-tiempo">Hace 2 min</div>
                <div class="log-accion">Usuario admin activó modo mantenimiento</div>
              </div>
              <div class="log-item">
                <div class="log-tiempo">Hace 15 min</div>
                <div class="log-accion">Nueva pantalla registrada: Pantalla-001</div>
              </div>
              <div class="log-item">
                <div class="log-tiempo">Hace 1 hora</div>
                <div class="log-accion">Contenido subido por editor123</div>
              </div>
            </div>
            <div class="acciones-auditoria">
              <button class="btn-accion-pequeño">Ver Todos los Logs</button>
              <button class="btn-accion-pequeño">Exportar</button>
            </div>
          </div>
        </div>

        <!-- Configuración del Sistema -->
        <div class="tarjeta-admin tarjeta-configuracion">
          <div class="header-tarjeta">
            <h3>⚙️ Configuración</h3>
          </div>
          <div class="contenido-configuracion">
            <div class="config-opciones">
              <div class="config-item">
                <div class="config-label">🔐 Códigos de Seguridad</div>
                <button class="btn-config">Gestionar</button>
              </div>
              <div class="config-item">
                <div class="config-label">📧 Configuración Email</div>
                <button class="btn-config">Configurar</button>
              </div>
              <div class="config-item">
                <div class="config-label">🎨 Personalización</div>
                <button class="btn-config">Personalizar</button>
              </div>
              <div class="config-item">
                <div class="config-label">💾 Backup y Restore</div>
                <button class="btn-config">Gestionar</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Accesos Rápidos -->
        <div class="tarjeta-admin tarjeta-accesos">
          <div class="header-tarjeta">
            <h3>🚀 Accesos Rápidos</h3>
          </div>
          <div class="contenido-accesos">
            <div class="grid-accesos-rapidos">
              <a routerLink="/campanas" class="acceso-rapido">
                <span class="icono-acceso">📢</span>
                <span class="label-acceso">Campañas</span>
              </a>
              <a routerLink="/pantallas" class="acceso-rapido">
                <span class="icono-acceso">📺</span>
                <span class="label-acceso">Pantallas</span>
              </a>
              <a routerLink="/contenidos" class="acceso-rapido">
                <span class="icono-acceso">🎨</span>
                <span class="label-acceso">Contenidos</span>
              </a>
              <a routerLink="/reportes" class="acceso-rapido">
                <span class="icono-acceso">📊</span>
                <span class="label-acceso">Reportes</span>
              </a>
              <a routerLink="/publicar" class="acceso-rapido">
                <span class="icono-acceso">📤</span>
                <span class="label-acceso">Publicar</span>
              </a>
              <a routerLink="/inicio" class="acceso-rapido">
                <span class="icono-acceso">🏠</span>
                <span class="label-acceso">Página Pública</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    }

    @if (pestanaActiva() === 'usuarios') {
      <app-gestion-usuarios></app-gestion-usuarios>
    }

    @if (pestanaActiva() === 'logs') {
      <app-logs-auditoria></app-logs-auditoria>
    }

    @if (pestanaActiva() === 'monitoreo') {
      <app-monitoreo-sistema></app-monitoreo-sistema>
    }
  </div>
</div>
  `
})
export class DashboardAdminComponent implements OnInit {
  private readonly servicioAuth = inject(ServicioAutenticacion);

  protected readonly usuarioActual = signal('Administrador');
  protected readonly totalUsuarios = signal(47);
  protected readonly pantallasActivas = signal(12);
  protected readonly contenidosActivos = signal(156);
  protected readonly campanasActivas = signal(8);
  protected readonly pantallasOnline = signal(9);
  protected readonly logsRecientes = signal(23);
  
  // Control de pestañas
  protected readonly pestanaActiva = signal<'dashboard' | 'usuarios' | 'logs' | 'monitoreo'>('dashboard');

  ngOnInit(): void {
    // Cargar datos del usuario actual
    // TODO: Implementar obtención del usuario actual cuando esté disponible
    this.usuarioActual.set('Admin Usuario');

    // Cargar estadísticas desde el backend
    this.cargarEstadisticas();
  }

  protected cambiarPestana(pestana: 'dashboard' | 'usuarios' | 'logs' | 'monitoreo'): void {
    this.pestanaActiva.set(pestana);
  }

  private cargarEstadisticas(): void {
    // TODO: Implementar llamadas al backend para obtener estadísticas reales
    // Por ahora usamos datos mockeados que se actualizarán con el backend
  }

  protected actualizarDatos(): void {
    console.log('Actualizando datos del dashboard...');
    this.cargarEstadisticas();
  }
}

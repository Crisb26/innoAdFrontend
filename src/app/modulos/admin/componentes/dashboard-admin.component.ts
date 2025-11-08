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
  template: `
    <div class="contenedor-dashboard-admin">
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
            <h3>👥 Gestión de Usuarios</h3>
            <span class="badge-importante">Admin Only</span>
          </div>
          <div class="contenido-usuarios">
            <div class="acciones-usuarios">
              <button class="btn-accion btn-crear">
                <span class="icono">➕</span>
                Crear Usuario
              </button>
              <button class="btn-accion btn-buscar">
                <span class="icono">🔍</span>
                Buscar Usuarios
              </button>
              <button class="btn-accion btn-roles">
                <span class="icono">🎭</span>
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
  `,
  styles: [`
    .contenedor-dashboard-admin {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-admin {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3rem;
      padding: 2rem;
      background: linear-gradient(135deg, var(--fondo-medio, #1e293b) 0%, var(--fondo-oscuro, #0f172a) 100%);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .titulo-admin h1 {
      color: var(--color-texto, #ffffff);
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .titulo-admin p {
      color: var(--color-texto-claro, #b4b8d0);
      font-size: 1.1rem;
    }

    .info-admin {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .badge-admin {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .usuario-actual {
      color: var(--color-texto-claro, #b4b8d0);
      font-size: 0.9rem;
    }

    .pestanas-admin {
      display: flex;
      gap: 4px;
      background: var(--fondo-muy-oscuro);
      padding: 8px;
      border-radius: var(--radio-lg);
      margin-bottom: var(--espacio-xl);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .pestana {
      flex: 1;
      padding: var(--espacio-md) var(--espacio-lg);
      background: transparent;
      border: none;
      color: var(--color-texto-claro);
      cursor: pointer;
      border-radius: var(--radio-md);
      transition: var(--transicion-suave);
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--espacio-sm);
    }

    .pestana:hover {
      background: var(--cristal-claro);
      color: var(--color-texto);
    }

    .pestana.activa {
      background: var(--gradiente-principal);
      color: var(--fondo-oscuro);
      font-weight: 600;
    }

    .contenido-pestana {
      min-height: 600px;
    }

    .seccion-critica {
      margin-bottom: 3rem;
    }

    .grid-admin {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }

    .tarjeta-admin {
      background: var(--fondo-medio, #1e293b);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .tarjeta-admin:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }

    .header-tarjeta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 1.5rem 0;
      margin-bottom: 1rem;
    }

    .header-tarjeta h3 {
      color: var(--color-texto, #ffffff);
      margin: 0;
      font-size: 1.3rem;
    }

    .badge-nuevo, .badge-importante, .badge-warning {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .badge-nuevo {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }

    .badge-importante {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
    }

    .badge-warning {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
    }

    .badge-estado {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .estado-online {
      background: rgba(16, 185, 129, 0.2);
      color: #6ee7b7;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    /* Estadísticas */
    .contenido-estadisticas {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      padding: 0 1.5rem 1rem;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
    }

    .stat-numero {
      font-size: 2rem;
      font-weight: bold;
      color: var(--color-primario, #00d4ff);
      margin-bottom: 0.25rem;
    }

    .stat-label {
      color: var(--color-texto-claro, #b4b8d0);
      font-size: 0.9rem;
    }

    .btn-detalle {
      margin: 1rem 1.5rem 1.5rem;
      padding: 0.75rem 1rem;
      background: transparent;
      border: 2px solid var(--color-primario, #00d4ff);
      color: var(--color-primario, #00d4ff);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      width: calc(100% - 3rem);
    }

    .btn-detalle:hover {
      background: var(--color-primario, #00d4ff);
      color: var(--fondo-oscuro, #0f172a);
    }

    /* Usuarios */
    .contenido-usuarios {
      padding: 0 1.5rem 1.5rem;
    }

    .acciones-usuarios {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .btn-accion {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .btn-crear {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }

    .btn-buscar {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
    }

    .btn-roles {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
    }

    .btn-accion:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .usuarios-recientes h4 {
      color: var(--color-texto, #ffffff);
      margin-bottom: 1rem;
      font-size: 1rem;
    }

    .usuario-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
    }

    .avatar-usuario {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--color-primario, #00d4ff);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .nombre-usuario {
      color: var(--color-texto, #ffffff);
      font-weight: 500;
    }

    .rol-usuario {
      color: var(--color-texto-claro, #b4b8d0);
      font-size: 0.8rem;
    }

    /* Pantallas */
    .contenido-pantallas {
      padding: 0 1.5rem 1.5rem;
    }

    .mapa-pantallas {
      margin-bottom: 1rem;
    }

    .pantalla-status {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      border-left: 4px solid;
    }

    .pantalla-status.online {
      background: rgba(16, 185, 129, 0.1);
      border-color: #10b981;
    }

    .pantalla-status.offline {
      background: rgba(239, 68, 68, 0.1);
      border-color: #ef4444;
    }

    .pantalla-icon {
      font-size: 1.5rem;
    }

    .pantalla-nombre {
      color: var(--color-texto, #ffffff);
      font-weight: 500;
    }

    .pantalla-estado {
      color: var(--color-texto-claro, #b4b8d0);
      font-size: 0.8rem;
    }

    .acciones-pantallas {
      display: flex;
      gap: 0.5rem;
    }

    .btn-accion-pequeño {
      padding: 0.5rem 1rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      background: transparent;
      color: var(--color-texto-claro, #b4b8d0);
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.8rem;
    }

    .btn-accion-pequeño:hover {
      border-color: var(--color-primario, #00d4ff);
      color: var(--color-primario, #00d4ff);
    }

    /* Auditoría */
    .contenido-auditoria {
      padding: 0 1.5rem 1.5rem;
    }

    .log-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.05);
      margin-bottom: 0.5rem;
    }

    .log-tiempo {
      color: var(--color-texto-gris, #6b7280);
      font-size: 0.8rem;
      min-width: 80px;
    }

    .log-accion {
      color: var(--color-texto-claro, #b4b8d0);
      font-size: 0.9rem;
      flex: 1;
      margin-left: 1rem;
    }

    .acciones-auditoria {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    /* Configuración */
    .contenido-configuracion {
      padding: 0 1.5rem 1.5rem;
    }

    .config-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      margin-bottom: 0.5rem;
    }

    .config-label {
      color: var(--color-texto, #ffffff);
      font-weight: 500;
    }

    .btn-config {
      padding: 0.5rem 1rem;
      border: 1px solid var(--color-primario, #00d4ff);
      border-radius: 6px;
      background: transparent;
      color: var(--color-primario, #00d4ff);
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.8rem;
    }

    .btn-config:hover {
      background: var(--color-primario, #00d4ff);
      color: var(--fondo-oscuro, #0f172a);
    }

    /* Accesos Rápidos */
    .contenido-accesos {
      padding: 0 1.5rem 1.5rem;
    }

    .grid-accesos-rapidos {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    .acceso-rapido {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      text-decoration: none;
      transition: all 0.3s ease;
      border: 1px solid transparent;
    }

    .acceso-rapido:hover {
      background: rgba(0, 212, 255, 0.1);
      border-color: var(--color-primario, #00d4ff);
      transform: translateY(-2px);
    }

    .icono-acceso {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .label-acceso {
      color: var(--color-texto-claro, #b4b8d0);
      font-size: 0.8rem;
      text-align: center;
    }

    .acceso-rapido:hover .label-acceso {
      color: var(--color-texto, #ffffff);
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .grid-admin {
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .contenedor-dashboard-admin {
        padding: 1rem;
      }

      .header-admin {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .grid-admin {
        grid-template-columns: 1fr;
      }

      .contenido-estadisticas {
        grid-template-columns: 1fr;
      }

      .acciones-usuarios {
        grid-template-columns: 1fr;
      }

      .grid-accesos-rapidos {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
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
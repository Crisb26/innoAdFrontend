import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PermisosServicio } from '../../core/servicios/permisos.servicio';

@Component({
  selector: 'app-tecnico-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tecnico-dashboard">
      <header class="dashboard-header">
        <h1>Panel Técnico</h1>
        <p>Monitoreo y gestión de sistemas</p>
      </header>

      <div class="dashboard-grid">
        <!-- Ventana de Daños -->
        <div class="dashboard-card" (click)="navegarA('daños')">
          <div class="card-icon">[][]</div>
          <h2>Daños Reportados</h2>
          <p class="card-description">Ver y gestionar problemas del sistema</p>
          <div class="card-meta">
            <span class="badge badge-danger">3 alertas activas</span>
          </div>
        </div>

        <!-- Monitoreo de Raspberry Pi -->
        <div class="dashboard-card" (click)="navegarA('dispositivos')">
          <div class="card-icon">[]�</div>
          <h2>Dispositivos IoT</h2>
          <p class="card-description">Monitoreo de Raspberry Pi y pantallas</p>
          <div class="card-meta">
            <span class="badge badge-success">12 conectados</span>
            <span class="badge badge-warning">2 fuera de línea</span>
          </div>
        </div>

        <!-- Publicaciones por Revisar -->
        <div class="dashboard-card" (click)="navegarA('publicaciones')">
          <div class="card-icon">[]�</div>
          <h2>Publicaciones</h2>
          <p class="card-description">Revisar y aprobar contenido nuevo</p>
          <div class="card-meta">
            <span class="badge badge-info">5 pendientes</span>
          </div>
        </div>

        <!-- Chat con Usuarios -->
        <div class="dashboard-card" (click)="navegarA('chat')">
          <div class="card-icon">[]�</div>
          <h2>Soporte de Usuarios</h2>
          <p class="card-description">Mensajes de usuarios requiriendo soporte</p>
          <div class="card-meta">
            <span class="badge badge-warning">2 sin leer</span>
          </div>
        </div>

        <!-- Logs del Sistema -->
        <div class="dashboard-card" (click)="navegarA('logs')">
          <div class="card-icon">[]�</div>
          <h2>Logs del Sistema</h2>
          <p class="card-description">Historial de eventos y errores</p>
        </div>

        <!-- Estadísticas -->
        <div class="dashboard-card" (click)="navegarA('estadisticas')">
          <div class="card-icon">[]�</div>
          <h2>Estadísticas</h2>
          <p class="card-description">Métricas de desempeño y uso</p>
        </div>
      </div>

      <!-- Resumen Rápido -->
      <section class="resumen-rapido">
        <h2>Estado del Sistema</h2>
        <div class="estado-grid">
          <div class="estado-item">
            <label>Dispositivos Activos</label>
            <span class="estado-valor">12/14</span>
          </div>
          <div class="estado-item">
            <label>Alertas Críticas</label>
            <span class="estado-valor warning">3</span>
          </div>
          <div class="estado-item">
            <label>Publicaciones en Cola</label>
            <span class="estado-valor">5</span>
          </div>
          <div class="estado-item">
            <label>Mensajes sin Leer</label>
            <span class="estado-valor">2</span>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .tecnico-dashboard {
      padding: 2rem;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }

    .dashboard-header {
      margin-bottom: 3rem;
      color: #333;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      margin: 0;
      color: #1a5490;
    }

    .dashboard-header p {
      font-size: 1rem;
      color: #666;
      margin: 0.5rem 0 0 0;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .dashboard-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #1a5490;
    }

    .dashboard-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      border-left-color: #0d3a6e;
    }

    .card-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      display: block;
    }

    .dashboard-card h2 {
      font-size: 1.25rem;
      margin: 0 0 0.5rem 0;
      color: #1a5490;
    }

    .card-description {
      color: #666;
      font-size: 0.9rem;
      margin: 0 0 1rem 0;
    }

    .card-meta {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .badge-success {
      background: #d4edda;
      color: #155724;
    }

    .badge-warning {
      background: #fff3cd;
      color: #856404;
    }

    .badge-danger {
      background: #f8d7da;
      color: #721c24;
    }

    .badge-info {
      background: #d1ecf1;
      color: #0c5460;
    }

    .resumen-rapido {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .resumen-rapido h2 {
      color: #1a5490;
      margin-top: 0;
    }

    .estado-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-top: 1.5rem;
    }

    .estado-item {
      text-align: center;
      padding: 1rem;
      border-radius: 8px;
      background: #f8f9fa;
    }

    .estado-item label {
      display: block;
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .estado-valor {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      color: #1a5490;
    }

    .estado-valor.warning {
      color: #ff6b6b;
    }
  `]
})
export class TecnicoDashboardComponent implements OnInit {
  constructor(
    private router: Router,
    private permisosServicio: PermisosServicio
  ) {}

  ngOnInit(): void {
    // Verificar que es técnico
    if (!this.permisosServicio.esTecnico()) {
      this.router.navigate(['/sin-permisos']);
    }
  }

  navegarA(seccion: string): void {
    switch (seccion) {
      case 'daños':
        this.router.navigate(['/tecnico', 'danos']);
        break;
      case 'dispositivos':
        this.router.navigate(['/tecnico', 'dispositivos']);
        break;
      case 'publicaciones':
        this.router.navigate(['/publicacion', 'revisar']);
        break;
      case 'chat':
        this.router.navigate(['/chat']);
        break;
      case 'logs':
        this.router.navigate(['/tecnico', 'logs']);
        break;
      case 'estadisticas':
        this.router.navigate(['/reportes']);
        break;
    }
  }
}

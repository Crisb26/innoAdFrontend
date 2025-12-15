import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PermisosServicio } from '../../core/servicios/permisos.servicio';

@Component({
  selector: 'app-developer-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="developer-dashboard">
      <header class="dashboard-header">
        <h1>Panel Developer</h1>
        <p>Herramientas de desarrollo y código</p>
      </header>

      <div class="dashboard-grid">
        <!-- Código y API -->
        <div class="dashboard-card" (click)="navegarA('codigo')">
          <div class="card-icon">💻</div>
          <h2>Código y API</h2>
          <p class="card-description">Acceso a documentación de API y ejemplos de código</p>
          <div class="card-meta">
            <span class="badge badge-info">v1.0 Activa</span>
          </div>
        </div>

        <!-- Logs y Debugging -->
        <div class="dashboard-card" (click)="navegarA('logs')">
          <div class="card-icon">🔍</div>
          <h2>Logs y Debugging</h2>
          <p class="card-description">Análisis de errores y debugging en tiempo real</p>
          <div class="card-meta">
            <span class="badge badge-success">Sistema estable</span>
          </div>
        </div>

        <!-- Infraestructura -->
        <div class="dashboard-card" (click)="navegarA('infraestructura')">
          <div class="card-icon">🏗️</div>
          <h2>Infraestructura</h2>
          <p class="card-description">Estado de servidores y configuración de despliegue</p>
          <div class="card-meta">
            <span class="badge badge-success">12 servidores activos</span>
          </div>
        </div>

        <!-- Herramientas de Desarrollo -->
        <div class="dashboard-card" (click)="navegarA('herramientas')">
          <div class="card-icon">🛠️</div>
          <h2>Herramientas Dev</h2>
          <p class="card-description">Git, builds, tests y deployment automation</p>
        </div>

        <!-- Métricas de Performance -->
        <div class="dashboard-card" (click)="navegarA('performance')">
          <div class="card-icon">⚡</div>
          <h2>Performance</h2>
          <p class="card-description">Análisis de velocidad y optimización</p>
          <div class="card-meta">
            <span class="badge badge-success">98% uptime</span>
          </div>
        </div>

        <!-- Documentación -->
        <div class="dashboard-card" (click)="navegarA('documentacion')">
          <div class="card-icon">📚</div>
          <h2>Documentación</h2>
          <p class="card-description">Guías técnicas y arquitectura del sistema</p>
        </div>
      </div>

      <!-- Información de Sistema -->
      <section class="sistema-info">
        <h2>Información del Sistema</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Versión API</label>
            <span>v1.0.0</span>
          </div>
          <div class="info-item">
            <label>Base de Datos</label>
            <span>PostgreSQL 17.6</span>
          </div>
          <div class="info-item">
            <label>Framework Backend</label>
            <span>Spring Boot 3.5.8</span>
          </div>
          <div class="info-item">
            <label>Framework Frontend</label>
            <span>Angular 18.2.x</span>
          </div>
        </div>
      </section>

      <!-- Links Rápidos -->
      <section class="quick-links">
        <h2>Links de Desarrollo</h2>
        <div class="links-grid">
          <a href="http://localhost:8080/swagger-ui.html" target="_blank" class="link-card">
            <span class="icon">📖</span>
            <span>Swagger API</span>
          </a>
          <a href="/admin" class="link-card">
            <span class="icon">⚙️</span>
            <span>Panel Admin</span>
          </a>
          <a href="http://localhost:5432" target="_blank" class="link-card">
            <span class="icon">🗄️</span>
            <span>Base de Datos</span>
          </a>
          <a href="#" class="link-card" (click)="mostrarCredenciales()">
            <span class="icon">🔐</span>
            <span>Credenciales</span>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .developer-dashboard {
      padding: 2rem;
      background: linear-gradient(135deg, #1e3a4c 0%, #2d5a7b 100%);
      min-height: 100vh;
    }

    .dashboard-header {
      margin-bottom: 3rem;
      color: white;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      margin: 0;
      color: #fff;
    }

    .dashboard-header p {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.7);
      margin: 0.5rem 0 0 0;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .dashboard-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      border-left: 4px solid #00d4ff;
    }

    .dashboard-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 8px 24px rgba(0, 212, 255, 0.3);
      border-left-color: #00ffff;
    }

    .card-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      display: block;
    }

    .dashboard-card h2 {
      font-size: 1.25rem;
      margin: 0 0 0.5rem 0;
      color: #1e3a4c;
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

    .badge-info {
      background: #d1ecf1;
      color: #0c5460;
    }

    .sistema-info {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      margin-bottom: 2rem;
    }

    .sistema-info h2 {
      color: #1e3a4c;
      margin-top: 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .info-item {
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 3px solid #00d4ff;
    }

    .info-item label {
      display: block;
      color: #666;
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      font-weight: 600;
    }

    .info-item span {
      display: block;
      color: #1e3a4c;
      font-size: 1.1rem;
      font-weight: 500;
      font-family: monospace;
    }

    .quick-links {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .quick-links h2 {
      color: #1e3a4c;
      margin-top: 0;
    }

    .links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .link-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
      border-radius: 8px;
      color: white;
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;
      border: none;
      font-size: 0.9rem;
    }

    .link-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 212, 255, 0.4);
    }

    .link-card .icon {
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
    }
  `]
})
export class DeveloperDashboardComponent implements OnInit {
  constructor(
    private router: Router,
    private permisosServicio: PermisosServicio
  ) {}

  ngOnInit(): void {
    // Verificar que es developer
    if (!this.permisosServicio.esDeveloper()) {
      this.router.navigate(['/sin-permisos']);
    }
  }

  navegarA(seccion: string): void {
    switch (seccion) {
      case 'codigo':
        window.open('http://localhost:8080/swagger-ui.html', '_blank');
        break;
      case 'logs':
        // TODO: Crear componente de logs
        console.log('Navegar a logs');
        break;
      case 'infraestructura':
        // TODO: Crear componente de infraestructura
        console.log('Navegar a infraestructura');
        break;
      case 'herramientas':
        // TODO: Crear componente de herramientas
        console.log('Navegar a herramientas');
        break;
      case 'performance':
        // TODO: Crear componente de performance
        console.log('Navegar a performance');
        break;
      case 'documentacion':
        // TODO: Crear documentación
        console.log('Abrir documentación');
        break;
    }
  }

  mostrarCredenciales(): void {
    alert('Credenciales disponibles en el archivo de configuración local. Contactar al administrador si no las tienes.');
  }
}

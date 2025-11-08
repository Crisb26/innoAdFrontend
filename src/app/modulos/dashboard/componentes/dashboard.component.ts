import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServicioAutenticacion } from '@core/servicios/autenticacion.servicio';
import { ServicioEstadisticas } from '@core/servicios/estadisticas.servicio';
import { NavegacionAutenticadaComponent } from '@shared/componentes/navegacion-autenticada.component';

interface MetricaKPI {
  nombre: string;
  valor: number;
  unidad: string;
  variacion: number;
  tendencia: 'subiendo' | 'bajando' | 'estable';
  icono: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavegacionAutenticadaComponent],
  template: `
    <!-- Navegación Superior -->
    <app-navegacion-autenticada></app-navegacion-autenticada>
    
    <div class="dashboard-container">
      <!-- Contenido Principal -->
      <div class="contenido-principal">
        <!-- Saludo -->
        <div class="seccion-saludo">
          <h1 class="titulo-dashboard">¡Bienvenido, {{ nombreUsuario() }}!</h1>
          <p class="subtitulo-dashboard">Gestiona tu contenido digital de manera inteligente</p>
        </div>

        <!-- Grid de Tarjetas -->
        <div class="grid-tarjetas">
          <!-- Tarjeta Campañas -->
          <div class="tarjeta-dashboard tarjeta-campanas">
            <div class="icono-tarjeta">📢</div>
            <div class="contenido-tarjeta">
              <h3>Campañas</h3>
              <p>{{ estadisticasCampanas() }}</p>
              <a routerLink="/campanas" class="btn-tarjeta">
                Gestionar Campañas
              </a>
            </div>
          </div>

          <!-- Tarjeta Pantallas -->
          <div class="tarjeta-dashboard tarjeta-pantallas">
            <div class="icono-tarjeta">📺</div>
            <div class="contenido-tarjeta">
              <h3>Pantallas</h3>
              <p>{{ estadisticasPantallas() }}</p>
              <a routerLink="/pantallas" class="btn-tarjeta">
                Ver Pantallas
              </a>
            </div>
          </div>

          <!-- Tarjeta Contenidos -->
          <div class="tarjeta-dashboard tarjeta-contenidos">
            <div class="icono-tarjeta">🎨</div>
            <div class="contenido-tarjeta">
              <h3>Contenidos</h3>
              <p>{{ estadisticasContenidos() }}</p>
              <a routerLink="/contenidos" class="btn-tarjeta">
                Crear Contenido
              </a>
            </div>
          </div>

          <!-- Tarjeta Reportes -->
          <div class="tarjeta-dashboard tarjeta-reportes">
            <div class="icono-tarjeta">📊</div>
            <div class="contenido-tarjeta">
              <h3>Reportes</h3>
              <p>Analytics avanzados</p>
              <a routerLink="/reportes" class="btn-tarjeta">
                Ver Reportes
              </a>
            </div>
          </div>

          <!-- Tarjeta Admin (solo para administradores) -->
          @if (esAdministrador()) {
            <div class="tarjeta-dashboard tarjeta-admin">
              <div class="icono-tarjeta">👑</div>
              <div class="contenido-tarjeta">
                <h3>Panel Admin</h3>
                <p>Administración del sistema</p>
                <a routerLink="/admin" class="btn-tarjeta btn-admin">
                  Acceder al Panel
                </a>
              </div>
            </div>
          }

          <!-- Tarjeta Publicar -->
          <div class="tarjeta-dashboard tarjeta-publicar">
            <div class="icono-tarjeta">📤</div>
            <div class="contenido-tarjeta">
              <h3>Publicar Ahora</h3>
              <p>Contenido rápido</p>
              <a routerLink="/publicar" class="btn-tarjeta">
                Publicar
              </a>
            </div>
          </div>
        </div>

        <!-- Sección de Actividad Reciente -->
        <div class="seccion-actividad">
          <h2>Actividad Reciente</h2>
          <div class="lista-actividad">
            <div class="item-actividad">
              <span class="icono-actividad">📢</span>
              <div class="info-actividad">
                <p><strong>Nueva campaña creada:</strong> "Promoción Verano 2024"</p>
                <small>Hace 2 horas</small>
              </div>
            </div>
            <div class="item-actividad">
              <span class="icono-actividad">📺</span>
              <div class="info-actividad">
                <p><strong>Pantalla actualizada:</strong> "Lobby Principal"</p>
                <small>Hace 4 horas</small>
              </div>
            </div>
            <div class="item-actividad">
              <span class="icono-actividad">🎨</span>
              <div class="info-actividad">
                <p><strong>Contenido publicado:</strong> "Banner Ofertas"</p>
                <small>Hace 6 horas</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, var(--fondo-oscuro, #0f172a) 0%, var(--fondo-medio, #1e293b) 100%);
    }

    .contenido-principal {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .seccion-saludo {
      text-align: center;
      margin-bottom: 3rem;
    }

    .titulo-dashboard {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #00d9ff, #ff006a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    .subtitulo-dashboard {
      color: var(--color-texto-claro, #b4b8d0);
      font-size: 1.1rem;
    }

    .grid-tarjetas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .tarjeta-dashboard {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;
    }

    .tarjeta-dashboard::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--color-primario, #00d4ff), var(--color-secundario, #8b5cf6));
    }

    .tarjeta-dashboard:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      border-color: var(--color-primario, #00d4ff);
      background: rgba(255, 255, 255, 0.08);
    }

    .icono-tarjeta {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
      filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.3));
    }

    .contenido-tarjeta h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: var(--color-texto, #ffffff);
    }

    .contenido-tarjeta p {
      color: var(--color-texto-claro, #b4b8d0);
      margin-bottom: 1.5rem;
    }

    .btn-tarjeta {
      display: inline-block;
      background: linear-gradient(135deg, var(--color-primario, #00d4ff), var(--color-secundario, #8b5cf6));
      color: white;
      text-decoration: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .btn-tarjeta:hover {
      transform: scale(1.05);
      box-shadow: 0 10px 20px rgba(0, 212, 255, 0.3);
    }

    .btn-admin {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    .btn-admin:hover {
      box-shadow: 0 10px 20px rgba(245, 158, 11, 0.3);
    }

    /* Colores específicos para cada tarjeta */
    .tarjeta-campanas .icono-tarjeta { color: #ff6b6b; }
    .tarjeta-pantallas .icono-tarjeta { color: #4ecdc4; }
    .tarjeta-contenidos .icono-tarjeta { color: #45b7d1; }
    .tarjeta-reportes .icono-tarjeta { color: #96ceb4; }
    .tarjeta-publicar .icono-tarjeta { color: #feca57; }
    .tarjeta-admin .icono-tarjeta { color: #f59e0b; }

    /* Sección de Actividad */
    .seccion-actividad {
      margin-top: 3rem;
    }

    .seccion-actividad h2 {
      font-size: 1.8rem;
      margin-bottom: 1.5rem;
      color: var(--color-texto, #ffffff);
      border-left: 4px solid var(--color-primario, #00d4ff);
      padding-left: 1rem;
    }

    .lista-actividad {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
    }

    .item-actividad {
      display: flex;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .item-actividad:last-child {
      border-bottom: none;
    }

    .icono-actividad {
      font-size: 1.5rem;
      margin-right: 1rem;
    }

    .info-actividad {
      flex: 1;
    }

    .info-actividad p {
      color: var(--color-texto-claro, #b4b8d0);
      margin: 0;
    }

    .info-actividad small {
      color: var(--color-texto-claro, #b4b8d0);
      font-size: 0.8rem;
      opacity: 0.7;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .contenido-principal {
        padding: 1rem;
      }

      .titulo-dashboard {
        font-size: 2rem;
      }

      .grid-tarjetas {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .tarjeta-dashboard {
        padding: 1.5rem;
      }

      .icono-tarjeta {
        font-size: 2.5rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly servicioAuth = inject(ServicioAutenticacion);
  private readonly servicioEstadisticas = inject(ServicioEstadisticas);

  protected readonly cargando = signal(true);
  protected readonly metricas = signal<MetricaKPI[]>([]);

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  private cargarEstadisticas(): void {
    this.servicioEstadisticas.obtenerGenerales().subscribe({
      next: (stats) => {
        this.metricas.set([
          {
            nombre: 'Campañas Activas',
            valor: stats.campanasActivas,
            unidad: '',
            variacion: 12,
            tendencia: 'subiendo',
            icono: '▲',
            color: '#667eea'
          },
          {
            nombre: 'Pantallas Conectadas',
            valor: stats.pantallasConectadas,
            unidad: '',
            variacion: 8,
            tendencia: 'subiendo',
            icono: '●',
            color: '#764ba2'
          },
          {
            nombre: 'Impresiones Totales',
            valor: stats.impresionesTotales,
            unidad: 'K',
            variacion: 15,
            tendencia: 'subiendo',
            icono: '◆',
            color: '#00d9ff'
          },
          {
            nombre: 'Tasa de Éxito',
            valor: stats.tasaExito,
            unidad: '%',
            variacion: 5,
            tendencia: 'subiendo',
            icono: '■',
            color: '#00ff88'
          }
        ]);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  protected nombreUsuario(): string {
    const usuario = this.servicioAuth.usuarioActual();
    return usuario?.nombreCompleto || usuario?.nombreUsuario || 'Usuario';
  }

  protected esAdministrador(): boolean {
    const usuario = this.servicioAuth.usuarioActual();
    return usuario?.rol?.nombre === 'Administrador' || false;
  }

  protected estadisticasCampanas(): string {
    return '12 activas, 5 programadas';
  }

  protected estadisticasPantallas(): string {
    return '8 conectadas de 10';
  }

  protected estadisticasContenidos(): string {
    return '24 elementos listos';
  }
}
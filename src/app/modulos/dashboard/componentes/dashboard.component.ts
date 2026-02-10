import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServicioAutenticacion } from '../../../core/servicios/autenticacion.servicio';
import { AyudaService } from '../../../core/servicios/ayuda.servicio';
import { ServicioEstadisticas } from '../../../core/servicios/estadisticas.servicio';
import { NavegacionAutenticadaComponent } from '../../../shared/componentes/navegacion-autenticada.component';

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
  styleUrls: ['./dashboard.component.scss'],
  template: `
    <!-- Navegación Superior -->
    <app-navegacion-autenticada></app-navegacion-autenticada>
    
    <div class="dashboard-container">
      <!-- Sección de Bienvenida Hero -->
      <div class="seccion-bienvenida-hero">
        <h1 class="titulo-bienvenida-hero">¡Bienvenido, {{ nombreUsuario() }}!</h1>
        <p class="subtitulo-bienvenida-hero">Gestiona tu contenido digital de manera inteligente</p>
      </div>

      <!-- Contenido Principal -->
      <div class="contenido-principal">
        <!-- Saludo vacío para mantener estructura -->
        <div class="seccion-saludo">

        <!-- Grid de Tarjetas -->
        <div class="grid-tarjetas">
          <!-- Tarjeta Campañas -->
          <div class="tarjeta-dashboard tarjeta-campanas">
            <div class="icono-tarjeta">Campañas</div>
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
            <div class="icono-tarjeta">Pantallas</div>
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
            <div class="icono-tarjeta">Contenidos</div>
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
            <div class="icono-tarjeta">Reportes</div>
            <div class="contenido-tarjeta">
              <h3>Reportes</h3>
              <p>Analytics avanzados</p>
              <a routerLink="/reportes" class="btn-tarjeta">
                Ver Reportes
              </a>
            </div>
          </div>

          <!-- Tarjeta Graficos -->
          <div class="tarjeta-dashboard tarjeta-graficos">
            <div class="icono-tarjeta">Graficos</div>
            <div class="contenido-tarjeta">
              <h3>Graficos Avanzados</h3>
              <p>Visualizacion de datos</p>
              <a routerLink="/dashboard/graficos" class="btn-tarjeta">
                Ver Graficos
              </a>
            </div>
          </div>

          <!-- Tarjeta Admin (solo para administradores) -->
          @if (esAdministrador()) {
            <div class="tarjeta-dashboard tarjeta-admin">
              <div class="icono-tarjeta">Admin</div>
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
            <div class="icono-tarjeta">Publicar</div>
            <div class="contenido-tarjeta">
              <h3>Publicar Ahora</h3>
              <p>Contenido rapido</p>
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
              <span class="icono-actividad">CAMP</span>
              <div class="info-actividad">
                <p><strong>Nueva campaña creada:</strong> "Promocion Verano 2024"</p>
                <small>Hace 2 horas</small>
              </div>
            </div>
            <div class="item-actividad">
              <span class="icono-actividad">PANT</span>
              <div class="info-actividad">
                <p><strong>Pantalla actualizada:</strong> "Lobby Principal"</p>
                <small>Hace 4 horas</small>
              </div>
            </div>
            <div class="item-actividad">
              <span class="icono-actividad">CONT</span>
              <div class="info-actividad">
                <p><strong>Contenido publicado:</strong> "Banner Ofertas"</p>
                <small>Hace 6 horas</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private readonly servicioAuth = inject(ServicioAutenticacion);
  private readonly servicioEstadisticas = inject(ServicioEstadisticas);
  private readonly ayuda = inject(AyudaService);

  protected readonly cargando = signal(true);
  protected readonly metricas = signal<MetricaKPI[]>([]);

  ngOnInit(): void {
    this.cargarEstadisticas();
    // Lanzar tour anclado al dashboard la primera vez (ligero delay para asegurar render)
    setTimeout(() => {
      this.ayuda.startTourOnce('dashboard', [
        { element: '.titulo-bienvenida-hero', intro: 'Este es tu espacio personal. Aquí verás un resumen rápido de tu cuenta y acciones importantes.' , position: 'bottom' },
        { element: '.tarjeta-campanas .btn-tarjeta', intro: 'Accede al módulo de Campañas para crear, editar y programar tus campañas.', position: 'right' },
        { element: '.tarjeta-publicar .btn-tarjeta', intro: 'Publica contenido rápidamente desde este acceso directo.', position: 'right' },
        { element: '.seccion-actividad', intro: 'Actividad reciente: revisa acciones y eventos recientes en tu cuenta.', position: 'left' }
      ], { showProgress: true, exitOnOverlayClick: true });
    }, 700);
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
import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PublicacionServicio, Publicacion } from '@core/servicios/publicacion.servicio';
import { PantallasService, RespuestaPantalla } from '@core/servicios/pantallas.service';

@Component({
  selector: 'app-panel-tecnico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel-tecnico">
      <header class="header-tecnico">
        <h1>🔧 Panel Técnico - InnoAd</h1>
        <div class="info-tecnico">
          <span>Publicaciones pendientes: <strong>{{ pendientes().length }}</strong></span>
          <span>Pantallas activas: <strong>{{ pantallasConectadas().length }}</strong></span>
        </div>
      </header>

      <div class="contenedor-principal">
        <!-- Tabs de navegación -->
        <div class="tabs-navigation">
          <button [class.activo]="pestanaActiva() === 'revision'"
                  (click)="cambiarPestana('revision')"
                  class="btn-tab">
            📋 Revisar Contenido ({{ pendientes().length }})
          </button>
          <button [class.activo]="pestanaActiva() === 'pantallas'"
                  (click)="cambiarPestana('pantallas')"
                  class="btn-tab">
            📺 Pantallas Conectadas
          </button>
          <button [class.activo]="pestanaActiva() === 'mapa'"
                  (click)="cambiarPestana('mapa')"
                  class="btn-tab">
            🗺️ Mapa de Ubicaciones
          </button>
          <button [class.activo]="pestanaActiva() === 'inventario'"
                  (click)="cambiarPestana('inventario')"
                  class="btn-tab">
            📦 Inventario
          </button>
          <button [class.activo]="pestanaActiva() === 'chat'"
                  (click)="cambiarPestana('chat')"
                  class="btn-tab">
            💬 Chat Soporte
          </button>
        </div>

        <!-- PESTAÑA: REVISION DE CONTENIDO -->
        @if (pestanaActiva() === 'revision') {
          <div class="contenido-pestana">
            <h2>Revisar Publicaciones Pendientes</h2>

            @if (pendientes().length === 0) {
              <div class="sin-elementos">
                <p>✅ No hay publicaciones pendientes</p>
              </div>
            } @else {
              <div class="grid-publicaciones">
                @for (pub of pendientes(); track pub.id) {
                  <div class="tarjeta-publicacion">
                    <img [src]="pub.contenido?.url || '/assets/imagenes/placeholder.jpg'" [alt]="pub.titulo" class="img-publicacion"
                         (error)="$any($event.target).src='/assets/imagenes/placeholder.jpg'">
                    <div class="info-publicacion">
                      <h3>{{ pub.titulo }}</h3>
                      <p class="usuario">👤 {{ pub.usuarioNombre }}</p>
                      <p class="ubicacion">📍 {{ pub.ubicaciones?.[0]?.ciudad || 'Sin ubicación' }}</p>
                      <p class="precio">💰 COP $ {{ pub.costo | number }}</p>
                      <p class="descripcion">{{ pub.descripcion }}</p>
                      <div class="acciones-publicacion">
                        <button class="btn-aprobar" (click)="aprobarPublicacion(pub.id)">
                          ✅ Aprobar
                        </button>
                        <button class="btn-rechazar" (click)="rechazarPublicacion(pub.id)">
                          ❌ Rechazar
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- PESTAÑA: PANTALLAS -->
        @if (pestanaActiva() === 'pantallas') {
          <div class="contenido-pestana">
            <h2>Estado de Pantallas</h2>
            @if (pantallasConectadas().length === 0) {
              <p>No hay pantallas conectadas</p>
            } @else {
              <div class="tabla-pantallas">
                <table>
                  <thead>
                    <tr>
                      <th>Estado</th>
                      <th>Nombre</th>
                      <th>Ubicación</th>
                      <th>Última Actualización</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (pantalla of pantallasConectadas(); track pantalla.id) {
                      <tr>
                        <td>
                          <span class="badge" [class.conectada]="pantalla.estaConectada">
                            {{ pantalla.estaConectada ? '🟢' : '🔴' }}
                          </span>
                        </td>
                        <td>{{ pantalla.nombre }}</td>
                        <td>{{ pantalla.ubicacion }}</td>
                        <td>{{ pantalla.ultimaSincronizacion | date:'short' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }

        <!-- PESTAÑA: MAPA -->
        @if (pestanaActiva() === 'mapa') {
          <div class="contenido-pestana">
            <h2>🗺️ Mapa de Ubicaciones</h2>
            <div class="contenedor-mapa">
              <p>Mapa de pantallas por región</p>
              <div style="padding: 2rem; background: #f0f0f0; border-radius: 8px; text-align: center;">
                📍 Mapa interactivo de ubicaciones de pantallas
              </div>
            </div>
          </div>
        }

        <!-- PESTAÑA: INVENTARIO -->
        @if (pestanaActiva() === 'inventario') {
          <div class="contenido-pestana">
            <h2>📦 Inventario de Equipos</h2>
            <div class="inventario-grid">
              <div class="tarjeta-inventario">
                <div class="icono">🖥️</div>
                <h3>Raspberry Pi</h3>
                <p class="cantidad">10 Disponibles</p>
                <p class="estado">2 en mantenimiento</p>
              </div>
              <div class="tarjeta-inventario">
                <div class="icono">📺</div>
                <h3>Pantallas LED</h3>
                <p class="cantidad">12 Disponibles</p>
                <p class="estado">1 requiere reparación</p>
              </div>
              <div class="tarjeta-inventario">
                <div class="icono">🔌</div>
                <h3>Cables HDMI</h3>
                <p class="cantidad">25 Disponibles</p>
                <p class="estado">Toda la cantidad disponible</p>
              </div>
              <div class="tarjeta-inventario">
                <div class="icono">⚡</div>
                <h3>Fuentes de Poder</h3>
                <p class="cantidad">8 Disponibles</p>
                <p class="estado">3 en prueba</p>
              </div>
            </div>
          </div>
        }

        <!-- PESTAÑA: CHAT SOPORTE -->
        @if (pestanaActiva() === 'chat') {
          <div class="contenido-pestana">
            <h2>💬 Chat Soporte</h2>
            <div style="padding: 2rem; background: #f5f5f5; border-radius: 8px; text-align: center;">
              <p>Sistema de chat en tiempo real con usuarios</p>
              <p>💬 Comunicación directa con clientes y usuarios del sistema</p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .panel-tecnico {
      padding: 2rem;
      background: linear-gradient(135deg, var(--fondo-oscuro, #1e293b) 0%, var(--fondo-medio, #0f172a) 100%);
      min-height: 100vh;
      color: var(--color-texto-claro, #e2e8f0);
    }

    .header-tecnico {
      margin-bottom: 2rem;
      padding: 1rem;
      border-bottom: 2px solid var(--color-primario, #00d4ff);
    }

    .header-tecnico h1 {
      margin: 0 0 1rem 0;
      color: var(--color-primario, #00d4ff);
      font-size: 2rem;
    }

    .info-tecnico {
      display: flex;
      gap: 2rem;
      font-size: 0.9rem;
    }

    .info-tecnico strong {
      color: var(--color-advertencia, #ff006a);
    }

    .tabs-navigation {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .btn-tab {
      padding: 0.75rem 1.5rem;
      border: 2px solid transparent;
      background: rgba(0, 212, 255, 0.1);
      color: var(--color-texto-claro, #cbd5e1);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 600;
    }

    .btn-tab:hover {
      background: rgba(0, 212, 255, 0.2);
      border-color: var(--color-primario, #00d4ff);
    }

    .btn-tab.activo {
      background: linear-gradient(135deg, var(--color-primario, #00d4ff), #0066ff);
      color: var(--color-texto, white);
      border-color: var(--color-primario, #00d4ff);
    }

    .contenido-pestana {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .contenido-pestana h2 {
      color: var(--color-primario, #00d4ff);
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .sin-elementos {
      padding: 2rem;
      text-align: center;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 8px;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .grid-publicaciones {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .tarjeta-publicacion {
      background: var(--fondo-medio, rgba(30, 41, 59, 0.8));
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .tarjeta-publicacion:hover {
      border-color: var(--color-primario, #00d4ff);
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
    }

    .img-publicacion {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .info-publicacion {
      padding: 1rem;
    }

    .info-publicacion h3 {
      margin: 0 0 0.5rem 0;
      color: var(--color-primario, #00d4ff);
    }

    .info-publicacion p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
      color: var(--color-texto-claro, #cbd5e1);
    }

    .acciones-publicacion {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .btn-aprobar, .btn-rechazar {
      flex: 1;
      padding: 0.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .btn-aprobar {
      background: rgba(16, 185, 129, 0.3);
      color: var(--color-exito, #10b981);
      border: 1px solid var(--color-exito, #10b981);
    }

    .btn-aprobar:hover {
      background: rgba(16, 185, 129, 0.5);
    }

    .btn-rechazar {
      background: rgba(255, 0, 106, 0.3);
      color: var(--color-error, #ff006a);
      border: 1px solid var(--color-error, #ff006a);
    }

    .btn-rechazar:hover {
      background: rgba(255, 0, 106, 0.5);
    }

    .tabla-pantallas {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--fondo-medio, rgba(30, 41, 59, 0.8));
      border: 1px solid var(--fondo-claro, rgba(0, 212, 255, 0.3));
      border-radius: 8px;
      overflow: hidden;
    }

    th {
      background: var(--fondo-claro, rgba(0, 212, 255, 0.1));
      color: var(--color-primario, #00d4ff);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid var(--color-primario, rgba(0, 212, 255, 0.3));
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid var(--fondo-claro, rgba(0, 212, 255, 0.1));
      color: var(--color-texto-claro, #e2e8f0);
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-weight: 600;
    }

    .badge.conectada {
      background: rgba(16, 185, 129, 0.2);
      color: var(--color-exito, #10b981);
    }

    .contenedor-mapa {
      padding: 1.5rem;
      background: var(--fondo-medio, rgba(30, 41, 59, 0.8));
      border: 1px solid var(--fondo-claro, rgba(0, 212, 255, 0.3));
      border-radius: 12px;
    }

    .inventario-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .tarjeta-inventario {
      background: var(--fondo-medio, rgba(30, 41, 59, 0.8));
      border: 1px solid var(--fondo-claro, rgba(0, 212, 255, 0.3));
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      transition: all 0.3s ease;
    }

    .tarjeta-inventario:hover {
      border-color: var(--color-primario, #00d4ff);
      transform: translateY(-5px);
    }

    .icono {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .tarjeta-inventario h3 {
      margin: 0.5rem 0;
      color: var(--color-primario, #00d4ff);
    }

    .cantidad {
      color: var(--color-exito, #10b981);
      font-weight: 600;
    }

    .estado {
      color: var(--color-error, #ff006a);
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .panel-tecnico {
        padding: 1rem;
      }

      .tabs-navigation {
        flex-direction: column;
      }

      .btn-tab {
        width: 100%;
      }

      .grid-publicaciones {
        grid-template-columns: 1fr;
      }

      .inventario-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
    }
  `]
})
export class PanelTecnicoComponent implements OnInit, OnDestroy {
  protected pendientes = signal<Publicacion[]>([]);
  protected pantallasConectadas = signal<RespuestaPantalla[]>([]);
  protected pestanaActiva = signal<string>('revision');
  protected procesando = signal<boolean>(false);

  private destroy$ = new Subject<void>();
  private publicacionServicio = inject(PublicacionServicio);
  private pantallasService = inject(PantallasService);

  ngOnInit(): void {
    this.cargarPublicacionesPendientes();
    this.cargarPantallasConectadas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected cambiarPestana(pestana: string): void {
    this.pestanaActiva.set(pestana);
  }

  private cargarPublicacionesPendientes(): void {
    this.publicacionServicio.obtenerPublicacionesPendientes$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(publicaciones => {
        this.pendientes.set(publicaciones);
      });
    this.publicacionServicio.cargarPublicacionesPendientes();
  }

  private cargarPantallasConectadas(): void {
    this.pantallasService.pantallas$
      .pipe(takeUntil(this.destroy$))
      .subscribe(pantallas => {
        this.pantallasConectadas.set(pantallas);
      });
    this.pantallasService.cargarPantallas();
  }

  protected aprobarPublicacion(publicacionId: number): void {
    const notas = prompt('Notas de aprobación (opcional):');
    if (notas === null) return; // Cancelado
    this.procesando.set(true);
    this.publicacionServicio.aprobarPublicacion(publicacionId, notas || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.procesando.set(false);
          alert('✅ Publicación aprobada exitosamente');
        },
        error: (err) => {
          this.procesando.set(false);
          alert('Error al aprobar la publicación: ' + (err.error?.mensaje || err.message));
        }
      });
  }

  protected rechazarPublicacion(publicacionId: number): void {
    const motivo = prompt('Motivo del rechazo (requerido):');
    if (!motivo || !motivo.trim()) return;
    this.procesando.set(true);
    this.publicacionServicio.rechazarPublicacion(publicacionId, motivo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.procesando.set(false);
          alert('❌ Publicación rechazada');
        },
        error: (err) => {
          this.procesando.set(false);
          alert('Error al rechazar la publicación: ' + (err.error?.mensaje || err.message));
        }
      });
  }
}

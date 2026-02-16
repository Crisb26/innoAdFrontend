import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

interface Publicacion {
  id: number;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  estado: string;
  usuarioNombre: string;
  ubicacion: string;
  precioCOP: number;
  fechaCreacion: string;
}

interface Pantalla {
  id: number;
  nombre: string;
  ubicacion: string;
  estado: string;
  ultimaActualizacion: string;
}

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
          <span>Pantallas conectadas: <strong>{{ pantallasConectadas().length }}</strong></span>
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
                    <img [src]="pub.imagenUrl" [alt]="pub.titulo" class="img-publicacion">
                    <div class="info-publicacion">
                      <h3>{{ pub.titulo }}</h3>
                      <p class="usuario">👤 {{ pub.usuarioNombre }}</p>
                      <p class="ubicacion">📍 {{ pub.ubicacion }}</p>
                      <p class="precio">💰 COP ${{ pub.precioCOP | number }}</p>
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
                        <span class="badge" [class.conectada]="pantalla.estado === 'CONECTADA'">
                          {{ pantalla.estado === 'CONECTADA' ? '🟢' : '🔴' }}
                        </span>
                      </td>
                      <td>{{ pantalla.nombre }}</td>
                      <td>{{ pantalla.ubicacion }}</td>
                      <td>{{ pantalla.ultimaActualizacion }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- PESTAÑA: MAPA -->
        @if (pestanaActiva() === 'mapa') {
          <div class="contenido-pestana">
            <h2>Mapa de Ubicaciones - Quindío</h2>
            <div class="contenedor-mapa">
              <div class="mapa-simple">
                <!-- Mapa interactivo simple -->
                <div class="regiones-colombia">
                  <div class="municipio" *ngFor="let municipio of municipios">
                    <div class="municipio-nombre">{{ municipio.nombre }}</div>
                    <div class="puntos">
                      @for (punto of municipio.puntos; track punto.id) {
                        <div class="punto" [style.left.%]="punto.x" [style.top.%]="punto.y"
                             [class.activo]="punto.estado === 'CONECTADA'">
                          <span class="tooltip">{{ punto.nombre }}</span>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div class="leyenda-mapa">
                <div class="leyenda-item">
                  <span class="punto-leyenda conectada"></span> Conectada
                </div>
                <div class="leyenda-item">
                  <span class="punto-leyenda desconectada"></span> Desconectada
                </div>
              </div>
            </div>
          </div>
        }

        <!-- PESTAÑA: INVENTARIO -->
        @if (pestanaActiva() === 'inventario') {
          <div class="contenido-pestana">
            <h2>Inventario de Equipos</h2>
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
              <div class="tarjeta-inventario">
                <div class="icono">🔗</div>
                <h3>Conectores</h3>
                <p class="cantidad">50 Disponibles</p>
                <p class="estado">Stock completo</p>
              </div>
              <div class="tarjeta-inventario">
                <div class="icono">🎥</div>
                <h3>Cámaras</h3>
                <p class="cantidad">5 Disponibles</p>
                <p class="estado">Todas operativas</p>
              </div>
            </div>
          </div>
        }

        <!-- PESTAÑA: CHAT -->
        @if (pestanaActiva() === 'chat') {
          <div class="contenido-pestana">
            <h2>Chat con Usuarios</h2>
            <div class="panel-chat">
              <div class="lista-usuarios">
                <h3>Usuarios en línea</h3>
                <div class="usuario-chat">
                  <span class="online-badge">🟢</span>
                  <span>Juan Pérez</span>
                </div>
                <div class="usuario-chat">
                  <span class="online-badge">🟢</span>
                  <span>María García</span>
                </div>
                <div class="usuario-chat">
                  <span class="offline-badge">🔴</span>
                  <span>Carlos López</span>
                </div>
              </div>
              <div class="area-chat">
                <div class="mensaje-chat">
                  <strong>Juan Pérez:</strong> ¿Mi publicación fue aprobada?
                </div>
                <div class="mensaje-chat propio">
                  <strong>Tú:</strong> Sí, tu publicación fue aprobada. Está lista para activar.
                </div>
              </div>
              <div class="input-chat">
                <input type="text" placeholder="Escribe tu respuesta...">
                <button class="btn-enviar">Enviar</button>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Botón de Impresión -->
      <div class="footer-tecnico">
        <button class="btn-imprimir" (click)="imprimirReporte()">
          🖨️ Imprimir Reporte
        </button>
      </div>
    </div>
  `,
  styles: [`
    .panel-tecnico {
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }

    .header-tecnico {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .header-tecnico h1 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .info-tecnico {
      display: flex;
      gap: 20px;
      color: #666;
    }

    .tabs-navigation {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .btn-tab {
      padding: 10px 20px;
      background: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s;
    }

    .btn-tab:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .btn-tab.activo {
      background: #667eea;
      color: white;
    }

    .contenido-pestana {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .grid-publicaciones {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .tarjeta-publicacion {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }

    .img-publicacion {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .info-publicacion {
      padding: 15px;
    }

    .info-publicacion h3 {
      margin: 0 0 10px 0;
    }

    .usuario, .ubicacion, .precio, .descripcion {
      font-size: 0.9em;
      color: #666;
      margin: 5px 0;
    }

    .acciones-publicacion {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }

    .btn-aprobar {
      flex: 1;
      padding: 8px;
      background: #22c55e;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-rechazar {
      flex: 1;
      padding: 8px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .tabla-pantallas {
      overflow-x: auto;
      margin-top: 20px;
    }

    .tabla-pantallas table {
      width: 100%;
      border-collapse: collapse;
    }

    .tabla-pantallas th {
      background: #f5f5f5;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }

    .tabla-pantallas td {
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }

    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9em;
    }

    .badge.conectada {
      background: #dcfce7;
    }

    .inventario-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .tarjeta-inventario {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }

    .icono {
      font-size: 2em;
      margin-bottom: 10px;
    }

    .cantidad {
      font-size: 1.5em;
      font-weight: bold;
      margin: 10px 0;
    }

    .estado {
      font-size: 0.9em;
      opacity: 0.9;
    }

    .panel-chat {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 20px;
      margin-top: 20px;
      height: 400px;
    }

    .lista-usuarios {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 10px;
    }

    .usuario-chat {
      padding: 8px;
      margin: 5px 0;
      background: #f5f5f5;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .online-badge { color: #22c55e; font-weight: bold; }
    .offline-badge { color: #ef4444; font-weight: bold; }

    .area-chat {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 10px;
      overflow-y: auto;
      background: #f9f9f9;
    }

    .mensaje-chat {
      margin: 10px 0;
      padding: 10px;
      background: white;
      border-radius: 4px;
    }

    .mensaje-chat.propio {
      background: #e0e7ff;
      text-align: right;
    }

    .input-chat {
      display: flex;
      gap: 10px;
    }

    .input-chat input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .btn-enviar {
      padding: 10px 20px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .footer-tecnico {
      margin-top: 20px;
      text-align: center;
    }

    .btn-imprimir {
      padding: 12px 30px;
      background: white;
      border: none;
      border-radius: 8px;
      font-size: 1em;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s;
    }

    .btn-imprimir:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .sin-elementos {
      padding: 40px 20px;
      text-align: center;
      color: #666;
    }

    .mapa-simple {
      height: 400px;
      background: #f0f0f0;
      border-radius: 8px;
      position: relative;
      overflow: hidden;
    }

    .regiones-colombia {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .municipio {
      position: absolute;
      border: 1px solid #ddd;
      padding: 10px;
    }

    .municipio-nombre {
      font-weight: bold;
      font-size: 0.9em;
      margin-bottom: 5px;
    }

    .punto {
      position: absolute;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #ef4444;
      cursor: pointer;
      transition: all 0.3s;
    }

    .punto.activo {
      background: #22c55e;
      width: 16px;
      height: 16px;
      margin-left: -2px;
      margin-top: -2px;
    }

    .punto:hover .tooltip {
      display: block;
    }

    .tooltip {
      display: none;
      position: absolute;
      background: #333;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      white-space: nowrap;
      font-size: 0.8em;
      z-index: 10;
    }

    .leyenda-mapa {
      margin-top: 10px;
      display: flex;
      gap: 20px;
    }

    .leyenda-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .punto-leyenda {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .punto-leyenda.conectada {
      background: #22c55e;
    }

    .punto-leyenda.desconectada {
      background: #ef4444;
    }

    .contenedor-mapa {
      margin-top: 20px;
    }
  `]
})
export class PanelTecnicoComponent implements OnInit {
  private http = inject(HttpClient);

  pestanaActiva = signal<string>('revision');
  pendientes = signal<Publicacion[]>([]);
  pantallasConectadas = signal<Pantalla[]>([]);

  municipios = [
    { nombre: 'Armenia', puntos: [
      { id: 1, nombre: 'CC Premium', x: 30, y: 20, estado: 'CONECTADA' },
      { id: 2, nombre: 'Centro Comercial', x: 50, y: 40, estado: 'CONECTADA' },
      { id: 3, nombre: 'Plaza Principal', x: 70, y: 60, estado: 'DESCONECTADA' }
    ]},
    { nombre: 'Pereira', puntos: [
      { id: 4, nombre: 'CC Primavera', x: 25, y: 70, estado: 'CONECTADA' },
      { id: 5, nombre: 'Paseo Peatonal', x: 60, y: 75, estado: 'CONECTADA' }
    ]},
    { nombre: 'Manizales', puntos: [
      { id: 6, nombre: 'Centro', x: 75, y: 25, estado: 'CONECTADA' }
    ]}
  ];

  ngOnInit() {
    this.cargarPublicacionesPendientes();
    this.cargarPantallas();
  }

  cambiarPestana(pestana: string) {
    this.pestanaActiva.set(pestana);
  }

  cargarPublicacionesPendientes() {
    // Datos estáticos mientras el backend se implementa
    this.pendientes.set([]);
  }

  cargarPantallas() {
    // Simulación de pantallas
    this.pantallasConectadas.set([
      { id: 1, nombre: 'Raspberry Pi #1', ubicacion: 'CC Premium', estado: 'CONECTADA', ultimaActualizacion: 'hace 2 min' },
      { id: 2, nombre: 'Raspberry Pi #2', ubicacion: 'Centro Comercial', estado: 'CONECTADA', ultimaActualizacion: 'hace 5 min' },
      { id: 3, nombre: 'Raspberry Pi #3', ubicacion: 'Plaza Principal', estado: 'DESCONECTADA', ultimaActualizacion: 'hace 30 min' }
    ]);
  }

  aprobarPublicacion(id: number) {
    // TODO: Implementar cuando backend esté listo
    alert('✅ Publicación aprobada (demo)');
  }

  rechazarPublicacion(id: number) {
    // TODO: Implementar cuando backend esté listo
    alert('❌ Publicación rechazada (demo)');
  }

  imprimirReporte() {
    window.print();
  }
}

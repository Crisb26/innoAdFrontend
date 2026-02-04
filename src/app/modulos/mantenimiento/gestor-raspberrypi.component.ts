import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface RaspberryPi {
  id: string;
  nombre: string;
  ubicacion: string;
  estado: 'activa' | 'inactiva' | 'error';
  ip?: string;
  temperatura?: number;
  cpu?: number;
  memoria?: number;
  contenido_actual?: string;
  uptime?: number;
  ultima_sincronizacion?: string;
}

@Component({
  selector: 'app-gestor-raspberrypi',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="contenedor-rpis">
      <div class="encabezado">
        <h1>Gestor de Pantallas Digitales</h1>
        <div class="acciones-globales">
          <button class="btn-accion" (click)="abrirDialogoNueva()">
            <span class="icono">+</span> Nueva Pantalla
          </button>
          <button class="btn-accion secundario" (click)="sincronizarTodas()">
            Sincronizar Todo
          </button>
          <button class="btn-accion secundario" (click)="reiniciarTodas()">
            Reiniciar Todo
          </button>
        </div>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="panel-filtros">
        <input 
          type="text" 
          placeholder="Buscar por nombre o ubicación..."
          [(ngModel)]="terminoBusqueda"
          (input)="filtrarPantallas()"
          class="input-busqueda"
        />
        
        <select [(ngModel)]="filtroEstado" (change)="filtrarPantallas()" class="select-filtro">
          <option value="">Todas</option>
          <option value="activa">Activas</option>
          <option value="inactiva">Inactivas</option>
          <option value="error">Con Error</option>
        </select>

        <select [(ngModel)]="ordenamiento" (change)="filtrarPantallas()" class="select-filtro">
          <option value="nombre">Ordenar por Nombre</option>
          <option value="ubicacion">Ordenar por Ubicación</option>
          <option value="estado">Ordenar por Estado</option>
          <option value="cpu">Ordenar por CPU</option>
        </select>
      </div>

      <!-- Vista de tarjetas -->
      <div class="grid-pantallas">
        <div *ngFor="let rpi of pantallasVisibles" 
             class="tarjeta-pantalla" 
             [class.activa]="rpi.estado === 'activa'"
             [class.inactiva]="rpi.estado === 'inactiva'"
             [class.error]="rpi.estado === 'error'">
          
          <div class="cabecera-tarjeta">
            <div class="info-basica">
              <h3>{{ rpi.nombre }}</h3>
              <p class="ubicacion">📍 {{ rpi.ubicacion }}</p>
              <p class="id-pantalla">ID: {{ rpi.id }}</p>
            </div>
            <div class="estado-badge" [ngClass]="rpi.estado">
              <span class="circulo-estado"></span>
              {{ rpi.estado | uppercase }}
            </div>
          </div>

          <!-- Metricas de sistema -->
          <div class="seccion-metricas" *ngIf="rpi.estado === 'activa'">
            <div class="metrica">
              <label>CPU</label>
              <div class="barra-progreso">
                <div class="relleno cpu" [style.width.%]="rpi.cpu || 0"></div>
              </div>
              <span class="valor">{{ rpi.cpu || 0 }}%</span>
            </div>

            <div class="metrica">
              <label>Memoria</label>
              <div class="barra-progreso">
                <div class="relleno memoria" [style.width.%]="rpi.memoria || 0"></div>
              </div>
              <span class="valor">{{ rpi.memoria || 0 }}%</span>
            </div>

            <div class="metrica">
              <label>Temperatura</label>
              <span class="valor temp" [class.alerta]="(rpi.temperatura || 0) > 70">
                {{ rpi.temperatura || 0 | number: '1.1-1' }}°C
              </span>
            </div>

            <div class="metrica">
              <label>IP</label>
              <span class="valor">{{ rpi.ip || 'Desconocida' }}</span>
            </div>
          </div>

          <!-- Contenido actual -->
          <div class="seccion-contenido" *ngIf="rpi.contenido_actual">
            <label>Reproduciendo:</label>
            <p class="contenido-actual">{{ rpi.contenido_actual }}</p>
          </div>

          <!-- Información de conectividad -->
          <div class="seccion-sincronizacion">
            <small>Última sincronización: {{ rpi.ultima_sincronizacion | date: 'short' }}</small>
          </div>

          <!-- Acciones -->
          <div class="acciones-tarjeta">
            <button class="btn-pequeno" (click)="reproducirTest(rpi.id)" title="Prueba de pantalla">
              📺 Test
            </button>
            <button class="btn-pequeno" (click)="recargarPantalla(rpi.id)" title="Recargar contenido">
              🔄 Recargar
            </button>
            <button class="btn-pequeno" (click)="reiniciarPantalla(rpi.id)" title="Reiniciar">
              ⚡ Reiniciar
            </button>
            <button class="btn-pequeno danger" (click)="eliminarPantalla(rpi.id)" title="Eliminar">
              🗑️ Eliminar
            </button>
            <button class="btn-pequeno" (click)="editarPantalla(rpi.id)" title="Editar">
              ✏️ Editar
            </button>
          </div>
        </div>

        <!-- Mensaje cuando no hay pantallas -->
        <div *ngIf="pantallasVisibles.length === 0" class="estado-vacio">
          <p>No hay pantallas que coincidan con los filtros</p>
        </div>
      </div>

      <!-- Estadísticas generales -->
      <div class="panel-estadisticas">
        <div class="estadistica">
          <span class="numero">{{ pantallasActivas }}</span>
          <span class="etiqueta">Activas</span>
        </div>
        <div class="estadistica">
          <span class="numero">{{ pantallasInactivas }}</span>
          <span class="etiqueta">Inactivas</span>
        </div>
        <div class="estadistica">
          <span class="numero">{{ pantallasError }}</span>
          <span class="etiqueta">Con Error</span>
        </div>
        <div class="estadistica">
          <span class="numero">{{ cpu_promedio | number: '1.1-1' }}%</span>
          <span class="etiqueta">CPU Promedio</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contenedor-rpis {
      padding: 2rem;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100vh;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #e2e8f0;
    }

    .encabezado {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid rgba(0, 212, 255, 0.3);
    }

    .encabezado h1 {
      font-size: 2.5rem;
      margin: 0;
      background: linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .acciones-globales {
      display: flex;
      gap: 1rem;
    }

    .btn-accion {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%);
      color: #0f172a;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-accion:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 212, 255, 0.4);
    }

    .btn-accion.secundario {
      background: rgba(0, 212, 255, 0.1);
      color: #00d4ff;
      border: 1px solid #00d4ff;
    }

    .btn-accion.secundario:hover {
      background: rgba(0, 212, 255, 0.2);
    }

    .panel-filtros {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .input-busqueda,
    .select-filtro {
      padding: 0.75rem 1rem;
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 8px;
      color: #e2e8f0;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .input-busqueda:focus,
    .select-filtro:focus {
      outline: none;
      border-color: #00d4ff;
      background: rgba(30, 41, 59, 1);
      box-shadow: 0 0 12px rgba(0, 212, 255, 0.2);
    }

    .input-busqueda {
      flex: 1;
      min-width: 250px;
    }

    .grid-pantallas {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .tarjeta-pantalla {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .tarjeta-pantalla.activa {
      border-color: rgba(0, 212, 255, 0.6);
      background: rgba(30, 41, 59, 0.8);
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
    }

    .tarjeta-pantalla.inactiva {
      border-color: rgba(100, 116, 139, 0.4);
      opacity: 0.7;
    }

    .tarjeta-pantalla.error {
      border-color: rgba(255, 0, 106, 0.6);
      background: rgba(255, 0, 106, 0.05);
    }

    .tarjeta-pantalla:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
    }

    .cabecera-tarjeta {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(0, 212, 255, 0.2);
    }

    .cabecera-tarjeta h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      color: #00d4ff;
    }

    .ubicacion {
      margin: 0.25rem 0;
      font-size: 0.9rem;
      color: #cbd5e1;
    }

    .id-pantalla {
      margin: 0.25rem 0 0 0;
      font-size: 0.8rem;
      color: #94a3b8;
      font-family: 'Courier New', monospace;
    }

    .estado-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      background: rgba(0, 212, 255, 0.1);
      color: #00d4ff;
    }

    .estado-badge.inactiva {
      background: rgba(100, 116, 139, 0.2);
      color: #cbd5e1;
    }

    .estado-badge.error {
      background: rgba(255, 0, 106, 0.2);
      color: #ff006a;
    }

    .circulo-estado {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #00d4ff;
      animation: pulso 2s ease-in-out infinite;
    }

    .estado-badge.inactiva .circulo-estado {
      background: #64748b;
      animation: none;
    }

    .estado-badge.error .circulo-estado {
      background: #ff006a;
      animation: pulso-error 1s ease-in-out infinite;
    }

    @keyframes pulso {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @keyframes pulso-error {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.1); }
    }

    .seccion-metricas {
      margin: 1.5rem 0;
      padding: 1rem;
      background: rgba(0, 212, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(0, 212, 255, 0.2);
    }

    .metrica {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .metrica:last-child {
      margin-bottom: 0;
    }

    .metrica label {
      font-size: 0.85rem;
      color: #94a3b8;
      font-weight: 500;
    }

    .barra-progreso {
      width: 100%;
      height: 6px;
      background: rgba(100, 116, 139, 0.3);
      border-radius: 3px;
      overflow: hidden;
    }

    .relleno {
      height: 100%;
      transition: width 0.5s ease;
      border-radius: 3px;
    }

    .relleno.cpu {
      background: linear-gradient(90deg, #f59e0b 0%, #ff006a 100%);
    }

    .relleno.memoria {
      background: linear-gradient(90deg, #00d4ff 0%, #8b5cf6 100%);
    }

    .valor {
      font-size: 0.9rem;
      font-weight: 600;
      color: #e2e8f0;
    }

    .valor.temp {
      color: #f59e0b;
    }

    .valor.temp.alerta {
      color: #ff006a;
      font-weight: 700;
    }

    .seccion-contenido {
      margin: 1rem 0;
      padding: 1rem;
      background: rgba(139, 92, 246, 0.1);
      border-radius: 8px;
      border: 1px solid rgba(139, 92, 246, 0.3);
    }

    .seccion-contenido label {
      display: block;
      font-size: 0.85rem;
      color: #94a3b8;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .contenido-actual {
      margin: 0;
      font-size: 0.95rem;
      color: #8b5cf6;
      font-weight: 500;
      word-break: break-word;
    }

    .seccion-sincronizacion {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(0, 212, 255, 0.1);
    }

    .seccion-sincronizacion small {
      color: #64748b;
      font-size: 0.8rem;
    }

    .acciones-tarjeta {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.5rem;
      margin-top: 1.5rem;
    }

    .btn-pequeno {
      padding: 0.5rem;
      background: rgba(0, 212, 255, 0.2);
      color: #00d4ff;
      border: 1px solid rgba(0, 212, 255, 0.5);
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-pequeno:hover {
      background: rgba(0, 212, 255, 0.4);
      transform: scale(1.05);
    }

    .btn-pequeno.danger {
      background: rgba(255, 0, 106, 0.2);
      color: #ff006a;
      border-color: rgba(255, 0, 106, 0.5);
    }

    .btn-pequeno.danger:hover {
      background: rgba(255, 0, 106, 0.4);
    }

    .estado-vacio {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem 2rem;
      color: #64748b;
      font-size: 1.1rem;
    }

    .panel-estadisticas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .estadistica {
      text-align: center;
      padding: 1.5rem;
      background: rgba(30, 41, 59, 0.6);
      border-radius: 8px;
      border: 1px solid rgba(0, 212, 255, 0.2);
    }

    .estadistica .numero {
      display: block;
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }

    .estadistica .etiqueta {
      display: block;
      color: #94a3b8;
      font-size: 0.9rem;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .encabezado {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .acciones-globales {
        width: 100%;
      }

      .grid-pantallas {
        grid-template-columns: 1fr;
      }

      .acciones-tarjeta {
        grid-template-columns: repeat(3, 1fr);
      }

      .panel-filtros {
        flex-direction: column;
      }

      .input-busqueda {
        min-width: auto;
      }
    }
  `]
})
export class GestorRaspberryPiComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private destroy$ = new Subject<void>();

  pantallas: RaspberryPi[] = [];
  pantallasVisibles: RaspberryPi[] = [];
  
  terminoBusqueda = '';
  filtroEstado = '';
  ordenamiento = 'nombre';

  pantallasActivas = 0;
  pantallasInactivas = 0;
  pantallasError = 0;
  cpu_promedio = 0;

  ngOnInit() {
    this.cargarPantallas();
    // Actualizar cada 30 segundos
    setInterval(() => this.cargarPantallas(), 30000);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarPantallas() {
    this.http.get<any>(`${environment.urlApi}/pantallas`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta) => {
          this.pantallas = respuesta.data || [];
          this.filtrarPantallas();
          this.calcularEstadisticas();
        },
        error: (error) => console.error('Error cargando pantallas:', error)
      });
  }

  filtrarPantallas() {
    let resultado = this.pantallas;

    if (this.terminoBusqueda) {
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        p.ubicacion.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
      );
    }

    if (this.filtroEstado) {
      resultado = resultado.filter(p => p.estado === this.filtroEstado);
    }

    // Ordenar
    resultado.sort((a, b) => {
      switch (this.ordenamiento) {
        case 'ubicacion':
          return a.ubicacion.localeCompare(b.ubicacion);
        case 'estado':
          return a.estado.localeCompare(b.estado);
        case 'cpu':
          return (b.cpu || 0) - (a.cpu || 0);
        default:
          return a.nombre.localeCompare(b.nombre);
      }
    });

    this.pantallasVisibles = resultado;
  }

  calcularEstadisticas() {
    this.pantallasActivas = this.pantallas.filter(p => p.estado === 'activa').length;
    this.pantallasInactivas = this.pantallas.filter(p => p.estado === 'inactiva').length;
    this.pantallasError = this.pantallas.filter(p => p.estado === 'error').length;
    
    const activas = this.pantallas.filter(p => p.estado === 'activa');
    this.cpu_promedio = activas.length > 0 
      ? activas.reduce((sum, p) => sum + (p.cpu || 0), 0) / activas.length
      : 0;
  }

  reproducirTest(id: string) {
    this.http.post(`${environment.urlApi}/pantallas/${id}/test`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('Test enviado a pantalla:', id);
        this.cargarPantallas();
      });
  }

  recargarPantalla(id: string) {
    this.http.post(`${environment.urlApi}/pantallas/${id}/recargar`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('Recarga enviada a pantalla:', id);
        this.cargarPantallas();
      });
  }

  reiniciarPantalla(id: string) {
    if (confirm('¿Está seguro de que desea reiniciar esta pantalla?')) {
      this.http.post(`${environment.urlApi}/pantallas/${id}/reiniciar`, {})
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          console.log('Reinicio enviado a pantalla:', id);
          this.cargarPantallas();
        });
    }
  }

  sincronizarTodas() {
    this.http.post(`${environment.urlApi}/pantallas/sincronizar-todas`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('Sincronización iniciada para todas las pantallas');
        this.cargarPantallas();
      });
  }

  reiniciarTodas() {
    if (confirm('¿Está seguro? Esto reiniciará TODAS las pantallas.')) {
      this.http.post(`${environment.urlApi}/pantallas/reiniciar-todas`, {})
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          console.log('Reinicio enviado a todas las pantallas');
          this.cargarPantallas();
        });
    }
  }

  eliminarPantalla(id: string) {
    if (confirm('¿Está seguro de eliminar esta pantalla?')) {
      this.http.delete(`${environment.urlApi}/pantallas/${id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          console.log('Pantalla eliminada:', id);
          this.cargarPantallas();
        });
    }
  }

  editarPantalla(id: string) {
    console.log('Editar pantalla:', id);
    // Implementar modal de edición
  }

  abrirDialogoNueva() {
    console.log('Abrir diálogo nueva pantalla');
    // Implementar modal de creación
  }
}

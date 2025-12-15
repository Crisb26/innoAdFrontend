import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UbicacionServicio, Ciudad, Lugar, Piso, SeleccionUbicacion } from '../../../core/servicios/ubicacion.servicio';
import { PermisosServicio } from '../../../core/servicios/permisos.servicio';

@Component({
  selector: 'app-seleccionar-ubicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="seleccionar-ubicaciones-container">
      <header class="header">
        <button class="btn-volver" (click)="volver()">← Volver</button>
        <h1>📍 Seleccionar Ubicaciones para tu Publicidad</h1>
      </header>

      <div class="contenido">
        <div class="panel-izquierda">
          <!-- Paso 1: Seleccionar ciudad -->
          <div class="paso">
            <h2>1. Elige una Ciudad</h2>
            <div class="ciudades-grid">
              <button *ngFor="let ciudad of ciudades"
                      class="ciudad-btn"
                      [class.activa]="ciudadSeleccionada?.id === ciudad.id"
                      (click)="seleccionarCiudad(ciudad)">
                <span class="nombre">{{ ciudad.nombre }}</span>
                <span class="cantidad">{{ ciudad.cantidadLugares }} lugares</span>
              </button>
            </div>
          </div>

          <!-- Paso 2: Seleccionar lugar -->
          <div class="paso" *ngIf="ciudadSeleccionada">
            <h2>2. Selecciona Lugar(es)</h2>
            <div class="lugares-list">
              <div *ngIf="lugares.length === 0" class="sin-resultados">
                <p>Cargando lugares...</p>
              </div>

              <div *ngFor="let lugar of lugares"
                   class="lugar-item"
                   [class.seleccionado]="estaSeleccionado(lugar.id)">
                
                <div class="lugar-header" (click)="toggleLugar(lugar)">
                  <input type="checkbox"
                         [checked]="estaSeleccionado(lugar.id)"
                         (change)="toggleLugar(lugar)"
                         (click)="$event.stopPropagation()">
                  <div class="lugar-info">
                    <h3>{{ lugar.nombre }}</h3>
                    <small>{{ lugar.pisos }} pisos • ${{ lugar.costoBase | number:'1.2' }}/día</small>
                  </div>
                  <span *ngIf="lugar.disponible" class="badge-disponible">✓ Disponible</span>
                  <span *ngIf="!lugar.disponible" class="badge-no-disponible">✗ No disponible</span>
                </div>

                <!-- Seleccionar pisos -->
                <div *ngIf="estaSeleccionado(lugar.id)" class="pisos-selector">
                  <p class="label-pisos">Selecciona los pisos:</p>
                  <div class="pisos-grid">
                    <button *ngFor="let piso of obtenerPisos(lugar)"
                            class="piso-btn"
                            [class.seleccionado]="estaPisoSeleccionado(lugar.id, piso.numero)"
                            [disabled]="!piso.disponible"
                            (click)="togglePiso(lugar, piso)">
                      Piso {{ piso.numero }}
                      <small *ngIf="!piso.disponible">(No disponible)</small>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel derecha: Resumen -->
        <div class="panel-derecha">
          <div class="resumen-card">
            <h2>📋 Resumen</h2>

            <!-- Ubicaciones seleccionadas -->
            <div class="ubicaciones-seleccionadas">
              <h3>Ubicaciones Elegidas</h3>
              <div *ngIf="ubicacionesElegidas.length === 0" class="vacio">
                <p>Ninguna ubicación seleccionada aún</p>
              </div>

              <div *ngFor="let ubicacion of ubicacionesElegidas" class="ubicacion-elegida">
                <div class="ubicacion-titulo">
                  <h4>{{ ubicacion.ciudadNombre }} - {{ ubicacion.lugarNombre }}</h4>
                  <button class="btn-quitar" (click)="quitarUbicacion(ubicacion.lugarId)">
                    ✕
                  </button>
                </div>
                <p class="ubicacion-detalles">
                  {{ ubicacion.pisos.length }} piso(s) • ${{ ubicacion.costoPorDia | number:'1.2' }}/día
                </p>
              </div>
            </div>

            <!-- Configuración de duración -->
            <div class="duracion-seccion">
              <label>Duración de la Campaña (días)</label>
              <input type="number"
                     [(ngModel)]="duracionDias"
                     min="1"
                     max="365"
                     (change)="recalcularCosto()"
                     class="input-duracion">
            </div>

            <!-- Cálculo de costo -->
            <div class="costo-seccion" *ngIf="ubicacionesElegidas.length > 0">
              <div class="costo-item">
                <span>Total de Ubicaciones:</span>
                <span class="numero">{{ ubicacionesElegidas.length }}</span>
              </div>
              <div class="costo-item">
                <span>Pisos Totales:</span>
                <span class="numero">{{ calcularTotalPisos() }}</span>
              </div>
              <div class="costo-item">
                <span>Duración:</span>
                <span class="numero">{{ duracionDias }} días</span>
              </div>
              <div class="costo-total">
                <span>Costo Total:</span>
                <span class="precio">${{ costoTotal | number:'1.2' }}</span>
              </div>
              <small class="nota-costo">
                *Costo = Σ(CostoPorDía × Pisos × Duración)
              </small>
            </div>

            <!-- Botones de acción -->
            <div class="acciones">
              <button class="btn-limpiar"
                      [disabled]="ubicacionesElegidas.length === 0"
                      (click)="limpiarSeleccion()">
                🗑️ Limpiar
              </button>
              <button class="btn-continuar"
                      [disabled]="ubicacionesElegidas.length === 0 || duracionDias < 1"
                      (click)="continuar()">
                ✓ Continuar
              </button>
            </div>
          </div>

          <!-- Info adicional -->
          <div class="info-card">
            <h3>💡 Información</h3>
            <p>Puedes seleccionar múltiples ubicaciones en diferentes ciudades.</p>
            <p>El costo se calcula automáticamente según la duración y los pisos seleccionados.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .seleccionar-ubicaciones-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .header {
      background: white;
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .btn-volver {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      color: #1a5490;
      transition: color 0.3s ease;
    }

    .btn-volver:hover {
      color: #0d3a6e;
    }

    .header h1 {
      margin: 0;
      color: #1a5490;
      flex: 1;
    }

    .contenido {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 2rem;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    @media (max-width: 1024px) {
      .contenido {
        grid-template-columns: 1fr;
      }
    }

    .paso {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .paso h2 {
      color: #1a5490;
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-size: 1.25rem;
    }

    .ciudades-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
    }

    .ciudad-btn {
      padding: 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
    }

    .ciudad-btn:hover {
      border-color: #1a5490;
      background: #f0f8ff;
    }

    .ciudad-btn.activa {
      border-color: #1a5490;
      background: #1a5490;
      color: white;
    }

    .ciudad-btn .nombre {
      display: block;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .ciudad-btn .cantidad {
      display: block;
      font-size: 0.85rem;
      opacity: 0.7;
    }

    .lugares-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .sin-resultados {
      text-align: center;
      padding: 2rem;
      color: #999;
    }

    .lugar-item {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 1rem;
      transition: all 0.3s ease;
    }

    .lugar-item:hover {
      border-color: #1a5490;
      background: #f9f9f9;
    }

    .lugar-item.seleccionado {
      border-color: #1a5490;
      background: #f0f8ff;
    }

    .lugar-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
    }

    .lugar-header input[type="checkbox"] {
      cursor: pointer;
      width: 20px;
      height: 20px;
    }

    .lugar-info {
      flex: 1;
    }

    .lugar-info h3 {
      margin: 0 0 0.25rem 0;
      color: #333;
    }

    .lugar-info small {
      color: #666;
      font-size: 0.85rem;
    }

    .badge-disponible {
      background: #d4edda;
      color: #155724;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .badge-no-disponible {
      background: #f8d7da;
      color: #721c24;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .pisos-selector {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .label-pisos {
      margin: 0 0 0.75rem 0;
      color: #666;
      font-weight: 600;
    }

    .pisos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
      gap: 0.5rem;
    }

    .piso-btn {
      padding: 0.5rem;
      border: 2px solid #ddd;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .piso-btn:hover:not(:disabled) {
      border-color: #1a5490;
      background: #f0f8ff;
    }

    .piso-btn.seleccionado {
      border-color: #1a5490;
      background: #1a5490;
      color: white;
    }

    .piso-btn:disabled {
      background: #f0f0f0;
      color: #ccc;
      cursor: not-allowed;
    }

    .piso-btn small {
      display: block;
      font-size: 0.75rem;
    }

    .panel-derecha {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      height: fit-content;
      position: sticky;
      top: 2rem;
    }

    .resumen-card,
    .info-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .resumen-card h2,
    .info-card h3 {
      color: #1a5490;
      margin-top: 0;
      margin-bottom: 1.5rem;
    }

    .ubicaciones-seleccionadas {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .ubicaciones-seleccionadas h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 0.95rem;
    }

    .vacio {
      text-align: center;
      padding: 1rem;
      color: #999;
      font-style: italic;
    }

    .ubicacion-elegida {
      padding: 0.75rem;
      background: #f0f8ff;
      border-left: 3px solid #1a5490;
      margin-bottom: 0.5rem;
      border-radius: 4px;
    }

    .ubicacion-titulo {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }

    .ubicacion-titulo h4 {
      margin: 0;
      color: #333;
      font-size: 0.95rem;
    }

    .btn-quitar {
      background: #ff6b6b;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      transition: background 0.3s ease;
    }

    .btn-quitar:hover {
      background: #e63946;
    }

    .ubicacion-detalles {
      margin: 0;
      font-size: 0.85rem;
      color: #666;
    }

    .duracion-seccion {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .duracion-seccion label {
      display: block;
      color: #666;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }

    .input-duracion {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .input-duracion:focus {
      outline: none;
      border-color: #1a5490;
    }

    .costo-seccion {
      background: #f5f5f5;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .costo-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
      color: #666;
    }

    .costo-item .numero {
      font-weight: 600;
      color: #333;
    }

    .costo-total {
      display: flex;
      justify-content: space-between;
      padding-top: 0.75rem;
      border-top: 2px solid #ddd;
      font-weight: 600;
      font-size: 1.1rem;
      color: #1a5490;
    }

    .costo-total .precio {
      font-size: 1.25rem;
      color: #51cf66;
    }

    .nota-costo {
      display: block;
      margin-top: 0.75rem;
      color: #999;
      font-size: 0.75rem;
    }

    .acciones {
      display: flex;
      gap: 1rem;
    }

    .btn-limpiar,
    .btn-continuar {
      flex: 1;
      padding: 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.3s ease;
    }

    .btn-limpiar {
      background: #f0f0f0;
      color: #333;
    }

    .btn-limpiar:hover:not(:disabled) {
      background: #e0e0e0;
    }

    .btn-limpiar:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-continuar {
      background: #1a5490;
      color: white;
    }

    .btn-continuar:hover:not(:disabled) {
      background: #0d3a6e;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(26, 84, 144, 0.3);
    }

    .btn-continuar:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .info-card {
      background: #f0f8ff;
      border-left: 4px solid #1a5490;
    }

    .info-card p {
      margin: 0.5rem 0;
      font-size: 0.9rem;
      color: #666;
      line-height: 1.5;
    }

    .info-card p:last-child {
      margin-bottom: 0;
    }
  `]
})
export class SeleccionarUbicacionesComponent implements OnInit, OnDestroy {
  ciudades: Ciudad[] = [];
  ciudadSeleccionada: Ciudad | null = null;
  lugares: Lugar[] = [];
  ubicacionesElegidas: SeleccionUbicacion[] = [];
  duracionDias = 30;
  costoTotal = 0;

  private pisosPorLugar: Map<number, number[]> = new Map();
  private destroy$ = new Subject<void>();

  constructor(
    private ubicacionServicio: UbicacionServicio,
    private permisosServicio: PermisosServicio,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar que es usuario
    if (!this.permisosServicio.esUsuario()) {
      this.router.navigate(['/sin-permisos']);
      return;
    }

    this.cargarCiudades();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarCiudades(): void {
    this.ubicacionServicio.obtenerCiudades$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(ciudades => {
        this.ciudades = ciudades;
      });
  }

  seleccionarCiudad(ciudad: Ciudad): void {
    this.ciudadSeleccionada = ciudad;
    this.lugares = [];
    this.ubicacionServicio.obtenerLugaresPorCiudad(ciudad.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(lugares => {
        this.lugares = lugares;
      });
  }

  toggleLugar(lugar: Lugar): void {
    if (!lugar.disponible) return;

    const indice = this.ubicacionesElegidas.findIndex(u => u.lugarId === lugar.id);
    
    if (indice !== -1) {
      // Remover
      this.ubicacionesElegidas.splice(indice, 1);
      this.pisosPorLugar.delete(lugar.id);
    } else {
      // Agregar
      const nuevaUbicacion: SeleccionUbicacion = {
        ciudadId: lugar.ciudadId,
        ciudadNombre: this.ciudadSeleccionada?.nombre || '',
        lugarId: lugar.id,
        lugarNombre: lugar.nombre,
        pisos: [],
        costoPorDia: lugar.costoBase
      };
      this.ubicacionesElegidas.push(nuevaUbicacion);
      this.pisosPorLugar.set(lugar.id, []);
    }

    this.recalcularCosto();
  }

  togglePiso(lugar: Lugar, piso: Piso): void {
    const pisos = this.pisosPorLugar.get(lugar.id) || [];
    const indice = pisos.indexOf(piso.numero);

    if (indice !== -1) {
      pisos.splice(indice, 1);
    } else {
      pisos.push(piso.numero);
    }

    this.pisosPorLugar.set(lugar.id, pisos);

    // Actualizar ubicación elegida
    const ubicacion = this.ubicacionesElegidas.find(u => u.lugarId === lugar.id);
    if (ubicacion) {
      ubicacion.pisos = pisos;
    }

    this.recalcularCosto();
  }

  estaSeleccionado(lugarId: number): boolean {
    return this.ubicacionesElegidas.some(u => u.lugarId === lugarId);
  }

  estaPisoSeleccionado(lugarId: number, numeroPiso: number): boolean {
    const pisos = this.pisosPorLugar.get(lugarId) || [];
    return pisos.includes(numeroPiso);
  }

  obtenerPisos(lugar: Lugar): Piso[] {
    const pisos: Piso[] = [];
    for (let i = 1; i <= lugar.pisos; i++) {
      pisos.push({
        numero: i,
        disponible: true,
        costoPorDia: lugar.costoBase / lugar.pisos // Distribuir costo entre pisos
      });
    }
    return pisos;
  }

  calcularTotalPisos(): number {
    return this.ubicacionesElegidas.reduce((total, ub) => total + ub.pisos.length, 0);
  }

  recalcularCosto(): void {
    this.costoTotal = this.ubicacionServicio.calcularCostoTotal(this.duracionDias);
  }

  quitarUbicacion(lugarId: number): void {
    const indice = this.ubicacionesElegidas.findIndex(u => u.lugarId === lugarId);
    if (indice !== -1) {
      this.ubicacionesElegidas.splice(indice, 1);
      this.pisosPorLugar.delete(lugarId);
      this.recalcularCosto();
    }
  }

  limpiarSeleccion(): void {
    this.ubicacionesElegidas = [];
    this.pisosPorLugar.clear();
    this.costoTotal = 0;
  }

  continuar(): void {
    if (this.ubicacionesElegidas.length === 0) return;

    // Guardar la selección en el servicio
    this.ubicacionServicio.guardarSeleccion(this.duracionDias)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Navegar a crear publicación con ubicaciones ya seleccionadas
        this.router.navigate(['/publicacion/crear'], {
          state: {
            ubicacionesSeleccionadas: this.ubicacionesElegidas,
            duracionDias: this.duracionDias,
            costoEstimado: this.costoTotal
          }
        });
      });
  }

  volver(): void {
    this.router.navigate(['/usuario/dashboard']);
  }
}

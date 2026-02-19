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
  templateUrl: './seleccionar-ubicaciones.component.html',
  styleUrls: ['./seleccionar-ubicaciones.component.scss']
})
    <div class="seleccionar-ubicaciones-container">
      <header class="header">
        <button class="btn-volver" (click)="volver()">← Volver</button>
        <h1>[]� Seleccionar Ubicaciones para tu Publicidad</h1>
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
                    <small>{{ lugar.pisos }} pisos • {{ lugar.costoBase | number:'1.2' }}/día</small>
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
            <h2>[]� Resumen</h2>

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
                  {{ ubicacion.pisos.length }} piso(s) • {{ ubicacion.costoPorDia | number:'1.2' }}/día
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
                <span class="precio">{{ costoTotal | number:'1.2' }}</span>
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
                []�[] Limpiar
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
            <h3>[]� Información</h3>
            <p>Puedes seleccionar múltiples ubicaciones en diferentes ciudades.</p>
            <p>El costo se calcula automáticamente según la duración y los pisos seleccionados.</p>
          </div>
        </div>
      </div>
    </div>
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

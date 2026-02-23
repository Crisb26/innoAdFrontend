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
      this.ubicacionesElegidas.splice(indice, 1);
      this.pisosPorLugar.delete(lugar.id);
    } else {
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
        costoPorDia: lugar.costoBase / lugar.pisos
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

    this.ubicacionServicio.guardarSeleccion(this.duracionDias)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
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

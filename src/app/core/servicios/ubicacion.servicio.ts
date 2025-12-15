import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Ciudad {
  id: number;
  nombre: string;
  codigo: string;
  cantidadLugares: number;
}

export interface Lugar {
  id: number;
  ciudadId: number;
  nombre: string;
  pisos: number;
  costoBase: number;
  disponible: boolean;
}

export interface Piso {
  numero: number;
  disponible: boolean;
  costoPorDia: number;
}

export interface SeleccionUbicacion {
  ciudadId: number;
  ciudadNombre: string;
  lugarId: number;
  lugarNombre: string;
  pisos: number[];
  costoPorDia: number;
}

@Injectable({
  providedIn: 'root'
})
export class UbicacionServicio {
  private ciudades$ = new BehaviorSubject<Ciudad[]>([]);
  private lugaresSeleccionados$ = new BehaviorSubject<Lugar[]>([]);
  private ubicacionesElegidas$ = new BehaviorSubject<SeleccionUbicacion[]>([]);

  constructor(private http: HttpClient) {
    this.cargarCiudades();
  }

  /**
   * Cargar lista de ciudades
   */
  cargarCiudades(): void {
    this.http.get<Ciudad[]>('/api/ubicaciones/ciudades')
      .pipe(
        tap(ciudades => this.ciudades$.next(ciudades))
      )
      .subscribe();
  }

  /**
   * Obtener ciudades
   */
  obtenerCiudades$(): Observable<Ciudad[]> {
    return this.ciudades$.asObservable();
  }

  /**
   * Obtener lugares de una ciudad
   */
  obtenerLugaresPorCiudad(ciudadId: number): Observable<Lugar[]> {
    return this.http.get<Lugar[]>(`/api/ubicaciones/ciudades/${ciudadId}/lugares`)
      .pipe(
        tap(lugares => this.lugaresSeleccionados$.next(lugares))
      );
  }

  /**
   * Obtener pisos disponibles de un lugar
   */
  obtenerPisosDisponibles(lugarId: number): Observable<Piso[]> {
    return this.http.get<Piso[]>(`/api/ubicaciones/lugares/${lugarId}/pisos`);
  }

  /**
   * Agregar ubicación a selección
   */
  agregarUbicacion(ubicacion: SeleccionUbicacion): void {
    const ubicaciones = this.ubicacionesElegidas$.value;
    
    // Evitar duplicados
    const existe = ubicaciones.find(u => u.lugarId === ubicacion.lugarId);
    if (!existe) {
      this.ubicacionesElegidas$.next([...ubicaciones, ubicacion]);
    }
  }

  /**
   * Remover ubicación de selección
   */
  removerUbicacion(lugarId: number): void {
    const ubicaciones = this.ubicacionesElegidas$.value.filter(u => u.lugarId !== lugarId);
    this.ubicacionesElegidas$.next(ubicaciones);
  }

  /**
   * Obtener ubicaciones elegidas
   */
  obtenerUbicacionesElegidas$(): Observable<SeleccionUbicacion[]> {
    return this.ubicacionesElegidas$.asObservable();
  }

  /**
   * Calcular costo total
   */
  calcularCostoTotal(duracionDias: number): number {
    const ubicaciones = this.ubicacionesElegidas$.value;
    return ubicaciones.reduce((total, ub) => {
      const costoPorUbicacion = ub.costoPorDia * duracionDias * ub.pisos.length;
      return total + costoPorUbicacion;
    }, 0);
  }

  /**
   * Limpiar selección
   */
  limpiarSeleccion(): void {
    this.ubicacionesElegidas$.next([]);
  }

  /**
   * Guardar selección (se usa al crear publicación)
   */
  guardarSeleccion(duracionDias: number): Observable<any> {
    const ubicaciones = this.ubicacionesElegidas$.value;
    const costoTotal = this.calcularCostoTotal(duracionDias);

    return this.http.post('/api/ubicaciones/seleccionar', {
      ubicaciones,
      duracionDias,
      costoTotal
    });
  }
}

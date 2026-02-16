import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { tap } from 'rxjs/operators';

export interface CarritoItem {
  id: number;
  usuarioId: number;
  publicacionId: number;
  publicacionTitulo: string;
  publicacionImagen: string;
  cantidad: number;
  precioUnitarioCOP: number;
  subtotal: number;
  fechaAgregado: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoServicio {
  private apiUrl = `${environment.apiUrl}/api/v1/carrito`;

  // Signals para reactivity
  items = signal<CarritoItem[]>([]);
  subtotal = signal<number>(0);
  iva = signal<number>(0);
  total = signal<number>(0);

  private itemsSubject = new BehaviorSubject<CarritoItem[]>([]);
  public items$ = this.itemsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarCarrito();
  }

  /**
   * Cargar carrito del usuario
   */
  cargarCarrito(): void {
    this.http.get<any>(`${this.apiUrl}`).subscribe(
      (response: any) => {
        if (response.exito && Array.isArray(response.data)) {
          this.items.set(response.data);
          this.itemsSubject.next(response.data);
          this.actualizarCalculos();
        }
      },
      (error) => {
        console.error('Error cargando carrito:', error);
        this.items.set([]);
        this.actualizarCalculos();
      }
    );
  }

  /**
   * Agregar item al carrito
   */
  agregarAlCarrito(publicacionId: number, cantidad: number = 1): Observable<any> {
    const payload = { publicacionId, cantidad };
    return this.http.post(`${this.apiUrl}/agregar`, payload).pipe(
      tap((response: any) => {
        if (response.exito) {
          this.cargarCarrito();
        }
      })
    );
  }

  /**
   * Actualizar cantidad de item
   */
  actualizarCantidad(itemId: number, cantidad: number): Observable<any> {
    const payload = { cantidad };
    return this.http.put(`${this.apiUrl}/${itemId}/cantidad`, payload).pipe(
      tap((response: any) => {
        if (response.exito) {
          this.cargarCarrito();
        }
      })
    );
  }

  /**
   * Eliminar item del carrito
   */
  eliminarItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${itemId}`).pipe(
      tap((response: any) => {
        if (response.exito) {
          this.cargarCarrito();
        }
      })
    );
  }

  /**
   * Vaciar carrito completo
   */
  vaciarCarrito(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/vaciar`).pipe(
      tap((response: any) => {
        if (response.exito) {
          this.items.set([]);
          this.itemsSubject.next([]);
          this.actualizarCalculos();
        }
      })
    );
  }

  /**
   * Obtener totales del carrito
   */
  obtenerTotales(): Observable<any> {
    return this.http.get(`${this.apiUrl}/totales`);
  }

  /**
   * Actualizar cálculos de subtotal, IVA y total
   */
  private actualizarCalculos(): void {
    const itemsActuales = this.items();

    // Calcular subtotal
    const subtotalCalc = itemsActuales.reduce((sum, item) => sum + item.subtotal, 0);
    this.subtotal.set(subtotalCalc);

    // Calcular IVA (19%)
    const ivaCalc = subtotalCalc * 0.19;
    this.iva.set(ivaCalc);

    // Calcular total
    const totalCalc = subtotalCalc + ivaCalc;
    this.total.set(totalCalc);
  }

  /**
   * Obtener cantidad de items en el carrito
   */
  obtenerCantidadItems(): number {
    return this.items().length;
  }

  /**
   * Verificar si el carrito está vacío
   */
  estaVacio(): boolean {
    return this.items().length === 0;
  }

  /**
   * Formatear número a moneda COP
   */
  formatearCOP(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  }
}

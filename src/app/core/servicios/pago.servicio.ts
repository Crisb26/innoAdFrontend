import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Pago {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  montoCOP: number;
  estado: string;
  metodoPago: string;
  referencia: string;
  fechaCreacion: Date;
  fechaProcesamiento?: Date;
}

export interface PagoEstadisticas {
  totalPagos: number;
  pagosCompletados: number;
  totalIngresosCOP: number;
  montoPendiente: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServicioPagos {
  private apiUrl = `${environment.apiUrl}/api/v1/pagos`;
  private pagosPendientesSubject = new BehaviorSubject<Pago[]>([]);
  public pagosPendientes$ = this.pagosPendientesSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Procesar pago desde el carrito
   */
  procesarPago(metodoPago: string, referencia: string = ''): Observable<any> {
    const payload = {
      metodoPago,
      referencia
    };

    return this.http.post(`${this.apiUrl}/procesar`, payload);
  }

  /**
   * Obtener historial de pagos del usuario actual
   */
  obtenerHistorial(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/historial`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  /**
   * Obtener pagos pendientes de verificación (ADMIN/TECNICO)
   */
  obtenerPagosPendientes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pendientes`);
  }

  /**
   * Verificar pago manual (ADMIN/TECNICO)
   */
  verificarPago(pagoId: number, aprobado: boolean): Observable<any> {
    const payload = { aprobado };
    return this.http.post(`${this.apiUrl}/${pagoId}/verificar`, payload);
  }

  /**
   * Procesar reembolso (ADMIN/TECNICO)
   */
  procesarReembolso(pagoId: number, razon: string): Observable<any> {
    const payload = { razon };
    return this.http.post(`${this.apiUrl}/${pagoId}/reembolso`, payload);
  }

  /**
   * Obtener estadísticas de pagos (ADMIN/TECNICO)
   */
  obtenerEstadisticas(): Observable<PagoEstadisticas> {
    return this.http.get<any>(`${this.apiUrl}/estadisticas`).pipe(
      // map the response to extract the 'data' field
    );
  }

  /**
   * Obtener detalles de un pago
   */
  obtenerPago(pagoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${pagoId}`);
  }

  /**
   * Cargar pagos pendientes en el subject (para admin/tecnico)
   */
  cargarPagosPendientes(): void {
    this.obtenerPagosPendientes().subscribe(
      (response: any) => {
        if (response.exito && Array.isArray(response.data)) {
          this.pagosPendientesSubject.next(response.data);
        }
      },
      (error) => {
        console.error('Error cargando pagos pendientes:', error);
        this.pagosPendientesSubject.next([]);
      }
    );
  }
}

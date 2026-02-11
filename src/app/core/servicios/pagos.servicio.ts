import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '@environments/environment';

/**
 * Interfaz para datos de pago
 */
export interface DatosCheckout {
  monto: number;
  descripcion: string;
  email: string;
  nombre: string;
  planId?: number;
  tipoPago: string;
}

/**
 * Interfaz para respuesta de pago
 */
export interface RespuestaPago {
  id: number;
  referencia: string;
  monto: number;
  estado: string;
  preferenceId: string;
  descripcion: string;
  fechaCreacion: string;
}

/**
 * Servicio de Pagos - Integración con Mercado Pago
 * Fase 5 - Gestión de transacciones
 */
@Injectable({
  providedIn: 'root'
})
export class ServicioPagos {
  private readonly http = inject(HttpClient);
  
  private apiUrl = `${environment.api.baseUrl}/v1/pagos`;
  
  // Estado de transacción actual
  private pagoActual = new BehaviorSubject<RespuestaPago | null>(null);
  pagoActual$ = this.pagoActual.asObservable();
  
  /**
   * Crear pago en el backend
   */
  crearPago(datos: DatosCheckout): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, datos);
  }
  
  /**
   * Obtener pago por ID
   */
  obtenerPago(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  
  /**
   * Listar pagos del usuario
   */
  listarPagos(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }
  
  /**
   * Obtener estado de pago actual
   */
  obtenerPagoActual(): RespuestaPago | null {
    return this.pagoActual.value;
  }
  
  /**
   * Establecer pago actual
   */
  establecerPagoActual(pago: RespuestaPago) {
    this.pagoActual.next(pago);
  }
  
  /**
   * Limpiar pago actual
   */
  limpiarPagoActual() {
    this.pagoActual.next(null);
  }
  
  /**
   * Redirigir a Mercado Pago
   */
  redirigirAMercadoPago(preferenceId: string) {
    // URL base de Mercado Pago (desarrollo vs producción)
    const baseUrl = environment.production 
      ? 'https://www.mercadopago.com.co/checkout/v1/redirect'
      : 'https://sandbox.mercadopago.com.co/checkout/v1/redirect';
    
    const url = `${baseUrl}?preference-id=${preferenceId}`;
    window.location.href = url;
  }
  
  /**
   * Reembolsar pago (solo admin)
   */
  reembolsarPago(pagoId: number, monto: number, motivo: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${pagoId}/reembolsar`,
      { monto, motivo }
    );
  }
  
  /**
   * Solicitar reembolso (usuario)
   */
  solicitarReembolso(solicitud: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reembolsos/solicitar`, solicitud);
  }
  
  /**
   * Listar reembolsos del usuario
   */
  listarReembolsos(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reembolsos?page=${page}&size=${size}`);
  }
  
  /**
   * Obtener reembolso por ID
   */
  obtenerReembolso(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reembolsos/${id}`);
  }
  
  /**
   * Listar reembolsos pendientes (admin)
   */
  listarReembolsosPendientes(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/reembolsos/pendientes?page=${page}&size=${size}`);
  }
  
  /**
   * Procesar reembolso (admin)
   */
  procesarReembolso(id: number, comentario: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/reembolsos/${id}/procesar`, { comentario });
  }
  
  /**
   * Rechazar reembolso (admin)
   */
  rechazarReembolso(id: number, razonRechazo: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/reembolsos/${id}/rechazar`, { razonRechazo });
  }
  
  /**
   * Obtener estadísticas de reembolsos (admin)
   */
  obtenerEstadisticasReembolsos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/reembolsos/estadisticas`);
  }
}

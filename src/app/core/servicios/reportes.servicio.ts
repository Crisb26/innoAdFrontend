import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface Reporte {
  id: number;
  titulo: string;
  tipo: 'CAMPANA' | 'CONTENIDO' | 'ANALYTICS' | 'USUARIOS';
  periodo: 'DIARIO' | 'SEMANAL' | 'MENSUAL' | 'PERSONALIZADO';
  fechaGeneracion: Date;
  estado: 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADO' | 'ERROR';
  generadoPor: string;
  datos?: any;
  costoGeneracion?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesServicio {
  private readonly API_URL = `${environment.urlApi}/reportes`;
  private reportes$ = new BehaviorSubject<Reporte[]>([]);
  private reporteActual$ = new BehaviorSubject<Reporte | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Obtener historial de reportes
   */
  obtenerHistorial(pagina: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(
      `${this.API_URL}/historial?page=${pagina}&size=${size}`
    ).pipe(
      tap(respuesta => this.reportes$.next(respuesta.content))
    );
  }

  /**
   * Obtener observable de reportes
   */
  obtenerReportes$(): Observable<Reporte[]> {
    return this.reportes$.asObservable();
  }

  /**
   * Generar nuevo reporte
   */
  generarReporte(tipoReporte: string, opciones: any): Observable<Reporte> {
    return this.http.post<Reporte>(
      `${this.API_URL}/generar`,
      {
        tipo: tipoReporte,
        opciones
      }
    ).pipe(
      tap(reporte => this.reporteActual$.next(reporte))
    );
  }

  /**
   * Obtener reporte específico
   */
  obtenerReporte(id: number): Observable<Reporte> {
    return this.http.get<Reporte>(`${this.API_URL}/${id}`);
  }

  /**
   * Descargar reporte en PDF
   */
  descargarReportePDF(id: number): Observable<Blob> {
    return this.http.get(
      `${this.API_URL}/${id}/descargar/pdf`,
      { responseType: 'blob' }
    );
  }

  /**
   * Descargar reporte en CSV
   */
  descargarReporteCSV(id: number): Observable<Blob> {
    return this.http.get(
      `${this.API_URL}/${id}/descargar/csv`,
      { responseType: 'blob' }
    );
  }

  /**
   * Descargar reporte en Excel
   */
  descargarReporteExcel(id: number): Observable<Blob> {
    return this.http.get(
      `${this.API_URL}/${id}/descargar/excel`,
      { responseType: 'blob' }
    );
  }

  /**
   * Eliminar reporte
   */
  eliminarReporte(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  /**
   * Obtener plantillas disponibles
   */
  obtenerPlantillas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/plantillas`);
  }

  /**
   * Programar reporte automático
   */
  programarReporte(configuracion: any): Observable<any> {
    return this.http.post(`${this.API_URL}/programado`, configuracion);
  }

  /**
   * Obtener reportes programados
   */
  obtenerReportesProgramados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/programados`);
  }

  /**
   * Cancelar reporte programado
   */
  cancelarReporteProgramado(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/programados/${id}`);
  }
}

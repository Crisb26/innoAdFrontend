import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { 
  EstadisticasGenerales, 
  EstadisticasCampanas, 
  EstadisticasPantallas,
  EstadisticasContenidos,
  Reporte,
  SolicitudGenerarReporte,
  FiltroEstadisticas,
  RespuestaAPI
} from '@core/modelos';

@Injectable({
  providedIn: 'root'
})
export class ServicioEstadisticas {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.urlApi}/estadisticas`;
  
  obtenerGenerales(filtro?: FiltroEstadisticas): Observable<EstadisticasGenerales> {
    let params = new HttpParams();
    if (filtro) {
      params = params.set('fechaInicio', filtro.fechaInicio.toISOString());
      params = params.set('fechaFin', filtro.fechaFin.toISOString());
    }
    
    return this.http.get<RespuestaAPI<EstadisticasGenerales>>(`${this.API_URL}/generales`, { params })
      .pipe(map(r => r.datos!));
  }
  
  obtenerCampanas(filtro?: FiltroEstadisticas): Observable<EstadisticasCampanas> {
    return this.http.post<RespuestaAPI<EstadisticasCampanas>>(`${this.API_URL}/campanas`, filtro)
      .pipe(map(r => r.datos!));
  }
  
  obtenerPantallas(filtro?: FiltroEstadisticas): Observable<EstadisticasPantallas> {
    return this.http.post<RespuestaAPI<EstadisticasPantallas>>(`${this.API_URL}/pantallas`, filtro)
      .pipe(map(r => r.datos!));
  }
  
  obtenerContenidos(filtro?: FiltroEstadisticas): Observable<EstadisticasContenidos> {
    return this.http.post<RespuestaAPI<EstadisticasContenidos>>(`${this.API_URL}/contenidos`, filtro)
      .pipe(map(r => r.datos!));
  }
  
  generarReporte(solicitud: SolicitudGenerarReporte): Observable<Reporte> {
    return this.http.post<RespuestaAPI<Reporte>>(`${this.API_URL}/reportes`, solicitud)
      .pipe(map(r => r.datos!));
  }
  
  descargarReporte(reporteId: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/reportes/${reporteId}/descargar`, {
      responseType: 'blob'
    });
  }
}

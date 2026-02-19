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
  // NOTA: Los endpoints de estadísticas usan rutas en inglés (/stats, /dashboard, /campaigns, /screens, /content)
  // mientras que los endpoints de autenticación usan rutas en español (/registrarse, /recuperar-contrasena).
  // Esta inconsistencia existe por razones históricas del backend. Considerar estandarizar en el futuro.
  private readonly API_URL = `${environment.urlApi}/stats`;
  
  obtenerGenerales(filtro?: FiltroEstadisticas): Observable<EstadisticasGenerales> {
    let params = new HttpParams();
    if (filtro) {
      params = params.set('fechaInicio', filtro.fechaInicio.toISOString());
      params = params.set('fechaFin', filtro.fechaFin.toISOString());
    }
    
    return this.http.get<any>(`${this.API_URL}/dashboard`, { params })
      .pipe(map(r => {
        // El endpoint devuelve los datos directamente, no en una estructura RespuestaAPI
        return r.datos || r;
      }));
  }
  
  obtenerCampanas(filtro?: FiltroEstadisticas): Observable<EstadisticasCampanas> {
    let params = new HttpParams();
    if (filtro) {
      params = params.set('fechaInicio', filtro.fechaInicio.toISOString());
      params = params.set('fechaFin', filtro.fechaFin.toISOString());
    }
    return this.http.get<any>(`${this.API_URL}/campaigns`, { params })
      .pipe(map(r => r.datos || r));
  }
  
  obtenerPantallas(filtro?: FiltroEstadisticas): Observable<EstadisticasPantallas> {
    let params = new HttpParams();
    if (filtro) {
      params = params.set('fechaInicio', filtro.fechaInicio.toISOString());
      params = params.set('fechaFin', filtro.fechaFin.toISOString());
    }
    return this.http.get<any>(`${this.API_URL}/screens`, { params })
      .pipe(map(r => r.datos || r));
  }
  
  obtenerContenidos(filtro?: FiltroEstadisticas): Observable<EstadisticasContenidos> {
    let params = new HttpParams();
    if (filtro) {
      params = params.set('fechaInicio', filtro.fechaInicio.toISOString());
      params = params.set('fechaFin', filtro.fechaFin.toISOString());
    }
    return this.http.get<any>(`${this.API_URL}/content`, { params })
      .pipe(map(r => r.datos || r));
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

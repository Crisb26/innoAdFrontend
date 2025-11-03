import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { 
  MensajeChat, 
  SolicitudChat, 
  RespuestaChat,
  AnalisisPredictivo,
  SolicitudAnalisis,
  EstadisticasAgenteIA,
  RespuestaAPI
} from '@core/modelos';

@Injectable({
  providedIn: 'root'
})
export class ServicioAgenteIA {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.urlApi}/agente-ia`;
  
  enviarMensaje(solicitud: SolicitudChat): Observable<RespuestaChat> {
    return this.http.post<RespuestaAPI<RespuestaChat>>(`${this.API_URL}/chat`, solicitud)
      .pipe(map(r => r.datos!));
  }
  
  obtenerHistorialChat(): Observable<MensajeChat[]> {
    return this.http.get<RespuestaAPI<MensajeChat[]>>(`${this.API_URL}/historial`)
      .pipe(map(r => r.datos!));
  }
  
  limpiarHistorial(): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/historial`);
  }
  
  solicitarAnalisis(solicitud: SolicitudAnalisis): Observable<AnalisisPredictivo> {
    return this.http.post<RespuestaAPI<AnalisisPredictivo>>(`${this.API_URL}/analisis`, solicitud)
      .pipe(map(r => r.datos!));
  }
  
  obtenerEstadisticas(): Observable<EstadisticasAgenteIA> {
    return this.http.get<RespuestaAPI<EstadisticasAgenteIA>>(`${this.API_URL}/estadisticas`)
      .pipe(map(r => r.datos!));
  }
}

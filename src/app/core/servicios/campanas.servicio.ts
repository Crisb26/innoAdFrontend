import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { 
  Campana, 
  SolicitudCrearCampana, 
  SolicitudActualizarCampana,
  FiltroCampanas,
  RespuestaPaginada,
  RespuestaAPI,
  EstadoCampaña
} from '@core/modelos';

@Injectable({
  providedIn: 'root'
})
export class ServicioCampanas {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.urlApi}/campanas`;
  
  obtenerTodas(filtro: FiltroCampanas): Observable<RespuestaPaginada<Campana>> {
    let params = new HttpParams()
      .set('pagina', filtro.pagina.toString())
      .set('tamaño', filtro.tamaño.toString());
    
    if (filtro.estado) params = params.set('estado', filtro.estado);
    if (filtro.tipo) params = params.set('tipo', filtro.tipo);
    if (filtro.cliente) params = params.set('cliente', filtro.cliente);
    if (filtro.busqueda) params = params.set('busqueda', filtro.busqueda);
    
    return this.http.get<RespuestaAPI<RespuestaPaginada<Campana>>>(this.API_URL, { params })
      .pipe(map(r => r.datos!));
  }
  
  obtenerPorId(id: string): Observable<Campana> {
    return this.http.get<RespuestaAPI<Campana>>(`${this.API_URL}/${id}`)
      .pipe(map(r => r.datos!));
  }
  
  crear(solicitud: SolicitudCrearCampana): Observable<Campana> {
    return this.http.post<RespuestaAPI<Campana>>(this.API_URL, solicitud)
      .pipe(map(r => r.datos!));
  }
  
  actualizar(solicitud: SolicitudActualizarCampana): Observable<Campana> {
    return this.http.put<RespuestaAPI<Campana>>(`${this.API_URL}/${solicitud.id}`, solicitud)
      .pipe(map(r => r.datos!));
  }
  
  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
  
  cambiarEstado(id: string, estado: EstadoCampana): Observable<Campana> {
    return this.http.patch<RespuestaAPI<Campana>>(`${this.API_URL}/${id}/estado`, { estado })
      .pipe(map(r => r.datos!));
  }
  
  duplicar(id: string): Observable<Campana> {
    return this.http.post<RespuestaAPI<Campana>>(`${this.API_URL}/${id}/duplicar`, {})
      .pipe(map(r => r.datos!));
  }
}

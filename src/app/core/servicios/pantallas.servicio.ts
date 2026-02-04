import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { 
  Pantalla, 
  SolicitudCrearPantalla, 
  SolicitudActualizarPantalla,
  FiltroPantallas,
  ComandoPantalla,
  EstadoConexionPantalla,
  RespuestaPaginada,
  RespuestaAPI
} from '@core/modelos';

@Injectable({
  providedIn: 'root'
})
export class ServicioPantallas {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.urlApi}/pantallas`;
  
  obtenerTodas(filtro: FiltroPantallas): Observable<RespuestaPaginada<Pantalla>> {
    let params = new HttpParams()
      .set('pagina', filtro.pagina.toString())
      .set('tamaño', filtro.tamaño.toString());
    
    if (filtro.estado) params = params.set('estado', filtro.estado);
    if (filtro.ciudad) params = params.set('ciudad', filtro.ciudad);
    if (filtro.busqueda) params = params.set('busqueda', filtro.busqueda);
    
    return this.http.get<RespuestaAPI<RespuestaPaginada<Pantalla>>>(this.API_URL, { params })
      .pipe(map(r => r.datos!));
  }
  
  obtenerPorId(id: string): Observable<Pantalla> {
    return this.http.get<RespuestaAPI<Pantalla>>(`${this.API_URL}/${id}`)
      .pipe(map(r => r.datos!));
  }
  
  crear(solicitud: SolicitudCrearPantalla): Observable<Pantalla> {
    return this.http.post<RespuestaAPI<Pantalla>>(this.API_URL, solicitud)
      .pipe(map(r => r.datos!));
  }
  
  actualizar(solicitud: SolicitudActualizarPantalla): Observable<Pantalla> {
    return this.http.put<RespuestaAPI<Pantalla>>(`${this.API_URL}/${solicitud.id}`, solicitud)
      .pipe(map(r => r.datos!));
  }
  
  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
  
  enviarComando(comando: ComandoPantalla): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${comando.pantallaId}/comando`, comando);
  }
  
  obtenerEstadoConexion(id: string): Observable<EstadoConexionPantalla> {
    return this.http.get<RespuestaAPI<EstadoConexionPantalla>>(`${this.API_URL}/${id}/estado`)
      .pipe(map(r => r.datos!));
  }
}

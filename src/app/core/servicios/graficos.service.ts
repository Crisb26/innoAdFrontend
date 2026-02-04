import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retry, retryWhen, mergeMap, finalize, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface RespuestaGraficos {
  estadisticas: {
    campanas_activas: number;
    pantallas_conectadas: number;
    contenidos_publicados: number;
    usuarios_activos: number;
  };
  graficos: {
    campanas_por_estado: Array<{ estado: string; cantidad: number }>;
    pantallas_por_estado: Array<{ estado: string; cantidad: number }>;
    contenidos_por_tipo: Array<{ tipo: string; cantidad: number }>;
    actividad_por_hora: Array<{ hora: number; cantidad: number }>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ServicioGraficos {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.urlApi}/graficos`;
  private intentos = 0;
  private maxIntentos = 3;

  obtenerDatos(filtro?: any): Observable<RespuestaGraficos> {
    let params = new HttpParams();
    if (filtro) {
      if (filtro.fechaInicio) {
        params = params.set('fechaInicio', filtro.fechaInicio);
      }
      if (filtro.fechaFin) {
        params = params.set('fechaFin', filtro.fechaFin);
      }
    }

    return this.http.get<RespuestaGraficos>(`${this.API_URL}/dashboard`, { params }).pipe(
      // Reintentos con backoff exponencial: 1s, 2s, 4s
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            this.intentos = index + 1;
            
            // Retry solo en errores específicos transitorios
            if (
              (error.status === 0 || // Timeout/conectividad
              error.status === 503 || // Servicio no disponible
              error.status === 504) && // Gateway timeout
              this.intentos <= this.maxIntentos
            ) {
              const delayMs = Math.pow(2, index) * 1000; // 1s, 2s, 4s
              console.warn(
                `[Gráficos] Reintentando en ${delayMs}ms (intento ${this.intentos}/${this.maxIntentos})`
              );
              return timer(delayMs);
            }
            
            // No reintentar para otros errores
            return throwError(() => error);
          })
        )
      ),
      tap(() => {
        if (this.intentos > 0) {
          console.log(`[Gráficos] Datos obtenidos exitosamente después de ${this.intentos} reintento(s)`);
          this.intentos = 0;
        }
      }),
      finalize(() => {
        this.intentos = 0;
      })
    );
  }

  obtenerEstadisticas(): Observable<RespuestaGraficos['estadisticas']> {
    return this.http.get<RespuestaGraficos['estadisticas']>(
      `${this.API_URL}/estadisticas`
    ).pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            if (
              (error.status === 0 || error.status === 503 || error.status === 504) &&
              index < this.maxIntentos
            ) {
              return timer(Math.pow(2, index) * 1000);
            }
            return throwError(() => error);
          })
        )
      )
    );
  }

  obtenerGraficos(tipo?: string): Observable<RespuestaGraficos['graficos']> {
    let params = new HttpParams();
    if (tipo) {
      params = params.set('tipo', tipo);
    }

    return this.http.get<RespuestaGraficos['graficos']>(
      `${this.API_URL}/graficos`,
      { params }
    ).pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            if (
              (error.status === 0 || error.status === 503 || error.status === 504) &&
              index < this.maxIntentos
            ) {
              return timer(Math.pow(2, index) * 1000);
            }
            return throwError(() => error);
          })
        )
      )
    );
  }
}

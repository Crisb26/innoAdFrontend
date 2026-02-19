import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, timer, of } from 'rxjs';
import { retry, delay, timeout, map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { API_ENDPOINTS, DEFAULT_API_CONFIG, HTTP_STATUS } from '@core/config/api.config';
import { ApiGatewayService } from './api-gateway.servicio';

/**
 * Interfaces para respuestas de API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
  field?: string;
}

export interface RequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  skipErrorHandling?: boolean;
  showLoader?: boolean;
}

/**
 * Servicio base para todas las comunicaciones HTTP
 * Proporciona métodos estándar con manejo de errores, retry automático,
 * timeout, cache y notificaciones de estado
 */
@Injectable({
  providedIn: 'root'
})
export class HttpBaseService {
  private readonly http = inject(HttpClient);
  private readonly apiGateway = inject(ApiGatewayService);
  
  // Usar API Gateway para obtener URLs (preparado para microservicios)
  private readonly baseUrl = this.apiGateway.getGatewayUrl();
  private readonly defaultTimeout = DEFAULT_API_CONFIG.timeout;
  private readonly defaultRetryAttempts = DEFAULT_API_CONFIG.retryAttempts;
  private readonly defaultRetryDelay = DEFAULT_API_CONFIG.retryDelay;

  // Estados de carga y conexión
  private readonly _isLoading = signal(false);
  private readonly _isOnline = signal(navigator.onLine);
  private readonly _activeRequests = signal(0);

  // Cache simple en memoria
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  // Subjects para notificaciones globales
  public readonly loadingState$ = new BehaviorSubject<boolean>(false);
  public readonly connectionState$ = new BehaviorSubject<boolean>(navigator.onLine);

  // Getters públicos
  get isLoading() { return this._isLoading.asReadonly(); }
  get isOnline() { return this._isOnline.asReadonly(); }
  get activeRequests() { return this._activeRequests.asReadonly(); }

  constructor() {
    this.initializeNetworkMonitoring();
  }

  /**
   * GET request genérico
   */
  get<T>(endpoint: string, options: RequestOptions = {}): Observable<T> {
    return this.executeRequest<T>('GET', endpoint, null, options);
  }

  /**
   * POST request genérico
   */
  post<T>(endpoint: string, body: any, options: RequestOptions = {}): Observable<T> {
    return this.executeRequest<T>('POST', endpoint, body, options);
  }

  /**
   * PUT request genérico
   */
  put<T>(endpoint: string, body: any, options: RequestOptions = {}): Observable<T> {
    return this.executeRequest<T>('PUT', endpoint, body, options);
  }

  /**
   * PATCH request genérico
   */
  patch<T>(endpoint: string, body: any, options: RequestOptions = {}): Observable<T> {
    return this.executeRequest<T>('PATCH', endpoint, body, options);
  }

  /**
   * DELETE request genérico
   */
  delete<T>(endpoint: string, options: RequestOptions = {}): Observable<T> {
    return this.executeRequest<T>('DELETE', endpoint, null, options);
  }

  /**
   * Upload de archivos con progreso
   */
  upload<T>(endpoint: string, file: File, options: RequestOptions = {}): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.executeRequest<T>('POST', endpoint, formData, {
      ...options,
      headers: {
        // No establecer Content-Type para FormData (el navegador lo hará automáticamente)
        ...options.headers
      }
    });
  }

  /**
   * Request con cache
   */
  getWithCache<T>(endpoint: string, ttl: number = 5 * 60 * 1000, options: RequestOptions = {}): Observable<T> {
    const cacheKey = this.generateCacheKey('GET', endpoint, options.params);
    const cached = this.getFromCache<T>(cacheKey);

    if (cached) {
      return new Observable(observer => {
        observer.next(cached);
        observer.complete();
      });
    }

    return this.get<T>(endpoint, options).pipe(
      map(response => {
        this.setCache(cacheKey, response, ttl);
        return response;
      })
    );
  }

  /**
   * Request por lotes (batch)
   */
  batch<T>(requests: Array<{ method: string; endpoint: string; body?: any }>): Observable<T[]> {
    const batchRequests = requests.map(req => 
      this.executeRequest<T>(req.method, req.endpoint, req.body)
    );

    return new Observable(observer => {
      Promise.all(batchRequests.map(req => req.toPromise()))
        .then(results => {
          observer.next(results as T[]);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  /**
   * Limpiar cache
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  /**
   * Verificar conectividad
   */
  checkConnectivity(): Observable<boolean> {
    return this.get<{ status: string }>('/system/health', { timeout: 5000 }).pipe(
      map((response: any) => response?.status === 'ok' || true),
      catchError(() => of(false))
    );
  }

  /**
   * Ejecutor principal de requests
   */
  private executeRequest<T>(
    method: string, 
    endpoint: string, 
    body: any = null, 
    options: RequestOptions = {}
  ): Observable<T> {
    const url = this.buildUrl(endpoint);
    const requestOptions = this.buildRequestOptions(options);
    const retryAttempts = options.retryAttempts ?? this.defaultRetryAttempts;
    const retryDelayMs = options.retryDelay ?? this.defaultRetryDelay;
    const timeoutMs = options.timeout ?? this.defaultTimeout;

    // Actualizar contadores
    this.incrementActiveRequests();
    if (options.showLoader !== false) {
      this.setLoadingState(true);
    }

    let request$: Observable<any>;

    switch (method.toUpperCase()) {
      case 'GET':
        request$ = this.http.get<ApiResponse<T>>(url, requestOptions);
        break;
      case 'POST':
        request$ = this.http.post<ApiResponse<T>>(url, body, requestOptions);
        break;
      case 'PUT':
        request$ = this.http.put<ApiResponse<T>>(url, body, requestOptions);
        break;
      case 'PATCH':
        request$ = this.http.patch<ApiResponse<T>>(url, body, requestOptions);
        break;
      case 'DELETE':
        request$ = this.http.delete<ApiResponse<T>>(url, requestOptions);
        break;
      default:
        throw new Error(`Método HTTP no soportado: ${method}`);
    }

    return request$.pipe(
      timeout(timeoutMs),
      retry({
        count: retryAttempts,
        delay: retryDelayMs
      }),
      map(response => this.processResponse<T>(response)),
      catchError(error => this.handleError(error, options)),
      tap({
        finalize: () => {
          this.decrementActiveRequests();
          if (this._activeRequests() === 0) {
            this.setLoadingState(false);
          }
        }
      })
    );
  }

  /**
   * Procesar respuesta de API
   */
  private processResponse<T>(response: ApiResponse<T>): T {
    if (response.success === false) {
      throw new Error(response.message || 'Error en la respuesta de la API');
    }
    return response.data;
  }

  /**
   * Construir URL completa
   */
  private buildUrl(endpoint: string): string {
    // Si el endpoint ya es una URL completa, usarla tal como está
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    // Limpiar endpoint
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    
    return `${cleanBaseUrl}/${DEFAULT_API_CONFIG.version}/${cleanEndpoint}`;
  }

  /**
   * Construir opciones de request
   */
  private buildRequestOptions(options: RequestOptions): any {
    const requestOptions: any = {};

    if (options.headers) {
      requestOptions.headers = options.headers;
    }

    if (options.params) {
      requestOptions.params = options.params;
    }

    return requestOptions;
  }

  /**
   * Manejar errores
   */
  private handleError(error: any, options: RequestOptions): Observable<never> {
    if (options.skipErrorHandling) {
      return throwError(() => error);
    }

    let processedError: ApiError;

    if (error instanceof HttpErrorResponse) {
      processedError = {
        message: error.error?.processedMessage || error.message || 'Error de comunicación',
        code: `HTTP_${error.status}`,
        details: error.error
      };
    } else if (error.name === 'TimeoutError') {
      processedError = {
        message: 'La solicitud ha excedido el tiempo límite',
        code: 'TIMEOUT_ERROR',
        details: error
      };
    } else {
      processedError = {
        message: error.message || 'Error desconocido',
        code: 'UNKNOWN_ERROR',
        details: error
      };
    }

    console.error('[]� Error procesado por HttpBaseService:', processedError);
    return throwError(() => processedError);
  }

  /**
   * Determinar si un error es reintentable
   */
  private shouldRetry(error: any): boolean {
    if (error instanceof HttpErrorResponse) {
      // Reintentar solo en errores temporales del servidor
      return error.status >= 500 && error.status <= 599;
    }
    return error.name === 'TimeoutError';
  }

  /**
   * Generar clave de cache
   */
  private generateCacheKey(method: string, endpoint: string, params?: any): string {
    const paramsString = params ? JSON.stringify(params) : '';
    return `${method}:${endpoint}:${paramsString}`;
  }

  /**
   * Obtener del cache
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Guardar en cache
   */
  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Incrementar contador de requests activos
   */
  private incrementActiveRequests(): void {
    this._activeRequests.set(this._activeRequests() + 1);
  }

  /**
   * Decrementar contador de requests activos
   */
  private decrementActiveRequests(): void {
    const current = this._activeRequests();
    this._activeRequests.set(Math.max(0, current - 1));
  }

  /**
   * Establecer estado de carga
   */
  private setLoadingState(loading: boolean): void {
    this._isLoading.set(loading);
    this.loadingState$.next(loading);
  }

  /**
   * Inicializar monitoreo de red
   */
  private initializeNetworkMonitoring(): void {
    window.addEventListener('online', () => {
      this._isOnline.set(true);
      this.connectionState$.next(true);
      console.log('[]� Conexión restablecida');
    });

    window.addEventListener('offline', () => {
      this._isOnline.set(false);
      this.connectionState$.next(false);
      console.log('[]� Sin conexión a internet');
    });
  }
}
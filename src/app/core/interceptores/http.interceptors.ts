import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject, filter, take, switchMap, catchError } from 'rxjs';
import { Router } from '@angular/router';

interface TokenService {
  getToken(): string | null;
  getRefreshToken(): string | null;
  setTokens(accessToken: string, refreshToken: string): void;
  clearTokens(): void;
  isTokenExpired(): boolean;
  refreshTokens(): Observable<{ accessToken: string; refreshToken: string }>;
}

// Servicio simulado para manejar tokens (luego conectaremos con el real)
class TokenManager implements TokenService {
  private readonly ACCESS_TOKEN_KEY = 'innoad_access_token';
  private readonly REFRESH_TOKEN_KEY = 'innoad_refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'innoad_token_expiry';

  getToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    
    // Decodificar el JWT para obtener la fecha de expiración
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, payload.exp.toString());
    } catch (error) {
      console.error('Error decodificando token:', error);
    }
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  isTokenExpired(): boolean {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return parseInt(expiry) <= now;
  }

  refreshTokens(): Observable<{ accessToken: string; refreshToken: string }> {
    // TODO: Implementar llamada real al backend
    return throwError(() => new Error('Refresh token not implemented yet'));
  }
}

// Variables globales para el manejo de refresh
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
const tokenManager = new TokenManager();

/**
 * Interceptor de autenticación HTTP
 * Maneja automáticamente:
 * - Adjuntar tokens JWT a las requests
 * - Renovar tokens expirados
 * - Manejar errores de autenticación
 * - Redireccionar en caso de sesión inválida
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);

  // URLs que no requieren autenticación
  const publicUrls = [
    '/auth/login',
    '/auth/register', 
    '/auth/refresh',
    '/auth/reset-password',
    '/system/health'
  ];

  // Verificar si la URL requiere autenticación
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));
  
  if (isPublicUrl) {
    return next(req);
  }

  // Obtener token de acceso
  const token = tokenManager.getToken();
  
  if (!token) {
    // No hay token, redirigir al login
    router.navigate(['/auth/login']);
    return throwError(() => new HttpErrorResponse({
      status: 401,
      statusText: 'No autorizado - Token faltante'
    }));
  }

  // Verificar si el token está expirado
  if (tokenManager.isTokenExpired()) {
    return handleTokenExpiry(req, next, router);
  }

  // Agregar token a la request
  const authReq = addTokenToRequest(req, token);
  
  return next(authReq).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handleTokenExpiry(req, next, router);
      }
      return throwError(() => error);
    })
  );
};

/**
 * Agrega el token JWT al header Authorization
 */
function addTokenToRequest(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
}

/**
 * Maneja la expiración del token
 */
function handleTokenExpiry(
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn,
  router: Router
): Observable<HttpEvent<unknown>> {
  const refreshToken = tokenManager.getRefreshToken();
  
  if (!refreshToken) {
    // No hay refresh token, redirigir al login
    tokenManager.clearTokens();
    router.navigate(['/auth/login']);
    return throwError(() => new HttpErrorResponse({
      status: 401,
      statusText: 'Sesión expirada'
    }));
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return tokenManager.refreshTokens().pipe(
      switchMap((tokens) => {
        isRefreshing = false;
        tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
        refreshTokenSubject.next(tokens.accessToken);
        
        // Reintentar la request original con el nuevo token
        const authReq = addTokenToRequest(req, tokens.accessToken);
        return next(authReq);
      }),
      catchError(error => {
        isRefreshing = false;
        tokenManager.clearTokens();
        router.navigate(['/auth/login']);
        return throwError(() => error);
      })
    );
  } else {
    // Hay un refresh en progreso, esperar a que termine
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        const authReq = addTokenToRequest(req, token!);
        return next(authReq);
      })
    );
  }
}

/**
 * Interceptor para logging de requests HTTP
 */
export const loggingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const startTime = performance.now();
  
  // Generar ID único para la request
  const requestId = generateRequestId();
  
  // Clonar request con headers de tracking
  const trackedReq = req.clone({
    setHeaders: {
      'X-Request-ID': requestId,
      'X-Client-Version': '1.0.0',
      'X-Timestamp': new Date().toISOString()
    }
  });

  console.group(`HTTP Request [${requestId}]`);
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers.keys().map(key => `${key}: ${req.headers.get(key)}`));
  if (req.body) {
    console.log('Body:', req.body);
  }
  console.groupEnd();

  return next(trackedReq).pipe(
    catchError(error => {
      const duration = performance.now() - startTime;
      console.group(`HTTP Error [${requestId}] - ${duration.toFixed(2)}ms`);
      console.error('Error:', error);
      console.groupEnd();
      return throwError(() => error);
    }),
    
    // Log successful responses
    tap => {
      const duration = performance.now() - startTime;
      console.group(`HTTP Response [${requestId}] - ${duration.toFixed(2)}ms`);
      console.log(`Status: ${(tap as any).status || 'Unknown'}`);
      console.groupEnd();
      return tap;
    }
  );
};

/**
 * Interceptor para manejo global de errores
 */
export const errorHandlingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';
      
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error del cliente: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Solicitud incorrecta';
            break;
          case 401:
            errorMessage = 'No autorizado - Inicie sesión nuevamente';
            break;
          case 403:
            errorMessage = 'Acceso denegado - Sin permisos suficientes';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado';
            break;
          case 422:
            errorMessage = 'Datos inválidos';
            if (error.error?.errors) {
              // Manejar errores de validación estructurados
              const validationErrors = Object.entries(error.error.errors)
                .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
                .join('\n');
              errorMessage += `\n${validationErrors}`;
            }
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          case 503:
            errorMessage = 'Servicio no disponible - Intente más tarde';
            break;
          default:
            errorMessage = `Error del servidor: ${error.status} - ${error.statusText}`;
        }
      }

      // Aquí podrías mostrar una notificación global
      console.error('Error HTTP Global:', errorMessage);
      
      // Modificar el error para incluir el mensaje procesado
      const enhancedError = new HttpErrorResponse({
        ...error,
        error: {
          ...error.error,
          processedMessage: errorMessage
        }
      });

      return throwError(() => enhancedError);
    })
  );
};

/**
 * Genera un ID único para tracking de requests
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
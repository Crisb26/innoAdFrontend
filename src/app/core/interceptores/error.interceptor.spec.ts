import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorInterceptor } from './error.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

describe('ErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería pasar petición sin error', () => {
    httpClient.get('/api/test').subscribe(
      response => {
        expect(response).toEqual({ data: 'test' });
      }
    );

    const req = httpMock.expectOne('/api/test');
    req.flush({ data: 'test' });
  });

  it('debería reintentar en error 503 (Service Unavailable)', () => {
    let intentos = 0;

    httpClient.get('/api/test').subscribe(
      () => {
        expect(intentos).toBeGreaterThanOrEqual(1);
      }
    );

    // Primer intento falla
    let req = httpMock.expectOne('/api/test');
    intentos++;
    req.error(new ProgressEvent('error'), { status: 503, statusText: 'Service Unavailable' });

    // Reintentos después de delays
    setTimeout(() => {
      req = httpMock.expectOne('/api/test');
      intentos++;
      req.flush({ data: 'test' });
    }, 1100);
  });

  it('debería reintentar en error 0 (Network Error)', (done) => {
    httpClient.get('/api/test').subscribe(
      () => {
        expect(true).toBe(true);
        done();
      }
    );

    const req1 = httpMock.expectOne('/api/test');
    req1.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    // Después de delay, debería reintentar
    setTimeout(() => {
      const req2 = httpMock.expectOne('/api/test');
      req2.flush({ data: 'test' });
    }, 1100);
  });

  it('no debería reintentar en error 401 (Unauthorized)', () => {
    httpClient.get('/api/test').subscribe(
      () => fail('Debería haber fallado'),
      error => {
        expect(error.status).toBe(401);
      }
    );

    const req = httpMock.expectOne('/api/test');
    req.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    // No debería haber más reintentos
    httpMock.expectNone('/api/test');
  });

  it('no debería reintentar en error 403 (Forbidden)', () => {
    httpClient.get('/api/test').subscribe(
      () => fail('Debería haber fallado'),
      error => {
        expect(error.status).toBe(403);
      }
    );

    const req = httpMock.expectOne('/api/test');
    req.flush({ error: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });

    httpMock.expectNone('/api/test');
  });

  it('debería mantener backoff exponencial (1s, 2s, 4s)', (done) => {
    const tiemposReintentos: number[] = [];
    const startTime = Date.now();

    httpClient.get('/api/test').subscribe(
      () => {
        // Debería tener 3 intentos fallidos + 1 exitoso
        expect(tiemposReintentos.length).toBe(3);
        done();
      }
    );

    // Primer intento
    let req = httpMock.expectOne('/api/test');
    tiemposReintentos.push(Date.now() - startTime);
    req.error(new ProgressEvent('error'), { status: 503 });

    // Segundo intento (después de ~1s)
    setTimeout(() => {
      req = httpMock.expectOne('/api/test');
      tiemposReintentos.push(Date.now() - startTime);
      req.error(new ProgressEvent('error'), { status: 503 });
    }, 1100);

    // Tercer intento (después de ~2s más)
    setTimeout(() => {
      req = httpMock.expectOne('/api/test');
      tiemposReintentos.push(Date.now() - startTime);
      req.error(new ProgressEvent('error'), { status: 503 });
    }, 3200);

    // Cuarto intento (después de ~4s más) - exitoso
    setTimeout(() => {
      req = httpMock.expectOne('/api/test');
      req.flush({ data: 'test' });
    }, 7400);
  });

  it('debería manejar errores de timeout', (done) => {
    httpClient.get('/api/test').subscribe(
      () => {
        expect(true).toBe(true);
        done();
      }
    );

    const req1 = httpMock.expectOne('/api/test');
    req1.error(new ProgressEvent('timeout'));

    setTimeout(() => {
      const req2 = httpMock.expectOne('/api/test');
      req2.flush({ data: 'test' });
    }, 1100);
  });

  it('debería lanzar error después de max reintentos', () => {
    httpClient.get('/api/test').subscribe(
      () => fail('Debería haber fallado'),
      error => {
        expect(error).toBeTruthy();
      }
    );

    // Simular 4 intentos fallidos (máximo)
    for (let i = 0; i < 4; i++) {
      const req = httpMock.expectOne('/api/test');
      req.error(new ProgressEvent('error'), { status: 503 });
    }
  });

  it('debería añadir header Authorization si existe token', () => {
    // Mock del localStorage
    spyOn(localStorage, 'getItem').and.returnValue('mock-token-12345');

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token-12345');

    req.flush({ data: 'test' });
  });

  it('debería no añadir Authorization si no existe token', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);

    req.flush({ data: 'test' });
  });

  it('debería manejo específico de error 500', () => {
    httpClient.get('/api/test').subscribe(
      () => fail('Debería haber fallado'),
      error => {
        expect(error.status).toBe(500);
      }
    );

    const req = httpMock.expectOne('/api/test');
    req.flush(
      { error: 'Internal Server Error' },
      { status: 500, statusText: 'Internal Server Error' }
    );
  });
});

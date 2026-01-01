import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ServicioMantenimiento } from './mantenimiento.servicio';
import { environment } from '../../../environments/environment';

describe('ServicioMantenimiento', () => {
  let servicio: ServicioMantenimiento;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/mantenimiento`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicioMantenimiento]
    });
    servicio = TestBed.inject(ServicioMantenimiento);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería estar creado', () => {
    expect(servicio).toBeTruthy();
  });

  it('debería obtener estado de mantenimiento', () => {
    const estadoEsperado = {
      activo: false,
      mensaje: 'Sistema operativo',
      ultimaAutenticacion: new Date()
    };

    servicio.obtenerEstado().subscribe(estado => {
      expect(estado).toEqual(estadoEsperado);
    });

    const req = httpMock.expectOne(`${apiUrl}/estado`);
    expect(req.request.method).toBe('GET');
    req.flush(estadoEsperado);
  });

  it('debería verificar contraseña correctamente', () => {
    const respuesta = { valida: true };

    servicio.verificarContraseña('admin123').subscribe(resultado => {
      expect(resultado.valida).toBe(true);
    });

    const req = httpMock.expectOne(`${apiUrl}/verificar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.contrasenia).toBe('admin123');
    req.flush(respuesta);
  });

  it('debería rechazar contraseña incorrecta', () => {
    const respuesta = { valida: false, intentosRestantes: 2 };

    servicio.verificarContraseña('wrongPassword').subscribe(resultado => {
      expect(resultado.valida).toBe(false);
      expect(resultado.intentosRestantes).toBe(2);
    });

    const req = httpMock.expectOne(`${apiUrl}/verificar`);
    expect(req.request.method).toBe('POST');
    req.flush(respuesta);
  });

  it('debería activar mantenimiento', () => {
    const datosActivacion = {
      activo: true,
      mensaje: 'Mantenimiento programado',
      contrasenia: 'newPassword123'
    };

    servicio.activarMantenimiento(datosActivacion).subscribe(resultado => {
      expect(resultado.activo).toBe(true);
    });

    const req = httpMock.expectOne(`${apiUrl}/activar`);
    expect(req.request.method).toBe('POST');
    req.flush(datosActivacion);
  });

  it('debería desactivar mantenimiento', () => {
    const respuesta = { activo: false };

    servicio.desactivarMantenimiento().subscribe(resultado => {
      expect(resultado.activo).toBe(false);
    });

    const req = httpMock.expectOne(`${apiUrl}/desactivar`);
    expect(req.request.method).toBe('POST');
    req.flush(respuesta);
  });

  it('debería obtener último acceso', () => {
    const ultimoAcceso = {
      usuario: 'admin',
      fecha: new Date(),
      exitoso: true
    };

    servicio.obtenerUltimo().subscribe(resultado => {
      expect(resultado.usuario).toBe('admin');
    });

    const req = httpMock.expectOne(`${apiUrl}/ultimo`);
    expect(req.request.method).toBe('GET');
    req.flush(ultimoAcceso);
  });

  it('debería manejar errores del servidor', () => {
    servicio.obtenerEstado().subscribe(
      () => fail('Debería haber fallado'),
      error => {
        expect(error.status).toBe(500);
      }
    );

    const req = httpMock.expectOne(`${apiUrl}/estado`);
    req.flush({ mensaje: 'Error interno' }, { status: 500, statusText: 'Internal Server Error' });
  });

  it('debería reintentar en caso de timeout', (done) => {
    let intentos = 0;

    servicio.obtenerEstado().subscribe(
      () => {
        expect(intentos).toBeGreaterThan(0);
        done();
      },
      () => fail('Debería haber recuperado después de reintentos')
    );

    // Simular timeout en primer intento
    const req1 = httpMock.expectOne(`${apiUrl}/estado`);
    req1.error(new ProgressEvent('timeout'));

    // Segundo intento después de delay
    setTimeout(() => {
      const req2 = httpMock.expectOne(`${apiUrl}/estado`);
      req2.flush({ activo: false, mensaje: 'OK' });
    }, 1100);
  });

  it('debería cachear estado después de obtenerlo', () => {
    const estadoEsperado = {
      activo: false,
      mensaje: 'Sistema operativo',
      ultimaAutenticacion: new Date()
    };

    // Primera llamada
    servicio.obtenerEstado().subscribe();
    let req = httpMock.expectOne(`${apiUrl}/estado`);
    req.flush(estadoEsperado);

    // Segunda llamada debería usar caché
    servicio.obtenerEstado().subscribe();
    
    // No debería haber más peticiones HTTP
    httpMock.expectNone(`${apiUrl}/estado`);
  });
});

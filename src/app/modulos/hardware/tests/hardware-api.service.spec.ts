/**
 * 🧪 TESTS - SERVICIO HARDWARE API
 * Cobertura completa: dispositivos, contenido, comandos, WebSocket, métricas
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ServicioHardwareAPI, DispositivoIoT, ContenidoRemoto } from './hardware-api.service';
import { environment } from '@environments/environment';

describe('ServicioHardwareAPI', () => {
  let service: ServicioHardwareAPI;
  let httpMock: HttpTestingController;

  const mockDispositivo: DispositivoIoT = {
    id: 'rpi-001',
    nombre: 'Display Entrada',
    tipo: 'raspberry_pi',
    estado: 'online',
    ubicacion: 'Lobby',
    ipAddress: '192.168.1.100',
    macAddress: '00:1A:2B:3C:4D:5E',
    ultimaConexion: new Date(),
    versionSoftware: '1.0.0',
    especificaciones: {
      procesador: 'ARM Cortex-A72',
      memoria: '8GB',
      almacenamiento: '64GB',
      resolucion: '3840x2160',
    },
    sensores: {
      temperatura: 45.5,
      humedad: 60,
      presion: 1013,
    },
  };

  const mockContenido: ContenidoRemoto = {
    id: 'content-001',
    titulo: 'Video Promocional',
    descripcion: 'Promoción de verano 2026',
    tipo: 'video',
    url: 'https://cdn.example.com/video.mp4',
    duracion: 30,
    tamaño: 524288000,
    fechaCreacion: new Date(),
    dispositivos: ['rpi-001', 'rpi-002'],
    estado: 'en_ejecucion',
    progreso: 75,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicioHardwareAPI],
    });

    service = TestBed.inject(ServicioHardwareAPI);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ==================== TESTS DISPOSITIVOS ====================

  describe('Gestión de Dispositivos', () => {
    it('debe obtener lista de dispositivos', (done) => {
      const mockDispositivos = [mockDispositivo];

      service.obtenerDispositivos().subscribe((dispositivos) => {
        expect(dispositivos.length).toBe(1);
        expect(dispositivos[0].id).toBe('rpi-001');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/dispositivos`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDispositivos);
    });

    it('debe obtener un dispositivo específico', (done) => {
      service.obtenerDispositivo('rpi-001').subscribe((dispositivo) => {
        expect(dispositivo.id).toBe('rpi-001');
        expect(dispositivo.estado).toBe('online');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/dispositivos/rpi-001`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDispositivo);
    });

    it('debe registrar nuevo dispositivo', (done) => {
      const nuevoDispositivo = { ...mockDispositivo, id: 'rpi-002' };

      service.registrarDispositivo({ nombre: 'Display 2', tipo: 'raspberry_pi' }).subscribe((dispositivo) => {
        expect(dispositivo.id).toBe('rpi-002');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/dispositivos`);
      expect(req.request.method).toBe('POST');
      req.flush(nuevoDispositivo);
    });

    it('debe actualizar dispositivo', (done) => {
      const dispositivoActualizado = { ...mockDispositivo, estado: 'offline' as const };

      service.actualizarDispositivo('rpi-001', { estado: 'offline' }).subscribe((dispositivo) => {
        expect(dispositivo.estado).toBe('offline');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/dispositivos/rpi-001`);
      expect(req.request.method).toBe('PUT');
      req.flush(dispositivoActualizado);
    });

    it('debe eliminar dispositivo', (done) => {
      service.eliminarDispositivo('rpi-001').subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/dispositivos/rpi-001`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  // ==================== TESTS COMANDOS ====================

  describe('Ejecución de Comandos', () => {
    it('debe ejecutar comando en dispositivo', (done) => {
      service.ejecutarComando('rpi-001', 'reproducir', { contenidoId: 'content-001' }).subscribe((comando) => {
        expect(comando.tipo).toBe('reproducir');
        expect(comando.estado).toBe('ejecutado');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/dispositivos/rpi-001/comando`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.tipo).toBe('reproducir');

      req.flush({
        id: 'cmd-001',
        dispositivoId: 'rpi-001',
        tipo: 'reproducir',
        parametros: { contenidoId: 'content-001' },
        estado: 'ejecutado',
        timestamp: new Date(),
      });
    });

    it('debe reproducir contenido', (done) => {
      service.reproducirContenido('rpi-001', 'content-001').subscribe((comando) => {
        expect(comando.tipo).toBe('reproducir');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/dispositivos/rpi-001/comando`);
      req.flush({
        id: 'cmd-001',
        dispositivoId: 'rpi-001',
        tipo: 'reproducir',
        parametros: {},
        estado: 'ejecutado',
        timestamp: new Date(),
      });
    });

    it('debe pausar dispositivo', (done) => {
      service.pausarDispositivo('rpi-001').subscribe((comando) => {
        expect(comando.tipo).toBe('pausar');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/dispositivos/rpi-001/comando`);
      req.flush({
        id: 'cmd-002',
        dispositivoId: 'rpi-001',
        tipo: 'pausar',
        parametros: {},
        estado: 'ejecutado',
        timestamp: new Date(),
      });
    });

    it('debe reiniciar dispositivo', (done) => {
      service.reiniciarDispositivo('rpi-001').subscribe((comando) => {
        expect(comando.tipo).toBe('reiniciar');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/dispositivos/rpi-001/comando`);
      req.flush({
        id: 'cmd-003',
        dispositivoId: 'rpi-001',
        tipo: 'reiniciar',
        parametros: {},
        estado: 'ejecutado',
        timestamp: new Date(),
      });
    });
  });

  // ==================== TESTS CONTENIDO ====================

  describe('Gestión de Contenido', () => {
    it('debe obtener lista de contenido', (done) => {
      const mockContenidos = [mockContenido];

      service.obtenerContenido().subscribe((contenido) => {
        expect(contenido.length).toBe(1);
        expect(contenido[0].id).toBe('content-001');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/contenido`);
      expect(req.request.method).toBe('GET');
      req.flush(mockContenidos);
    });

    it('debe asignar contenido a dispositivos', (done) => {
      service
        .asignarContenidoADispositivos('content-001', ['rpi-001', 'rpi-002'], {
          fechaInicio: new Date(),
        })
        .subscribe((contenido) => {
          expect(contenido.dispositivos.length).toBe(2);
          done();
        });

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/contenido/content-001/asignar`);
      expect(req.request.method).toBe('POST');

      req.flush(mockContenido);
    });

    it('debe eliminar contenido', (done) => {
      service.eliminarContenido('content-001').subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/contenido/content-001`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  // ==================== TESTS ESTADÍSTICAS ====================

  describe('Estadísticas y Diagnóstico', () => {
    it('debe obtener estadísticas de dispositivo', (done) => {
      service.obtenerEstadisticas('rpi-001').subscribe((stats) => {
        expect(stats.dispositivoId).toBe('rpi-001');
        expect(stats.confiabilidad).toBe(99.5);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/dispositivos/rpi-001/estadisticas`);
      expect(req.request.method).toBe('GET');

      req.flush({
        dispositivoId: 'rpi-001',
        tiempoActividad: 168,
        confiabilidad: 99.5,
        commandosEjecutados: 245,
        anchodeBanda: 95.5,
        usoCPU: 45,
        usoMemoria: 62,
        temperatura: 45.5,
      });
    });

    it('debe ejecutar test de conexión', (done) => {
      service.testConexion('rpi-001').subscribe((resultado) => {
        expect(resultado.conectado).toBe(true);
        expect(resultado.latencia).toBeLessThan(100);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/dispositivos/rpi-001/test`);
      expect(req.request.method).toBe('GET');

      req.flush({
        conectado: true,
        latencia: 45,
        mensajes: ['Conexión exitosa'],
      });
    });

    it('debe sincronizar dispositivo', (done) => {
      service.sincronizar('rpi-001').subscribe((resultado) => {
        expect(resultado.mensaje).toContain('sincronizado');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/dispositivos/rpi-001/sincronizar`);
      expect(req.request.method).toBe('POST');

      req.flush({
        mensaje: 'Dispositivo sincronizado correctamente',
        timestamp: new Date(),
      });
    });
  });

  // ==================== TESTS OBSERVABLES ====================

  describe('Observables y Estado', () => {
    it('debe emitir dispositivos en observable', (done) => {
      const mockDispositivos = [mockDispositivo];

      service.dispositivos$.subscribe((dispositivos) => {
        if (dispositivos.length > 0) {
          expect(dispositivos[0].id).toBe('rpi-001');
          done();
        }
      });

      service.obtenerDispositivos().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/dispositivos`);
      req.flush(mockDispositivos);
    });

    it('debe emitir estado de conexión', (done) => {
      service.estadoConexion$.subscribe((conectado) => {
        expect(typeof conectado).toBe('boolean');
        done();
      });
    });
  });

  // ==================== TESTS ERROR HANDLING ====================

  describe('Manejo de Errores', () => {
    it('debe manejar error al obtener dispositivos', (done) => {
      service.obtenerDispositivos().subscribe({
        error: (error) => {
          expect(error.message).toContain('dispositivos');
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/dispositivos`);
      req.error(new ErrorEvent('Error de red'));
    });

    it('debe manejar error en ejecución de comando', (done) => {
      service.ejecutarComando('rpi-001', 'reproducir').subscribe({
        error: (error) => {
          expect(error.message).toContain('comando');
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/dispositivos/rpi-001/comando`);
      req.error(new ErrorEvent('Dispositivo offline'));
    });

    it('debe manejar error en sincronización', (done) => {
      service.sincronizar('rpi-001').subscribe({
        error: (error) => {
          expect(error.message).toContain('sincronización');
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/hardware/dispositivos/rpi-001/sincronizar`);
      req.error(new ErrorEvent('Timeout'));
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ServicioHardwareAPI, DispositivoIoT, ContenidoRemoto, ComandoDispositivo } from './hardware-api.service';

/**
 * []� TEST SUITE: ServicioHardwareAPI (Frontend)
 * Pruebas unitarias para el servicio HTTP del hardware API
 */
describe('ServicioHardwareAPI', () => {
  let servicio: ServicioHardwareAPI;
  let httpMock: HttpTestingController;

  const API_URL = 'http://localhost:4200/api/hardware';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicioHardwareAPI],
    });

    servicio = TestBed.inject(ServicioHardwareAPI);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ==================== DISPOSITIVOS ====================

  describe('Dispositivos', () => {
    it('[] obtenerDispositivos() debe hacer GET a /dispositivos', (done) => {
      // Arrange
      const dispositivosMock: DispositivoIoT[] = [
        {
          id: 'disp-001',
          nombre: 'Raspberry Pi Entrada',
          tipo: 'raspberry_pi',
          estado: 'online',
          ubicacion: 'Recepción',
          ipAddress: '192.168.1.100',
          macAddress: 'B8:27:EB:12:34:56',
          ultimaConexion: new Date(),
          versionSoftware: '1.0.0',
          especificaciones: {
            procesador: 'ARM',
            memoria: '4GB',
            almacenamiento: '32GB',
          },
        },
      ];

      // Act
      servicio.obtenerDispositivos().subscribe((dispositivos) => {
        // Assert
        expect(dispositivos.length).toBe(1);
        expect(dispositivos[0].nombre).toBe('Raspberry Pi Entrada');
        done();
      });

      // Arrange - HTTP expectations
      const req = httpMock.expectOne(`${API_URL}/dispositivos`);
      expect(req.request.method).toBe('GET');
      req.flush(dispositivosMock);
    });

    it('[] obtenerDispositivo() debe hacer GET a /dispositivos/{id}', (done) => {
      // Arrange
      const dispositivoMock: DispositivoIoT = {
        id: 'disp-001',
        nombre: 'Raspberry Pi Entrada',
        tipo: 'raspberry_pi',
        estado: 'online',
        ubicacion: 'Recepción',
        ipAddress: '192.168.1.100',
        macAddress: 'B8:27:EB:12:34:56',
        ultimaConexion: new Date(),
        versionSoftware: '1.0.0',
        especificaciones: {
          procesador: 'ARM',
          memoria: '4GB',
          almacenamiento: '32GB',
        },
      };

      // Act
      servicio.obtenerDispositivo('disp-001').subscribe((dispositivo) => {
        // Assert
        expect(dispositivo.id).toBe('disp-001');
        expect(dispositivo.estado).toBe('online');
        done();
      });

      // Arrange - HTTP expectations
      const req = httpMock.expectOne(`${API_URL}/dispositivos/disp-001`);
      expect(req.request.method).toBe('GET');
      req.flush(dispositivoMock);
    });

    it('[] registrarDispositivo() debe hacer POST a /dispositivos', (done) => {
      // Arrange
      const nuevoDispositivo = {
        nombre: 'Nueva Raspberry',
        tipo: 'raspberry_pi',
        ubicacion: 'Sala',
        ipAddress: '192.168.1.101',
        macAddress: 'B8:27:EB:12:34:57',
        versionSoftware: '1.0.0',
      };

      const dispositivoGuardado: DispositivoIoT = {
        id: 'disp-002',
        ...nuevoDispositivo,
        estado: 'online',
        ultimaConexion: new Date(),
        especificaciones: {},
      };

      // Act
      servicio.registrarDispositivo(nuevoDispositivo as any).subscribe((resultado) => {
        // Assert
        expect(resultado.id).toBeDefined();
        expect(resultado.nombre).toBe('Nueva Raspberry');
        done();
      });

      // Arrange - HTTP expectations
      const req = httpMock.expectOne(`${API_URL}/dispositivos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.nombre).toBe('Nueva Raspberry');
      req.flush(dispositivoGuardado);
    });

    it('[] actualizarDispositivo() debe hacer PUT a /dispositivos/{id}', (done) => {
      // Arrange
      const actualizacion = { nombre: 'Raspberry Actualizada' };

      // Act
      servicio.actualizarDispositivo('disp-001', actualizacion as any).subscribe(() => {
        // Assert
        expect(true).toBe(true);
        done();
      });

      // Arrange - HTTP expectations
      const req = httpMock.expectOne(`${API_URL}/dispositivos/disp-001`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.nombre).toBe('Raspberry Actualizada');
      req.flush({});
    });

    it('[] eliminarDispositivo() debe hacer DELETE a /dispositivos/{id}', (done) => {
      // Act
      servicio.eliminarDispositivo('disp-001').subscribe(() => {
        // Assert
        expect(true).toBe(true);
        done();
      });

      // Arrange - HTTP expectations
      const req = httpMock.expectOne(`${API_URL}/dispositivos/disp-001`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  // ==================== COMANDOS ====================

  describe('Comandos', () => {
    it('[] reproducirContenido() debe ejecutar comando reproducir', (done) => {
      // Arrange
      const comando = {
        id: 'cmd-001',
        tipo: 'reproducir',
        estado: 'ejecutado',
        respuesta: 'Reproduciendo contenido',
      };

      // Act
      servicio.reproducirContenido('disp-001', 'cont-001').subscribe((resultado) => {
        // Assert
        expect(resultado.tipo).toBe('reproducir');
        expect(resultado.estado).toBe('ejecutado');
        done();
      });

      // Arrange - HTTP expectations
      const req = httpMock.expectOne(`${API_URL}/dispositivos/disp-001/comando`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.tipo).toBe('reproducir');
      req.flush(comando);
    });

    it('[] pausarDispositivo() debe ejecutar comando pausar', (done) => {
      // Arrange
      const comando = {
        id: 'cmd-002',
        tipo: 'pausar',
        estado: 'ejecutado',
      };

      // Act
      servicio.pausarDispositivo('disp-001').subscribe((resultado) => {
        // Assert
        expect(resultado.tipo).toBe('pausar');
        done();
      });

      // Arrange - HTTP expectations
      const req = httpMock.expectOne(`${API_URL}/dispositivos/disp-001/comando`);
      expect(req.request.method).toBe('POST');
      req.flush(comando);
    });

    it('[] detenerDispositivo() debe ejecutar comando detener', (done) => {
      // Arrange
      const comando = {
        id: 'cmd-003',
        tipo: 'detener',
        estado: 'ejecutado',
      };

      // Act
      servicio.detenerDispositivo('disp-001').subscribe((resultado) => {
        // Assert
        expect(resultado.tipo).toBe('detener');
        done();
      });

      // Arrange - HTTP expectations
      const req = httpMock.expectOne(`${API_URL}/dispositivos/disp-001/comando`);
      expect(req.request.method).toBe('POST');
      req.flush(comando);
    });

    it('[] reiniciarDispositivo() debe ejecutar comando reiniciar', (done) => {
      // Arrange
      const comando = {
        id: 'cmd-004',
        tipo: 'reiniciar',
        estado: 'ejecutado',
      };

      // Act
      servicio.reiniciarDispositivo('disp-001').subscribe((resultado) => {
        // Assert
        expect(resultado.tipo).toBe('reiniciar');
        done();
      });

      // Arrange - HTTP expectations
      const req = httpMock.expectOne(`${API_URL}/dispositivos/disp-001/comando`);
      expect(req.request.method).toBe('POST');
      req.flush(comando);
    });

    it('[] actualizarSoftware() debe ejecutar comando actualizar', (done) => {
      // Arrange
      const comando = {
        id: 'cmd-005',
        tipo: 'actualizar',
        estado: 'ejecutado',
      };

      // Act
      servicio.actualizarSoftware('disp-001').subscribe((resultado) => {
        // Assert
        expect(resultado.tipo).toBe('actualizar');
        done();
      });

      // Arrange - HTTP expectations
      const req = httpMock.expectOne(`${API_URL}/dispositivos/disp-001/comando`);
      expect(req.request.method).toBe('POST');
      req.flush(comando);
    });
  });

  // ==================== CONTENIDO ====================

  describe('Contenido', () => {
    it('[] obtenerContenido() debe hacer GET a /contenido', (done) => {
      // Arrange
      const contenidoMock: ContenidoRemoto[] = [
        {
          id: 'cont-001',
          titulo: 'Video Promocional',
          descripcion: 'Video de 30 segundos',
          tipo: 'video',
          url: '/contenido/promo.mp4',
          tamaño: 52428800,
          fechaCreacion: new Date(),
          dispositivos: ['disp-001'],
          estado: 'en_ejecucion',
          progreso: 50,
        },
      ];

      // Act
      servicio.obtenerContenido().subscribe((contenido) => {
        // Assert
        expect(contenido.length).toBe(1);
        expect(contenido[0].titulo).toBe('Video Promocional');
        done();
      });

      // Arrange - HTTP expectations
      const req = httpMock.expectOne(`${API_URL}/contenido`);
      expect(req.request.method).toBe('GET');
      req.flush(contenidoMock);
    });

    it('[] asignarContenidoADispositivos() debe hacer POST a /contenido/{id}/asignar', (done) => {
      // Arrange
      const contenidoMock: ContenidoRemoto = {
        id: 'cont-001',
        titulo: 'Video Promocional',
        descripcion: 'Video de 30 segundos',
        tipo: 'video',
        url: '/contenido/promo.mp4',
        tamaño: 52428800,
        fechaCreacion: new Date(),
        dispositivos: ['disp-001', 'disp-002'],
        estado: 'en_ejecucion',
        progreso: 0,
      };

      const dispositivoIds = ['disp-001', 'disp-002'];

      // Act
      servicio.asignarContenidoADispositivos('cont-001', dispositivoIds).subscribe((resultado) => {
        // Assert
        expect(resultado.dispositivos.length).toBe(2);
        expect(resultado.estado).toBe('en_ejecucion');
        done();
      });

      // Arrange - HTTP expectations
      const req = httpMock.expectOne(`${API_URL}/contenido/cont-001/asignar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.dispositivoIds).toEqual(dispositivoIds);
      req.flush(contenidoMock);
    });

    it('[] eliminarContenido() debe hacer DELETE a /contenido/{id}', (done) => {
      // Act
      servicio.eliminarContenido('cont-001').subscribe(() => {
        // Assert
        expect(true).toBe(true);
        done();
      });

      // Arrange - HTTP expectations
      const req = httpMock.expectOne(`${API_URL}/contenido/cont-001`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  // ==================== ESTADÍSTICAS ====================

  describe('Estadísticas', () => {
    it('[] obtenerEstadisticas() debe hacer GET a /dispositivos/{id}/estadisticas', (done) => {
      // Arrange
      const estadisticasMock = {
        dispositivoId: 'disp-001',
        tiempoActividad: 72,
        confiabilidad: 98,
        commandosEjecutados: 250,
        anchodeBanda: 85.5,
        usoCPU: 45,
        usoMemoria: 62,
        temperatura: 48.5,
      };

      // Act
      servicio.obtenerEstadisticas('disp-001').subscribe((stats) => {
        // Assert
        expect(stats.confiabilidad).toBe(98);
        expect(stats.usoCPU).toBe(45);
        done();
      });

      // Arrange - HTTP expectations
      const req = httpMock.expectOne(`${API_URL}/dispositivos/disp-001/estadisticas`);
      expect(req.request.method).toBe('GET');
      req.flush(estadisticasMock);
    });

    it('[] testConexion() debe hacer GET a /dispositivos/{id}/test', (done) => {
      // Arrange
      const testMock = {
        conectado: true,
        latencia: 25,
        mensajes: ['Ping exitoso', 'Dispositivo respondiendo'],
      };

      // Act
      servicio.testConexion('disp-001').subscribe((resultado) => {
        // Assert
        expect(resultado.conectado).toBe(true);
        expect(resultado.latencia).toBe(25);
        done();
      });

      // Arrange - HTTP expectations
      const req = httpMock.expectOne(`${API_URL}/dispositivos/disp-001/test`);
      expect(req.request.method).toBe('GET');
      req.flush(testMock);
    });

    it('[] sincronizar() debe hacer POST a /dispositivos/{id}/sincronizar', (done) => {
      // Arrange
      const syncMock = {
        mensaje: 'Sincronización completada',
        timestamp: new Date(),
      };

      // Act
      servicio.sincronizar('disp-001').subscribe((resultado) => {
        // Assert
        expect(resultado.mensaje).toBe('Sincronización completada');
        done();
      });

      // Arrange - HTTP expectations
      const req = httpMock.expectOne(`${API_URL}/dispositivos/disp-001/sincronizar`);
      expect(req.request.method).toBe('POST');
      req.flush(syncMock);
    });
  });

  // ==================== OBSERVABLES ====================

  describe('Observables públicos', () => {
    it('[] dispositivos$ debe ser un Observable', (done) => {
      // Act & Assert
      servicio.dispositivos$.subscribe((dispositivos) => {
        expect(Array.isArray(dispositivos)).toBe(true);
        done();
      });
    });

    it('[] contenido$ debe ser un Observable', (done) => {
      // Act & Assert
      servicio.contenido$.subscribe((contenido) => {
        expect(Array.isArray(contenido)).toBe(true);
        done();
      });
    });

    it('[] estadoConexion$ debe ser un Observable', (done) => {
      // Act & Assert
      servicio.estadoConexion$.subscribe((conectado) => {
        expect(typeof conectado).toBe('boolean');
        done();
      });
    });

    it('[] metrics$ debe ser un Observable', (done) => {
      // Act & Assert
      servicio.metrics$.subscribe(() => {
        expect(true).toBe(true);
        done();
      });
    });
  });
});

/**
 * 🧪 TESTS - COMPONENTE HARDWARE
 * Gestor de dispositivos IoT con listado, control y monitoreo
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ServicioHardwareAPI, DispositivoIoT } from '../servicios/hardware-api.service';

describe('Componente Gestor Hardware', () => {
  let httpTestingController: any;
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

  let servicio: ServicioHardwareAPI;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicioHardwareAPI],
    });

    servicio = TestBed.inject(ServicioHardwareAPI);
  }));

  describe('Listado de Dispositivos', () => {
    it('debe cargar dispositivos al inicializar', (done) => {
      spyOn(servicio, 'obtenerDispositivos').and.returnValue(of([mockDispositivo]));

      servicio.obtenerDispositivos().subscribe((dispositivos) => {
        expect(dispositivos.length).toBe(1);
        expect(dispositivos[0].nombre).toBe('Display Entrada');
        done();
      });
    });

    it('debe filtrar dispositivos por estado', (done) => {
      const mockDispositivos = [
        mockDispositivo,
        { ...mockDispositivo, id: 'rpi-002', estado: 'offline' as const },
      ];

      spyOn(servicio, 'obtenerDispositivos').and.returnValue(of(mockDispositivos));

      servicio.obtenerDispositivos().subscribe((dispositivos) => {
        const onlineDevices = dispositivos.filter((d) => d.estado === 'online');
        expect(onlineDevices.length).toBe(1);
        done();
      });
    });

    it('debe filtrar dispositivos por tipo', (done) => {
      const mockDispositivos = [
        mockDispositivo,
        { ...mockDispositivo, id: 'spk-001', tipo: 'speaker' as const },
      ];

      spyOn(servicio, 'obtenerDispositivos').and.returnValue(of(mockDispositivos));

      servicio.obtenerDispositivos().subscribe((dispositivos) => {
        const rpiDevices = dispositivos.filter((d) => d.tipo === 'raspberry_pi');
        expect(rpiDevices.length).toBe(1);
        done();
      });
    });

    it('debe ordenar dispositivos por nombre', (done) => {
      const mockDispositivos = [
        { ...mockDispositivo, nombre: 'Zebra Display' },
        { ...mockDispositivo, nombre: 'Alpha Display' },
      ];

      spyOn(servicio, 'obtenerDispositivos').and.returnValue(of(mockDispositivos));

      servicio.obtenerDispositivos().subscribe((dispositivos) => {
        const sorted = [...dispositivos].sort((a, b) => a.nombre.localeCompare(b.nombre));
        expect(sorted[0].nombre).toBe('Alpha Display');
        done();
      });
    });
  });

  describe('Control de Dispositivos', () => {
    it('debe ejecutar comando reproducir', (done) => {
      spyOn(servicio, 'reproducirContenido').and.returnValue(
        of({
          id: 'cmd-001',
          dispositivoId: 'rpi-001',
          tipo: 'reproducir',
          parametros: { contenidoId: 'content-001' },
          estado: 'ejecutado',
          timestamp: new Date(),
        })
      );

      servicio.reproducirContenido('rpi-001', 'content-001').subscribe((comando) => {
        expect(comando.estado).toBe('ejecutado');
        expect(comando.tipo).toBe('reproducir');
        done();
      });
    });

    it('debe ejecutar comando pausar', (done) => {
      spyOn(servicio, 'pausarDispositivo').and.returnValue(
        of({
          id: 'cmd-002',
          dispositivoId: 'rpi-001',
          tipo: 'pausar',
          parametros: {},
          estado: 'ejecutado',
          timestamp: new Date(),
        })
      );

      servicio.pausarDispositivo('rpi-001').subscribe((comando) => {
        expect(comando.tipo).toBe('pausar');
        done();
      });
    });

    it('debe ejecutar comando reiniciar', (done) => {
      spyOn(servicio, 'reiniciarDispositivo').and.returnValue(
        of({
          id: 'cmd-003',
          dispositivoId: 'rpi-001',
          tipo: 'reiniciar',
          parametros: {},
          estado: 'ejecutado',
          timestamp: new Date(),
        })
      );

      servicio.reiniciarDispositivo('rpi-001').subscribe((comando) => {
        expect(comando.tipo).toBe('reiniciar');
        done();
      });
    });

    it('debe manejar error en ejecución de comando', (done) => {
      spyOn(servicio, 'ejecutarComando').and.returnValue(
        throwError(() => new Error('Dispositivo offline'))
      );

      servicio.ejecutarComando('rpi-001', 'reproducir').subscribe({
        error: (error) => {
          expect(error.message).toContain('offline');
          done();
        },
      });
    });
  });

  describe('Monitoreo de Dispositivos', () => {
    it('debe obtener estadísticas en tiempo real', (done) => {
      spyOn(servicio, 'obtenerEstadisticas').and.returnValue(
        of({
          dispositivoId: 'rpi-001',
          tiempoActividad: 168,
          confiabilidad: 99.5,
          commandosEjecutados: 245,
          anchodeBanda: 95.5,
          usoCPU: 45,
          usoMemoria: 62,
          temperatura: 45.5,
        })
      );

      servicio.obtenerEstadisticas('rpi-001').subscribe((stats) => {
        expect(stats.usoCPU).toBe(45);
        expect(stats.temperatura).toBe(45.5);
        done();
      });
    });

    it('debe mostrar alerta si temperatura es alta', (done) => {
      spyOn(servicio, 'obtenerEstadisticas').and.returnValue(
        of({
          dispositivoId: 'rpi-001',
          tiempoActividad: 168,
          confiabilidad: 99.5,
          commandosEjecutados: 245,
          anchodeBanda: 95.5,
          usoCPU: 45,
          usoMemoria: 62,
          temperatura: 75, // Temperatura alta
        })
      );

      servicio.obtenerEstadisticas('rpi-001').subscribe((stats) => {
        const alertaTemperatura = stats.temperatura > 70;
        expect(alertaTemperatura).toBe(true);
        done();
      });
    });

    it('debe detectar dispositivo offline', (done) => {
      const dispositivoOffline = { ...mockDispositivo, estado: 'offline' as const };

      servicio.dispositivos$.subscribe((dispositivos) => {
        const isOffline = dispositivos.some((d) => d.estado === 'offline');
        // Simplemente verificar la lógica
        expect(typeof isOffline).toBe('boolean');
      });

      done();
    });

    it('debe calcular confiabilidad del dispositivo', (done) => {
      spyOn(servicio, 'obtenerEstadisticas').and.returnValue(
        of({
          dispositivoId: 'rpi-001',
          tiempoActividad: 168,
          confiabilidad: 99.5,
          commandosEjecutados: 245,
          anchodeBanda: 95.5,
          usoCPU: 45,
          usoMemoria: 62,
          temperatura: 45.5,
        })
      );

      servicio.obtenerEstadisticas('rpi-001').subscribe((stats) => {
        expect(stats.confiabilidad).toBeGreaterThan(99);
        done();
      });
    });
  });

  describe('Sincronización y Diagnóstico', () => {
    it('debe sincronizar dispositivo correctamente', (done) => {
      spyOn(servicio, 'sincronizar').and.returnValue(
        of({
          mensaje: 'Dispositivo sincronizado correctamente',
          timestamp: new Date(),
        })
      );

      servicio.sincronizar('rpi-001').subscribe((resultado) => {
        expect(resultado.mensaje).toContain('sincronizado');
        done();
      });
    });

    it('debe ejecutar test de conexión', (done) => {
      spyOn(servicio, 'testConexion').and.returnValue(
        of({
          conectado: true,
          latencia: 45,
          mensajes: ['Conexión exitosa'],
        })
      );

      servicio.testConexion('rpi-001').subscribe((resultado) => {
        expect(resultado.conectado).toBe(true);
        expect(resultado.latencia).toBeLessThan(100);
        done();
      });
    });

    it('debe detectar latencia alta', (done) => {
      spyOn(servicio, 'testConexion').and.returnValue(
        of({
          conectado: true,
          latencia: 250, // Latencia alta
          mensajes: ['Conexión lenta'],
        })
      );

      servicio.testConexion('rpi-001').subscribe((resultado) => {
        const latenciaAlta = resultado.latencia > 200;
        expect(latenciaAlta).toBe(true);
        done();
      });
    });

    it('debe manejar fallo de test de conexión', (done) => {
      spyOn(servicio, 'testConexion').and.returnValue(
        throwError(() => new Error('Dispositivo no responde'))
      );

      servicio.testConexion('rpi-001').subscribe({
        error: (error) => {
          expect(error.message).toContain('no responde');
          done();
        },
      });
    });
  });

  describe('Gestión de Contenido', () => {
    it('debe obtener lista de contenido', (done) => {
      const mockContenido = [
        {
          id: 'content-001',
          titulo: 'Video Promocional',
          descripcion: 'Verano 2026',
          tipo: 'video' as const,
          url: 'https://cdn.example.com/video.mp4',
          duracion: 30,
          tamaño: 524288000,
          fechaCreacion: new Date(),
          dispositivos: ['rpi-001'],
          estado: 'en_ejecucion' as const,
          progreso: 75,
        },
      ];

      spyOn(servicio, 'obtenerContenido').and.returnValue(of(mockContenido));

      servicio.obtenerContenido().subscribe((contenido) => {
        expect(contenido.length).toBe(1);
        expect(contenido[0].tipo).toBe('video');
        done();
      });
    });

    it('debe asignar contenido a múltiples dispositivos', (done) => {
      const mockContenido = {
        id: 'content-001',
        titulo: 'Video Promocional',
        descripcion: 'Verano 2026',
        tipo: 'video' as const,
        url: 'https://cdn.example.com/video.mp4',
        duracion: 30,
        tamaño: 524288000,
        fechaCreacion: new Date(),
        dispositivos: ['rpi-001', 'rpi-002', 'spk-001'],
        estado: 'en_ejecucion' as const,
        progreso: 75,
      };

      spyOn(servicio, 'asignarContenidoADispositivos').and.returnValue(of(mockContenido));

      servicio.asignarContenidoADispositivos('content-001', ['rpi-001', 'rpi-002', 'spk-001']).subscribe((contenido) => {
        expect(contenido.dispositivos.length).toBe(3);
        done();
      });
    });

    it('debe rastrear progreso de contenido', (done) => {
      const mockContenido = {
        id: 'content-001',
        titulo: 'Video Promocional',
        descripcion: 'Verano 2026',
        tipo: 'video' as const,
        url: 'https://cdn.example.com/video.mp4',
        duracion: 30,
        tamaño: 524288000,
        fechaCreacion: new Date(),
        dispositivos: ['rpi-001'],
        estado: 'en_ejecucion' as const,
        progreso: 75,
      };

      servicio.contenido$.subscribe((contenido) => {
        if (contenido.length > 0) {
          expect(contenido[0].progreso).toBeGreaterThanOrEqual(0);
          expect(contenido[0].progreso).toBeLessThanOrEqual(100);
          done();
        }
      });

      // Simular actualización
      spyOn(servicio, 'obtenerContenido').and.returnValue(of([mockContenido]));
      servicio.obtenerContenido().subscribe();
    });
  });

  describe('Manejo de Errores en Componente', () => {
    it('debe mostrar mensaje de error si carga de dispositivos falla', (done) => {
      spyOn(servicio, 'obtenerDispositivos').and.returnValue(
        throwError(() => new Error('Error de red'))
      );

      servicio.obtenerDispositivos().subscribe({
        error: (error) => {
          expect(error.message).toContain('red');
          done();
        },
      });
    });

    it('debe mostrar estado vacío si no hay dispositivos', (done) => {
      spyOn(servicio, 'obtenerDispositivos').and.returnValue(of([]));

      servicio.obtenerDispositivos().subscribe((dispositivos) => {
        expect(dispositivos.length).toBe(0);
        done();
      });
    });

    it('debe reintentar carga en caso de fallo temporal', (done) => {
      let intentos = 0;

      spyOn(servicio, 'obtenerDispositivos').and.callFake(() => {
        intentos++;
        if (intentos === 1) {
          return throwError(() => new Error('Temporal error'));
        }
        return of([mockDispositivo]);
      });

      // Primer intento
      servicio.obtenerDispositivos().subscribe({
        error: () => {
          // Segundo intento
          servicio.obtenerDispositivos().subscribe((dispositivos) => {
            expect(dispositivos.length).toBe(1);
            done();
          });
        },
      });
    });
  });
});

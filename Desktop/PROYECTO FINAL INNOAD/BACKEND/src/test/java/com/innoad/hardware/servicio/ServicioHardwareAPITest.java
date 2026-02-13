package com.innoad.hardware.servicio;

import com.innoad.hardware.dto.*;
import com.innoad.hardware.modelo.DispositivoIoT;
import com.innoad.hardware.modelo.ContenidoRemoto;
import com.innoad.hardware.repositorio.DispositivoRepositorio;
import com.innoad.hardware.repositorio.ContenidoRepositorio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 🧪 TEST SUITE: ServicioHardwareAPI
 * Pruebas unitarias para operaciones de dispositivos IoT
 */
@DisplayName("Suite de Pruebas: ServicioHardwareAPI")
public class ServicioHardwareAPITest {

    @Mock
    private DispositivoRepositorio dispositivoRepositorio;

    @Mock
    private ContenidoRepositorio contenidoRepositorio;

    @InjectMocks
    private ServicioHardwareAPI servicio;

    private DispositivoIoT dispositivoTest;
    private DispositivoDTO dispositivoDTOTest;
    private ContenidoRemoto contenidoTest;

    @BeforeEach
    void configurarTests() {
        MockitoAnnotations.openMocks(this);

        // Dispositivo de prueba
        dispositivoTest = new DispositivoIoT();
        dispositivoTest.setId("disp-001");
        dispositivoTest.setNombre("Raspberry Pi Entrada");
        dispositivoTest.setTipo("raspberry_pi");
        dispositivoTest.setEstado("online");
        dispositivoTest.setUbicacion("Recepción");
        dispositivoTest.setIpAddress("192.168.1.100");
        dispositivoTest.setMacAddress("B8:27:EB:12:34:56");
        dispositivoTest.setVersionSoftware("1.0.0");
        dispositivoTest.setUltimaConexion(LocalDateTime.now());

        // Especificaciones
        Map<String, Object> specs = new HashMap<>();
        specs.put("procesador", "ARM Cortex-A72");
        specs.put("memoria", "4GB");
        specs.put("almacenamiento", "32GB");
        dispositivoTest.setEspecificaciones(specs);

        // Sensores
        Map<String, Object> sensores = new HashMap<>();
        sensores.put("temperatura", 45.5);
        sensores.put("humedad", 60.0);
        sensores.put("presion", 1013.25);
        dispositivoTest.setSensores(sensores);

        // DTO para pruebas
        dispositivoDTOTest = convertirADTO(dispositivoTest);

        // Contenido de prueba
        contenidoTest = new ContenidoRemoto();
        contenidoTest.setId("cont-001");
        contenidoTest.setTitulo("Anuncio Promocional");
        contenidoTest.setDescripcion("Video de 30 segundos");
        contenidoTest.setTipo("video");
        contenidoTest.setUrl("/contenido/remoto/anuncio.mp4");
        contenidoTest.setTamaño(52428800L);
        contenidoTest.setFechaCreacion(LocalDateTime.now());
        contenidoTest.setEstado("programado");
        contenidoTest.setProgreso(0);
    }

    // ==================== DISPOSITIVOS - TEST ====================

    @Test
    @DisplayName("✅ Registrar nuevo dispositivo correctamente")
    void testRegistrarDispositivo() {
        // Arrange
        when(dispositivoRepositorio.save(any(DispositivoIoT.class)))
                .thenReturn(dispositivoTest);

        // Act
        DispositivoDTO resultado = servicio.registrarDispositivo(dispositivoDTOTest);

        // Assert
        assertNotNull(resultado);
        assertEquals("Raspberry Pi Entrada", resultado.getNombre());
        assertEquals("online", resultado.getEstado());
        verify(dispositivoRepositorio, times(1)).save(any(DispositivoIoT.class));
    }

    @Test
    @DisplayName("✅ Obtener dispositivo por ID")
    void testObtenerDispositivo() {
        // Arrange
        when(dispositivoRepositorio.findById("disp-001"))
                .thenReturn(Optional.of(dispositivoTest));

        // Act
        DispositivoDTO resultado = servicio.obtenerDispositivo("disp-001");

        // Assert
        assertNotNull(resultado);
        assertEquals("disp-001", resultado.getId());
        assertEquals("Raspberry Pi Entrada", resultado.getNombre());
    }

    @Test
    @DisplayName("✅ Obtener lista de dispositivos")
    void testObtenerDispositivos() {
        // Arrange
        List<DispositivoIoT> dispositivos = Arrays.asList(dispositivoTest);
        when(dispositivoRepositorio.findAll()).thenReturn(dispositivos);

        // Act
        List<DispositivoDTO> resultado = servicio.obtenerDispositivos();

        // Assert
        assertFalse(resultado.isEmpty());
        assertEquals(1, resultado.size());
        assertEquals("Raspberry Pi Entrada", resultado.get(0).getNombre());
    }

    @Test
    @DisplayName("✅ Actualizar datos de dispositivo")
    void testActualizarDispositivo() {
        // Arrange
        DispositivoDTO actualizacion = new DispositivoDTO();
        actualizacion.setNombre("Raspberry Pi Actualizada");
        actualizacion.setUbicacion("Recepción Principal");

        when(dispositivoRepositorio.findById("disp-001"))
                .thenReturn(Optional.of(dispositivoTest));
        when(dispositivoRepositorio.save(any(DispositivoIoT.class)))
                .thenReturn(dispositivoTest);

        // Act
        DispositivoDTO resultado = servicio.actualizarDispositivo("disp-001", actualizacion);

        // Assert
        assertNotNull(resultado);
        verify(dispositivoRepositorio, times(1)).save(any(DispositivoIoT.class));
    }

    @Test
    @DisplayName("✅ Eliminar dispositivo")
    void testEliminarDispositivo() {
        // Arrange
        doNothing().when(dispositivoRepositorio).deleteById("disp-001");

        // Act
        servicio.eliminarDispositivo("disp-001");

        // Assert
        verify(dispositivoRepositorio, times(1)).deleteById("disp-001");
    }

    @Test
    @DisplayName("❌ Error al obtener dispositivo inexistente")
    void testObtenerDispositivoNoExistente() {
        // Arrange
        when(dispositivoRepositorio.findById("no-existe"))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            servicio.obtenerDispositivo("no-existe");
        });
    }

    // ==================== COMANDOS - TEST ====================

    @Test
    @DisplayName("✅ Ejecutar comando 'reproducir'")
    void testEjecutarComandoReproducir() {
        // Arrange
        when(dispositivoRepositorio.findById("disp-001"))
                .thenReturn(Optional.of(dispositivoTest));

        ComandoDTO comando = new ComandoDTO();
        comando.setTipo("reproducir");
        comando.setParametros(Map.of("contenidoId", "cont-001"));

        // Act
        ComandoDispositivoDTO resultado = servicio.ejecutarComando("disp-001", comando);

        // Assert
        assertNotNull(resultado);
        assertEquals("reproducir", resultado.getTipo());
        assertEquals("ejecutado", resultado.getEstado());
        assertTrue(resultado.getRespuesta().contains("Reproduciendo"));
    }

    @Test
    @DisplayName("✅ Ejecutar comando 'pausar'")
    void testEjecutarComandoPausar() {
        // Arrange
        when(dispositivoRepositorio.findById("disp-001"))
                .thenReturn(Optional.of(dispositivoTest));

        ComandoDTO comando = new ComandoDTO();
        comando.setTipo("pausar");

        // Act
        ComandoDispositivoDTO resultado = servicio.ejecutarComando("disp-001", comando);

        // Assert
        assertNotNull(resultado);
        assertEquals("pausar", resultado.getTipo());
        assertTrue(resultado.getRespuesta().contains("pausado"));
    }

    @Test
    @DisplayName("✅ Ejecutar comando 'reiniciar'")
    void testEjecutarComandoReiniciar() {
        // Arrange
        when(dispositivoRepositorio.findById("disp-001"))
                .thenReturn(Optional.of(dispositivoTest));
        when(dispositivoRepositorio.save(any(DispositivoIoT.class)))
                .thenReturn(dispositivoTest);

        ComandoDTO comando = new ComandoDTO();
        comando.setTipo("reiniciar");

        // Act
        ComandoDispositivoDTO resultado = servicio.ejecutarComando("disp-001", comando);

        // Assert
        assertNotNull(resultado);
        assertEquals("reiniciar", resultado.getTipo());
        assertTrue(resultado.getRespuesta().contains("reiniciando"));
    }

    @Test
    @DisplayName("✅ Reproducir contenido en dispositivo")
    void testReproducirContenido() {
        // Arrange
        when(dispositivoRepositorio.findById("disp-001"))
                .thenReturn(Optional.of(dispositivoTest));

        // Act
        ComandoDispositivoDTO resultado = servicio.reproducirContenido("disp-001", "cont-001");

        // Assert
        assertNotNull(resultado);
        assertEquals("reproducir", resultado.getTipo());
        assertEquals("cont-001", resultado.getParametros().get("contenidoId"));
    }

    @Test
    @DisplayName("✅ Actualizar estado de dispositivo")
    void testActualizarEstadoDispositivo() {
        // Arrange
        when(dispositivoRepositorio.findById("disp-001"))
                .thenReturn(Optional.of(dispositivoTest));
        when(dispositivoRepositorio.save(any(DispositivoIoT.class)))
                .thenReturn(dispositivoTest);

        // Act
        servicio.actualizarEstadoDispositivo("disp-001", "offline");

        // Assert
        verify(dispositivoRepositorio, times(1)).save(any(DispositivoIoT.class));
    }

    // ==================== CONTENIDO - TEST ====================

    @Test
    @DisplayName("✅ Obtener lista de contenido")
    void testObtenerContenido() {
        // Arrange
        List<ContenidoRemoto> contenidos = Arrays.asList(contenidoTest);
        when(contenidoRepositorio.findAll()).thenReturn(contenidos);

        // Act
        List<ContenidoDTO> resultado = servicio.obtenerContenido();

        // Assert
        assertFalse(resultado.isEmpty());
        assertEquals(1, resultado.size());
        assertEquals("Anuncio Promocional", resultado.get(0).getTitulo());
    }

    @Test
    @DisplayName("✅ Subir nuevo contenido")
    void testSubirContenido() throws IOException {
        // Arrange
        byte[] contenido = "Video content".getBytes();
        MultipartFile archivo = new MockMultipartFile(
                "archivo",
                "anuncio.mp4",
                "video/mp4",
                contenido
        );

        ContenidoDTO metadata = new ContenidoDTO();
        metadata.setTitulo("Anuncio Nuevo");
        metadata.setDescripcion("Video promocional");
        metadata.setTipo("video");

        when(contenidoRepositorio.save(any(ContenidoRemoto.class)))
                .thenReturn(contenidoTest);

        // Act
        ContenidoDTO resultado = servicio.subirContenido(archivo, metadata);

        // Assert
        assertNotNull(resultado);
        assertEquals("Anuncio Promocional", resultado.getTitulo());
        verify(contenidoRepositorio, times(1)).save(any(ContenidoRemoto.class));
    }

    @Test
    @DisplayName("✅ Asignar contenido a dispositivos")
    void testAsignarContenido() {
        // Arrange
        List<String> dispositivoIds = Arrays.asList("disp-001", "disp-002");

        when(contenidoRepositorio.findById("cont-001"))
                .thenReturn(Optional.of(contenidoTest));
        when(contenidoRepositorio.save(any(ContenidoRemoto.class)))
                .thenReturn(contenidoTest);

        // Act
        ContenidoDTO resultado = servicio.asignarContenidoADispositivos(
                "cont-001",
                dispositivoIds,
                null
        );

        // Assert
        assertNotNull(resultado);
        assertEquals("en_ejecucion", resultado.getEstado());
    }

    // ==================== ESTADÍSTICAS - TEST ====================

    @Test
    @DisplayName("✅ Obtener estadísticas de dispositivo")
    void testObtenerEstadisticas() {
        // Arrange
        when(dispositivoRepositorio.findById("disp-001"))
                .thenReturn(Optional.of(dispositivoTest));

        // Act
        EstadisticasDispositivoDTO stats = servicio.obtenerEstadisticas("disp-001");

        // Assert
        assertNotNull(stats);
        assertEquals("disp-001", stats.getDispositivoId());
        assertTrue(stats.getConfiabilidad() >= 95);
        assertTrue(stats.getTemperatura() > 30 && stats.getTemperatura() < 70);
        assertTrue(stats.getUsoCPU() >= 10 && stats.getUsoCPU() <= 80);
        assertTrue(stats.getUsoMemoria() >= 30 && stats.getUsoMemoria() <= 90);
    }

    @Test
    @DisplayName("✅ Test de conexión exitoso")
    void testConexionExitosa() {
        // Arrange
        when(dispositivoRepositorio.findById("disp-001"))
                .thenReturn(Optional.of(dispositivoTest));

        // Act
        TestConexionDTO resultado = servicio.testConexion("disp-001");

        // Assert
        assertNotNull(resultado);
        assertTrue(resultado.isConectado());
        assertTrue(resultado.getLatencia() > 0);
        assertFalse(resultado.getMensajes().isEmpty());
    }

    @Test
    @DisplayName("✅ Test de conexión fallido (dispositivo offline)")
    void testConexionFallida() {
        // Arrange
        dispositivoTest.setEstado("offline");
        when(dispositivoRepositorio.findById("disp-001"))
                .thenReturn(Optional.of(dispositivoTest));

        // Act
        TestConexionDTO resultado = servicio.testConexion("disp-001");

        // Assert
        assertNotNull(resultado);
        assertFalse(resultado.isConectado());
    }

    @Test
    @DisplayName("✅ Sincronizar dispositivo")
    void testSincronizar() {
        // Arrange
        when(dispositivoRepositorio.findById("disp-001"))
                .thenReturn(Optional.of(dispositivoTest));
        when(dispositivoRepositorio.save(any(DispositivoIoT.class)))
                .thenReturn(dispositivoTest);

        // Act
        SincronizacionDTO resultado = servicio.sincronizar("disp-001");

        // Assert
        assertNotNull(resultado);
        assertTrue(resultado.getMensaje().contains("Sincronización"));
        assertNotNull(resultado.getTimestamp());
    }

    @Test
    @DisplayName("✅ Actualizar sensores del dispositivo")
    void testActualizarSensores() {
        // Arrange
        when(dispositivoRepositorio.findById("disp-001"))
                .thenReturn(Optional.of(dispositivoTest));
        when(dispositivoRepositorio.save(any(DispositivoIoT.class)))
                .thenReturn(dispositivoTest);

        SensoresDTO sensores = new SensoresDTO();
        sensores.setTemperatura(48.5);
        sensores.setHumedad(55.0);
        sensores.setPresion(1012.5);

        // Act
        servicio.actualizarSensores("disp-001", sensores);

        // Assert
        verify(dispositivoRepositorio, times(1)).save(any(DispositivoIoT.class));
    }

    @Test
    @DisplayName("✅ Actualizar progreso de contenido")
    void testActualizarProgresoContenido() {
        // Arrange
        when(contenidoRepositorio.findById("cont-001"))
                .thenReturn(Optional.of(contenidoTest));
        when(contenidoRepositorio.save(any(ContenidoRemoto.class)))
                .thenReturn(contenidoTest);

        // Act
        servicio.actualizarProgresoContenido("cont-001", 50);

        // Assert
        verify(contenidoRepositorio, times(1)).save(any(ContenidoRemoto.class));
        assertEquals(50, contenidoTest.getProgreso());
    }

    // ==================== HELPERS ====================

    private DispositivoDTO convertirADTO(DispositivoIoT dispositivo) {
        DispositivoDTO dto = new DispositivoDTO();
        dto.setId(dispositivo.getId());
        dto.setNombre(dispositivo.getNombre());
        dto.setTipo(dispositivo.getTipo());
        dto.setEstado(dispositivo.getEstado());
        dto.setUbicacion(dispositivo.getUbicacion());
        dto.setIpAddress(dispositivo.getIpAddress());
        dto.setMacAddress(dispositivo.getMacAddress());
        dto.setUltimaConexion(dispositivo.getUltimaConexion());
        dto.setVersionSoftware(dispositivo.getVersionSoftware());
        dto.setEspecificaciones(dispositivo.getEspecificaciones());
        dto.setSensores(dispositivo.getSensores());
        return dto;
    }
}

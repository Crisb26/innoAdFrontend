package com.innoad.hardware.controlador;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.innoad.hardware.dto.*;
import com.innoad.hardware.servicio.ServicioHardwareAPI;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 🧪 TEST SUITE: ControladorHardwareAPI
 * Pruebas de endpoints REST para Hardware API
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Suite de Pruebas: ControladorHardwareAPI")
public class ControladorHardwareAPITest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ServicioHardwareAPI servicio;

    @Autowired
    private ObjectMapper objectMapper;

    private DispositivoDTO dispositivoDTO;
    private ComandoDTO comandoDTO;
    private ContenidoDTO contenidoDTO;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        // Dispositivo de prueba
        dispositivoDTO = new DispositivoDTO();
        dispositivoDTO.setId("disp-001");
        dispositivoDTO.setNombre("Raspberry Pi Test");
        dispositivoDTO.setTipo("raspberry_pi");
        dispositivoDTO.setEstado("online");
        dispositivoDTO.setUbicacion("Recepción");
        dispositivoDTO.setIpAddress("192.168.1.100");
        dispositivoDTO.setMacAddress("B8:27:EB:12:34:56");
        dispositivoDTO.setVersionSoftware("1.0.0");
        dispositivoDTO.setUltimaConexion(LocalDateTime.now());

        // Comando de prueba
        comandoDTO = new ComandoDTO();
        comandoDTO.setTipo("reproducir");
        comandoDTO.setParametros(Map.of("contenidoId", "cont-001"));

        // Contenido de prueba
        contenidoDTO = new ContenidoDTO();
        contenidoDTO.setId("cont-001");
        contenidoDTO.setTitulo("Video Test");
        contenidoDTO.setDescripcion("Video de prueba");
        contenidoDTO.setTipo("video");
        contenidoDTO.setUrl("/contenido/test.mp4");
        contenidoDTO.setTamaño(52428800L);
        contenidoDTO.setEstado("programado");
        contenidoDTO.setProgreso(0);
    }

    // ==================== DISPOSITIVOS ====================

    @Test
    @DisplayName("✅ GET /api/hardware/dispositivos - Obtener lista")
    void testObtenerDispositivos() throws Exception {
        // Arrange
        List<DispositivoDTO> dispositivos = Arrays.asList(dispositivoDTO);
        when(servicio.obtenerDispositivos()).thenReturn(dispositivos);

        // Act & Assert
        mockMvc.perform(get("/api/hardware/dispositivos")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("disp-001"))
                .andExpect(jsonPath("$[0].nombre").value("Raspberry Pi Test"));
    }

    @Test
    @DisplayName("✅ GET /api/hardware/dispositivos/{id} - Obtener dispositivo")
    void testObtenerDispositivoPorId() throws Exception {
        // Arrange
        when(servicio.obtenerDispositivo("disp-001")).thenReturn(dispositivoDTO);

        // Act & Assert
        mockMvc.perform(get("/api/hardware/dispositivos/disp-001")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("disp-001"))
                .andExpect(jsonPath("$.nombre").value("Raspberry Pi Test"));
    }

    @Test
    @DisplayName("✅ POST /api/hardware/dispositivos - Registrar dispositivo")
    void testRegistrarDispositivo() throws Exception {
        // Arrange
        when(servicio.registrarDispositivo(any(DispositivoDTO.class)))
                .thenReturn(dispositivoDTO);

        // Act & Assert
        mockMvc.perform(post("/api/hardware/dispositivos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dispositivoDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("disp-001"));
    }

    @Test
    @DisplayName("✅ PUT /api/hardware/dispositivos/{id} - Actualizar dispositivo")
    void testActualizarDispositivo() throws Exception {
        // Arrange
        when(servicio.actualizarDispositivo(eq("disp-001"), any(DispositivoDTO.class)))
                .thenReturn(dispositivoDTO);

        // Act & Assert
        mockMvc.perform(put("/api/hardware/dispositivos/disp-001")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dispositivoDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Raspberry Pi Test"));
    }

    @Test
    @DisplayName("✅ DELETE /api/hardware/dispositivos/{id} - Eliminar dispositivo")
    void testEliminarDispositivo() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/hardware/dispositivos/disp-001")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").exists());
    }

    // ==================== COMANDOS ====================

    @Test
    @DisplayName("✅ POST /api/hardware/dispositivos/{id}/comando - Ejecutar comando")
    void testEjecutarComando() throws Exception {
        // Arrange
        ComandoDispositivoDTO resultado = new ComandoDispositivoDTO();
        resultado.setId("cmd-001");
        resultado.setDispositivoId("disp-001");
        resultado.setTipo("reproducir");
        resultado.setEstado("ejecutado");
        resultado.setRespuesta("Reproduciendo contenido");

        when(servicio.ejecutarComando(eq("disp-001"), any(ComandoDTO.class)))
                .thenReturn(resultado);

        // Act & Assert
        mockMvc.perform(post("/api/hardware/dispositivos/disp-001/comando")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(comandoDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tipo").value("reproducir"))
                .andExpect(jsonPath("$.estado").value("ejecutado"));
    }

    @Test
    @DisplayName("✅ POST /api/hardware/dispositivos/{id}/reproducir - Reproducir contenido")
    void testReproducir() throws Exception {
        // Arrange
        ComandoDispositivoDTO resultado = new ComandoDispositivoDTO();
        resultado.setTipo("reproducir");
        resultado.setEstado("ejecutado");

        when(servicio.reproducirContenido("disp-001", "cont-001"))
                .thenReturn(resultado);

        // Act & Assert
        mockMvc.perform(post("/api/hardware/dispositivos/disp-001/reproducir")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"contenidoId\": \"cont-001\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tipo").value("reproducir"));
    }

    @Test
    @DisplayName("✅ POST /api/hardware/dispositivos/{id}/pausar - Pausar")
    void testPausar() throws Exception {
        // Arrange
        ComandoDispositivoDTO resultado = new ComandoDispositivoDTO();
        resultado.setTipo("pausar");
        resultado.setEstado("ejecutado");

        when(servicio.pausarDispositivo("disp-001"))
                .thenReturn(resultado);

        // Act & Assert
        mockMvc.perform(post("/api/hardware/dispositivos/disp-001/pausar")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tipo").value("pausar"));
    }

    @Test
    @DisplayName("✅ POST /api/hardware/dispositivos/{id}/detener - Detener")
    void testDetener() throws Exception {
        // Arrange
        ComandoDispositivoDTO resultado = new ComandoDispositivoDTO();
        resultado.setTipo("detener");
        resultado.setEstado("ejecutado");

        when(servicio.detenerDispositivo("disp-001"))
                .thenReturn(resultado);

        // Act & Assert
        mockMvc.perform(post("/api/hardware/dispositivos/disp-001/detener")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tipo").value("detener"));
    }

    @Test
    @DisplayName("✅ POST /api/hardware/dispositivos/{id}/reiniciar - Reiniciar")
    void testReiniciar() throws Exception {
        // Arrange
        ComandoDispositivoDTO resultado = new ComandoDispositivoDTO();
        resultado.setTipo("reiniciar");
        resultado.setEstado("ejecutado");

        when(servicio.reiniciarDispositivo("disp-001"))
                .thenReturn(resultado);

        // Act & Assert
        mockMvc.perform(post("/api/hardware/dispositivos/disp-001/reiniciar")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tipo").value("reiniciar"));
    }

    @Test
    @DisplayName("✅ POST /api/hardware/dispositivos/{id}/actualizar - Actualizar software")
    void testActualizarSoftware() throws Exception {
        // Arrange
        ComandoDispositivoDTO resultado = new ComandoDispositivoDTO();
        resultado.setTipo("actualizar");
        resultado.setEstado("ejecutado");

        when(servicio.actualizarSoftware("disp-001"))
                .thenReturn(resultado);

        // Act & Assert
        mockMvc.perform(post("/api/hardware/dispositivos/disp-001/actualizar")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tipo").value("actualizar"));
    }

    // ==================== CONTENIDO ====================

    @Test
    @DisplayName("✅ GET /api/hardware/contenido - Obtener lista de contenido")
    void testObtenerContenido() throws Exception {
        // Arrange
        List<ContenidoDTO> contenidos = Arrays.asList(contenidoDTO);
        when(servicio.obtenerContenido()).thenReturn(contenidos);

        // Act & Assert
        mockMvc.perform(get("/api/hardware/contenido")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("cont-001"))
                .andExpect(jsonPath("$[0].titulo").value("Video Test"));
    }

    @Test
    @DisplayName("✅ POST /api/hardware/contenido/asignar - Asignar contenido")
    void testAsignarContenido() throws Exception {
        // Arrange
        when(servicio.asignarContenidoADispositivos(
                eq("cont-001"),
                any(),
                any()))
                .thenReturn(contenidoDTO);

        String payload = objectMapper.writeValueAsString(Map.of(
                "dispositivoIds", Arrays.asList("disp-001", "disp-002"),
                "programacion", Map.of("fechaInicio", LocalDateTime.now())
        ));

        // Act & Assert
        mockMvc.perform(post("/api/hardware/contenido/cont-001/asignar")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("cont-001"));
    }

    @Test
    @DisplayName("✅ DELETE /api/hardware/contenido/{id} - Eliminar contenido")
    void testEliminarContenido() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/hardware/contenido/cont-001")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").exists());
    }

    // ==================== ESTADÍSTICAS ====================

    @Test
    @DisplayName("✅ GET /api/hardware/dispositivos/{id}/estadisticas - Obtener estadísticas")
    void testObtenerEstadisticas() throws Exception {
        // Arrange
        EstadisticasDispositivoDTO stats = new EstadisticasDispositivoDTO();
        stats.setDispositivoId("disp-001");
        stats.setConfiabilidad(98);
        stats.setUsoCPU(45);
        stats.setUsoMemoria(62);
        stats.setTemperatura(48.5);

        when(servicio.obtenerEstadisticas("disp-001"))
                .thenReturn(stats);

        // Act & Assert
        mockMvc.perform(get("/api/hardware/dispositivos/disp-001/estadisticas")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.confiabilidad").value(98))
                .andExpect(jsonPath("$.usoCPU").value(45));
    }

    @Test
    @DisplayName("✅ GET /api/hardware/dispositivos/{id}/test - Test de conexión")
    void testConexion() throws Exception {
        // Arrange
        TestConexionDTO resultado = new TestConexionDTO();
        resultado.setConectado(true);
        resultado.setLatencia(25);
        resultado.setMensajes(Arrays.asList("Ping exitoso", "Dispositivo respondiendo"));

        when(servicio.testConexion("disp-001"))
                .thenReturn(resultado);

        // Act & Assert
        mockMvc.perform(get("/api/hardware/dispositivos/disp-001/test")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conectado").value(true))
                .andExpect(jsonPath("$.latencia").value(25));
    }

    @Test
    @DisplayName("✅ POST /api/hardware/dispositivos/{id}/sincronizar - Sincronizar")
    void testSincronizar() throws Exception {
        // Arrange
        SincronizacionDTO resultado = new SincronizacionDTO();
        resultado.setMensaje("Sincronización completada");
        resultado.setTimestamp(LocalDateTime.now());

        when(servicio.sincronizar("disp-001"))
                .thenReturn(resultado);

        // Act & Assert
        mockMvc.perform(post("/api/hardware/dispositivos/disp-001/sincronizar")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Sincronización completada"));
    }

    // ==================== HEALTH ====================

    @Test
    @DisplayName("✅ GET /api/hardware/health - Health check")
    void testHealth() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/hardware/health")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("operativo"))
                .andExpect(jsonPath("$.servicio").value("Hardware API"));
    }
}

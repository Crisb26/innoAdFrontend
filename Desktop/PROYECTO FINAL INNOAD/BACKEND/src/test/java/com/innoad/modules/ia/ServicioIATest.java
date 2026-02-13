package com.innoad.modules.ia.servicio;

import com.innoad.modules.ia.domain.PromptIAPorRol;
import com.innoad.modules.ia.domain.HorarioAtencion;
import com.innoad.modules.ia.domain.HorarioAtencion.DiaSemana;
import com.innoad.modules.ia.domain.RegistroInteraccionIA;
import com.innoad.modules.ia.domain.RegistroInteraccionIA.EstadoInteraccion;
import com.innoad.modules.ia.repository.RepositorioPromptIAPorRol;
import com.innoad.modules.ia.repository.RepositorioHorarioAtencion;
import com.innoad.modules.ia.repository.RepositorioRegistroInteraccionIA;
import com.innoad.modules.ia.dto.DTOPromptIAPorRol;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para ServicioIA
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Pruebas - Servicio de IA")
class ServicioIATest {
    
    @Autowired
    private ServicioIA servicioIA;
    
    @MockBean
    private RepositorioPromptIAPorRol repositorioPromptIAPorRol;
    
    @MockBean
    private RepositorioHorarioAtencion repositorioHorarioAtencion;
    
    @MockBean
    private RepositorioRegistroInteraccionIA repositorioRegistroInteraccionIA;
    
    private PromptIAPorRol promptMock;
    private HorarioAtencion horarioMock;
    private RegistroInteraccionIA registroMock;
    
    @BeforeEach
    void setUp() {
        // Preparar datos de prueba
        promptMock = new PromptIAPorRol();
        promptMock.setId(1L);
        promptMock.setRol("ROLE_ADMIN");
        promptMock.setInstruccion("Instrucción para admin");
        promptMock.setTokenMaximo(2000);
        promptMock.setTemperatura(0.7f);
        promptMock.setActivo(true);
        
        horarioMock = new HorarioAtencion();
        horarioMock.setId(1L);
        horarioMock.setDiaSemana(DiaSemana.LUNES);
        horarioMock.setHoraInicio(LocalTime.of(8, 0));
        horarioMock.setHoraFin(LocalTime.of(18, 0));
        horarioMock.setActivo(true);
        
        registroMock = new RegistroInteraccionIA();
        registroMock.setId(1L);
        registroMock.setIdUsuario(101L);
        registroMock.setPregunta("¿Cómo uso el sistema?");
        registroMock.setRespuesta("Aquí está la respuesta...");
        registroMock.setEstado(EstadoInteraccion.COMPLETADA);
        registroMock.setTokensUtilizados(150);
        registroMock.setTiempoRespuesta(2.5f);
    }
    
    @Test
    @DisplayName("Debe obtener un prompt para un rol específico")
    void testObtenerPromptParaRol() {
        // Arrange
        when(repositorioPromptIAPorRol.findByRolAndActivo("ROLE_ADMIN", true))
            .thenReturn(Optional.of(promptMock));
        
        // Act
        PromptIAPorRol resultado = servicioIA.obtenerPromptParaRol("ROLE_ADMIN");
        
        // Assert
        assertNotNull(resultado);
        assertEquals("ROLE_ADMIN", resultado.getRol());
        verify(repositorioPromptIAPorRol, times(1))
            .findByRolAndActivo("ROLE_ADMIN", true);
    }
    
    @Test
    @DisplayName("Debe registrar una interacción de IA")
    void testRegistrarInteraccion() {
        // Arrange
        when(repositorioRegistroInteraccionIA.save(any(RegistroInteraccionIA.class)))
            .thenReturn(registroMock);
        
        // Act
        RegistroInteraccionIA resultado = servicioIA.registrarInteraccion(101L, "¿Cómo uso el sistema?");
        
        // Assert
        assertNotNull(resultado);
        assertEquals(101L, resultado.getIdUsuario());
        verify(repositorioRegistroInteraccionIA, times(1)).save(any(RegistroInteraccionIA.class));
    }
    
    @Test
    @DisplayName("Debe actualizar un registro de interacción completado")
    void testActualizarRegistroInteraccion() {
        // Arrange
        when(repositorioRegistroInteraccionIA.findById(1L)).thenReturn(Optional.of(registroMock));
        when(repositorioRegistroInteraccionIA.save(any(RegistroInteraccionIA.class)))
            .thenReturn(registroMock);
        
        // Act
        servicioIA.actualizarRegistroInteraccion(1L, "Respuesta", 150, 2.5f);
        
        // Assert
        verify(repositorioRegistroInteraccionIA, times(1)).findById(1L);
        verify(repositorioRegistroInteraccionIA, times(1)).save(any(RegistroInteraccionIA.class));
    }
    
    @Test
    @DisplayName("Debe registrar un error en una interacción fallida")
    void testRegistrarErrorInteraccion() {
        // Arrange
        when(repositorioRegistroInteraccionIA.findById(1L)).thenReturn(Optional.of(registroMock));
        when(repositorioRegistroInteraccionIA.save(any(RegistroInteraccionIA.class)))
            .thenReturn(registroMock);
        
        // Act
        servicioIA.registrarErrorInteraccion(1L, "Error de timeout");
        
        // Assert
        verify(repositorioRegistroInteraccionIA, times(1)).findById(1L);
        verify(repositorioRegistroInteraccionIA, times(1)).save(any(RegistroInteraccionIA.class));
    }
    
    @Test
    @DisplayName("Debe obtener historial de interacciones paginado")
    void testObtenerHistorialInteracciones() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(repositorioRegistroInteraccionIA.findByIdUsuario(101L, pageable))
            .thenReturn(new PageImpl<>(Arrays.asList(registroMock), pageable, 1));
        
        // Act
        var resultado = servicioIA.obtenerHistorialInteracciones(101L, pageable);
        
        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        verify(repositorioRegistroInteraccionIA, times(1))
            .findByIdUsuario(101L, pageable);
    }
    
    @Test
    @DisplayName("Debe crear un nuevo prompt de IA")
    void testCrearPrompt() {
        // Arrange
        DTOPromptIAPorRol.Crear crearPrompt = new DTOPromptIAPorRol.Crear();
        crearPrompt.setRol("ROLE_TECNICO");
        crearPrompt.setInstruccion("Instrucción para técnicos");
        crearPrompt.setTokenMaximo(2000);
        crearPrompt.setTemperatura(0.7f);
        
        when(repositorioPromptIAPorRol.save(any(PromptIAPorRol.class)))
            .thenReturn(promptMock);
        
        // Act
        PromptIAPorRol resultado = servicioIA.crearPrompt(crearPrompt);
        
        // Assert
        assertNotNull(resultado);
        assertTrue(resultado.isActivo());
        verify(repositorioPromptIAPorRol, times(1)).save(any(PromptIAPorRol.class));
    }
    
    @Test
    @DisplayName("Debe actualizar un prompt existente")
    void testActualizarPrompt() {
        // Arrange
        DTOPromptIAPorRol.Actualizar actualizarPrompt = new DTOPromptIAPorRol.Actualizar();
        actualizarPrompt.setInstruccion("Nueva instrucción");
        actualizarPrompt.setTemperatura(0.8f);
        
        when(repositorioPromptIAPorRol.findById(1L)).thenReturn(Optional.of(promptMock));
        when(repositorioPromptIAPorRol.save(any(PromptIAPorRol.class)))
            .thenReturn(promptMock);
        
        // Act
        servicioIA.actualizarPrompt(1L, actualizarPrompt);
        
        // Assert
        verify(repositorioPromptIAPorRol, times(1)).findById(1L);
        verify(repositorioPromptIAPorRol, times(1)).save(any(PromptIAPorRol.class));
    }
    
    @Test
    @DisplayName("Debe obtener todos los prompts activos")
    void testObtenerPromptsActivos() {
        // Arrange
        when(repositorioPromptIAPorRol.findByActivo(true))
            .thenReturn(Arrays.asList(promptMock));
        
        // Act
        var resultado = servicioIA.obtenerPromptsActivos();
        
        // Assert
        assertNotNull(resultado);
        assertFalse(resultado.isEmpty());
        verify(repositorioPromptIAPorRol, times(1)).findByActivo(true);
    }
    
    @Test
    @DisplayName("Debe contar las interacciones completadas de un usuario")
    void testContarInteraccionesCompletadas() {
        // Arrange
        when(repositorioRegistroInteraccionIA
            .countByIdUsuarioAndEstado(101L, EstadoInteraccion.COMPLETADA))
            .thenReturn(5L);
        
        // Act
        Long resultado = servicioIA.contarInteraccionesCompletadas(101L);
        
        // Assert
        assertEquals(5L, resultado);
        verify(repositorioRegistroInteraccionIA, times(1))
            .countByIdUsuarioAndEstado(101L, EstadoInteraccion.COMPLETADA);
    }
}

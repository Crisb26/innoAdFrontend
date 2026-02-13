package com.innoad.modules.campanas;

import com.innoad.modules.campanas.controller.ControladorCampanas;
import com.innoad.modules.campanas.domain.EstadoCampana;
import com.innoad.modules.campanas.dto.CampanaDTO;
import com.innoad.modules.campanas.service.ServicioCampanas;
import com.innoad.modules.auth.domain.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DisplayName("CampanaController Tests")
class CampanaControllerTests {

    @Mock
    private ServicioCampanas servicioCampanas;

    @InjectMocks
    private ControladorCampanas controladorCampanas;

    private Usuario usuario;
    private CampanaDTO campanaDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setEmail("test@innoad.com");
        
        campanaDTO = new CampanaDTO();
        campanaDTO.setId(1L);
        campanaDTO.setTitulo("Campaña Test");
        campanaDTO.setDescripcion("Descripción");
        campanaDTO.setPresupuesto(1000.00);
        campanaDTO.setEstado(EstadoCampana.BORRADORA);
        campanaDTO.setFechaInicio(LocalDateTime.now().plusDays(1));
        campanaDTO.setFechaFin(LocalDateTime.now().plusDays(8));
    }

    @Test
    @DisplayName("POST /api/campanas - Debería crear campaña")
    void testCrearCampana() {
        // Arrange
        when(servicioCampanas.crearCampana(any(CampanaDTO.class), any(Usuario.class)))
            .thenReturn(campanaDTO);
        
        // Act
        ResponseEntity<CampanaDTO> resultado = controladorCampanas.crearCampana(campanaDTO, usuario);
        
        // Assert
        assertEquals(HttpStatus.CREATED, resultado.getStatusCode());
        assertNotNull(resultado.getBody());
        assertEquals("Campaña Test", resultado.getBody().getTitulo());
    }

    @Test
    @DisplayName("GET /api/campanas/{id} - Debería obtener campaña")
    void testObtenerCampana() {
        // Arrange
        when(servicioCampanas.obtenerCampana(1L, usuario))
            .thenReturn(campanaDTO);
        
        // Act
        ResponseEntity<CampanaDTO> resultado = controladorCampanas.obtenerCampana(1L, usuario);
        
        // Assert
        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertNotNull(resultado.getBody());
        assertEquals("Campaña Test", resultado.getBody().getTitulo());
    }

    @Test
    @DisplayName("GET /api/campanas - Debería listar campañas")
    void testListarCampanas() {
        // Arrange
        List<CampanaDTO> campanas = List.of(campanaDTO);
        when(servicioCampanas.listarCampanasUsuario(usuario))
            .thenReturn(campanas);
        
        // Act
        ResponseEntity<List<CampanaDTO>> resultado = controladorCampanas.listarCampanas(usuario);
        
        // Assert
        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(1, resultado.getBody().size());
    }

    @Test
    @DisplayName("PUT /api/campanas/{id} - Debería actualizar campaña")
    void testActualizarCampana() {
        // Arrange
        campanaDTO.setTitulo("Campaña Actualizada");
        when(servicioCampanas.actualizarCampana(1L, campanaDTO, usuario))
            .thenReturn(campanaDTO);
        
        // Act
        ResponseEntity<CampanaDTO> resultado = controladorCampanas.actualizarCampana(1L, campanaDTO, usuario);
        
        // Assert
        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals("Campaña Actualizada", resultado.getBody().getTitulo());
    }

    @Test
    @DisplayName("PATCH /api/campanas/{id}/estado - Debería cambiar estado")
    void testCambiarEstado() {
        // Arrange
        campanaDTO.setEstado(EstadoCampana.ACTIVA);
        when(servicioCampanas.cambiarEstado(1L, EstadoCampana.ACTIVA, usuario))
            .thenReturn(campanaDTO);
        
        // Act
        ResponseEntity<CampanaDTO> resultado = controladorCampanas.cambiarEstado(1L, EstadoCampana.ACTIVA, usuario);
        
        // Assert
        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(EstadoCampana.ACTIVA, resultado.getBody().getEstado());
    }

    @Test
    @DisplayName("DELETE /api/campanas/{id} - Debería eliminar campaña")
    void testEliminarCampana() {
        // Arrange
        doNothing().when(servicioCampanas).eliminarCampana(1L, usuario);
        
        // Act
        ResponseEntity<Void> resultado = controladorCampanas.eliminarCampana(1L, usuario);
        
        // Assert
        assertEquals(HttpStatus.NO_CONTENT, resultado.getStatusCode());
        verify(servicioCampanas, times(1)).eliminarCampana(1L, usuario);
    }

    @Test
    @DisplayName("GET /api/campanas/{id}/presupuesto - Debería obtener presupuesto")
    void testObtenerPresupuesto() {
        // Arrange
        when(servicioCampanas.obtenerPresupuesto(1L, usuario))
            .thenReturn(1000.00);
        
        // Act
        ResponseEntity<Double> resultado = controladorCampanas.obtenerPresupuesto(1L, usuario);
        
        // Assert
        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(1000.00, resultado.getBody());
    }

    @Test
    @DisplayName("GET /api/campanas/{id}/estadisticas - Debería obtener estadísticas")
    void testObtenerEstadisticas() {
        // Arrange
        Map<String, Object> stats = new HashMap<>();
        stats.put("impresiones", 10000);
        stats.put("clics", 500);
        stats.put("ctr", 5.0);
        
        when(servicioCampanas.obtenerEstadisticas(1L, usuario))
            .thenReturn(stats);
        
        // Act
        ResponseEntity<Map<String, Object>> resultado = controladorCampanas.obtenerEstadisticas(1L, usuario);
        
        // Assert
        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(10000, resultado.getBody().get("impresiones"));
    }
}

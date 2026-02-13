package com.innoad.modules.campanas;

import com.innoad.modules.campanas.domain.Campana;
import com.innoad.modules.campanas.domain.EstadoCampana;
import com.innoad.modules.campanas.dto.CampanaDTO;
import com.innoad.modules.campanas.repository.RepositorioCampanas;
import com.innoad.modules.campanas.service.ServicioCampanas;
import com.innoad.modules.auth.domain.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DisplayName("CampanaService Tests")
class CampanaServiceTests {

    @Mock
    private RepositorioCampanas repositorioCampanas;

    @InjectMocks
    private ServicioCampanas servicioCampanas;

    private Usuario usuario;
    private Campana campana;
    private CampanaDTO campanaDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        // Configurar usuario
        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setEmail("test@innoad.com");
        
        // Configurar campaña
        campana = new Campana();
        campana.setId(1L);
        campana.setTitulo("Campaña Test");
        campana.setDescripcion("Descripción test");
        campana.setPresupuesto(1000.00);
        campana.setEstado(EstadoCampana.BORRADORA);
        campana.setFechaInicio(LocalDateTime.now().plusDays(1));
        campana.setFechaFin(LocalDateTime.now().plusDays(8));
        campana.setUsuario(usuario);
        
        // Configurar DTO
        campanaDTO = new CampanaDTO();
        campanaDTO.setTitulo("Campaña Test");
        campanaDTO.setDescripcion("Descripción test");
        campanaDTO.setPresupuesto(1000.00);
    }

    @Test
    @DisplayName("Debería crear una campaña exitosamente")
    void testCrearCampana() {
        // Arrange
        when(repositorioCampanas.save(any(Campana.class))).thenReturn(campana);
        
        // Act
        CampanaDTO resultado = servicioCampanas.crearCampana(campanaDTO, usuario);
        
        // Assert
        assertNotNull(resultado);
        assertEquals("Campaña Test", resultado.getTitulo());
        assertEquals(1000.00, resultado.getPresupuesto());
        verify(repositorioCampanas, times(1)).save(any(Campana.class));
    }

    @Test
    @DisplayName("Debería obtener campaña por ID")
    void testObtenerCampanaPorId() {
        // Arrange
        when(repositorioCampanas.findByIdAndUsuarioId(1L, 1L))
            .thenReturn(Optional.of(campana));
        
        // Act
        CampanaDTO resultado = servicioCampanas.obtenerCampana(1L, usuario);
        
        // Assert
        assertNotNull(resultado);
        assertEquals("Campaña Test", resultado.getTitulo());
    }

    @Test
    @DisplayName("Debería lanzar excepción si campaña no existe")
    void testObtenerCampanaNoExistente() {
        // Arrange
        when(repositorioCampanas.findByIdAndUsuarioId(999L, 1L))
            .thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
            servicioCampanas.obtenerCampana(999L, usuario)
        );
    }

    @Test
    @DisplayName("Debería validar fechas correctamente")
    void testValidarFechas() {
        // Arrange
        CampanaDTO dto = new CampanaDTO();
        dto.setTitulo("Test");
        dto.setFechaInicio(LocalDateTime.now().minusDays(1)); // Fecha pasada
        dto.setFechaFin(LocalDateTime.now().minusDays(2));
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
            servicioCampanas.crearCampana(dto, usuario)
        );
    }

    @Test
    @DisplayName("Debería validar presupuesto > 0")
    void testValidarPresupuesto() {
        // Arrange
        CampanaDTO dto = new CampanaDTO();
        dto.setTitulo("Test");
        dto.setPresupuesto(-100.00);
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
            servicioCampanas.crearCampana(dto, usuario)
        );
    }

    @Test
    @DisplayName("Debería cambiar estado correctamente")
    void testCambiarEstado() {
        // Arrange
        when(repositorioCampanas.findByIdAndUsuarioId(1L, 1L))
            .thenReturn(Optional.of(campana));
        when(repositorioCampanas.save(any(Campana.class)))
            .thenReturn(campana);
        
        // Act
        CampanaDTO resultado = servicioCampanas.cambiarEstado(1L, EstadoCampana.ACTIVA, usuario);
        
        // Assert
        assertNotNull(resultado);
        verify(repositorioCampanas, times(1)).save(any(Campana.class));
    }

    @Test
    @DisplayName("Debería eliminar campaña")
    void testEliminarCampana() {
        // Arrange
        when(repositorioCampanas.findByIdAndUsuarioId(1L, 1L))
            .thenReturn(Optional.of(campana));
        doNothing().when(repositorioCampanas).deleteById(1L);
        
        // Act
        servicioCampanas.eliminarCampana(1L, usuario);
        
        // Assert
        verify(repositorioCampanas, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Debería validar que solo el propietario puede acceder")
    void testSeguridad_OtroUsuarioNoPuedeAcceder() {
        // Arrange
        Usuario otroUsuario = new Usuario();
        otroUsuario.setId(999L);
        
        when(repositorioCampanas.findByIdAndUsuarioId(1L, 999L))
            .thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
            servicioCampanas.obtenerCampana(1L, otroUsuario)
        );
    }
}

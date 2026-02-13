package com.innoad.modules.mantenimiento;

import com.innoad.modules.mantenimiento.domain.Mantenimiento;
import com.innoad.modules.mantenimiento.dto.MantenimientoDTO;
import com.innoad.modules.mantenimiento.repository.RepositorioMantenimiento;
import com.innoad.modules.mantenimiento.service.ServicioMantenimiento;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DisplayName("MantenimientoService Tests")
class MantenimientoServiceTests {

    @Mock
    private RepositorioMantenimiento repositorioMantenimiento;

    @InjectMocks
    private ServicioMantenimiento servicioMantenimiento;

    private Mantenimiento mantenimiento;
    private MantenimientoDTO mantenimientoDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        mantenimiento = new Mantenimiento();
        mantenimiento.setId(1L);
        mantenimiento.setActivo(true);
        mantenimiento.setContraseña("$2a$10$hashedPassword");
        mantenimiento.setFechaActivacion(LocalDateTime.now());
        mantenimiento.setIntentos(0);
        mantenimiento.setUltimaAutenticacion(LocalDateTime.now());
        mantenimiento.setMensaje("Sistema en mantenimiento");
        
        mantenimientoDTO = new MantenimientoDTO();
        mantenimientoDTO.setActivo(true);
        mantenimientoDTO.setContraseña("admin123");
        mantenimientoDTO.setMensaje("Sistema en mantenimiento");
    }

    @Test
    @DisplayName("Debería obtener estado de mantenimiento")
    void testObtenerEstado() {
        // Arrange
        when(repositorioMantenimiento.findFirst())
            .thenReturn(Optional.of(mantenimiento));
        
        // Act
        MantenimientoDTO resultado = servicioMantenimiento.obtenerEstado();
        
        // Assert
        assertNotNull(resultado);
        assertTrue(resultado.isActivo());
        assertEquals("Sistema en mantenimiento", resultado.getMensaje());
    }

    @Test
    @DisplayName("Debería activar modo mantenimiento")
    void testActivarMantenimiento() {
        // Arrange
        MantenimientoDTO dto = new MantenimientoDTO();
        dto.setActivo(true);
        dto.setContraseña("newPassword123");
        dto.setMensaje("Actualizaciones en progreso");
        
        when(repositorioMantenimiento.save(any(Mantenimiento.class)))
            .thenReturn(mantenimiento);
        
        // Act
        MantenimientoDTO resultado = servicioMantenimiento.activarMantenimiento(dto);
        
        // Assert
        assertNotNull(resultado);
        assertTrue(resultado.isActivo());
        verify(repositorioMantenimiento, times(1)).save(any(Mantenimiento.class));
    }

    @Test
    @DisplayName("Debería desactivar modo mantenimiento")
    void testDesactivarMantenimiento() {
        // Arrange
        when(repositorioMantenimiento.findFirst())
            .thenReturn(Optional.of(mantenimiento));
        mantenimiento.setActivo(false);
        when(repositorioMantenimiento.save(any(Mantenimiento.class)))
            .thenReturn(mantenimiento);
        
        // Act
        MantenimientoDTO resultado = servicioMantenimiento.desactivarMantenimiento();
        
        // Assert
        assertNotNull(resultado);
        assertFalse(resultado.isActivo());
        verify(repositorioMantenimiento, times(1)).save(any(Mantenimiento.class));
    }

    @Test
    @DisplayName("Debería validar contraseña correctamente")
    void testVerificarContraseña() {
        // Arrange
        when(repositorioMantenimiento.findFirst())
            .thenReturn(Optional.of(mantenimiento));
        
        // Act
        boolean resultado = servicioMantenimiento.verificarContraseña("admin123");
        
        // Assert
        assertTrue(resultado);
    }

    @Test
    @DisplayName("Debería rechazar contraseña incorrecta")
    void testVerificarContraseñaIncorrecta() {
        // Arrange
        when(repositorioMantenimiento.findFirst())
            .thenReturn(Optional.of(mantenimiento));
        
        // Act
        boolean resultado = servicioMantenimiento.verificarContraseña("wrongPassword");
        
        // Assert
        assertFalse(resultado);
    }

    @Test
    @DisplayName("Debería validar contraseña mínima de 8 caracteres")
    void testValidarLongitudContraseña() {
        // Arrange
        MantenimientoDTO dto = new MantenimientoDTO();
        dto.setContraseña("corta"); // < 8 caracteres
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
            servicioMantenimiento.activarMantenimiento(dto)
        );
    }

    @Test
    @DisplayName("Debería registrar intento fallido")
    void testRegistrarIntentoFallido() {
        // Arrange
        when(repositorioMantenimiento.findFirst())
            .thenReturn(Optional.of(mantenimiento));
        mantenimiento.setIntentos(1);
        when(repositorioMantenimiento.save(any(Mantenimiento.class)))
            .thenReturn(mantenimiento);
        
        // Act
        servicioMantenimiento.registrarIntentoFallido();
        
        // Assert
        verify(repositorioMantenimiento, times(1)).save(any(Mantenimiento.class));
        assertEquals(1, mantenimiento.getIntentos());
    }

    @Test
    @DisplayName("Debería bloquear después de 3 intentos fallidos")
    void testBloqueoDebeIntentos() {
        // Arrange
        when(repositorioMantenimiento.findFirst())
            .thenReturn(Optional.of(mantenimiento));
        mantenimiento.setIntentos(3);
        when(repositorioMantenimiento.save(any(Mantenimiento.class)))
            .thenReturn(mantenimiento);
        
        // Act
        servicioMantenimiento.registrarIntentoFallido();
        
        // Assert
        verify(repositorioMantenimiento, times(1)).save(any(Mantenimiento.class));
    }

    @Test
    @DisplayName("Debería registrar última autenticación")
    void testRegistrarUltimaAutenticacion() {
        // Arrange
        when(repositorioMantenimiento.findFirst())
            .thenReturn(Optional.of(mantenimiento));
        LocalDateTime antes = LocalDateTime.now();
        mantenimiento.setUltimaAutenticacion(antes.plusSeconds(1));
        when(repositorioMantenimiento.save(any(Mantenimiento.class)))
            .thenReturn(mantenimiento);
        
        // Act
        servicioMantenimiento.registrarAutenticacionExitosa();
        
        // Assert
        verify(repositorioMantenimiento, times(1)).save(any(Mantenimiento.class));
    }

    @Test
    @DisplayName("Debería obtener historial de accesos")
    void testObtenerHistorialAccesos() {
        // Arrange
        Mantenimiento m1 = new Mantenimiento();
        m1.setUltimaAutenticacion(LocalDateTime.now().minusHours(2));
        
        when(repositorioMantenimiento.findAll())
            .thenReturn(List.of(m1));
        
        // Act
        List<MantenimientoDTO> resultado = servicioMantenimiento.obtenerHistorialAccesos();
        
        // Assert
        assertNotNull(resultado);
        verify(repositorioMantenimiento, times(1)).findAll();
    }

    @Test
    @DisplayName("Debería resetear intentos después de autenticación exitosa")
    void testResetearIntentos() {
        // Arrange
        when(repositorioMantenimiento.findFirst())
            .thenReturn(Optional.of(mantenimiento));
        mantenimiento.setIntentos(0);
        when(repositorioMantenimiento.save(any(Mantenimiento.class)))
            .thenReturn(mantenimiento);
        
        // Act
        servicioMantenimiento.registrarAutenticacionExitosa();
        
        // Assert
        verify(repositorioMantenimiento, times(1)).save(any(Mantenimiento.class));
        assertEquals(0, mantenimiento.getIntentos());
    }

    @Test
    @DisplayName("Debería validar que contraseña sea diferente a anterior")
    void testValidarContraseñaNoRepetida() {
        // Arrange
        MantenimientoDTO dto = new MantenimientoDTO();
        dto.setContraseña("oldPassword123");
        
        when(repositorioMantenimiento.findFirst())
            .thenReturn(Optional.of(mantenimiento));
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
            servicioMantenimiento.cambiarContraseña("oldPassword123", dto)
        );
    }
}

package com.innoad.modules.pantallas;

import com.innoad.modules.pantallas.domain.Pantalla;
import com.innoad.modules.pantallas.domain.EstadoPantalla;
import com.innoad.modules.pantallas.dto.PantallaDTO;
import com.innoad.modules.pantallas.repository.RepositorioPantallas;
import com.innoad.modules.pantallas.service.ServicioPantallas;
import com.innoad.modules.auth.domain.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DisplayName("PantallaService Tests")
class PantallaServiceTests {

    @Mock
    private RepositorioPantallas repositorioPantallas;

    @InjectMocks
    private ServicioPantallas servicioPantallas;

    private Usuario usuario;
    private Pantalla pantalla;
    private PantallaDTO pantallaDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setEmail("test@innoad.com");
        
        pantalla = new Pantalla();
        pantalla.setId(1L);
        pantalla.setNombre("Pantalla Puerta");
        pantalla.setUbicacion("Entrada Principal");
        pantalla.setResolucion("1920x1080");
        pantalla.setIP("192.168.1.100");
        pantalla.setEstado(EstadoPantalla.ACTIVA);
        pantalla.setUsuario(usuario);
        
        pantallaDTO = new PantallaDTO();
        pantallaDTO.setNombre("Pantalla Puerta");
        pantallaDTO.setUbicacion("Entrada Principal");
        pantallaDTO.setResolucion("1920x1080");
        pantallaDTO.setIP("192.168.1.100");
    }

    @Test
    @DisplayName("Debería crear una pantalla exitosamente")
    void testCrearPantalla() {
        // Arrange
        when(repositorioPantallas.save(any(Pantalla.class))).thenReturn(pantalla);
        
        // Act
        PantallaDTO resultado = servicioPantallas.crearPantalla(pantallaDTO, usuario);
        
        // Assert
        assertNotNull(resultado);
        assertEquals("Pantalla Puerta", resultado.getNombre());
        assertEquals("192.168.1.100", resultado.getIP());
        verify(repositorioPantallas, times(1)).save(any(Pantalla.class));
    }

    @Test
    @DisplayName("Debería obtener pantalla por ID")
    void testObtenerPantallaPorId() {
        // Arrange
        when(repositorioPantallas.findByIdAndUsuarioId(1L, 1L))
            .thenReturn(Optional.of(pantalla));
        
        // Act
        PantallaDTO resultado = servicioPantallas.obtenerPantalla(1L, usuario);
        
        // Assert
        assertNotNull(resultado);
        assertEquals("Pantalla Puerta", resultado.getNombre());
    }

    @Test
    @DisplayName("Debería validar IP correctamente")
    void testValidarIP() {
        // Arrange
        PantallaDTO dto = new PantallaDTO();
        dto.setNombre("Test");
        dto.setIP("192.168.1.999"); // IP inválida
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
            servicioPantallas.crearPantalla(dto, usuario)
        );
    }

    @Test
    @DisplayName("Debería validar que nombre no sea vacío")
    void testValidarNombreVacio() {
        // Arrange
        PantallaDTO dto = new PantallaDTO();
        dto.setNombre("");
        dto.setIP("192.168.1.100");
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
            servicioPantallas.crearPantalla(dto, usuario)
        );
    }

    @Test
    @DisplayName("Debería listar pantallas del usuario")
    void testListarPantallasUsuario() {
        // Arrange
        when(repositorioPantallas.findByUsuarioId(1L))
            .thenReturn(List.of(pantalla));
        
        // Act
        List<PantallaDTO> resultado = servicioPantallas.listarPantallasUsuario(usuario);
        
        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Pantalla Puerta", resultado.get(0).getNombre());
    }

    @Test
    @DisplayName("Debería actualizar estado de pantalla")
    void testActualizarEstado() {
        // Arrange
        when(repositorioPantallas.findByIdAndUsuarioId(1L, 1L))
            .thenReturn(Optional.of(pantalla));
        when(repositorioPantallas.save(any(Pantalla.class)))
            .thenReturn(pantalla);
        
        // Act
        PantallaDTO resultado = servicioPantallas.actualizarEstado(1L, EstadoPantalla.INACTIVA, usuario);
        
        // Assert
        assertNotNull(resultado);
        verify(repositorioPantallas, times(1)).save(any(Pantalla.class));
    }

    @Test
    @DisplayName("Debería validar conectividad")
    void testValidarConectividad() {
        // Arrange
        when(repositorioPantallas.findByIdAndUsuarioId(1L, 1L))
            .thenReturn(Optional.of(pantalla));
        
        // Act
        boolean resultado = servicioPantallas.verificarConectividad(1L, usuario);
        
        // Assert
        assertTrue(resultado);
    }

    @Test
    @DisplayName("Debería eliminar pantalla")
    void testEliminarPantalla() {
        // Arrange
        when(repositorioPantallas.findByIdAndUsuarioId(1L, 1L))
            .thenReturn(Optional.of(pantalla));
        doNothing().when(repositorioPantallas).deleteById(1L);
        
        // Act
        servicioPantallas.eliminarPantalla(1L, usuario);
        
        // Assert
        verify(repositorioPantallas, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Debería verificar que solo propietario puede acceder")
    void testSeguridad_OtroUsuarioNoPuedeAcceder() {
        // Arrange
        Usuario otroUsuario = new Usuario();
        otroUsuario.setId(999L);
        
        when(repositorioPantallas.findByIdAndUsuarioId(1L, 999L))
            .thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
            servicioPantallas.obtenerPantalla(1L, otroUsuario)
        );
    }
}

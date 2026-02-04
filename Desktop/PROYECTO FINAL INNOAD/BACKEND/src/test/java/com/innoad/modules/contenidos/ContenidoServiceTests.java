package com.innoad.modules.contenidos;

import com.innoad.modules.contenidos.domain.Contenido;
import com.innoad.modules.contenidos.domain.TipoContenido;
import com.innoad.modules.contenidos.dto.ContenidoDTO;
import com.innoad.modules.contenidos.repository.RepositorioContenidos;
import com.innoad.modules.contenidos.service.ServicioContenidos;
import com.innoad.modules.auth.domain.Usuario;
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

@DisplayName("ContenidoService Tests")
class ContenidoServiceTests {

    @Mock
    private RepositorioContenidos repositorioContenidos;

    @InjectMocks
    private ServicioContenidos servicioContenidos;

    private Usuario usuario;
    private Contenido contenido;
    private ContenidoDTO contenidoDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setEmail("test@innoad.com");
        
        contenido = new Contenido();
        contenido.setId(1L);
        contenido.setTitulo("Video Promocional");
        contenido.setDescripcion("Video de promoción");
        contenido.setTipo(TipoContenido.VIDEO);
        contenido.setRuta("/videos/promo.mp4");
        contenido.setDuracion(60);
        contenido.setTamaño(50000000L);
        contenido.setFechaCreacion(LocalDateTime.now());
        contenido.setUsuario(usuario);
        
        contenidoDTO = new ContenidoDTO();
        contenidoDTO.setTitulo("Video Promocional");
        contenidoDTO.setDescripcion("Video de promoción");
        contenidoDTO.setTipo(TipoContenido.VIDEO);
    }

    @Test
    @DisplayName("Debería crear contenido exitosamente")
    void testCrearContenido() {
        // Arrange
        when(repositorioContenidos.save(any(Contenido.class))).thenReturn(contenido);
        
        // Act
        ContenidoDTO resultado = servicioContenidos.crearContenido(contenidoDTO, usuario);
        
        // Assert
        assertNotNull(resultado);
        assertEquals("Video Promocional", resultado.getTitulo());
        assertEquals(TipoContenido.VIDEO, resultado.getTipo());
        verify(repositorioContenidos, times(1)).save(any(Contenido.class));
    }

    @Test
    @DisplayName("Debería obtener contenido por ID")
    void testObtenerContenidoPorId() {
        // Arrange
        when(repositorioContenidos.findByIdAndUsuarioId(1L, 1L))
            .thenReturn(Optional.of(contenido));
        
        // Act
        ContenidoDTO resultado = servicioContenidos.obtenerContenido(1L, usuario);
        
        // Assert
        assertNotNull(resultado);
        assertEquals("Video Promocional", resultado.getTitulo());
    }

    @Test
    @DisplayName("Debería validar tipos de contenido")
    void testValidarTipoContenido() {
        // Arrange
        ContenidoDTO dto = new ContenidoDTO();
        dto.setTitulo("Test");
        dto.setTipo(null); // Tipo inválido
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
            servicioContenidos.crearContenido(dto, usuario)
        );
    }

    @Test
    @DisplayName("Debería validar tamaño máximo de archivo")
    void testValidarTamañoArchivo() {
        // Arrange
        ContenidoDTO dto = new ContenidoDTO();
        dto.setTitulo("Test");
        dto.setTipo(TipoContenido.VIDEO);
        dto.setTamaño(2000000000L); // > 1GB
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
            servicioContenidos.crearContenido(dto, usuario)
        );
    }

    @Test
    @DisplayName("Debería listar contenidos del usuario")
    void testListarContenidosUsuario() {
        // Arrange
        when(repositorioContenidos.findByUsuarioId(1L))
            .thenReturn(List.of(contenido));
        
        // Act
        List<ContenidoDTO> resultado = servicioContenidos.listarContenidosUsuario(usuario);
        
        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    @DisplayName("Debería filtrar contenidos por tipo")
    void testFiltrarPorTipo() {
        // Arrange
        when(repositorioContenidos.findByTipoAndUsuarioId(TipoContenido.VIDEO, 1L))
            .thenReturn(List.of(contenido));
        
        // Act
        List<ContenidoDTO> resultado = servicioContenidos.filtrarPorTipo(TipoContenido.VIDEO, usuario);
        
        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals(TipoContenido.VIDEO, resultado.get(0).getTipo());
    }

    @Test
    @DisplayName("Debería calcular tamaño total de contenidos")
    void testCalcularTamañoTotal() {
        // Arrange
        when(repositorioContenidos.sumTamañoByUsuarioId(1L))
            .thenReturn(50000000L);
        
        // Act
        Long resultado = servicioContenidos.obtenerTamañoTotalContenidos(usuario);
        
        // Assert
        assertEquals(50000000L, resultado);
    }

    @Test
    @DisplayName("Debería validar que contenido esté disponible")
    void testValidarDisponibilidad() {
        // Arrange
        when(repositorioContenidos.findByIdAndUsuarioId(1L, 1L))
            .thenReturn(Optional.of(contenido));
        
        // Act
        boolean resultado = servicioContenidos.verificarDisponibilidad(1L, usuario);
        
        // Assert
        assertTrue(resultado);
    }

    @Test
    @DisplayName("Debería eliminar contenido")
    void testEliminarContenido() {
        // Arrange
        when(repositorioContenidos.findByIdAndUsuarioId(1L, 1L))
            .thenReturn(Optional.of(contenido));
        doNothing().when(repositorioContenidos).deleteById(1L);
        
        // Act
        servicioContenidos.eliminarContenido(1L, usuario);
        
        // Assert
        verify(repositorioContenidos, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Debería solo permitir acceso al propietario")
    void testSeguridad_OtroUsuarioNoPuedeAcceder() {
        // Arrange
        Usuario otroUsuario = new Usuario();
        otroUsuario.setId(999L);
        
        when(repositorioContenidos.findByIdAndUsuarioId(1L, 999L))
            .thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
            servicioContenidos.obtenerContenido(1L, otroUsuario)
        );
    }
}

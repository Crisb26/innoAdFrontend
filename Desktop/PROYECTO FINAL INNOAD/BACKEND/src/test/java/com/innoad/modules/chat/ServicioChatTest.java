package com.innoad.modules.chat.servicio;

import com.innoad.modules.chat.dominio.ChatUsuario;
import com.innoad.modules.chat.dominio.MensajeChat;
import com.innoad.modules.chat.dominio.SolicitudChatTecnico;
import com.innoad.modules.chat.dominio.SolicitudChatTecnico.EstadoSolicitud;
import com.innoad.modules.chat.repositorio.RepositorioChatUsuario;
import com.innoad.modules.chat.repositorio.RepositorioMensajeChat;
import com.innoad.modules.chat.repositorio.RepositorioSolicitudChatTecnico;
import com.innoad.modules.chat.dto.DTOChatUsuario;
import com.innoad.modules.chat.dto.DTOMensajeChat;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para ServicioChat
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Pruebas - Servicio de Chat")
class ServicioChatTest {
    
    @Autowired
    private ServicioChat servicioChat;
    
    @MockBean
    private RepositorioChatUsuario repositorioChatUsuario;
    
    @MockBean
    private RepositorioMensajeChat repositorioMensajeChat;
    
    @MockBean
    private RepositorioSolicitudChatTecnico repositorioSolicitudChatTecnico;
    
    private ChatUsuario chatMock;
    private MensajeChat mensajeMock;
    private SolicitudChatTecnico solicitudMock;
    
    @BeforeEach
    void setUp() {
        // Preparar datos de prueba
        chatMock = new ChatUsuario();
        chatMock.setId(1L);
        chatMock.setIdUsuarioTecnico(101L);
        chatMock.setIdUsuarioSolicitante(102L);
        chatMock.setActivo(true);
        chatMock.setFechaCreacion(LocalDateTime.now());
        
        mensajeMock = new MensajeChat();
        mensajeMock.setId(1L);
        mensajeMock.setIdChatUsuario(1L);
        mensajeMock.setIdUsuarioRemitente(101L);
        mensajeMock.setContenido("Mensaje de prueba");
        mensajeMock.setLeido(false);
        
        solicitudMock = new SolicitudChatTecnico();
        solicitudMock.setId(1L);
        solicitudMock.setIdUsuario(102L);
        solicitudMock.setDescripcion("Solicitud de soporte");
        solicitudMock.setEstado(EstadoSolicitud.PENDIENTE);
    }
    
    @Test
    @DisplayName("Debe obtener o crear un chat existente")
    void testObtenerOCrearChatExistente() {
        // Arrange
        when(repositorioChatUsuario.findByIdUsuarioTecnicoAndIdUsuarioSolicitante(101L, 102L))
            .thenReturn(Optional.of(chatMock));
        
        // Act
        ChatUsuario resultado = servicioChat.obtenerOCrearChat(101L, 102L);
        
        // Assert
        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals(101L, resultado.getIdUsuarioTecnico());
        verify(repositorioChatUsuario, times(1))
            .findByIdUsuarioTecnicoAndIdUsuarioSolicitante(101L, 102L);
    }
    
    @Test
    @DisplayName("Debe enviar un mensaje en un chat activo")
    void testEnviarMensajeEnChatActivo() {
        // Arrange
        DTOMensajeChat.Crear crearMensaje = new DTOMensajeChat.Crear();
        crearMensaje.setIdChatUsuario(1L);
        crearMensaje.setIdUsuarioRemitente(101L);
        crearMensaje.setContenido("Nuevo mensaje");
        
        when(repositorioChatUsuario.findById(1L)).thenReturn(Optional.of(chatMock));
        when(repositorioMensajeChat.save(any(MensajeChat.class))).thenReturn(mensajeMock);
        
        // Act
        MensajeChat resultado = servicioChat.enviarMensaje(1L, 101L, "Nuevo mensaje");
        
        // Assert
        assertNotNull(resultado);
        assertEquals(101L, resultado.getIdUsuarioRemitente());
        verify(repositorioChatUsuario, times(1)).findById(1L);
        verify(repositorioMensajeChat, times(1)).save(any(MensajeChat.class));
    }
    
    @Test
    @DisplayName("Debe marcar mensajes como leídos")
    void testMarcarMensajesComoLeidos() {
        // Arrange
        List<MensajeChat> mensajesNoLeidos = new ArrayList<>();
        mensajesNoLeidos.add(mensajeMock);
        
        when(repositorioMensajeChat.findByIdChatUsuarioAndLeido(1L, false))
            .thenReturn(mensajesNoLeidos);
        when(repositorioMensajeChat.save(any(MensajeChat.class))).thenReturn(mensajeMock);
        
        // Act
        servicioChat.marcarMensajesComoLeidos(1L);
        
        // Assert
        verify(repositorioMensajeChat, times(1))
            .findByIdChatUsuarioAndLeido(1L, false);
        verify(repositorioMensajeChat, times(1)).save(any(MensajeChat.class));
    }
    
    @Test
    @DisplayName("Debe cerrar un chat activo")
    void testCerrarChat() {
        // Arrange
        when(repositorioChatUsuario.findById(1L)).thenReturn(Optional.of(chatMock));
        when(repositorioChatUsuario.save(any(ChatUsuario.class))).thenReturn(chatMock);
        
        // Act
        servicioChat.cerrarChat(1L);
        
        // Assert
        verify(repositorioChatUsuario, times(1)).findById(1L);
        verify(repositorioChatUsuario, times(1)).save(any(ChatUsuario.class));
    }
    
    @Test
    @DisplayName("Debe crear una solicitud de chat técnico")
    void testCrearSolicitudChat() {
        // Arrange
        when(repositorioSolicitudChatTecnico.save(any(SolicitudChatTecnico.class)))
            .thenReturn(solicitudMock);
        
        // Act
        SolicitudChatTecnico resultado = servicioChat.crearSolicitudChat(102L, "Solicitud de soporte");
        
        // Assert
        assertNotNull(resultado);
        assertEquals(EstadoSolicitud.PENDIENTE, resultado.getEstado());
        verify(repositorioSolicitudChatTecnico, times(1)).save(any(SolicitudChatTecnico.class));
    }
    
    @Test
    @DisplayName("Debe asignar una solicitud a un técnico")
    void testAsignarSolicitud() {
        // Arrange
        when(repositorioSolicitudChatTecnico.findById(1L)).thenReturn(Optional.of(solicitudMock));
        when(repositorioSolicitudChatTecnico.save(any(SolicitudChatTecnico.class)))
            .thenReturn(solicitudMock);
        
        // Act
        servicioChat.asignarSolicitud(1L, 101L);
        
        // Assert
        verify(repositorioSolicitudChatTecnico, times(1)).findById(1L);
        verify(repositorioSolicitudChatTecnico, times(1)).save(any(SolicitudChatTecnico.class));
    }
    
    @Test
    @DisplayName("Debe obtener solicitudes pendientes paginadas")
    void testObtenerSolicitudesPendientes() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(repositorioSolicitudChatTecnico.findByEstado(EstadoSolicitud.PENDIENTE, pageable))
            .thenReturn(new PageImpl<>(Arrays.asList(solicitudMock), pageable, 1));
        
        // Act
        var resultado = servicioChat.obtenerSolicitudesPendientes(pageable);
        
        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        verify(repositorioSolicitudChatTecnico, times(1))
            .findByEstado(EstadoSolicitud.PENDIENTE, pageable);
    }
}

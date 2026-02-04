package com.innoad.modules.chat.servicio;

import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.auth.repository.RepositorioUsuario;
import com.innoad.modules.chat.dominio.ChatUsuario;
import com.innoad.modules.chat.dominio.MensajeChat;
import com.innoad.modules.chat.dominio.SolicitudChatTecnico;
import com.innoad.modules.chat.dto.DTOChatUsuario;
import com.innoad.modules.chat.dto.DTOMensajeChat;
import com.innoad.modules.chat.dto.DTOSolicitudChatTecnico;
import com.innoad.modules.chat.repositorio.RepositorioChatUsuario;
import com.innoad.modules.chat.repositorio.RepositorioMensajeChat;
import com.innoad.modules.chat.repositorio.RepositorioSolicitudChatTecnico;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioChat {

    private final RepositorioChatUsuario repositorioChatUsuario;
    private final RepositorioMensajeChat repositorioMensajeChat;
    private final RepositorioSolicitudChatTecnico repositorioSolicitudChatTecnico;
    private final RepositorioUsuario repositorioUsuario;

    @Transactional
    public ChatUsuario obtenerOCrearChat(Long idTecnico, Long idSolicitante) {
        log.info("Obteniendo o creando chat entre técnico {} y solicitante {}", idTecnico, idSolicitante);
        
        var chatExistente = repositorioChatUsuario.encontrarChatActivo(idTecnico, idSolicitante);
        if (chatExistente.isPresent()) {
            return chatExistente.get();
        }

        Usuario tecnico = repositorioUsuario.findById(idTecnico)
                .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        Usuario solicitante = repositorioUsuario.findById(idSolicitante)
                .orElseThrow(() -> new RuntimeException("Solicitante no encontrado"));

        ChatUsuario nuevoChat = new ChatUsuario();
        nuevoChat.setUsuarioTecnico(tecnico);
        nuevoChat.setUsuarioSolicitante(solicitante);
        nuevoChat.setActivo(true);
        nuevoChat.setFechaCreacion(LocalDateTime.now());
        nuevoChat.setFechaActualizacion(LocalDateTime.now());

        return repositorioChatUsuario.save(nuevoChat);
    }

    @Transactional
    public MensajeChat enviarMensaje(Long idChat, Long idUsuarioRemitente, String contenido) {
        log.info("Enviando mensaje en chat {} desde usuario {}", idChat, idUsuarioRemitente);
        
        ChatUsuario chat = repositorioChatUsuario.findById(idChat)
                .orElseThrow(() -> new RuntimeException("Chat no encontrado"));
        
        Usuario usuarioRemitente = repositorioUsuario.findById(idUsuarioRemitente)
                .orElseThrow(() -> new RuntimeException("Usuario remitente no encontrado"));

        MensajeChat mensaje = new MensajeChat();
        mensaje.setChat(chat);
        mensaje.setUsuarioRemitente(usuarioRemitente);
        mensaje.setContenido(contenido);
        mensaje.setFechaCreacion(LocalDateTime.now());
        mensaje.setLeido(false);

        chat.setFechaActualizacion(LocalDateTime.now());
        repositorioChatUsuario.save(chat);

        return repositorioMensajeChat.save(mensaje);
    }

    @Transactional(readOnly = true)
    public Page<DTOMensajeChat> obtenerMensajesPorChat(Long idChat, Pageable pageable) {
        log.info("Obteniendo mensajes del chat {}", idChat);
        
        return repositorioMensajeChat.encontrarMensajesPorChat(idChat, pageable)
                .map(this::convertirMensajeADTO);
    }

    @Transactional
    public void marcarMensajesComoLeidos(Long idChat) {
        log.info("Marcando mensajes como leídos en chat {}", idChat);
        
        List<MensajeChat> mensajesNoLeidos = repositorioMensajeChat
                .encontrarMensajesNoLeidosPorChat(idChat);
        
        mensajesNoLeidos.forEach(m -> {
            m.setLeido(true);
            m.setFechaLectura(LocalDateTime.now());
        });
        
        repositorioMensajeChat.saveAll(mensajesNoLeidos);
    }

    @Transactional
    public ChatUsuario cerrarChat(Long idChat) {
        log.info("Cerrando chat {}", idChat);
        
        ChatUsuario chat = repositorioChatUsuario.findById(idChat)
                .orElseThrow(() -> new RuntimeException("Chat no encontrado"));
        
        chat.setActivo(false);
        chat.setFechaCierre(LocalDateTime.now());
        
        return repositorioChatUsuario.save(chat);
    }

    @Transactional(readOnly = true)
    public List<DTOChatUsuario> obtenerChatsActivosPorUsuario(Long idUsuario) {
        log.info("Obteniendo chats activos para usuario {}", idUsuario);
        
        return repositorioChatUsuario.encontrarChatsActivosPorUsuario(idUsuario)
                .stream()
                .map(this::convertirChatADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DTOChatUsuario> obtenerChatsPorTecnico(Long idTecnico) {
        log.info("Obteniendo chats para técnico {}", idTecnico);
        
        return repositorioChatUsuario.encontrarChatsPorTecnico(idTecnico)
                .stream()
                .map(this::convertirChatADTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public SolicitudChatTecnico crearSolicitudChat(Long idUsuario, String descripcion) {
        log.info("Creando solicitud de chat para usuario {}", idUsuario);
        
        Usuario usuario = repositorioUsuario.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        SolicitudChatTecnico solicitud = new SolicitudChatTecnico();
        solicitud.setUsuario(usuario);
        solicitud.setDescripcion(descripcion);
        solicitud.setEstado(SolicitudChatTecnico.EstadoSolicitud.PENDIENTE);
        solicitud.setFechaCreacion(LocalDateTime.now());
        solicitud.setFechaActualizacion(LocalDateTime.now());

        return repositorioSolicitudChatTecnico.save(solicitud);
    }

    @Transactional
    public SolicitudChatTecnico asignarSolicitud(Long idSolicitud, Long idTecnico) {
        log.info("Asignando solicitud {} a técnico {}", idSolicitud, idTecnico);
        
        SolicitudChatTecnico solicitud = repositorioSolicitudChatTecnico.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        
        Usuario tecnico = repositorioUsuario.findById(idTecnico)
                .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));

        solicitud.setTecnicoAsignado(tecnico);
        solicitud.setEstado(SolicitudChatTecnico.EstadoSolicitud.ASIGNADA);
        solicitud.setFechaAsignacion(LocalDateTime.now());
        solicitud.setFechaActualizacion(LocalDateTime.now());

        return repositorioSolicitudChatTecnico.save(solicitud);
    }

    @Transactional
    public SolicitudChatTecnico cambiarEstadoSolicitud(Long idSolicitud, 
                                                       SolicitudChatTecnico.EstadoSolicitud nuevoEstado) {
        log.info("Cambiando estado de solicitud {} a {}", idSolicitud, nuevoEstado);
        
        SolicitudChatTecnico solicitud = repositorioSolicitudChatTecnico.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        
        solicitud.setEstado(nuevoEstado);
        solicitud.setFechaActualizacion(LocalDateTime.now());

        return repositorioSolicitudChatTecnico.save(solicitud);
    }

    @Transactional(readOnly = true)
    public Page<DTOSolicitudChatTecnico> obtenerSolicitudesPendientes(Pageable pageable) {
        log.info("Obteniendo solicitudes pendientes");
        
        return repositorioSolicitudChatTecnico.encontrarSolicitudesPendientes(pageable)
                .map(this::convertirSolicitudADTO);
    }

    @Transactional(readOnly = true)
    public long contarMensajesNoLeidos(Long idChat) {
        return repositorioMensajeChat.contarMensajesNoLeidos(idChat);
    }

    private DTOChatUsuario convertirChatADTO(ChatUsuario chat) {
        long mensajesNoLeidos = contarMensajesNoLeidos(chat.getId());
        
        return DTOChatUsuario.builder()
                .id(chat.getId())
                .idUsuarioTecnico(chat.getUsuarioTecnico().getId())
                .nombreTecnico(chat.getUsuarioTecnico().getNombre())
                .idUsuarioSolicitante(chat.getUsuarioSolicitante().getId())
                .nombreSolicitante(chat.getUsuarioSolicitante().getNombre())
                .activo(chat.getActivo())
                .fechaCreacion(chat.getFechaCreacion())
                .fechaActualizacion(chat.getFechaActualizacion())
                .fechaCierre(chat.getFechaCierre())
                .mensajesNoLeidos(mensajesNoLeidos)
                .build();
    }

    private DTOMensajeChat convertirMensajeADTO(MensajeChat mensaje) {
        return DTOMensajeChat.builder()
                .id(mensaje.getId())
                .idChat(mensaje.getChat().getId())
                .idUsuarioRemitente(mensaje.getUsuarioRemitente().getId())
                .nombreUsuarioRemitente(mensaje.getUsuarioRemitente().getNombre())
                .contenido(mensaje.getContenido())
                .fechaCreacion(mensaje.getFechaCreacion())
                .leido(mensaje.getLeido())
                .fechaLectura(mensaje.getFechaLectura())
                .build();
    }

    private DTOSolicitudChatTecnico convertirSolicitudADTO(SolicitudChatTecnico solicitud) {
        return DTOSolicitudChatTecnico.builder()
                .id(solicitud.getId())
                .idUsuario(solicitud.getUsuario().getId())
                .nombreUsuario(solicitud.getUsuario().getNombre())
                .descripcion(solicitud.getDescripcion())
                .estado(solicitud.getEstado().name())
                .fechaCreacion(solicitud.getFechaCreacion())
                .fechaAsignacion(solicitud.getFechaAsignacion())
                .idTecnicoAsignado(solicitud.getTecnicoAsignado() != null ? solicitud.getTecnicoAsignado().getId() : null)
                .nombreTecnicoAsignado(solicitud.getTecnicoAsignado() != null ? solicitud.getTecnicoAsignado().getNombre() : null)
                .fechaActualizacion(solicitud.getFechaActualizacion())
                .build();
    }
}

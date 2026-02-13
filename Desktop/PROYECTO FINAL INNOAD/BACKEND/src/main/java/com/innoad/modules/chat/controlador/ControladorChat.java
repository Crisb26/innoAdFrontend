package com.innoad.modules.chat.controlador;

import com.innoad.modules.chat.dominio.SolicitudChatTecnico;
import com.innoad.modules.chat.dto.DTOChatUsuario;
import com.innoad.modules.chat.dto.DTOMensajeChat;
import com.innoad.modules.chat.dto.DTORespuestaChat;
import com.innoad.modules.chat.dto.DTOSolicitudChatTecnico;
import com.innoad.modules.chat.servicio.ServicioChat;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ControladorChat {

    private final ServicioChat servicioChat;

    @PostMapping("/crear")
    @PreAuthorize("hasAnyRole('ROLE_TECNICO', 'ROLE_DEVELOPER', 'ROLE_ADMIN')")
    public ResponseEntity<DTORespuestaChat> crearObtenerChat(
            @RequestParam Long idTecnico,
            @RequestParam Long idSolicitante) {
        try {
            log.info("Creando/obteniendo chat entre técnico {} y solicitante {}", idTecnico, idSolicitante);
            var chat = servicioChat.obtenerOCrearChat(idTecnico, idSolicitante);
            
            DTOChatUsuario dtoChat = DTOChatUsuario.builder()
                    .id(chat.getId())
                    .idUsuarioTecnico(chat.getUsuarioTecnico().getId())
                    .nombreTecnico(chat.getUsuarioTecnico().getNombre())
                    .idUsuarioSolicitante(chat.getUsuarioSolicitante().getId())
                    .nombreSolicitante(chat.getUsuarioSolicitante().getNombre())
                    .activo(chat.getActivo())
                    .build();

            return ResponseEntity.ok(DTORespuestaChat.exitoso(dtoChat, "Chat creado/obtenido exitosamente"));
        } catch (Exception e) {
            log.error("Error al crear/obtener chat: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DTORespuestaChat.error("Error al crear/obtener chat", "500"));
        }
    }

    @PostMapping("/{idChat}/mensaje")
    @PreAuthorize("hasAnyRole('ROLE_USUARIO', 'ROLE_TECNICO', 'ROLE_DEVELOPER', 'ROLE_ADMIN')")
    public ResponseEntity<DTORespuestaChat> enviarMensaje(
            @PathVariable Long idChat,
            @RequestParam Long idUsuario,
            @RequestBody String contenido) {
        try {
            log.info("Enviando mensaje en chat {}", idChat);
            var mensaje = servicioChat.enviarMensaje(idChat, idUsuario, contenido);
            
            DTOMensajeChat dtoMensaje = DTOMensajeChat.builder()
                    .id(mensaje.getId())
                    .idChat(mensaje.getChat().getId())
                    .idUsuarioRemitente(mensaje.getUsuarioRemitente().getId())
                    .nombreUsuarioRemitente(mensaje.getUsuarioRemitente().getNombre())
                    .contenido(mensaje.getContenido())
                    .fechaCreacion(mensaje.getFechaCreacion())
                    .leido(mensaje.getLeido())
                    .build();

            return ResponseEntity.ok(DTORespuestaChat.exitoso(dtoMensaje, "Mensaje enviado exitosamente"));
        } catch (Exception e) {
            log.error("Error al enviar mensaje: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DTORespuestaChat.error("Error al enviar mensaje", "500"));
        }
    }

    @GetMapping("/{idChat}/mensajes")
    @PreAuthorize("hasAnyRole('ROLE_USUARIO', 'ROLE_TECNICO', 'ROLE_DEVELOPER', 'ROLE_ADMIN')")
    public ResponseEntity<DTORespuestaChat> obtenerMensajes(
            @PathVariable Long idChat,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanio) {
        try {
            log.info("Obteniendo mensajes del chat {}", idChat);
            Pageable pageable = PageRequest.of(pagina, tamanio);
            Page<DTOMensajeChat> mensajes = servicioChat.obtenerMensajesPorChat(idChat, pageable);
            
            return ResponseEntity.ok(DTORespuestaChat.exitoso(mensajes, "Mensajes obtenidos exitosamente"));
        } catch (Exception e) {
            log.error("Error al obtener mensajes: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DTORespuestaChat.error("Error al obtener mensajes", "500"));
        }
    }

    @PutMapping("/{idChat}/marcar-leidos")
    @PreAuthorize("hasAnyRole('ROLE_USUARIO', 'ROLE_TECNICO', 'ROLE_DEVELOPER', 'ROLE_ADMIN')")
    public ResponseEntity<DTORespuestaChat> marcarComoLeidos(@PathVariable Long idChat) {
        try {
            log.info("Marcando mensajes como leídos en chat {}", idChat);
            servicioChat.marcarMensajesComoLeidos(idChat);
            
            return ResponseEntity.ok(DTORespuestaChat.exitoso(null, "Mensajes marcados como leídos"));
        } catch (Exception e) {
            log.error("Error al marcar mensajes como leídos: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DTORespuestaChat.error("Error al marcar mensajes", "500"));
        }
    }

    @PutMapping("/{idChat}/cerrar")
    @PreAuthorize("hasAnyRole('ROLE_TECNICO', 'ROLE_DEVELOPER', 'ROLE_ADMIN')")
    public ResponseEntity<DTORespuestaChat> cerrarChat(@PathVariable Long idChat) {
        try {
            log.info("Cerrando chat {}", idChat);
            var chatCerrado = servicioChat.cerrarChat(idChat);
            
            return ResponseEntity.ok(DTORespuestaChat.exitoso(chatCerrado.getId(), "Chat cerrado exitosamente"));
        } catch (Exception e) {
            log.error("Error al cerrar chat: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DTORespuestaChat.error("Error al cerrar chat", "500"));
        }
    }

    @GetMapping("/usuario/{idUsuario}")
    @PreAuthorize("hasAnyRole('ROLE_USUARIO', 'ROLE_TECNICO', 'ROLE_DEVELOPER', 'ROLE_ADMIN')")
    public ResponseEntity<DTORespuestaChat> obtenerChatsUsuario(@PathVariable Long idUsuario) {
        try {
            log.info("Obteniendo chats del usuario {}", idUsuario);
            List<DTOChatUsuario> chats = servicioChat.obtenerChatsActivosPorUsuario(idUsuario);
            
            return ResponseEntity.ok(DTORespuestaChat.exitoso(chats, "Chats obtenidos exitosamente"));
        } catch (Exception e) {
            log.error("Error al obtener chats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DTORespuestaChat.error("Error al obtener chats", "500"));
        }
    }

    @GetMapping("/tecnico/{idTecnico}")
    @PreAuthorize("hasAnyRole('ROLE_TECNICO', 'ROLE_DEVELOPER', 'ROLE_ADMIN')")
    public ResponseEntity<DTORespuestaChat> obtenerChatsTecnico(@PathVariable Long idTecnico) {
        try {
            log.info("Obteniendo chats del técnico {}", idTecnico);
            List<DTOChatUsuario> chats = servicioChat.obtenerChatsPorTecnico(idTecnico);
            
            return ResponseEntity.ok(DTORespuestaChat.exitoso(chats, "Chats obtenidos exitosamente"));
        } catch (Exception e) {
            log.error("Error al obtener chats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DTORespuestaChat.error("Error al obtener chats", "500"));
        }
    }

    // Endpoints para Solicitudes de Chat Técnico

    @PostMapping("/solicitud")
    @PreAuthorize("hasAnyRole('ROLE_USUARIO')")
    public ResponseEntity<DTORespuestaChat> crearSolicitud(
            @RequestParam Long idUsuario,
            @RequestBody String descripcion) {
        try {
            log.info("Creando solicitud de chat para usuario {}", idUsuario);
            var solicitud = servicioChat.crearSolicitudChat(idUsuario, descripcion);
            
            DTOSolicitudChatTecnico dtoSolicitud = DTOSolicitudChatTecnico.builder()
                    .id(solicitud.getId())
                    .idUsuario(solicitud.getUsuario().getId())
                    .nombreUsuario(solicitud.getUsuario().getNombre())
                    .descripcion(solicitud.getDescripcion())
                    .estado(solicitud.getEstado().name())
                    .fechaCreacion(solicitud.getFechaCreacion())
                    .build();

            return ResponseEntity.ok(DTORespuestaChat.exitoso(dtoSolicitud, "Solicitud creada exitosamente"));
        } catch (Exception e) {
            log.error("Error al crear solicitud: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DTORespuestaChat.error("Error al crear solicitud", "500"));
        }
    }

    @PutMapping("/solicitud/{idSolicitud}/asignar")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<DTORespuestaChat> asignarSolicitud(
            @PathVariable Long idSolicitud,
            @RequestParam Long idTecnico) {
        try {
            log.info("Asignando solicitud {} a técnico {}", idSolicitud, idTecnico);
            var solicitud = servicioChat.asignarSolicitud(idSolicitud, idTecnico);
            
            return ResponseEntity.ok(DTORespuestaChat.exitoso(solicitud.getId(), "Solicitud asignada exitosamente"));
        } catch (Exception e) {
            log.error("Error al asignar solicitud: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DTORespuestaChat.error("Error al asignar solicitud", "500"));
        }
    }

    @PutMapping("/solicitud/{idSolicitud}/estado")
    @PreAuthorize("hasAnyRole('ROLE_TECNICO', 'ROLE_ADMIN')")
    public ResponseEntity<DTORespuestaChat> cambiarEstadoSolicitud(
            @PathVariable Long idSolicitud,
            @RequestParam String nuevoEstado) {
        try {
            log.info("Cambiando estado de solicitud {} a {}", idSolicitud, nuevoEstado);
            var solicitud = servicioChat.cambiarEstadoSolicitud(idSolicitud, 
                    SolicitudChatTecnico.EstadoSolicitud.valueOf(nuevoEstado));
            
            return ResponseEntity.ok(DTORespuestaChat.exitoso(solicitud.getId(), "Estado actualizado exitosamente"));
        } catch (Exception e) {
            log.error("Error al cambiar estado: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DTORespuestaChat.error("Error al cambiar estado", "500"));
        }
    }

    @GetMapping("/solicitudes/pendientes")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<DTORespuestaChat> obtenerSolicitudesPendientes(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanio) {
        try {
            log.info("Obteniendo solicitudes pendientes");
            Pageable pageable = PageRequest.of(pagina, tamanio);
            Page<DTOSolicitudChatTecnico> solicitudes = servicioChat.obtenerSolicitudesPendientes(pageable);
            
            return ResponseEntity.ok(DTORespuestaChat.exitoso(solicitudes, "Solicitudes obtenidas exitosamente"));
        } catch (Exception e) {
            log.error("Error al obtener solicitudes: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DTORespuestaChat.error("Error al obtener solicitudes", "500"));
        }
    }
}

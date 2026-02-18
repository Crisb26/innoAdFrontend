package com.innoad.modules.chat.controller;

import com.innoad.modules.chat.domain.MensajeChat;
import com.innoad.modules.chat.service.ServicioChat;
import com.innoad.modules.chat.service.ServicioPresencia;
import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.auth.repository.RepositorioUsuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

/**
 * Controlador WebSocket para chat en tiempo real
 * Maneja conexiones STOMP y envío de mensajes en tiempo real
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class ControladorWebSocketChat {

    private final ServicioChat servicioChat;
    private final ServicioPresencia servicioPresencia;
    private final RepositorioUsuario repositorioUsuario;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Enviar mensaje a través de WebSocket
     */
    @MessageMapping("/chat/{chatId}/mensaje")
    @SendTo("/topic/chat/{chatId}")
    public Map<String, Object> enviarMensajeWS(
            @DestinationVariable Long chatId,
            Map<String, String> payload,
            Principal principal) {

        try {
            Usuario emisor = obtenerUsuarioDePrincipal(principal);
            String contenido = payload.get("contenido");
            String tipoStr = payload.getOrDefault("tipo", "TEXTO");
            String archivoUrl = payload.get("archivoUrl");

            MensajeChat.TipoMensaje tipo = MensajeChat.TipoMensaje.valueOf(tipoStr);

            MensajeChat mensaje = servicioChat.enviarMensaje(
                    chatId, emisor, contenido, tipo, archivoUrl
            );

            // Preparar respuesta
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("id", mensaje.getId());
            respuesta.put("chatId", chatId);
            respuesta.put("contenido", mensaje.getContenido());
            respuesta.put("emisor", emisor.getNombreUsuario());
            respuesta.put("tipo", mensaje.getTipo());
            respuesta.put("fechaEnvio", mensaje.getFechaEnvio());
            respuesta.put("exito", true);

            // Notificar a todos los usuarios del chat
            messagingTemplate.convertAndSend("/topic/chat/" + chatId, respuesta);

            log.debug("Mensaje enviado en chat {}", chatId);

            return respuesta;

        } catch (Exception e) {
            log.error("Error enviando mensaje: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("exito", false);
            error.put("error", e.getMessage());
            return error;
        }
    }

    /**
     * Notificar que un usuario está escribiendo
     */
    @MessageMapping("/chat/{chatId}/escribiendo")
    @SendTo("/topic/chat/{chatId}/escribiendo")
    public Map<String, Object> notificarEscribiendo(
            @DestinationVariable Long chatId,
            Principal principal) {

        Usuario usuario = obtenerUsuarioDePrincipal(principal);

        Map<String, Object> notificacion = new HashMap<>();
        notificacion.put("chatId", chatId);
        notificacion.put("usuario", usuario.getNombreUsuario());
        notificacion.put("escribiendo", true);

        log.debug("Usuario {} está escribiendo en chat {}", usuario.getNombreUsuario(), chatId);

        return notificacion;
    }

    /**
     * Notificar actividad del usuario (para presencia online)
     */
    @MessageMapping("/presencia/actividad")
    public void registrarActividad(Principal principal) {
        Usuario usuario = obtenerUsuarioDePrincipal(principal);
        servicioPresencia.registrarActividad(usuario.getId());

        // Notificar cambio de presencia a otros usuarios
        Map<String, Object> notificacion = new HashMap<>();
        notificacion.put("usuarioId", usuario.getId());
        notificacion.put("usuario", usuario.getNombreUsuario());
        notificacion.put("estado", "ONLINE");

        messagingTemplate.convertAndSend("/topic/presencia", notificacion);

        log.debug("Actividad registrada: Usuario {}", usuario.getNombreUsuario());
    }

    /**
     * Conectar usuario (al establecer WebSocket)
     */
    @MessageMapping("/presencia/conectar")
    public void conectar(Principal principal) {
        Usuario usuario = obtenerUsuarioDePrincipal(principal);
        servicioPresencia.conectar(usuario);

        Map<String, Object> notificacion = new HashMap<>();
        notificacion.put("usuarioId", usuario.getId());
        notificacion.put("usuario", usuario.getNombreUsuario());
        notificacion.put("evento", "conectado");

        messagingTemplate.convertAndSend("/topic/presencia", notificacion);

        log.info("Usuario {} conectado a WebSocket", usuario.getNombreUsuario());
    }

    /**
     * Desconectar usuario
     */
    @MessageMapping("/presencia/desconectar")
    public void desconectar(Principal principal) {
        Usuario usuario = obtenerUsuarioDePrincipal(principal);
        servicioPresencia.desconectar(usuario);

        Map<String, Object> notificacion = new HashMap<>();
        notificacion.put("usuarioId", usuario.getId());
        notificacion.put("usuario", usuario.getNombreUsuario());
        notificacion.put("evento", "desconectado");

        messagingTemplate.convertAndSend("/topic/presencia", notificacion);

        log.info("Usuario {} desconectado", usuario.getNombreUsuario());
    }

    // Métodos privados

    /**
     * Obtener usuario del principal de Spring Security
     */
    private Usuario obtenerUsuarioDePrincipal(Principal principal) {
        if (principal == null) {
            throw new IllegalArgumentException("Usuario no autenticado");
        }

        // El principal contiene el nombre de usuario o el JWT
        String nombreUsuario = principal.getName();

        return repositorioUsuario.findByNombreUsuario(nombreUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + nombreUsuario));
    }
}

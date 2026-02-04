package com.innoad.modules.chat.controlador;

import com.innoad.modules.chat.dominio.MensajeWebSocketChat;
import com.innoad.modules.chat.servicio.ServicioChat;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpAttributesContextHolder;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

/**
 * Controlador WebSocket para chat en tiempo real
 * Maneja mensajes STOMP sobre WebSocket
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class ControladorWebSocketChat {
    
    private final ServicioChat servicioChat;
    private final SimpMessagingTemplate plantillaMensajeria;
    
    /**
     * Recibe mensaje de chat y lo retransmite a todos los usuarios conectados
     * 
     * Cliente envía a: /aplicacion/chat/{idChat}/mensaje
     * Servidor retransmite a: /tema/chat/{idChat}
     */
    @MessageMapping("/chat/{idChat}/mensaje")
    public void recibirMensajeChat(
            @DestinationVariable Long idChat,
            @Payload MensajeWebSocketChat mensaje) {
        
        try {
            log.debug("WebSocket - Mensaje recibido en chat {}: {}", idChat, mensaje.getContenido());
            
            // Validar que el mensaje sea válido
            if (mensaje.getContenido() == null || mensaje.getContenido().isBlank()) {
                enviarError(idChat, "El contenido del mensaje no puede estar vacío");
                return;
            }
            
            // Establecer datos del mensaje
            mensaje.setIdChat(idChat);
            mensaje.setTimestamp(System.currentTimeMillis());
            mensaje.setTipo("MENSAJE");
            
            // Persistir en BD
            Long idMensaje = servicioChat.enviarMensaje(
                idChat,
                mensaje.getIdUsuario(),
                mensaje.getContenido()
            ).getId();
            
            mensaje.setIdMensajeChat(idMensaje);
            mensaje.setEstado("ENVIADO");
            
            // Retransmitir a todos los usuarios en el chat
            plantillaMensajeria.convertAndSend(
                "/tema/chat/" + idChat,
                mensaje
            );
            
            log.info("WebSocket - Mensaje persistido y retransmitido: {}", idMensaje);
            
        } catch (Exception e) {
            log.error("Error en WebSocket chat: {}", e.getMessage(), e);
            enviarError(idChat, "Error al procesar el mensaje: " + e.getMessage());
        }
    }
    
    /**
     * Notifica cuando un usuario está escribiendo
     * 
     * Cliente envía a: /aplicacion/chat/{idChat}/escribiendo
     */
    @MessageMapping("/chat/{idChat}/escribiendo")
    public void notificarEscribiendo(
            @DestinationVariable Long idChat,
            @Payload MensajeWebSocketChat notificacion) {
        
        try {
            notificacion.setIdChat(idChat);
            notificacion.setTipo("ESCRIBIENDO");
            notificacion.setTimestamp(System.currentTimeMillis());
            
            // Retransmitir indicador de escritura
            plantillaMensajeria.convertAndSend(
                "/tema/presencia/" + idChat,
                notificacion
            );
            
        } catch (Exception e) {
            log.error("Error notificando escritura: {}", e.getMessage());
        }
    }
    
    /**
     * Notifica que un usuario dejó de escribir
     */
    @MessageMapping("/chat/{idChat}/dejo-de-escribir")
    public void notificarParoEscritura(@DestinationVariable Long idChat, 
                                       @Payload MensajeWebSocketChat notificacion) {
        
        try {
            notificacion.setIdChat(idChat);
            notificacion.setTipo("PARAR_ESCRIBIR");
            
            plantillaMensajeria.convertAndSend(
                "/tema/presencia/" + idChat,
                notificacion
            );
            
        } catch (Exception e) {
            log.error("Error notificando fin de escritura: {}", e.getMessage());
        }
    }
    
    /**
     * Marca mensajes del chat como leídos
     */
    @MessageMapping("/chat/{idChat}/marcar-leido")
    public void marcarChatComoLeido(@DestinationVariable Long idChat,
                                     @Payload MensajeWebSocketChat notificacion) {
        
        try {
            servicioChat.marcarMensajesComoLeidos(idChat);
            
            notificacion.setIdChat(idChat);
            notificacion.setTipo("MARCADO_LEIDO");
            notificacion.setTimestamp(System.currentTimeMillis());
            
            plantillaMensajeria.convertAndSend(
                "/tema/chat/" + idChat,
                notificacion
            );
            
            log.debug("Chat {} marcado como leído", idChat);
            
        } catch (Exception e) {
            log.error("Error marcando chat como leído: {}", e.getMessage());
            enviarError(idChat, "Error al marcar como leído");
        }
    }
    
    /**
     * Cierra un chat
     */
    @MessageMapping("/chat/{idChat}/cerrar")
    public void cerrarChat(@DestinationVariable Long idChat,
                           @Payload MensajeWebSocketChat notificacion) {
        
        try {
            servicioChat.cerrarChat(idChat);
            
            notificacion.setIdChat(idChat);
            notificacion.setTipo("CHAT_CERRADO");
            notificacion.setTimestamp(System.currentTimeMillis());
            
            plantillaMensajeria.convertAndSend(
                "/tema/chat/" + idChat,
                notificacion
            );
            
            log.info("Chat {} cerrado desde WebSocket", idChat);
            
        } catch (Exception e) {
            log.error("Error cerrando chat: {}", e.getMessage());
            enviarError(idChat, "Error al cerrar el chat");
        }
    }
    
    /**
     * Envía un mensaje de error a un chat específico
     */
    private void enviarError(Long idChat, String mensajeError) {
        MensajeWebSocketChat error = MensajeWebSocketChat.builder()
            .idChat(idChat)
            .tipo("ERROR")
            .mensajeError(mensajeError)
            .timestamp(System.currentTimeMillis())
            .estado("ERROR")
            .build();
        
        plantillaMensajeria.convertAndSend("/tema/chat/" + idChat, error);
    }
}

package com.innoad.modules.chat.dominio;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Mensaje WebSocket para chat en tiempo real
 * Se envía entre cliente y servidor sin persistir en BD
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MensajeWebSocketChat {
    
    /**
     * Tipo de mensaje (MENSAJE, ESCRIBIENDO, USUARIO_CONECTADO, USUARIO_DESCONECTADO, etc)
     */
    private String tipo;
    
    /**
     * ID del chat al cual pertenece
     */
    private Long idChat;
    
    /**
     * ID del usuario que envía el mensaje
     */
    private Long idUsuario;
    
    /**
     * Nombre del usuario (para mostrar en tiempo real)
     */
    private String nombreUsuario;
    
    /**
     * Contenido del mensaje
     */
    private String contenido;
    
    /**
     * Timestamp del mensaje en el cliente
     */
    private Long timestamp;
    
    /**
     * ID del mensaje (una vez persistido en BD)
     */
    private Long idMensajeChat;
    
    /**
     * Indicador de estado (enviado, recibido, error)
     */
    private String estado;
    
    /**
     * Mensaje de error si aplica
     */
    private String mensajeError;
    
    /**
     * Número de usuarios conectados en el chat
     */
    private Integer usuariosConectados;
    
    /**
     * Token del usuario para validación
     */
    private String token;
    
    /**
     * Información adicional en formato JSON
     */
    private Object metadata;
}

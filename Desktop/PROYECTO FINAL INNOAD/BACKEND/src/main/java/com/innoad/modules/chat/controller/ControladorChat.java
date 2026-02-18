package com.innoad.modules.chat.controller;

import com.innoad.modules.chat.domain.Chat;
import com.innoad.modules.chat.domain.MensajeChat;
import com.innoad.modules.chat.service.ServicioChat;
import com.innoad.modules.auth.domain.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controlador REST para gestionar chats
 */
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Slf4j
public class ControladorChat {

    private final ServicioChat servicioChat;

    /**
     * Iniciar nuevo chat con técnico
     */
    @PostMapping("/iniciar")
    public ResponseEntity<Map<String, Object>> iniciarChat(
            @AuthenticationPrincipal Usuario usuario) {

        Chat chat = servicioChat.iniciarChatConTecnico(usuario);

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("chatId", chat.getId());
        respuesta.put("estado", chat.getEstado());
        respuesta.put("tecnico", chat.getTecnico() != null ? chat.getTecnico().getNombreUsuario() : "No asignado");
        respuesta.put("mensaje", "Chat iniciado exitosamente");

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    /**
     * Obtener todos los chats del usuario
     */
    @GetMapping("/mis-chats")
    public ResponseEntity<List<Map<String, Object>>> obtenerMisChats(
            @AuthenticationPrincipal Usuario usuario) {

        List<Chat> chats = servicioChat.obtenerChatsDeUsuario(usuario);

        List<Map<String, Object>> respuesta = chats.stream()
                .map(chat -> {
                    Map<String, Object> chatMap = new HashMap<>();
                    chatMap.put("id", chat.getId());
                    chatMap.put("estado", chat.getEstado());
                    chatMap.put("tipo", chat.getTipo());
                    chatMap.put("fechaCreacion", chat.getFechaCreacion());
                    chatMap.put("mensajesPendientes", servicioChat.obtenerMensajes(chat.getId()).size());
                    return chatMap;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(respuesta);
    }

    /**
     * Obtener mensajes de un chat
     */
    @GetMapping("/{chatId}/mensajes")
    public ResponseEntity<List<Map<String, Object>>> obtenerMensajes(
            @PathVariable Long chatId) {

        List<MensajeChat> mensajes = servicioChat.obtenerMensajes(chatId);

        List<Map<String, Object>> respuesta = mensajes.stream()
                .map(m -> {
                    Map<String, Object> msgMap = new HashMap<>();
                    msgMap.put("id", m.getId());
                    msgMap.put("emisor", m.getEmisor().getNombreUsuario());
                    msgMap.put("contenido", m.getContenido());
                    msgMap.put("tipo", m.getTipo());
                    msgMap.put("fechaEnvio", m.getFechaEnvio());
                    msgMap.put("leido", m.getLeido());
                    return msgMap;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(respuesta);
    }

    /**
     * Enviar mensaje en el chat
     */
    @PostMapping("/{chatId}/mensaje")
    public ResponseEntity<Map<String, Object>> enviarMensaje(
            @PathVariable Long chatId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal Usuario usuario) {

        try {
            String contenido = request.get("contenido");
            String tipoStr = request.getOrDefault("tipo", "TEXTO");
            String archivoUrl = request.get("archivoUrl");

            MensajeChat.TipoMensaje tipo = MensajeChat.TipoMensaje.valueOf(tipoStr);

            MensajeChat mensaje = servicioChat.enviarMensaje(
                    chatId, usuario, contenido, tipo, archivoUrl
            );

            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("id", mensaje.getId());
            respuesta.put("contenido", mensaje.getContenido());
            respuesta.put("emisor", mensaje.getEmisor().getNombreUsuario());
            respuesta.put("fechaEnvio", mensaje.getFechaEnvio());

            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Transferir chat a administrador
     */
    @PostMapping("/{chatId}/transferir")
    public ResponseEntity<Map<String, Object>> transferirAAdmin(
            @PathVariable Long chatId,
            @AuthenticationPrincipal Usuario tecnico) {

        try {
            Chat chatTransferido = servicioChat.transferirChatAAdmin(chatId, tecnico);

            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("chatId", chatTransferido.getId());
            respuesta.put("estado", chatTransferido.getEstado());
            respuesta.put("admin", chatTransferido.getAdmin().getNombreUsuario());
            respuesta.put("mensaje", "Chat transferido a administrador");

            return ResponseEntity.ok(respuesta);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Marcar mensajes como leídos
     */
    @PutMapping("/{chatId}/marcar-leidos")
    public ResponseEntity<Void> marcarComoLeidos(
            @PathVariable Long chatId,
            @AuthenticationPrincipal Usuario usuario) {

        servicioChat.marcarMensajesComoLeidos(chatId, usuario);
        return ResponseEntity.ok().build();
    }

    /**
     * Cerrar chat
     */
    @PostMapping("/{chatId}/cerrar")
    public ResponseEntity<Map<String, Object>> cerrarChat(
            @PathVariable Long chatId,
            @AuthenticationPrincipal Usuario usuario) {

        try {
            Chat chatCerrado = servicioChat.cerrarChat(chatId, usuario);

            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("chatId", chatCerrado.getId());
            respuesta.put("estado", chatCerrado.getEstado());
            respuesta.put("mensaje", "Chat cerrado exitosamente");

            return ResponseEntity.ok(respuesta);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener chats pendientes (para técnico)
     */
    @GetMapping("/tecnico/pendientes")
    public ResponseEntity<List<Map<String, Object>>> obtenerChatsPendientesTecnico(
            @AuthenticationPrincipal Usuario usuario) {

        if (!usuario.esTecnico()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Chat> chats = servicioChat.obtenerChatsPendientesTecnico(usuario);

        List<Map<String, Object>> respuesta = chats.stream()
                .map(chat -> {
                    Map<String, Object> chatMap = new HashMap<>();
                    chatMap.put("id", chat.getId());
                    chatMap.put("usuario", chat.getUsuario().getNombreUsuario());
                    chatMap.put("estado", chat.getEstado());
                    chatMap.put("fechaCreacion", chat.getFechaCreacion());
                    return chatMap;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(respuesta);
    }

    /**
     * Obtener estadísticas de chats
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<java.util.Map<String, Long>> obtenerEstadisticas() {
        return ResponseEntity.ok(servicioChat.obtenerEstadisticas());
    }
}

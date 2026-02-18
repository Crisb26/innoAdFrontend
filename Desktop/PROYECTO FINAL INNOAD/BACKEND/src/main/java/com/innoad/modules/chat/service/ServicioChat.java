package com.innoad.modules.chat.service;

import com.innoad.modules.chat.domain.Chat;
import com.innoad.modules.chat.domain.MensajeChat;
import com.innoad.modules.chat.domain.PresenciaUsuario;
import com.innoad.modules.chat.repository.RepositorioChat;
import com.innoad.modules.chat.repository.RepositorioMensajeChat;
import com.innoad.modules.chat.repository.RepositorioPresenciaUsuario;
import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.auth.repository.RepositorioUsuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar chats en tiempo real
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioChat {

    private final RepositorioChat repositorioChat;
    private final RepositorioMensajeChat repositorioMensajeChat;
    private final RepositorioPresenciaUsuario repositorioPresenciaUsuario;
    private final RepositorioUsuario repositorioUsuario;

    /**
     * Iniciar un chat entre usuario y técnico disponible
     */
    @Transactional
    public Chat iniciarChatConTecnico(Usuario usuario) {
        // Verificar si ya tiene un chat activo
        return repositorioChat.findByUsuarioAndEstado(usuario, Chat.EstadoChat.ACTIVO)
                .orElseGet(() -> {
                    // Buscar técnico disponible
                    Usuario tecnico = asignarTecnicoDisponible();

                    Chat chat = Chat.builder()
                            .usuario(usuario)
                            .tecnico(tecnico)
                            .tipo(Chat.TipoChat.USUARIO_TECNICO)
                            .estado(Chat.EstadoChat.ACTIVO)
                            .build();

                    Chat chatGuardado = repositorioChat.save(chat);
                    log.info("Chat iniciado: Usuario {} con Técnico {}", usuario.getNombreUsuario(), tecnico != null ? tecnico.getNombreUsuario() : "No asignado");

                    return chatGuardado;
                });
    }

    /**
     * Transferir chat a administrador
     */
    @Transactional
    public Chat transferirChatAAdmin(Long chatId, Usuario tecnico) {
        Chat chat = repositorioChat.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat no encontrado"));

        if (!chat.getTecnico().getId().equals(tecnico.getId())) {
            throw new IllegalArgumentException("Solo el técnico asignado puede transferir este chat");
        }

        Usuario admin = asignarAdminDisponible();

        chat.setAdmin(admin);
        chat.setEstado(Chat.EstadoChat.TRANSFERIDO);
        chat.setFechaTransferencia(LocalDateTime.now());

        // Crear mensaje del sistema notificando la transferencia
        MensajeChat mensajeSistema = MensajeChat.builder()
                .chat(chat)
                .emisor(tecnico)
                .contenido("Chat transferido a administrador para escala")
                .tipo(MensajeChat.TipoMensaje.SISTEMA)
                .build();

        repositorioMensajeChat.save(mensajeSistema);
        Chat chatTransferido = repositorioChat.save(chat);

        log.info("Chat {} transferido de {} a {}", chatId, tecnico.getNombreUsuario(), admin.getNombreUsuario());

        return chatTransferido;
    }

    /**
     * Enviar mensaje en el chat
     */
    @Transactional
    public MensajeChat enviarMensaje(Long chatId, Usuario emisor, String contenido,
                                     MensajeChat.TipoMensaje tipo, String archivoUrl) {
        Chat chat = repositorioChat.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat no encontrado"));

        // Verificar que el usuario tenga acceso a este chat
        if (!chat.getUsuario().getId().equals(emisor.getId()) &&
            !chat.getTecnico().getId().equals(emisor.getId()) &&
            (chat.getAdmin() == null || !chat.getAdmin().getId().equals(emisor.getId()))) {
            throw new IllegalArgumentException("No tienes acceso a este chat");
        }

        MensajeChat mensaje = MensajeChat.builder()
                .chat(chat)
                .emisor(emisor)
                .contenido(contenido)
                .tipo(tipo)
                .archivoUrl(archivoUrl)
                .build();

        MensajeChat mensajeGuardado = repositorioMensajeChat.save(mensaje);
        log.debug("Mensaje guardado en chat {}: {}", chatId, mensajeGuardado.getId());

        return mensajeGuardado;
    }

    /**
     * Obtener todos los chats del usuario
     */
    @Transactional(readOnly = true)
    public List<Chat> obtenerChatsDeUsuario(Usuario usuario) {
        return repositorioChat.findByUsuario(usuario).stream()
                .sorted((c1, c2) -> c2.getFechaCreacion().compareTo(c1.getFechaCreacion()))
                .collect(Collectors.toList());
    }

    /**
     * Obtener chats pendientes del técnico
     */
    @Transactional(readOnly = true)
    public List<Chat> obtenerChatsPendientesTecnico(Usuario tecnico) {
        return repositorioChat.findPendientesTecnico(tecnico.getId());
    }

    /**
     * Obtener chats transferidos del admin
     */
    @Transactional(readOnly = true)
    public List<Chat> obtenerChatsTransferidosAdmin(Usuario admin) {
        return repositorioChat.findTransferidosAdmin(admin.getId());
    }

    /**
     * Obtener mensajes de un chat
     */
    @Transactional(readOnly = true)
    public List<MensajeChat> obtenerMensajes(Long chatId) {
        Chat chat = repositorioChat.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat no encontrado"));

        return repositorioMensajeChat.findByChat(chat);
    }

    /**
     * Marcar mensajes como leídos
     */
    @Transactional
    public void marcarMensajesComoLeidos(Long chatId, Usuario usuario) {
        List<MensajeChat> noLeidos = repositorioMensajeChat.findNoLeidosByChat(chatId);

        noLeidos.forEach(m -> {
            // Solo marcar como leído si es para el receptor
            if (!m.getEmisor().getId().equals(usuario.getId())) {
                m.marcarComoLeido();
                repositorioMensajeChat.save(m);
            }
        });

        log.debug("Mensajes marcados como leídos en chat {}", chatId);
    }

    /**
     * Cerrar un chat
     */
    @Transactional
    public Chat cerrarChat(Long chatId, Usuario usuario) {
        Chat chat = repositorioChat.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat no encontrado"));

        // Solo usuario o técnico/admin del chat pueden cerrar
        if (!chat.getUsuario().getId().equals(usuario.getId()) &&
            !chat.getTecnico().getId().equals(usuario.getId()) &&
            (chat.getAdmin() == null || !chat.getAdmin().getId().equals(usuario.getId()))) {
            throw new IllegalArgumentException("No tienes permiso para cerrar este chat");
        }

        chat.setEstado(Chat.EstadoChat.CERRADO);
        chat.setFechaCierre(LocalDateTime.now());

        Chat chatCerrado = repositorioChat.save(chat);
        log.info("Chat {} cerrado por {}", chatId, usuario.getNombreUsuario());

        return chatCerrado;
    }

    /**
     * Obtener un chat por ID
     */
    @Transactional(readOnly = true)
    public Chat obtenerChat(Long chatId) {
        return repositorioChat.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat no encontrado"));
    }

    /**
     * Obtener estadísticas de chats
     */
    @Transactional(readOnly = true)
    public java.util.Map<String, Long> obtenerEstadisticas() {
        return java.util.Map.ofEntries(
                java.util.Map.entry("activos", repositorioChat.countByEstado(Chat.EstadoChat.ACTIVO)),
                java.util.Map.entry("transferidos", repositorioChat.countByEstado(Chat.EstadoChat.TRANSFERIDO)),
                java.util.Map.entry("cerrados", repositorioChat.countByEstado(Chat.EstadoChat.CERRADO))
        );
    }

    // Métodos privados

    /**
     * Asignar técnico disponible (round-robin)
     */
    private Usuario asignarTecnicoDisponible() {
        List<PresenciaUsuario> tecnicosOnline = repositorioPresenciaUsuario.findTecnicosOnline();

        if (tecnicosOnline.isEmpty()) {
            // Si no hay técnicos online, buscar el primero disponible
            return repositorioUsuario.findAll().stream()
                    .filter(Usuario::esTecnico)
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("No hay técnicos disponibles"));
        }

        // Retornar el técnico con menor carga (más activo recientemente = menos carga)
        return tecnicosOnline.get(0).getUsuario();
    }

    /**
     * Asignar administrador disponible
     */
    private Usuario asignarAdminDisponible() {
        return repositorioUsuario.findAll().stream()
                .filter(Usuario::esAdministrador)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No hay administradores disponibles"));
    }
}

package com.innoad.modules.chat.repository;

import com.innoad.modules.chat.domain.MensajeChat;
import com.innoad.modules.chat.domain.Chat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para gestionar mensajes de chat
 */
@Repository
public interface RepositorioMensajeChat extends JpaRepository<MensajeChat, Long> {

    /**
     * Obtener todos los mensajes de un chat
     */
    List<MensajeChat> findByChat(Chat chat);

    /**
     * Obtener mensajes paginados de un chat
     */
    Page<MensajeChat> findByChat(Chat chat, Pageable pageable);

    /**
     * Obtener mensajes no leídos de un chat
     */
    @Query("SELECT m FROM MensajeChat m WHERE m.chat.id = :chatId AND m.leido = false ORDER BY m.fechaEnvio ASC")
    List<MensajeChat> findNoLeidosByChat(@Param("chatId") Long chatId);

    /**
     * Obtener mensajes no leídos por usuario receptor
     */
    @Query("SELECT m FROM MensajeChat m WHERE m.chat.usuario.id = :usuarioId AND m.leido = false AND m.tipo != 'SISTEMA' ORDER BY m.fechaEnvio ASC")
    List<MensajeChat> findNoLeidosPorUsuario(@Param("usuarioId") Long usuarioId);

    /**
     * Contar mensajes no leídos de un chat
     */
    @Query("SELECT COUNT(m) FROM MensajeChat m WHERE m.chat.id = :chatId AND m.leido = false")
    long countNoLeidosByChat(@Param("chatId") Long chatId);

    /**
     * Obtener último mensaje del chat
     */
    @Query("SELECT m FROM MensajeChat m WHERE m.chat.id = :chatId ORDER BY m.fechaEnvio DESC LIMIT 1")
    MensajeChat findUltimoMensaje(@Param("chatId") Long chatId);

    /**
     * Obtener mensajes de un período de tiempo
     */
    @Query("SELECT m FROM MensajeChat m WHERE m.chat.id = :chatId AND m.fechaEnvio BETWEEN :desde AND :hasta ORDER BY m.fechaEnvio ASC")
    List<MensajeChat> findByPeriodo(@Param("chatId") Long chatId, @Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);

    /**
     * Contar mensajes por tipo
     */
    long countByChatAndTipo(Chat chat, MensajeChat.TipoMensaje tipo);

    /**
     * Buscar mensajes por contenido
     */
    @Query("SELECT m FROM MensajeChat m WHERE m.chat.id = :chatId AND LOWER(m.contenido) LIKE LOWER(CONCAT('%', :termino, '%'))")
    List<MensajeChat> buscarPorContenido(@Param("chatId") Long chatId, @Param("termino") String termino);
}

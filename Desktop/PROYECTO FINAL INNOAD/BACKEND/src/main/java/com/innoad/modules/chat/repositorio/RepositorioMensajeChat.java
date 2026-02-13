package com.innoad.modules.chat.repositorio;

import com.innoad.modules.chat.dominio.MensajeChat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepositorioMensajeChat extends JpaRepository<MensajeChat, Long> {

    @Query("SELECT m FROM MensajeChat m WHERE m.chat.id = :chatId ORDER BY m.fechaCreacion ASC")
    Page<MensajeChat> encontrarMensajesPorChat(@Param("chatId") Long chatId, Pageable pageable);

    @Query("SELECT COUNT(m) FROM MensajeChat m WHERE m.chat.id = :chatId AND m.leido = false")
    long contarMensajesNoLeidos(@Param("chatId") Long chatId);

    @Query("SELECT m FROM MensajeChat m WHERE m.chat.id = :chatId AND m.leido = false ORDER BY m.fechaCreacion ASC")
    List<MensajeChat> encontrarMensajesNoLeidosPorChat(@Param("chatId") Long chatId);
}

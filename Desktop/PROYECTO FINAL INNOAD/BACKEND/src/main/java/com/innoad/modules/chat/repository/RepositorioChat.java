package com.innoad.modules.chat.repository;

import com.innoad.modules.chat.domain.Chat;
import com.innoad.modules.auth.domain.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para gestionar chats
 */
@Repository
public interface RepositorioChat extends JpaRepository<Chat, Long> {

    /**
     * Obtener todos los chats de un usuario
     */
    List<Chat> findByUsuario(Usuario usuario);

    /**
     * Obtener chats paginados del usuario
     */
    Page<Chat> findByUsuario(Usuario usuario, Pageable pageable);

    /**
     * Obtener chats de técnico
     */
    List<Chat> findByTecnico(Usuario tecnico);

    /**
     * Obtener chats de admin
     */
    List<Chat> findByAdmin(Usuario admin);

    /**
     * Obtener chat activo del usuario (si existe)
     */
    Optional<Chat> findByUsuarioAndEstado(Usuario usuario, Chat.EstadoChat estado);

    /**
     * Obtener chats por estado
     */
    List<Chat> findByEstado(Chat.EstadoChat estado);

    /**
     * Obtener chats por tipo y estado
     */
    List<Chat> findByTipoAndEstado(Chat.TipoChat tipo, Chat.EstadoChat estado);

    /**
     * Obtener chats recientes del usuario
     */
    @Query("SELECT c FROM Chat c WHERE c.usuario.id = :usuarioId ORDER BY c.fechaCreacion DESC")
    List<Chat> findRecientesDelUsuario(@Param("usuarioId") Long usuarioId, Pageable pageable);

    /**
     * Obtener chats pendientes para técnico (ACTIVOS y asignados a él)
     */
    @Query("SELECT c FROM Chat c WHERE c.tecnico.id = :tecnicoId AND c.estado = 'ACTIVO' ORDER BY c.fechaCreacion ASC")
    List<Chat> findPendientesTecnico(@Param("tecnicoId") Long tecnicoId);

    /**
     * Obtener chats transferidos pendientes para admin
     */
    @Query("SELECT c FROM Chat c WHERE c.admin.id = :adminId AND c.estado = 'TRANSFERIDO' ORDER BY c.fechaTransferencia ASC")
    List<Chat> findTransferidosAdmin(@Param("adminId") Long adminId);

    /**
     * Contar chats activos por técnico
     */
    long countByTecnicoAndEstado(Usuario tecnico, Chat.EstadoChat estado);

    /**
     * Contar chats por estado
     */
    long countByEstado(Chat.EstadoChat estado);
}

package com.innoad.modules.chat.repository;

import com.innoad.modules.chat.domain.PresenciaUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para gestionar presencia de usuarios
 */
@Repository
public interface RepositorioPresenciaUsuario extends JpaRepository<PresenciaUsuario, Long> {

    /**
     * Obtener presencia de un usuario
     */
    Optional<PresenciaUsuario> findByUsuarioId(Long usuarioId);

    /**
     * Obtener todos los usuarios online
     */
    @Query("SELECT p FROM PresenciaUsuario p WHERE p.estado = 'ONLINE'")
    List<PresenciaUsuario> findAllOnline();

    /**
     * Obtener todos los usuarios ausentes
     */
    @Query("SELECT p FROM PresenciaUsuario p WHERE p.estado = 'AUSENTE'")
    List<PresenciaUsuario> findAllAusentes();

    /**
     * Obtener todos los usuarios offline
     */
    @Query("SELECT p FROM PresenciaUsuario p WHERE p.estado = 'OFFLINE'")
    List<PresenciaUsuario> findAllOffline();

    /**
     * Contar usuarios online
     */
    @Query("SELECT COUNT(p) FROM PresenciaUsuario p WHERE p.estado = 'ONLINE'")
    long countOnline();

    /**
     * Contar usuarios ausentes
     */
    @Query("SELECT COUNT(p) FROM PresenciaUsuario p WHERE p.estado = 'AUSENTE'")
    long countAusentes();

    /**
     * Contar usuarios offline
     */
    @Query("SELECT COUNT(p) FROM PresenciaUsuario p WHERE p.estado = 'OFFLINE'")
    long countOffline();

    /**
     * Obtener técnicos online para asignación de chats
     */
    @Query("SELECT p FROM PresenciaUsuario p WHERE p.usuario.rol = 'TECNICO' AND p.estado = 'ONLINE' ORDER BY p.ultimaActividad DESC")
    List<PresenciaUsuario> findTecnicosOnline();
}

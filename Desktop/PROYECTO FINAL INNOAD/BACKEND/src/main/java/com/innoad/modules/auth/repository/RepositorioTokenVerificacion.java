package com.innoad.modules.auth.repository;

import com.innoad.modules.auth.domain.TokenVerificacion;
import com.innoad.modules.auth.domain.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repositorio para tokens de verificación de email
 */
@Repository
public interface RepositorioTokenVerificacion extends JpaRepository<TokenVerificacion, Long> {

    /**
     * Buscar token por su valor
     */
    Optional<TokenVerificacion> findByToken(String token);

    /**
     * Buscar tokens activos de un usuario
     */
    @Query("SELECT t FROM TokenVerificacion t WHERE t.usuario = :usuario AND t.verificadoEn IS NULL AND t.expiraEn > :now")
    Optional<TokenVerificacion> findByUsuarioAndVerificadoEnIsNullAndExpiraEnAfter(Usuario usuario, LocalDateTime now);

    /**
     * Eliminar tokens expirados
     */
    @Modifying
    @Query("DELETE FROM TokenVerificacion t WHERE t.expiraEn < :now")
    void deleteExpiredTokens(LocalDateTime now);

    /**
     * Eliminar todos los tokens de un usuario
     */
    void deleteByUsuario(Usuario usuario);
}

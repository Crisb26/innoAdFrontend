package com.innoad.modules.screens.repository;

import com.innoad.modules.screens.domain.Pantalla;
import com.innoad.modules.auth.domain.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la gestión de pantallas (Raspberry Pi)
 */
@Repository
public interface RepositorioPantalla extends JpaRepository<Pantalla, Long> {

    /**
     * Busca una pantalla por su código de identificación
     */
    Optional<Pantalla> findByCodigoIdentificacion(String codigoIdentificacion);

    /**
     * Busca pantallas de un usuario específico
     */
    List<Pantalla> findByUsuario(Usuario usuario);

    /**
     * Busca pantallas de un usuario por ID
     */
    List<Pantalla> findByUsuarioId(Long usuarioId);

    /**
     * Busca pantallas por estado
     */
    List<Pantalla> findByEstado(String estado);

    /**
     * Busca pantallas activas de un usuario
     */
    @Query("SELECT p FROM Pantalla p WHERE p.usuario.id = :usuarioId AND p.estado = 'ACTIVA'")
    List<Pantalla> findPantallasActivasByUsuarioId(@Param("usuarioId") Long usuarioId);

    /**
     * Busca pantallas conectadas (última conexión en los últimos 5 minutos)
     */
    @Query("SELECT p FROM Pantalla p WHERE p.ultimaConexion > :fechaLimite")
    List<Pantalla> findPantallasConectadas(@Param("fechaLimite") LocalDateTime fechaLimite);

    /**
     * Busca pantallas por nombre (búsqueda parcial)
     */
    @Query("SELECT p FROM Pantalla p WHERE LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))")
    List<Pantalla> buscarPorNombre(@Param("nombre") String nombre);

    /**
     * Busca pantallas por ubicación
     */
    List<Pantalla> findByUbicacionContainingIgnoreCase(String ubicacion);

    /**
     * Verifica si existe una pantalla con el código de identificación
     */
    boolean existsByCodigoIdentificacion(String codigoIdentificacion);

    /**
     * Cuenta pantallas activas de un usuario
     */
    @Query("SELECT COUNT(p) FROM Pantalla p WHERE p.usuario.id = :usuarioId AND p.estado = 'ACTIVA'")
    long contarPantallasActivasByUsuarioId(@Param("usuarioId") Long usuarioId);

    /**
     * Obtiene todas las pantallas ordenadas por última conexión
     */
    List<Pantalla> findAllByOrderByUltimaConexionDesc();

    /**
     * Busca pantallas que no se han conectado en un período específico
     */
    @Query("SELECT p FROM Pantalla p WHERE p.ultimaConexion IS NULL OR p.ultimaConexion < :fechaLimite")
    List<Pantalla> findPantallasDesconectadas(@Param("fechaLimite") LocalDateTime fechaLimite);

    /**
     * Cuenta pantallas activas
     */
    @Query("SELECT COUNT(p) FROM Pantalla p WHERE p.estado = 'ACTIVA'")
    Long countByActivoTrue();
}

package com.innoad.modules.content.repository;

import com.innoad.modules.content.domain.Contenido;
import com.innoad.modules.screens.domain.Pantalla;
import com.innoad.modules.auth.domain.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para la gestión de contenidos publicitarios
 */
@Repository
public interface RepositorioContenido extends JpaRepository<Contenido, Long> {

    /**
     * Busca contenidos de una pantalla específica
     */
    List<Contenido> findByPantalla(Pantalla pantalla);

    /**
     * Busca contenidos de una pantalla por ID
     */
    List<Contenido> findByPantallaId(Long pantallaId);

    /**
     * Busca contenidos de un usuario
     */
    List<Contenido> findByUsuario(Usuario usuario);

    /**
     * Busca contenidos de un usuario por ID
     */
    List<Contenido> findByUsuarioId(Long usuarioId);

    /**
     * Busca contenidos por estado
     */
    List<Contenido> findByEstado(String estado);

    /**
     * Busca contenidos activos de una pantalla, ordenados por orden y prioridad
     */
    @Query("SELECT c FROM Contenido c WHERE c.pantalla.id = :pantallaId " +
           "AND c.estado = 'ACTIVO' " +
           "AND (c.fechaInicio IS NULL OR c.fechaInicio <= :ahora) " +
           "AND (c.fechaFin IS NULL OR c.fechaFin >= :ahora) " +
           "ORDER BY c.orden ASC, c.prioridad DESC")
    List<Contenido> findContenidosActivosByPantallaId(
        @Param("pantallaId") Long pantallaId,
        @Param("ahora") LocalDateTime ahora
    );

    /**
     * Busca contenidos por tipo
     */
    List<Contenido> findByTipo(String tipo);

    /**
     * Busca contenidos por tipo y pantalla
     */
    List<Contenido> findByTipoAndPantallaId(String tipo, Long pantallaId);

    /**
     * Busca contenidos por prioridad
     */
    List<Contenido> findByPrioridad(String prioridad);

    /**
     * Busca contenidos que están en período de publicación
     */
    @Query("SELECT c FROM Contenido c WHERE c.estado = 'ACTIVO' " +
           "AND (c.fechaInicio IS NULL OR c.fechaInicio <= :ahora) " +
           "AND (c.fechaFin IS NULL OR c.fechaFin >= :ahora)")
    List<Contenido> findContenidosEnPeriodoPublicacion(@Param("ahora") LocalDateTime ahora);

    /**
     * Busca contenidos por tags (búsqueda parcial)
     */
    @Query("SELECT c FROM Contenido c WHERE LOWER(c.tags) LIKE LOWER(CONCAT('%', :tag, '%'))")
    List<Contenido> buscarPorTag(@Param("tag") String tag);

    /**
     * Busca contenidos por título (búsqueda parcial)
     */
    @Query("SELECT c FROM Contenido c WHERE LOWER(c.titulo) LIKE LOWER(CONCAT('%', :titulo, '%'))")
    List<Contenido> buscarPorTitulo(@Param("titulo") String titulo);

    /**
     * Cuenta contenidos activos de una pantalla
     */
    @Query("SELECT COUNT(c) FROM Contenido c WHERE c.pantalla.id = :pantallaId AND c.estado = 'ACTIVO'")
    long contarContenidosActivosByPantallaId(@Param("pantallaId") Long pantallaId);

    /**
     * Obtiene los contenidos más reproducidos
     */
    @Query("SELECT c FROM Contenido c ORDER BY c.vecesReproducido DESC")
    List<Contenido> findTopContenidos();

    /**
     * Busca contenidos que finalizan pronto (próximos días)
     */
    @Query("SELECT c FROM Contenido c WHERE c.estado = 'ACTIVO' " +
           "AND c.fechaFin IS NOT NULL " +
           "AND c.fechaFin BETWEEN :ahora AND :fechaLimite")
    List<Contenido> findContenidosProximosAFinalizar(
        @Param("ahora") LocalDateTime ahora,
        @Param("fechaLimite") LocalDateTime fechaLimite
    );

    /**
     * Busca contenidos finalizados (fecha fin pasada)
     */
    @Query("SELECT c FROM Contenido c WHERE c.fechaFin IS NOT NULL AND c.fechaFin < :ahora")
    List<Contenido> findContenidosFinalizados(@Param("ahora") LocalDateTime ahora);

    /**
     * Obtiene contenidos de una pantalla ordenados para reproducción
     */
    @Query("SELECT c FROM Contenido c WHERE c.pantalla.id = :pantallaId " +
           "AND c.estado = 'ACTIVO' " +
           "ORDER BY c.prioridad DESC, c.orden ASC, c.fechaCreacion ASC")
    List<Contenido> findContenidosParaReproduccion(@Param("pantallaId") Long pantallaId);

    /**
     * Cuenta contenidos activos
     */
    @Query("SELECT COUNT(c) FROM Contenido c WHERE c.estado = 'ACTIVO'")
    Long countByActivoTrue();
}

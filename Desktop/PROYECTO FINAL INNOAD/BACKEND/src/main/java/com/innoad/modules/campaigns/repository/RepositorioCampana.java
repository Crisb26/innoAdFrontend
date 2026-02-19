package com.innoad.modules.campaigns.repository;

import com.innoad.modules.campaigns.domain.Campana;
import com.innoad.modules.auth.domain.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para gestionar campañas
 */
@Repository
public interface RepositorioCampana extends JpaRepository<Campana, Long> {

    /**
     * Obtener todas las campañas de un usuario
     */
    List<Campana> findByUsuario(Usuario usuario);

    /**
     * Obtener campañas paginadas de un usuario
     */
    Page<Campana> findByUsuario(Usuario usuario, Pageable pageable);

    /**
     * Obtener campañas por estado
     */
    List<Campana> findByEstado(Campana.EstadoCampana estado);

    /**
     * Obtener campañas paginadas por estado
     */
    Page<Campana> findByEstado(Campana.EstadoCampana estado, Pageable pageable);

    /**
     * Buscar campañas por nombre
     */
    @Query("SELECT c FROM Campana c WHERE LOWER(c.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))")
    List<Campana> buscarPorNombre(@Param("nombre") String nombre);

    /**
     * Obtener campañas activas en un rango de fechas
     */
    @Query("SELECT c FROM Campana c WHERE c.estado = :estado AND c.fechaInicio <= :fecha AND c.fechaFin >= :fecha")
    List<Campana> findActivasEnFecha(@Param("estado") Campana.EstadoCampana estado, @Param("fecha") LocalDateTime fecha);

    /**
     * Obtener campañas con rango de fechas
     */
    @Query("SELECT c FROM Campana c WHERE c.fechaInicio >= :desde AND c.fechaFin <= :hasta")
    List<Campana> findByFechaRango(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);

    /**
     * Contar campañas por usuario
     */
    long countByUsuario(Usuario usuario);

    /**
     * Contar campañas por estado
     */
    long countByEstado(Campana.EstadoCampana estado);

    /**
     * Obtener campañas de un usuario filtradas por estado
     */
    List<Campana> findByUsuarioAndEstado(Usuario usuario, Campana.EstadoCampana estado);

    /**
     * Obtener campañas que contienen un contenido específico
     */
    @Query(value = "SELECT DISTINCT c.* FROM campanas c JOIN campana_contenidos cc ON c.id = cc.campana_id WHERE cc.contenido_id = :contenidoId", nativeQuery = true)
    List<Campana> findByContenidoId(@Param("contenidoId") Long contenidoId);

    /**
     * Obtener campañas que utilizan una pantalla específica
     */
    @Query(value = "SELECT DISTINCT c.* FROM campanas c JOIN campana_pantallas cp ON c.id = cp.campana_id WHERE cp.pantalla_id = :pantallaId", nativeQuery = true)
    List<Campana> findByPantallaId(@Param("pantallaId") Long pantallaId);
}

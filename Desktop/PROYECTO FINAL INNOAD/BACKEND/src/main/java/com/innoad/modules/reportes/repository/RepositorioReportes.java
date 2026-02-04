package com.innoad.modules.reportes.repository;

import com.innoad.modules.reportes.modelo.Reporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RepositorioReportes extends JpaRepository<Reporte, Long> {

    /**
     * Obtener reportes por tipo
     */
    List<Reporte> findByTipo(String tipo);

    /**
     * Obtener reportes por periodo
     */
    List<Reporte> findByPeriodo(String periodo);

    /**
     * Obtener reportes por usuario que los generó
     */
    List<Reporte> findByGeneradoPor(String usuario);

    /**
     * Obtener reportes por estado
     */
    List<Reporte> findByEstado(String estado);

    /**
     * Obtener reportes entre fechas
     */
    @Query("SELECT r FROM Reporte r WHERE r.fechaGeneracion BETWEEN :fechaInicio AND :fechaFin")
    List<Reporte> findByFechaGeneracionBetween(
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin
    );

    /**
     * Obtener reportes completados
     */
    List<Reporte> findByEstadoAndGeneradoPor(String estado, String usuario);
    
    /**
     * Obtener reportes recientes limitado
     */
    @Query(value = "SELECT * FROM reporte ORDER BY fecha_generacion DESC LIMIT :limite", nativeQuery = true)
    List<Reporte> findRecientes(@Param("limite") int limite);
}

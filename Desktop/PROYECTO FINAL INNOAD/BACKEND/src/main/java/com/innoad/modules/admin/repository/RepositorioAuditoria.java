package com.innoad.modules.admin.repository;

import com.innoad.modules.admin.domain.Auditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para la gestión de registros de auditoría en la base de datos.
 */
@Repository
public interface RepositorioAuditoria extends JpaRepository<Auditoria, Long> {

    /**
     * Encuentra registros de auditoría por usuario
     */
    List<Auditoria> findByUsuarioId(Long usuarioId);

    /**
     * Encuentra registros de auditoría por entidad
     */
    List<Auditoria> findByEntidad(String entidad);

    /**
     * Encuentra registros de auditoría por entidad e ID de entidad
     */
    List<Auditoria> findByEntidadAndEntidadId(String entidad, Long entidadId);

    /**
     * Encuentra registros de auditoría por acción
     */
    List<Auditoria> findByAccion(String accion);

    /**
     * Encuentra registros de auditoría entre fechas
     */
    @Query("SELECT a FROM Auditoria a WHERE a.fechaHora BETWEEN :inicio AND :fin ORDER BY a.fechaHora DESC")
    List<Auditoria> encontrarEntreFechas(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    /**
     * Encuentra registros de auditoría recientes paginados
     */
    Page<Auditoria> findAllByOrderByFechaHoraDesc(Pageable pageable);

    /**
     * Encuentra registros de auditoría por usuario entre fechas
     */
    @Query("SELECT a FROM Auditoria a WHERE a.usuarioId = :usuarioId AND a.fechaHora BETWEEN :inicio AND :fin ORDER BY a.fechaHora DESC")
    List<Auditoria> encontrarPorUsuarioEntreFechas(
        @Param("usuarioId") Long usuarioId,
        @Param("inicio") LocalDateTime inicio,
        @Param("fin") LocalDateTime fin
    );

    /**
     * Cuenta registros de auditoría por usuario
     */
    Long countByUsuarioId(Long usuarioId);

    /**
     * Elimina registros de auditoría antiguos
     */
    @Query("DELETE FROM Auditoria a WHERE a.fechaHora < :fechaLimite")
    void eliminarAnterioresA(@Param("fechaLimite") LocalDateTime fechaLimite);
}

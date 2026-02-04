package com.innoad.modules.campanas.repositorio;

import com.innoad.modules.campanas.dominio.Campana;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RepositorioCampanas extends JpaRepository<Campana, Long> {
    
    // Búsquedas por usuario
    Page<Campana> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId, Pageable pageable);
    
    // Búsquedas por estado
    List<Campana> findByEstadoOrderByFechaCreacionDesc(Campana.EstadoCampana estado);
    
    Page<Campana> findByUsuarioIdAndEstadoOrderByFechaCreacionDesc(
        Long usuarioId, 
        Campana.EstadoCampana estado, 
        Pageable pageable
    );
    
    // Búsquedas por nombre
    Page<Campana> findByUsuarioIdAndNombreContainingIgnoreCaseOrderByFechaCreacionDesc(
        Long usuarioId,
        String nombre,
        Pageable pageable
    );
    
    // Búsquedas por rango de fechas
    @Query("SELECT c FROM Campana c WHERE c.usuario.id = :usuarioId AND c.fechaInicio >= :inicio AND c.fechaFin <= :fin ORDER BY c.fechaCreacion DESC")
    Page<Campana> findByUsuarioIdAndFechaRango(
        @Param("usuarioId") Long usuarioId,
        @Param("inicio") LocalDateTime inicio,
        @Param("fin") LocalDateTime fin,
        Pageable pageable
    );
    
    // Campañas activas de un usuario
    @Query("SELECT c FROM Campana c WHERE c.usuario.id = :usuarioId AND c.estado = 'ACTIVA' AND c.fechaInicio <= CURRENT_TIMESTAMP AND c.fechaFin >= CURRENT_TIMESTAMP")
    List<Campana> findCampanasActivasDelUsuario(@Param("usuarioId") Long usuarioId);
    
    // Campañas próximas a comenzar
    @Query("SELECT c FROM Campana c WHERE c.usuario.id = :usuarioId AND c.estado = 'BORRADORA' AND c.fechaInicio > CURRENT_TIMESTAMP ORDER BY c.fechaInicio ASC")
    List<Campana> findCampanaProximas(@Param("usuarioId") Long usuarioId);
    
    // Campañas finalizadas
    @Query("SELECT c FROM Campana c WHERE c.usuario.id = :usuarioId AND c.fechaFin < CURRENT_TIMESTAMP ORDER BY c.fechaFin DESC")
    Page<Campana> findCampanasFinalizadas(@Param("usuarioId") Long usuarioId, Pageable pageable);
    
    // Obtener por ID y usuario (seguridad)
    Optional<Campana> findByIdAndUsuarioId(Long id, Long usuarioId);
    
    // Contar campañas activas
    @Query("SELECT COUNT(c) FROM Campana c WHERE c.usuario.id = :usuarioId AND c.estado = 'ACTIVA'")
    long countCampanasActivas(@Param("usuarioId") Long usuarioId);
}

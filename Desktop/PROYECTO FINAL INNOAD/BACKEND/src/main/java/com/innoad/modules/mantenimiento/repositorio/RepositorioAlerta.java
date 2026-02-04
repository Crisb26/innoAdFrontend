package com.innoad.modules.mantenimiento.repositorio;

import com.innoad.modules.mantenimiento.dominio.Alerta;
import com.innoad.modules.mantenimiento.dominio.EstadoAlerta;
import com.innoad.modules.mantenimiento.dominio.TipoAlerta;
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
public interface RepositorioAlerta extends JpaRepository<Alerta, Long> {
    
    Page<Alerta> findByEstado(EstadoAlerta estado, Pageable pageable);
    
    Page<Alerta> findByTipo(TipoAlerta tipo, Pageable pageable);
    
    List<Alerta> findByEstadoOrderByFechaCreacionDesc(EstadoAlerta estado);
    
    List<Alerta> findByEstadoAndTipoOrderByPrioridadDescFechaCreacionDesc(
        EstadoAlerta estado, TipoAlerta tipo
    );
    
    List<Alerta> findByDispositivoIdAndEstado(String dispositivoId, EstadoAlerta estado);
    
    @Query("SELECT a FROM Alerta a WHERE a.estado = 'ACTIVA' " +
           "AND a.prioridad >= 4 ORDER BY a.prioridad DESC, a.fechaCreacion DESC")
    List<Alerta> findAlertasCriticasActivas();
    
    @Query("SELECT a FROM Alerta a WHERE a.fechaCreacion BETWEEN :inicio AND :fin " +
           "ORDER BY a.fechaCreacion DESC")
    List<Alerta> findAlertas(
        @Param("inicio") LocalDateTime inicio,
        @Param("fin") LocalDateTime fin
    );
    
    long countByEstado(EstadoAlerta estado);
    
    long countByTipoAndEstado(TipoAlerta tipo, EstadoAlerta estado);
    
    Optional<Alerta> findByIdAndEstado(Long id, EstadoAlerta estado);
}

package com.innoad.modules.mantenimiento.repositorio;

import com.innoad.modules.mantenimiento.dominio.Mantenimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RepositorioMantenimiento extends JpaRepository<Mantenimiento, Long> {
    
    @Query("SELECT m FROM Mantenimiento m ORDER BY m.fechaCreacion DESC LIMIT 1")
    Optional<Mantenimiento> getUltimoMantenimiento();
    
    @Query("SELECT m FROM Mantenimiento m WHERE m.estado = 'ACTIVO'")
    Optional<Mantenimiento> getMantenimientoActivo();
    
    @Query("SELECT m FROM Mantenimiento m WHERE m.fechaInicio <= :ahora AND m.fechaFin >= :ahora")
    Optional<Mantenimiento> getMantenimientoActualPorFecha(@Param("ahora") LocalDateTime ahora);
}

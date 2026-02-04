package com.innoad.config.auditoria;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RepositorioAuditoria extends JpaRepository<RegistroAuditoria, Long> {
    
    // Obtener registros de auditoría de un usuario
    List<RegistroAuditoria> findByUsuarioIdOrderByTimestampDesc(String usuarioId);
    
    // Obtener accesos sospechosos
    @Query("SELECT r FROM RegistroAuditoria r WHERE r.esSospechoso = true ORDER BY r.timestamp DESC")
    List<RegistroAuditoria> obtenerAccesosSospechosos();
    
    // Obtener intentos de login fallidos en un rango de tiempo
    @Query("SELECT r FROM RegistroAuditoria r WHERE r.tipoAccion = 'LOGIN' " +
           "AND r.resultado = 'FALLIDO' " +
           "AND r.timestamp BETWEEN :inicio AND :fin " +
           "ORDER BY r.timestamp DESC")
    List<RegistroAuditoria> obtenerIntentosLoginFallidos(
        @Param("inicio") LocalDateTime inicio,
        @Param("fin") LocalDateTime fin
    );
    
    // Obtener accesos desde una IP específica
    List<RegistroAuditoria> findByIpAddressOrderByTimestampDesc(String ipAddress);
    
    // Obtener actividad de hoy
    @Query("SELECT r FROM RegistroAuditoria r WHERE DATE(r.timestamp) = CURRENT_DATE " +
           "ORDER BY r.timestamp DESC")
    List<RegistroAuditoria> obtenerActividadDeHoy();
}

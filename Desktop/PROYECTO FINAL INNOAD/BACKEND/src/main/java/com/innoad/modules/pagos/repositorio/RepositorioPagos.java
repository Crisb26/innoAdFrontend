package com.innoad.modules.pagos.repositorio;

import com.innoad.modules.pagos.dominio.Pago;
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
 * Repositorio para entidad Pago
 * Gestiona operaciones de base de datos para pagos
 */
@Repository
public interface RepositorioPagos extends JpaRepository<Pago, Long> {
    
    /**
     * Buscar pago por referencia
     */
    Optional<Pago> findByReferencia(String referencia);
    
    /**
     * Buscar pago por ID de Mercado Pago
     */
    Optional<Pago> findByMercadoPagoId(String mercadoPagoId);
    
    /**
     * Buscar pagos por usuario
     */
    Page<Pago> findByUsuarioId(Long usuarioId, Pageable pageable);
    
    /**
     * Buscar pagos por estado
     */
    Page<Pago> findByEstado(Pago.EstadoPago estado, Pageable pageable);
    
    /**
     * Buscar pagos por usuario y estado
     */
    Page<Pago> findByUsuarioIdAndEstado(Long usuarioId, Pago.EstadoPago estado, Pageable pageable);
    
    /**
     * Buscar pagos recientes
     */
    List<Pago> findByFechaCreacionBetweenOrderByFechaCreacionDesc(
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin
    );
    
    /**
     * Buscar pagos aprobados
     */
    @Query("SELECT p FROM Pago p WHERE p.estado = 'APROBADO' ORDER BY p.fechaPago DESC")
    List<Pago> findPagosAprobados();
    
    /**
     * Buscar pagos pendientes
     */
    @Query("SELECT p FROM Pago p WHERE p.estado = 'PENDIENTE' AND p.fechaCreacion < :fechaLimite")
    List<Pago> findPagosPendientesAntiguos(@Param("fechaLimite") LocalDateTime fechaLimite);
    
    /**
     * Contar pagos por estado
     */
    long countByEstado(Pago.EstadoPago estado);
    
    /**
     * Contar pagos por usuario
     */
    long countByUsuarioId(Long usuarioId);
    
    /**
     * Buscar por preference ID
     */
    Optional<Pago> findByPreferenceId(String preferenceId);
}

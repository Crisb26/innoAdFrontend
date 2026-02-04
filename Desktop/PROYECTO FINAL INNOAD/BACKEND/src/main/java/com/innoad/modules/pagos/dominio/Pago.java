package com.innoad.modules.pagos.dominio;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad para gestionar pagos con Mercado Pago
 * Fase 5 - Integración de pagos
 */
@Entity
@Table(name = "pagos", indexes = {
    @Index(name = "idx_usuario_id", columnList = "usuario_id"),
    @Index(name = "idx_estado", columnList = "estado"),
    @Index(name = "idx_mercado_pago_id", columnList = "mercado_pago_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pago implements Serializable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Información del pago
    @Column(nullable = false)
    private String referencia;
    
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal monto;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EstadoPago estado;
    
    @Column(nullable = false)
    private String descripcion;
    
    // Integración Mercado Pago
    @Column(name = "mercado_pago_id")
    private String mercadoPagoId;
    
    @Column(name = "mercado_pago_status")
    private String mercadoPagoStatus;
    
    @Column(name = "preference_id")
    private String preferenceId;
    
    // Datos del usuario
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;
    
    @Column(nullable = false)
    private String usuarioEmail;
    
    @Column(nullable = false)
    private String usuarioNombre;
    
    // Datos del plan/suscripción
    @Column(name = "plan_id")
    private Long planId;
    
    @Column(name = "plan_nombre")
    private String planNombre;
    
    @Column(name = "tipo_pago", nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoPago tipoPago;
    
    // Detalles de la transacción
    @Column(name = "metodo_pago")
    private String metodoPago;
    
    @Column(name = "ultimos_4_digitos")
    private String ultimos4Digitos;
    
    @Column(name = "banco")
    private String banco;
    
    // Timestamps
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;
    
    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;
    
    // Auditoría
    @Column(name = "codigo_autorizacion")
    private String codigoAutorizacion;
    
    @Column(name = "id_transaccion_mp")
    private String idTransaccionMP;
    
    @Column(columnDefinition = "TEXT")
    private String respuestaJSON;
    
    // Reembolsos
    @Column(name = "monto_reembolsado", precision = 19, scale = 2)
    private BigDecimal montoReembolsado;
    
    @Column(name = "fecha_reembolso")
    private LocalDateTime fechaReembolso;
    
    @Column(name = "motivo_reembolso")
    private String motivoReembolso;
    
    // Campos de control
    @Column(name = "intentos_fallidos")
    private Integer intentosFallidos;
    
    @Column(name = "nota_interna")
    private String notaInterna;
    
    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
        this.estado = EstadoPago.PENDIENTE;
        this.intentosFallidos = 0;
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
    
    public enum EstadoPago {
        PENDIENTE,
        PROCESANDO,
        APROBADO,
        AUTORIZADO,
        RECHAZADO,
        REEMBOLSADO,
        FALLIDO,
        CANCELADO,
        EN_DISPUTA
    }
    
    public enum TipoPago {
        PLAN_MENSUAL,
        PLAN_ANUAL,
        PAGO_UNICO,
        MEJORA_PLAN,
        CREDITO_ADICIONAL
    }
}

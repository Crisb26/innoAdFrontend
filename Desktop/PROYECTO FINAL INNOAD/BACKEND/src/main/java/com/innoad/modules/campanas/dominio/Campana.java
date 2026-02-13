package com.innoad.modules.campanas.dominio;

import jakarta.persistence.*;
import lombok.*;
import com.innoad.modules.auth.domain.Usuario;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "campanas", indexes = {
    @Index(name = "idx_campanas_usuario_id", columnList = "usuario_id"),
    @Index(name = "idx_campanas_estado", columnList = "estado"),
    @Index(name = "idx_campanas_fecha_inicio", columnList = "fecha_inicio")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Campana {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 255)
    private String nombre;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;
    
    @Column(name = "fecha_fin", nullable = false)
    private LocalDateTime fechaFin;
    
    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private EstadoCampana estado;
    
    @Column(name = "pantallas_asignadas", nullable = false)
    private Integer pantallasAsignadas;
    
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @Column(name = "presupuesto")
    private Double presupuesto;
    
    @Column(name = "invertido", columnDefinition = "DECIMAL(10,2) DEFAULT 0")
    private Double invertido;
    
    @Column(name = "clic_rate", columnDefinition = "DECIMAL(5,2) DEFAULT 0")
    private Double clickRate;
    
    @Column(name = "impresiones")
    private Long impresiones;
    
    @Column(name = "clics")
    private Long clics;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        if (estado == null) {
            estado = EstadoCampana.BORRADORA;
        }
        if (invertido == null) {
            invertido = 0.0;
        }
        if (clickRate == null) {
            clickRate = 0.0;
        }
        if (impresiones == null) {
            impresiones = 0L;
        }
        if (clics == null) {
            clics = 0L;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
    
    public enum EstadoCampana {
        BORRADORA,
        ACTIVA,
        PAUSADA,
        FINALIZADA,
        CANCELADA
    }
    
    // Método auxiliar para validar fechas
    public boolean esValida() {
        return fechaInicio != null && fechaFin != null && 
               fechaInicio.isBefore(fechaFin) &&
               nombre != null && !nombre.isBlank();
    }
}

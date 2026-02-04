package com.innoad.modules.publicaciones.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "publicaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Publicacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String titulo;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoContenido tipoContenido;
    
    @Column
    private String archivoUrl;
    
    @Column(nullable = false)
    private Integer duracionDias;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EstadoPublicacion estado = EstadoPublicacion.PENDIENTE;
    
    @Column(nullable = false)
    private Long usuarioId;
    
    @Column
    private BigDecimal costoTotal;
    
    @Column
    private String ubicacionesJson; // JSON array de ubicaciones seleccionadas
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
    
    @Column
    private LocalDateTime fechaAprobacion;
    
    @Column
    private LocalDateTime fechaRechazo;
    
    @Column
    private String motivoRechazo;
    
    @Column
    private LocalDateTime fechaPublicacion;
    
    @Column
    private LocalDateTime fechaFinalizacion;
    
    public enum TipoContenido {
        VIDEO, IMAGEN
    }
    
    public enum EstadoPublicacion {
        PENDIENTE, APROBADO, RECHAZADO, PUBLICADO, FINALIZADO
    }
}

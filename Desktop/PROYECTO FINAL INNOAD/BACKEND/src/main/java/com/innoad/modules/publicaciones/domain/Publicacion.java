package com.innoad.modules.publicaciones.domain;

import com.innoad.modules.auth.domain.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entidad para Publicaciones/Campañas de contenido de usuarios
 * Representa una publicidad que el usuario quiere mostrar en pantallas
 */
@Entity
@Table(name = "publicaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Publicacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false)
    private String imagenUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPublicacion estado;

    @Enumerated(EnumType.STRING)
    private TipoFormato formato; // HORIZONTAL, VERTICAL, CUADRADO

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "ubicacion")
    private String ubicacion; // Centro comercial, municipio, etc

    @Column(name = "precio_cop")
    private Double precioCOP; // Precio en pesos colombianos

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        estado = EstadoPublicacion.PENDIENTE_REVISION;
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }

    public enum EstadoPublicacion {
        PENDIENTE_REVISION,  // Esperando revisión del técnico
        APROBADA,            // Aprobada, lista para mostrar
        RECHAZADA,           // Rechazada por contenido inapropiado
        ACTIVA,              // Actualmente mostrándose
        PAUSADA,             // Pausada temporalmente
        FINALIZADA           // Completó su periodo
    }

    public enum TipoFormato {
        HORIZONTAL,  // 16:9
        VERTICAL,    // 9:16
        CUADRADO     // 1:1
    }
}

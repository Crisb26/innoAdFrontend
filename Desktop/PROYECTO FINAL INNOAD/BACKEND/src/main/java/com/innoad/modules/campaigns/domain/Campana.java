package com.innoad.modules.campaigns.domain;

import com.innoad.modules.auth.domain.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Entidad que representa una campaña publicitaria en InnoAd
 */
@Entity
@Table(name = "campanas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Campana {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoCampana estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDateTime fechaFin;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "campana_contenidos", joinColumns = @JoinColumn(name = "campana_id"))
    @Column(name = "contenido_id")
    @Builder.Default
    private List<Long> contenidoIds = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "campana_pantallas", joinColumns = @JoinColumn(name = "campana_id"))
    @Column(name = "pantalla_id")
    @Builder.Default
    private List<Long> pantallaIds = new ArrayList<>();

    @Column(name = "prioridad")
    @Builder.Default
    private Integer prioridad = 5;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String configuracion; // JSON con transiciones, horarios, etc.

    @Column(name = "reproducciones_totales")
    @Builder.Default
    private Long reproduccionesTotales = 0L;

    @Column(name = "pantallas_activas")
    @Builder.Default
    private Integer pantallasActivas = 0;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "campana_tags", joinColumns = @JoinColumn(name = "campana_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        if (estado == null) {
            estado = EstadoCampana.BORRADOR;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }

    public enum EstadoCampana {
        BORRADOR,      // En edición
        PROGRAMADA,    // Próxima a iniciarse
        ACTIVA,        // En reproducción
        PAUSADA,       // Pausada temporalmente
        FINALIZADA     // Completada
    }

    public boolean estaActiva() {
        LocalDateTime ahora = LocalDateTime.now();
        return estado == EstadoCampana.ACTIVA &&
               ahora.isAfter(fechaInicio) &&
               ahora.isBefore(fechaFin);
    }

    public boolean estaProgramada() {
        return estado == EstadoCampana.PROGRAMADA &&
               LocalDateTime.now().isBefore(fechaInicio);
    }

    public void incrementarReproducciones() {
        this.reproduccionesTotales = (this.reproduccionesTotales != null ? this.reproduccionesTotales : 0) + 1;
    }
}

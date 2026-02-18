package com.innoad.modules.content.domain;

import com.innoad.modules.auth.domain.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad que representa una publicidad en el sistema InnoAd.
 */
@Entity
@Table(name = "publicidades")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Publicidad {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "El título es obligatorio")
    @Size(max = 200, message = "El título no puede exceder 200 caracteres")
    @Column(nullable = false, length = 200)
    private String titulo;
    
    @NotBlank(message = "La descripción es obligatoria")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String descripcion;
    
    @Column(length = 500)
    private String urlImagen; // URL de la imagen principal
    
    @Column(length = 500)
    private String urlVideo; // URL del video si aplica
    
    @Column(length = 500)
    private String urlDestino; // URL a la que redirige el anuncio
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_creador_id", nullable = false)
    private Usuario usuarioCreador;
    
    @Column
    private LocalDateTime fechaCreacion;
    
    @Column
    private LocalDateTime fechaActualizacion;
    
    @Column
    private LocalDateTime fechaInicio; // Cuándo empieza la campaña
    
    @Column
    private LocalDateTime fechaFin; // Cuándo termina la campaña
    
    @Column(length = 50)
    private String estado; // BORRADOR, ACTIVA, PAUSADA, FINALIZADA
    
    @Builder.Default
    @Column
    private Integer impresiones = 0; // Numero de veces mostrada
    
    @Builder.Default
    @Column
    private Integer clics = 0; // Numero de clics
    
    @Builder.Default
    @Column
    private Integer conversiones = 0; // Numero de conversiones
    
    @Column
    private Double presupuesto; // Presupuesto asignado
    
    @Builder.Default
    @Column
    private Double gastado = 0.0; // Monto gastado
    
    @Column(length = 100)
    private String audienciaObjetivo; // Descripción de la audiencia
    
    @Column(length = 100)
    private String categoria; // Categoría del anuncio
    
    @Column(columnDefinition = "TEXT")
    private String palabrasClave; // Keywords separadas por comas
    
    @Builder.Default
    @Column
    private Boolean generadaPorIA = false; // Si fue creada con ayuda de IA
    
    @Column(columnDefinition = "TEXT")
    private String sugerenciasIA; // Sugerencias de mejora por IA
    
    @Column
    private Integer calificacionIA; // Calificación de la IA sobre la efectividad (1-100)
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        if (estado == null) {
            estado = "BORRADOR";
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
    
    /**
     * Calcula el CTR (Click Through Rate)
     */
    public Double calcularCTR() {
        if (impresiones == 0) return 0.0;
        return (clics.doubleValue() / impresiones.doubleValue()) * 100;
    }
    
    /**
     * Calcula la tasa de conversión
     */
    public Double calcularTasaConversion() {
        if (clics == 0) return 0.0;
        return (conversiones.doubleValue() / clics.doubleValue()) * 100;
    }
    
    /**
     * Verifica si la campaña está activa
     */
    public Boolean estaActiva() {
        LocalDateTime ahora = LocalDateTime.now();
        return "ACTIVA".equals(estado) &&
               (fechaInicio == null || !ahora.isBefore(fechaInicio)) &&
               (fechaFin == null || !ahora.isAfter(fechaFin));
    }
}


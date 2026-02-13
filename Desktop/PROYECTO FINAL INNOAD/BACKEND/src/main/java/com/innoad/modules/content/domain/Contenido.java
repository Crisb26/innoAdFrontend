package com.innoad.modules.content.domain;

import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.screens.domain.Pantalla;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entidad que representa un contenido publicitario que se mostrará en las pantallas.
 * Puede ser imagen, video, texto o HTML.
 */
@Entity
@Table(name = "contenidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contenido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Título del contenido
     */
    @NotBlank(message = "El título es obligatorio")
    @Size(min = 3, max = 200, message = "El título debe tener entre 3 y 200 caracteres")
    @Column(nullable = false, length = 200)
    private String titulo;

    /**
     * Descripción del contenido
     */
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    /**
     * Tipo de contenido: IMAGEN, VIDEO, TEXTO, HTML
     */
    @NotBlank(message = "El tipo de contenido es obligatorio")
    @Column(nullable = false, length = 20)
    private String tipo;

    /**
     * URL del archivo (para imagen o video)
     */
    @Column(length = 500)
    private String urlArchivo;

    /**
     * Nombre del archivo original
     */
    @Column(length = 255)
    private String nombreArchivo;

    /**
     * Tamaño del archivo en bytes
     */
    private Long tamanoArchivo;

    /**
     * Tipo MIME del archivo
     */
    @Column(length = 100)
    private String tipoMime;

    /**
     * Contenido de texto (para tipo TEXTO)
     */
    @Column(columnDefinition = "TEXT")
    private String contenidoTexto;

    /**
     * Contenido HTML (para tipo HTML)
     */
    @Column(columnDefinition = "TEXT")
    private String contenidoHtml;

    /**
     * Duración en segundos que se mostrará el contenido
     */
    @Min(value = 1, message = "La duración debe ser al menos 1 segundo")
    @Column(nullable = false)
    @Builder.Default
    private Integer duracionSegundos = 10;

    /**
     * Orden de reproducción (menor número = mayor prioridad)
     */
    @Builder.Default
    private Integer orden = 0;

    /**
     * Prioridad: BAJA, NORMAL, ALTA, URGENTE
     */
    @Column(length = 20)
    @Builder.Default
    private String prioridad = "NORMAL";

    /**
     * Estado del contenido: BORRADOR, ACTIVO, PAUSADO, FINALIZADO
     */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String estado = "BORRADOR";

    /**
     * Fecha de inicio de publicación
     */
    private LocalDateTime fechaInicio;

    /**
     * Fecha de fin de publicación
     */
    private LocalDateTime fechaFin;

    /**
     * Pantalla asignada
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pantalla_id", nullable = false)
    private Pantalla pantalla;

    /**
     * Usuario creador del contenido
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /**
     * Fecha de creación
     */
    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    /**
     * Fecha de última actualización
     */
    @Builder.Default
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    /**
     * Número de veces que se ha reproducido
     */
    @Builder.Default
    private Integer vecesReproducido = 0;

    /**
     * Última fecha de reproducción
     */
    private LocalDateTime ultimaReproduccion;

    /**
     * Tags o etiquetas para categorizar el contenido
     */
    @Column(length = 500)
    private String tags;

    /**
     * Verifica si el contenido está activo
     */
    public boolean estaActivo() {
        if (!"ACTIVO".equals(estado)) {
            return false;
        }

        LocalDateTime ahora = LocalDateTime.now();

        if (fechaInicio != null && ahora.isBefore(fechaInicio)) {
            return false;
        }

        if (fechaFin != null && ahora.isAfter(fechaFin)) {
            return false;
        }

        return true;
    }

    /**
     * Verifica si el contenido está en el período de publicación
     */
    public boolean enPeriodoPublicacion() {
        LocalDateTime ahora = LocalDateTime.now();

        if (fechaInicio != null && ahora.isBefore(fechaInicio)) {
            return false;
        }

        if (fechaFin != null && ahora.isAfter(fechaFin)) {
            return false;
        }

        return true;
    }

    /**
     * Incrementa el contador de reproducciones
     */
    public void incrementarReproducciones() {
        this.vecesReproducido++;
        this.ultimaReproduccion = LocalDateTime.now();
    }

    /**
     * Actualiza la fecha de modificación
     */
    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}

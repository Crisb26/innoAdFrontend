package com.innoad.dto.solicitud;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para crear o actualizar un contenido publicitario
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudContenido {

    @NotBlank(message = "El título es obligatorio")
    @Size(min = 3, max = 200, message = "El título debe tener entre 3 y 200 caracteres")
    private String titulo;

    private String descripcion;

    @NotBlank(message = "El tipo de contenido es obligatorio")
    @Pattern(regexp = "^(IMAGEN|VIDEO|TEXTO|HTML)$",
             message = "El tipo debe ser: IMAGEN, VIDEO, TEXTO o HTML")
    private String tipo;

    private String urlArchivo;

    private String nombreArchivo;

    private Long tamanoArchivo;

    private String tipoMime;

    private String contenidoTexto;

    private String contenidoHtml;

    @NotNull(message = "La duración en segundos es obligatoria")
    @Min(value = 1, message = "La duración debe ser al menos 1 segundo")
    @Max(value = 3600, message = "La duración no puede exceder 1 hora (3600 segundos)")
    private Integer duracionSegundos;

    @Min(value = 0, message = "El orden no puede ser negativo")
    private Integer orden;

    @Pattern(regexp = "^(BAJA|NORMAL|ALTA|URGENTE)$",
             message = "La prioridad debe ser: BAJA, NORMAL, ALTA o URGENTE")
    private String prioridad;

    @Pattern(regexp = "^(BORRADOR|ACTIVO|PAUSADO|FINALIZADO)$",
             message = "El estado debe ser: BORRADOR, ACTIVO, PAUSADO o FINALIZADO")
    private String estado;

    private LocalDateTime fechaInicio;

    private LocalDateTime fechaFin;

    @NotNull(message = "El ID de la pantalla es obligatorio")
    private Long pantallaId;

    @Size(max = 500, message = "Los tags no pueden exceder 500 caracteres")
    private String tags;
}

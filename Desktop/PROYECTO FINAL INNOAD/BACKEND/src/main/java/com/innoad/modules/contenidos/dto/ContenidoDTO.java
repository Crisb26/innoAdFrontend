package com.innoad.modules.contenidos.dto;

import com.innoad.modules.contenidos.dominio.Contenido;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContenidoDTO {
    
    private Long id;
    
    @NotBlank(message = "El nombre es requerido")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    private String nombre;
    
    @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
    private String descripcion;
    
    @NotNull(message = "El tipo de contenido es requerido")
    private Contenido.TipoContenido tipo;
    
    @NotBlank(message = "El nombre del archivo es requerido")
    private String nombreArchivo;
    
    private String rutaArchivo;
    
    @NotNull(message = "El tamaño del archivo es requerido")
    @Min(value = 1, message = "El archivo debe tener al menos 1 byte")
    @Max(value = 104857600, message = "El archivo no puede exceder 100MB")
    private Long tamaño;
    
    @NotBlank(message = "El tipo MIME es requerido")
    private String mimeType;
    
    private String urlPublica;
    
    @Builder.Default
    private Contenido.EstadoContenido estado = Contenido.EstadoContenido.BORRADOR;
    
    @NotNull(message = "La duración en segundos es requerida")
    @Min(value = 1, message = "La duración debe ser mayor a 1 segundo")
    @Max(value = 3600, message = "La duración no puede exceder 1 hora")
    private Integer duracionSegundos;
    
    @NotNull(message = "El ID de la campaña es requerido")
    private Long campanaId;
    
    private String campaña;
    
    private Long vecesReproducido;
    
    private LocalDateTime fechaCreacion;
    
    private LocalDateTime fechaActualizacion;
    
    public static ContenidoDTO fromEntity(Contenido contenido) {
        return ContenidoDTO.builder()
            .id(contenido.getId())
            .nombre(contenido.getNombre())
            .descripcion(contenido.getDescripcion())
            .tipo(contenido.getTipo())
            .nombreArchivo(contenido.getNombreArchivo())
            .rutaArchivo(contenido.getRutaArchivo())
            .tamaño(contenido.getTamaño())
            .mimeType(contenido.getMimeType())
            .urlPublica(contenido.getUrlPublica())
            .estado(contenido.getEstado())
            .duracionSegundos(contenido.getDuracionSegundos())
            .campanaId(contenido.getCampana().getId())
            .campaña(contenido.getCampana().getNombre())
            .vecesReproducido(contenido.getVecesReproducido())
            .fechaCreacion(contenido.getFechaCreacion())
            .fechaActualizacion(contenido.getFechaActualizacion())
            .build();
    }
}

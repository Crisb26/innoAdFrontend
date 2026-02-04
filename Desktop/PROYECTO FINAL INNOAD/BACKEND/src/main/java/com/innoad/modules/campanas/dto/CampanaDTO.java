package com.innoad.modules.campanas.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampanaDTO {
    
    private Long id;
    
    @NotBlank(message = "El nombre de la campaña es requerido")
    @Size(min = 3, max = 255, message = "El nombre debe tener entre 3 y 255 caracteres")
    private String nombre;
    
    @Size(max = 1000, message = "La descripción no puede exceder 1000 caracteres")
    private String descripcion;
    
    @NotNull(message = "La fecha de inicio es requerida")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaInicio;
    
    @NotNull(message = "La fecha de fin es requerida")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaFin;
    
    @NotNull(message = "La cantidad de pantallas es requerida")
    @Min(value = 1, message = "Debe asignar al menos 1 pantalla")
    @Max(value = 100, message = "No puede asignar más de 100 pantallas")
    private Integer pantallasAsignadas;
    
    @Min(value = 0, message = "El presupuesto no puede ser negativo")
    private Double presupuesto;
    
    private String estado;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaCreacion;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaActualizacion;
    
    private Double invertido;
    
    private Double clickRate;
    
    private Long impresiones;
    
    private Long clics;
    
    // Constructor para conversión de entidad
    public static CampanaDTO fromEntity(com.innoad.modules.campanas.dominio.Campana campana) {
        return CampanaDTO.builder()
            .id(campana.getId())
            .nombre(campana.getNombre())
            .descripcion(campana.getDescripcion())
            .fechaInicio(campana.getFechaInicio())
            .fechaFin(campana.getFechaFin())
            .pantallasAsignadas(campana.getPantallasAsignadas())
            .presupuesto(campana.getPresupuesto())
            .estado(campana.getEstado().toString())
            .fechaCreacion(campana.getFechaCreacion())
            .fechaActualizacion(campana.getFechaActualizacion())
            .invertido(campana.getInvertido())
            .clickRate(campana.getClickRate())
            .impresiones(campana.getImpresiones())
            .clics(campana.getClics())
            .build();
    }
}

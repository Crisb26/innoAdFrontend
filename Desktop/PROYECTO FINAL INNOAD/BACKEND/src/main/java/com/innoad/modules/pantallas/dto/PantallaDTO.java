package com.innoad.modules.pantallas.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PantallaDTO {
    
    private Long id;
    
    @NotBlank(message = "El código es requerido")
    @Size(min = 3, max = 100, message = "El código debe tener entre 3 y 100 caracteres")
    private String codigo;
    
    @NotBlank(message = "El nombre es requerido")
    @Size(min = 3, max = 255, message = "El nombre debe tener entre 3 y 255 caracteres")
    private String nombre;
    
    @Size(max = 1000, message = "La descripción no puede exceder 1000 caracteres")
    private String descripcion;
    
    @NotBlank(message = "La ubicación es requerida")
    private String ubicacion;
    
    private String resolucion;
    
    private String estado;
    
    private Boolean conectada;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime ultimaConexion;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaCreacion;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaActualizacion;
    
    private String ipAddress;
    
    private String macAddress;
    
    private Integer bateriaPortacentaje;
    
    private Double temperaturaCPU;
    
    private Long campanaActualId;
    
    public static PantallaDTO fromEntity(com.innoad.modules.pantallas.dominio.Pantalla pantalla) {
        return PantallaDTO.builder()
            .id(pantalla.getId())
            .codigo(pantalla.getCodigo())
            .nombre(pantalla.getNombre())
            .descripcion(pantalla.getDescripcion())
            .ubicacion(pantalla.getUbicacion())
            .resolucion(pantalla.getResolucion())
            .estado(pantalla.getEstado().toString())
            .conectada(pantalla.getConectada())
            .ultimaConexion(pantalla.getUltimaConexion())
            .fechaCreacion(pantalla.getFechaCreacion())
            .fechaActualizacion(pantalla.getFechaActualizacion())
            .ipAddress(pantalla.getIpAddress())
            .macAddress(pantalla.getMacAddress())
            .bateriaPortacentaje(pantalla.getBateriaPortacentaje())
            .temperaturaCPU(pantalla.getTemperaturaCPU())
            .campanaActualId(pantalla.getCampanaActual() != null ? pantalla.getCampanaActual().getId() : null)
            .build();
    }
}

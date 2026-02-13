package com.innoad.modules.mantenimiento.dto;

import com.innoad.modules.mantenimiento.dominio.Mantenimiento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MantenimientoDTO {
    
    private Long id;
    
    @NotNull(message = "El estado es requerido")
    private Mantenimiento.EstadoMantenimiento estado;
    
    @NotBlank(message = "El motivo es requerido")
    private String motivo;
    
    @NotBlank(message = "El mensaje es requerido")
    private String mensaje;
    
    @NotBlank(message = "La contraseña es requerida")
    private String password;
    
    @NotNull(message = "La fecha de inicio es requerida")
    private LocalDateTime fechaInicio;
    
    @NotNull(message = "La fecha de fin es requerida")
    private LocalDateTime fechaFin;
    
    @Builder.Default
    private Boolean permiteLectura = false;
    
    @Builder.Default
    private Boolean bloqueaGraficos = true;
    
    @Builder.Default
    private Boolean bloqueaPublicacion = true;
    
    @Builder.Default
    private Boolean bloqueaDescarga = true;
    
    private LocalDateTime fechaCreacion;
    
    private LocalDateTime fechaActualizacion;
    
    private String creadoPor;
    
    public static MantenimientoDTO fromEntity(Mantenimiento entity) {
        return MantenimientoDTO.builder()
            .id(entity.getId())
            .estado(entity.getEstado())
            .motivo(entity.getMotivo())
            .mensaje(entity.getMensaje())
            .fechaInicio(entity.getFechaInicio())
            .fechaFin(entity.getFechaFin())
            .permiteLectura(entity.getPermiteLectura())
            .bloqueaGraficos(entity.getBloqueaGraficos())
            .bloqueaPublicacion(entity.getBloqueaPublicacion())
            .bloqueaDescarga(entity.getBloqueaDescarga())
            .fechaCreacion(entity.getFechaCreacion())
            .fechaActualizacion(entity.getFechaActualizacion())
            .creadoPor(entity.getCreadoPor())
            .build();
    }
}

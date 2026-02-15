package com.innoad.dto.solicitud;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para activar modo mantenimiento
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudModoMantenimiento {

    @NotBlank(message = "El código de seguridad es obligatorio")
    private String codigoSeguridad;

    private String mensaje;

    private LocalDateTime fechaFinEstimada;
}

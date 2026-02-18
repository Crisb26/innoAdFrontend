package com.innoad.dto.solicitud;

import com.innoad.shared.dto.RolUsuario;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para solicitud de cambio de rol de usuario
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudCambiarRol {

    @NotNull(message = "El nuevo rol es obligatorio")
    private RolUsuario nuevoRol;

    private String motivo;
}

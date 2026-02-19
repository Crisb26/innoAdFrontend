package com.innoad.dto.solicitud;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para solicitar recuperación de contraseña
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudRecuperacionContrasena {

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Debe ser un email válido")
    private String email;
}

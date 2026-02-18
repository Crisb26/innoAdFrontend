package com.innoad.dto.solicitud;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para solicitud de actualización de perfil de usuario
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudActualizarPerfil {
    
    @Email(message = "Debe ser un email válido")
    private String email;
    
    private String telefono;
    
    private String direccion;
    
    private String avatarUrl;
}

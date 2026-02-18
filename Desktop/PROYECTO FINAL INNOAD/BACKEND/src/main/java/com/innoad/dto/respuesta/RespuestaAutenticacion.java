package com.innoad.dto.respuesta;

import com.innoad.shared.dto.RolUsuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la respuesta de autenticación (login/registro exitoso)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespuestaAutenticacion {
    
    private String token;
    private String tipoToken;
    private Long id;
    private String nombreUsuario;
    private String email;
    private String nombreCompleto;
    private RolUsuario rol;
    private Boolean verificado;
    private String mensaje;
}

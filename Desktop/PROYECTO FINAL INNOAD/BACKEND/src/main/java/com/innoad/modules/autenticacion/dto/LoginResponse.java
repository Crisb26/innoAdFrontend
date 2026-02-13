package com.innoad.modules.autenticacion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para response de login
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private String token;
    private String refreshToken;
    private Long usuarioId;
    private String nombreUsuario;
    private String email;
    private String rol;
    private Long expiresIn;
    private String tipo;

    public LoginResponse(String token, String refreshToken, Long usuarioId, String nombreUsuario, String email, String rol) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.usuarioId = usuarioId;
        this.nombreUsuario = nombreUsuario;
        this.email = email;
        this.rol = rol;
        this.expiresIn = 3600L; // 1 hora en segundos
        this.tipo = "Bearer";
    }
}

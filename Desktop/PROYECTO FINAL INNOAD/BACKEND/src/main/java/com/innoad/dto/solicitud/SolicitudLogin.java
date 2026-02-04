package com.innoad.dto.solicitud;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la solicitud de inicio de sesión
 * Acepta múltiples formatos de nombres de campo para compatibilidad con diferentes frontends
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudLogin {
    
    @NotBlank(message = "El nombre de usuario o email es obligatorio")
    @JsonProperty(value = "nombreUsuarioOEmail")
    private String nombreUsuarioOEmail;
    
    @NotBlank(message = "La contraseña es obligatoria")
    @JsonProperty(value = "contrasena")
    private String contrasena;
    
    // Setters alternativos para compatibilidad con frontends que usan nombres en inglés
    @JsonProperty("username")
    public void setUsername(String username) {
        this.nombreUsuarioOEmail = username;
    }
    
    @JsonProperty("nombreUsuario")
    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuarioOEmail = nombreUsuario;
    }
    
    @JsonProperty("email")
    public void setEmail(String email) {
        this.nombreUsuarioOEmail = email;
    }
    
    @JsonProperty("password")
    public void setPassword(String password) {
        this.contrasena = password;
    }
}

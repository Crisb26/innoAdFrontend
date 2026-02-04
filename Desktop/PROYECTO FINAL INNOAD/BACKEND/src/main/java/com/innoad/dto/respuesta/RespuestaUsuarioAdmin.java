package com.innoad.dto.respuesta;

import com.innoad.shared.dto.RolUsuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para datos de usuario en panel de administración
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespuestaUsuarioAdmin {
    private Long id;
    private String nombreUsuario;
    private String email;
    private String nombre;
    private String apellido;
    private String nombreCompleto;
    private RolUsuario rol;
    private String telefono;
    private String empresa;
    private String cargo;
    private Boolean activo;
    private Boolean verificado;
    private LocalDateTime fechaRegistro;
    private LocalDateTime ultimoAcceso;
    private Integer intentosFallidos;
    private LocalDateTime fechaBloqueo;
}

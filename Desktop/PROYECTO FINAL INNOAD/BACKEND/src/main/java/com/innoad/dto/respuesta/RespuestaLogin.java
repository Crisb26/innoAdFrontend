package com.innoad.dto.respuesta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespuestaLogin {
    private String token;
    private String tokenActualizacion;
    private UsuarioLogin usuario;
    private long expiraEn; // segundos

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsuarioLogin {
        private Long id;
        private String nombreUsuario;
        private String email;
        private String nombreCompleto;
        private String telefono;
        private String direccion;
        private String cedula;
        private String avatarUrl;
        private RolSimple rol;
        @Builder.Default
        private List<PermisoSimple> permisos = List.of();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RolSimple {
        private String nombre;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PermisoSimple {
        private String nombre;
    }
}

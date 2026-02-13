package com.innoad.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConexionUsuarioDTO {
    
    private Long id;
    private String usuarioId;
    private String nombreUsuario;
    private String ipAddress;
    private String navegador;
    private String sistemaOperativo;
    private LocalDateTime fechaConexion;
    private LocalDateTime fechaDesconexion;
    private boolean conectadoActualmente;
    private Long tiempoConexionSegundos;
    private String tiempoConexionFormato; // "2h 30m 45s"
    private LocalDateTime fechaRegistro;
    private String estado;
}

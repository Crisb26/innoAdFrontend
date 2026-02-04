package com.innoad.dto.respuesta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO de respuesta para estadísticas globales del sistema
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespuestaEstadisticas {
    private Long totalUsuarios;
    private Long usuariosActivos;
    private Long usuariosInactivos;
    private Long usuariosVerificados;
    private Long usuariosNoVerificados;
    private Long usuariosBloqueados;
    private Map<String, Long> usuariosPorRol;
    private Long totalPantallas;
    private Long pantallasActivas;
    private Long totalContenidos;
    private Long contenidosActivos;
    private Long totalPublicidades;
    private Long conversacionesIA;
    private Map<String, Object> estadisticasAdicionales;
}

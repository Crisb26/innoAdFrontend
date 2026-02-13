package com.innoad.dto.respuesta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para una pantalla
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaPantalla {

    private Long id;
    private String nombre;
    private String descripcion;
    private String codigoIdentificacion;
    private String estado;
    private String ubicacion;
    private String resolucion;
    private String orientacion;
    private Long usuarioId;
    private String nombreUsuario;
    private LocalDateTime fechaRegistro;
    private LocalDateTime ultimaConexion;
    private LocalDateTime ultimaSincronizacion;
    private String direccionIp;
    private String versionSoftware;
    private String informacionSistema;
    private String notas;
    private boolean estaConectada;
    private int cantidadContenidos;
}

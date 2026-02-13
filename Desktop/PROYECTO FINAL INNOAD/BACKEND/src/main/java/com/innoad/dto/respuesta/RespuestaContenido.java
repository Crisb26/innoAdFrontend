package com.innoad.dto.respuesta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para un contenido
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaContenido {

    private Long id;
    private String titulo;
    private String descripcion;
    private String tipo;
    private String urlArchivo;
    private String nombreArchivo;
    private Long tamanoArchivo;
    private String tipoMime;
    private String contenidoTexto;
    private String contenidoHtml;
    private Integer duracionSegundos;
    private Integer orden;
    private String prioridad;
    private String estado;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private Long pantallaId;
    private String nombrePantalla;
    private Long usuarioId;
    private String nombreUsuario;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private Integer vecesReproducido;
    private LocalDateTime ultimaReproduccion;
    private String tags;
    private boolean estaActivo;
    private boolean enPeriodoPublicacion;
}

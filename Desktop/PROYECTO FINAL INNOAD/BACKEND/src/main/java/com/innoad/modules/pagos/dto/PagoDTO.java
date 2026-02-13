package com.innoad.modules.pagos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO para transferencia de datos de Pagos
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagoDTO {
    
    private Long id;
    private String referencia;
    private BigDecimal monto;
    private String estado;
    private String descripcion;
    private String mercadoPagoId;
    private String preferenceId;
    private Long usuarioId;
    private String usuarioEmail;
    private String usuarioNombre;
    private Long planId;
    private String planNombre;
    private String tipoPago;
    private String metodoPago;
    private String ultimos4Digitos;
    private String banco;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaPago;
    private String codigoAutorizacion;
    private BigDecimal montoReembolsado;
    private LocalDateTime fechaReembolso;
    
}

/**
 * DTO para crear un nuevo pago
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class SolicitudCrearPagoDTO {
    private BigDecimal monto;
    private String descripcion;
    private Long planId;
    private String tipoPago;
    private String email;
    private String nombre;
}

/**
 * DTO para respuesta de Mercado Pago
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class RespuestaMercadoPagoDTO {
    private String preferenceId;
    private String inicPoint;
    private String estado;
    private String mensaje;
}

/**
 * DTO para webhook de Mercado Pago
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class WebhookMercadoPagoDTO {
    private String action;
    private String type;
    private String apiVersion;
    private Long id;
    private Long liveMode;
    private String userId;
    private String apiVersion_;
    private Object resource;
}

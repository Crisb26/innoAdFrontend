package com.innoad.modules.pagos.servicio;

import com.innoad.modules.pagos.dominio.Pago;
import com.innoad.modules.pagos.dto.PagoDTO;
import com.innoad.modules.pagos.repositorio.RepositorioPagos;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Servicio de Pagos - Integración con Mercado Pago
 * Fase 5 - Sistema de pagos profesional
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ServicioPagos {
    
    private final RepositorioPagos repositorioPagos;
    
    @Value("${mercado-pago.access-token}")
    private String mercadoPagoAccessToken;
    
    @Value("${mercado-pago.public-key}")
    private String mercadoPagoPublicKey;
    
    /**
     * Crear preference de pago en Mercado Pago
     */
    public PagoDTO crearPago(
        BigDecimal monto,
        String descripcion,
        String email,
        String nombre,
        Long usuarioId,
        Long planId,
        String tipoPago
    ) {
        try {
            // Configurar cliente de Mercado Pago
            MercadoPagoConfig.setAccessToken(mercadoPagoAccessToken);
            
            // Crear items de preferencia
            PreferenceItemRequest item = PreferenceItemRequest.builder()
                .id(UUID.randomUUID().toString())
                .title(descripcion)
                .quantity(1)
                .unitPrice(new BigDecimal(monto.toString()))
                .build();
            
            // Crear preference request
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(List.of(item))
                .externalReference(UUID.randomUUID().toString())
                .build();
            
            // Crear preference
            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);
            
            // Guardar pago en BD
            String referencia = UUID.randomUUID().toString();
            Pago pago = Pago.builder()
                .referencia(referencia)
                .monto(monto)
                .descripcion(descripcion)
                .estado(Pago.EstadoPago.PENDIENTE)
                .usuarioId(usuarioId)
                .usuarioEmail(email)
                .usuarioNombre(nombre)
                .planId(planId)
                .tipoPago(Pago.TipoPago.valueOf(tipoPago))
                .preferenceId(preference.getId())
                .mercadoPagoStatus("pending")
                .intentosFallidos(0)
                .build();
            
            Pago pagGuardado = repositorioPagos.save(pago);
            
            log.info("Pago creado exitosamente: {}", referencia);
            return convertirADTO(pagGuardado);
            
        } catch (MPException | MPApiException e) {
            log.error("Error al crear preference en Mercado Pago: {}", e.getMessage());
            throw new RuntimeException("Error creando pago: " + e.getMessage());
        }
    }
    
    /**
     * Confirmar pago (webhook de Mercado Pago)
     */
    public void confirmarPago(String mercadoPagoId, String status) {
        try {
            Pago pago = repositorioPagos.findByMercadoPagoId(mercadoPagoId)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));
            
            pago.setMercadoPagoStatus(status);
            pago.setMercadoPagoId(mercadoPagoId);
            
            if ("approved".equals(status)) {
                pago.setEstado(Pago.EstadoPago.APROBADO);
                pago.setFechaPago(LocalDateTime.now());
                log.info("Pago aprobado: {}", pago.getReferencia());
            } else if ("rejected".equals(status)) {
                pago.setEstado(Pago.EstadoPago.RECHAZADO);
                pago.setIntentosFallidos(pago.getIntentosFallidos() + 1);
                log.warn("Pago rechazado: {}", pago.getReferencia());
            } else if ("pending".equals(status)) {
                pago.setEstado(Pago.EstadoPago.PROCESANDO);
            }
            
            repositorioPagos.save(pago);
        } catch (Exception e) {
            log.error("Error confirmando pago: {}", e.getMessage());
            throw new RuntimeException("Error confirmando pago");
        }
    }
    
    /**
     * Obtener pago por ID
     */
    public PagoDTO obtenerPago(Long id) {
        Pago pago = repositorioPagos.findById(id)
            .orElseThrow(() -> new RuntimeException("Pago no encontrado"));
        return convertirADTO(pago);
    }
    
    /**
     * Listar pagos del usuario
     */
    public Page<PagoDTO> listarPagosPorUsuario(Long usuarioId, Pageable pageable) {
        return repositorioPagos.findByUsuarioId(usuarioId, pageable)
            .map(this::convertirADTO);
    }
    
    /**
     * Listar pagos por estado
     */
    public Page<PagoDTO> listarPagosPorEstado(String estado, Pageable pageable) {
        Pago.EstadoPago estadoPago = Pago.EstadoPago.valueOf(estado);
        return repositorioPagos.findByEstado(estadoPago, pageable)
            .map(this::convertirADTO);
    }
    
    /**
     * Reembolsar pago
     */
    public void reembolsarPago(Long pagoId, BigDecimal monto, String motivo) {
        Pago pago = repositorioPagos.findById(pagoId)
            .orElseThrow(() -> new RuntimeException("Pago no encontrado"));
        
        if (!Pago.EstadoPago.APROBADO.equals(pago.getEstado())) {
            throw new RuntimeException("Solo se pueden reembolsar pagos aprobados");
        }
        
        pago.setEstado(Pago.EstadoPago.REEMBOLSADO);
        pago.setMontoReembolsado(monto);
        pago.setFechaReembolso(LocalDateTime.now());
        pago.setMotivoReembolso(motivo);
        
        repositorioPagos.save(pago);
        log.info("Pago reembolsado: {} - Monto: {}", pagoId, monto);
    }
    
    /**
     * Convertir entidad a DTO
     */
    private PagoDTO convertirADTO(Pago pago) {
        return PagoDTO.builder()
            .id(pago.getId())
            .referencia(pago.getReferencia())
            .monto(pago.getMonto())
            .estado(pago.getEstado().toString())
            .descripcion(pago.getDescripcion())
            .mercadoPagoId(pago.getMercadoPagoId())
            .preferenceId(pago.getPreferenceId())
            .usuarioId(pago.getUsuarioId())
            .usuarioEmail(pago.getUsuarioEmail())
            .usuarioNombre(pago.getUsuarioNombre())
            .planId(pago.getPlanId())
            .planNombre(pago.getPlanNombre())
            .tipoPago(pago.getTipoPago().toString())
            .metodoPago(pago.getMetodoPago())
            .ultimos4Digitos(pago.getUltimos4Digitos())
            .banco(pago.getBanco())
            .fechaCreacion(pago.getFechaCreacion())
            .fechaPago(pago.getFechaPago())
            .codigoAutorizacion(pago.getCodigoAutorizacion())
            .montoReembolsado(pago.getMontoReembolsado())
            .fechaReembolso(pago.getFechaReembolso())
            .build();
    }
}

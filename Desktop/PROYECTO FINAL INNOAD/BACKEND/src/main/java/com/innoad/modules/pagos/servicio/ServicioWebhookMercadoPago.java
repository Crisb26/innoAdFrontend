package com.innoad.modules.pagos.servicio;

import com.innoad.modules.pagos.dominio.Pago;
import com.innoad.modules.pagos.repositorio.RepositorioPagos;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;

/**
 * Servicio para procesar webhooks de Mercado Pago
 * Maneja notificaciones de cambio de estado de pagos
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ServicioWebhookMercadoPago {
    
    private final RepositorioPagos repositorioPagos;
    
    @Value("${mercado-pago.webhook-secret:}")
    private String webhookSecret;
    
    /**
     * Procesar webhook de Mercado Pago
     * Tipos de eventos:
     * - payment: Cambios en pagos
     * - plan: Cambios en planes
     * - subscription: Cambios en suscripciones
     * - invoice: Cambios en facturas
     */
    public void procesarWebhook(Map<String, Object> payload) {
        try {
            String type = payload.getOrDefault("type", "").toString();
            String action = payload.getOrDefault("action", "").toString();
            
            log.info("Procesando webhook Mercado Pago - Type: {}, Action: {}", type, action);
            
            if ("payment".equals(type)) {
                procesarWebhookPago(payload);
            } else if ("plan".equals(type)) {
                log.info("Webhook de plan recibido: {}", action);
            } else if ("subscription".equals(type)) {
                log.info("Webhook de suscripción recibido: {}", action);
            } else {
                log.warn("Tipo de webhook no soportado: {}", type);
            }
            
        } catch (Exception e) {
            log.error("Error procesando webhook", e);
            // No lanzar excepción para que MP reciba 200 OK
        }
    }
    
    /**
     * Procesar webhook específico de pagos
     */
    private void procesarWebhookPago(Map<String, Object> payload) {
        try {
            // El payload de MP contiene data.id con el payment_id
            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            if (data == null) {
                log.warn("No hay data en payload de pago");
                return;
            }
            
            String mercadoPagoId = data.get("id").toString();
            log.info("Procesando pago: {}", mercadoPagoId);
            
            // Buscar el pago por mercadoPagoId
            Pago pago = repositorioPagos.findByMercadoPagoId(mercadoPagoId)
                .orElseGet(() -> {
                    log.warn("Pago no encontrado en BD: {}", mercadoPagoId);
                    return null;
                });
            
            if (pago == null) return;
            
            // Actualizar estado basado en el status de MP
            String status = data.getOrDefault("status", "").toString();
            actualizarEstadoPago(pago, status);
            
        } catch (Exception e) {
            log.error("Error procesando webhook de pago", e);
        }
    }
    
    /**
     * Actualizar estado del pago según respuesta de Mercado Pago
     * Estados posibles: pending, approved, authorized, in_process, in_mediation, rejected, cancelled, refunded
     */
    private void actualizarEstadoPago(Pago pago, String statusMercadoPago) {
        try {
            log.info("Actualizando pago {} a estado: {}", pago.getReferencia(), statusMercadoPago);
            
            pago.setMercadoPagoStatus(statusMercadoPago);
            
            switch (statusMercadoPago) {
                case "approved":
                    pago.setEstado(Pago.EstadoPago.APROBADO);
                    pago.setFechaPago(LocalDateTime.now());
                    log.info("✓ Pago APROBADO: {}", pago.getReferencia());
                    // TODO: Trigger de eventos (ej: actualizar suscripción, entregar contenido)
                    break;
                    
                case "pending":
                case "in_process":
                    pago.setEstado(Pago.EstadoPago.PROCESANDO);
                    log.info("⏳ Pago PROCESANDO: {}", pago.getReferencia());
                    break;
                    
                case "authorized":
                    pago.setEstado(Pago.EstadoPago.AUTORIZADO);
                    log.info("🔒 Pago AUTORIZADO: {}", pago.getReferencia());
                    break;
                    
                case "rejected":
                case "cancelled":
                    pago.setEstado(Pago.EstadoPago.RECHAZADO);
                    pago.setIntentosFallidos(pago.getIntentosFallidos() + 1);
                    log.warn("❌ Pago RECHAZADO: {}", pago.getReferencia());
                    break;
                    
                case "refunded":
                    pago.setEstado(Pago.EstadoPago.REEMBOLSADO);
                    log.info("↩️ Pago REEMBOLSADO: {}", pago.getReferencia());
                    break;
                    
                case "in_mediation":
                    pago.setEstado(Pago.EstadoPago.EN_DISPUTA);
                    log.warn("⚖️ Pago EN_DISPUTA: {}", pago.getReferencia());
                    break;
                    
                default:
                    log.warn("Estado de pago no reconocido: {}", statusMercadoPago);
            }
            
            pago.setFechaActualizacion(LocalDateTime.now());
            repositorioPagos.save(pago);
            
        } catch (Exception e) {
            log.error("Error actualizando estado de pago", e);
        }
    }
    
    /**
     * Validar firma del webhook (seguridad HMAC SHA256)
     * La firma debe ser: HMAC SHA256 de (xRequestId + timestamp + body) con el secret de MP
     */
    public boolean validarFirmaWebhook(String signature, String xRequestId, String timestamp, String body) {
        try {
            if (webhookSecret == null || webhookSecret.isEmpty()) {
                log.warn("ADVERTENCIA: No hay webhook secret configurado. Aceptando todos los webhooks (NO SEGURO en producción)");
                return true;
            }
            
            // Construir el string a verificar: xRequestId + timestamp + body
            String stringAVerificar = xRequestId + timestamp + body;
            
            // Generar la firma HMAC SHA256
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                webhookSecret.getBytes(StandardCharsets.UTF_8),
                0,
                webhookSecret.getBytes(StandardCharsets.UTF_8).length,
                "HmacSHA256"
            );
            mac.init(secretKey);
            byte[] hash = mac.doFinal(stringAVerificar.getBytes(StandardCharsets.UTF_8));
            String expectedSignature = Base64.getEncoder().encodeToString(hash);
            
            boolean valida = signature.equals(expectedSignature);
            log.info("Validación de firma webhook: {}", valida ? "✓ VÁLIDA" : "✗ INVÁLIDA");
            
            if (!valida) {
                log.warn("Firma de webhook inválida. Esperada: {}, Recibida: {}", expectedSignature, signature);
            }
            
            return valida;
            
        } catch (Exception e) {
            log.error("Error validando firma del webhook: {}", e.getMessage());
            return false;
        }
    }
}

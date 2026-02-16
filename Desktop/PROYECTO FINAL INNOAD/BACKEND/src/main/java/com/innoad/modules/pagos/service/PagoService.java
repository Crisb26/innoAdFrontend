package com.innoad.modules.pagos.service;

import com.innoad.modules.pagos.domain.Pago;
import com.innoad.modules.pagos.domain.CarritoItem;
import com.innoad.modules.pagos.repository.PagoRepository;
import com.innoad.modules.pagos.repository.CarritoItemRepository;
import com.innoad.modules.auth.domain.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PagoService {

    private final PagoRepository pagoRepository;
    private final CarritoItemRepository carritoItemRepository;
    private final CarritoService carritoService;

    /**
     * Procesar pago desde el carrito
     */
    @Transactional
    public Pago procesarPago(Usuario usuario, String metodoPago, String referencia) {
        // Obtener carrito del usuario
        List<CarritoItem> items = carritoItemRepository.findByUsuario(usuario);

        if (items.isEmpty()) {
            throw new RuntimeException("Carrito vacío");
        }

        // Calcular monto total
        BigDecimal montoCOP = items.stream()
                .map(CarritoItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Agregar IVA (19%)
        BigDecimal iva = montoCOP.multiply(new BigDecimal("0.19"));
        montoCOP = montoCOP.add(iva);

        // Crear registro de pago
        Pago pago = Pago.builder()
                .usuario(usuario)
                .montoCOP(montoCOP)
                .metodoPago(metodoPago)
                .referencia(referencia)
                .estado(Pago.EstadoPago.PROCESANDO)
                .fechaCreacion(LocalDateTime.now())
                .build();

        Pago pagoGuardado = pagoRepository.save(pago);
        log.info("Pago iniciado: usuario={}, monto={}, metodo={}", usuario.getId(), montoCOP, metodoPago);

        // Procesar según método de pago
        try {
            procesarMetodoPago(pagoGuardado, metodoPago);
            pagoGuardado.setEstado(Pago.EstadoPago.COMPLETADO);
            pagoGuardado.setFechaProcesamiento(LocalDateTime.now());
            pagoRepository.save(pagoGuardado);

            // Vaciar carrito después de pago exitoso
            carritoService.vaciarCarrito(usuario);
            log.info("Pago completado exitosamente: id={}", pagoGuardado.getId());
        } catch (Exception e) {
            pagoGuardado.setEstado(Pago.EstadoPago.FALLIDO);
            pagoRepository.save(pagoGuardado);
            log.error("Error procesando pago: {}", e.getMessage());
            throw new RuntimeException("Error al procesar pago: " + e.getMessage());
        }

        return pagoGuardado;
    }

    /**
     * Procesar según método de pago
     */
    private void procesarMetodoPago(Pago pago, String metodo) throws Exception {
        switch (metodo.toLowerCase()) {
            case "tarjeta":
                procesarTarjeta(pago);
                break;
            case "transferencia":
                procesarTransferencia(pago);
                break;
            case "nequi":
            case "daviplata":
                procesarNequi(pago);
                break;
            case "contra":
                procesarContraEntrega(pago);
                break;
            default:
                throw new RuntimeException("Método de pago no soportado");
        }
    }

    /**
     * Procesar pago con tarjeta de crédito
     * Nota: En producción integrar con Stripe o similar
     */
    private void procesarTarjeta(Pago pago) throws Exception {
        log.info("Procesando pago con tarjeta: referencia={}", pago.getReferencia());
        // TODO: Integrar con Stripe API
        // Por ahora, simular aprobación
        Thread.sleep(500);
    }

    /**
     * Procesar pago por transferencia bancaria
     */
    private void procesarTransferencia(Pago pago) throws Exception {
        log.info("Pago por transferencia registrado: referencia={}", pago.getReferencia());
        // Transferencia manual - el técnico verifica después
        pago.setEstado(Pago.EstadoPago.PENDIENTE);
    }

    /**
     * Procesar pago con Nequi/Daviplata
     * Nota: En producción integrar con API de Bancolombia
     */
    private void procesarNequi(Pago pago) throws Exception {
        log.info("Procesando pago Nequi/Daviplata: referencia={}", pago.getReferencia());
        // TODO: Integrar con Nequi API
        Thread.sleep(500);
    }

    /**
     * Registrar pago contra entrega
     */
    private void procesarContraEntrega(Pago pago) throws Exception {
        log.info("Pago registrado como contra entrega: referencia={}", pago.getReferencia());
        pago.setEstado(Pago.EstadoPago.PENDIENTE);
    }

    /**
     * Obtener historial de pagos del usuario
     */
    public Page<Pago> obtenerHistorialPagos(Usuario usuario, Pageable pageable) {
        return pagoRepository.findByUsuario(usuario, pageable);
    }

    /**
     * Obtener pagos pendientes de verificación (admin/técnico)
     */
    public List<Pago> obtenerPagosPendientes() {
        return pagoRepository.findByEstado(Pago.EstadoPago.PENDIENTE);
    }

    /**
     * Obtener pago por ID
     */
    public Optional<Pago> obtenerPago(Long pagoId) {
        return pagoRepository.findById(pagoId);
    }

    /**
     * Verificar pago manual (para transferencias)
     */
    @Transactional
    public Pago verificarPago(Long pagoId, Boolean aprobado) {
        Pago pago = pagoRepository.findById(pagoId)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));

        if (aprobado) {
            pago.setEstado(Pago.EstadoPago.COMPLETADO);
            pago.setFechaProcesamiento(LocalDateTime.now());
            log.info("Pago verificado y aprobado: id={}", pagoId);
        } else {
            pago.setEstado(Pago.EstadoPago.CANCELADO);
            log.info("Pago rechazado: id={}", pagoId);
        }

        return pagoRepository.save(pago);
    }

    /**
     * Procesar reembolso
     */
    @Transactional
    public Pago reembolsarPago(Long pagoId, String razon) {
        Pago pago = pagoRepository.findById(pagoId)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));

        if (!pago.getEstado().equals(Pago.EstadoPago.COMPLETADO)) {
            throw new RuntimeException("Solo se pueden reembolsar pagos completados");
        }

        pago.setEstado(Pago.EstadoPago.CANCELADO);
        pago.setFechaProcesamiento(LocalDateTime.now());
        log.info("Pago reembolsado: id={}, razon={}", pagoId, razon);

        return pagoRepository.save(pago);
    }

    /**
     * Obtener estadísticas de pagos
     */
    public PagoEstadisticas obtenerEstadisticas() {
        List<Pago> pagosCompletados = pagoRepository.findByEstado(Pago.EstadoPago.COMPLETADO);
        BigDecimal totalIngresos = pagosCompletados.stream()
                .map(Pago::getMontoCOP)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return PagoEstadisticas.builder()
                .totalPagos(pagoRepository.count())
                .pagosCompletados(pagosCompletados.size())
                .totalIngresosCOP(totalIngresos)
                .montoPendiente(obtenerMontoPendiente())
                .build();
    }

    /**
     * Calcular monto pendiente de verificar
     */
    private BigDecimal obtenerMontoPendiente() {
        List<Pago> pendientes = pagoRepository.findByEstado(Pago.EstadoPago.PENDIENTE);
        return pendientes.stream()
                .map(Pago::getMontoCOP)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * DTO para estadísticas
     */
    @lombok.Data
    @lombok.Builder
    public static class PagoEstadisticas {
        private Long totalPagos;
        private Integer pagosCompletados;
        private BigDecimal totalIngresosCOP;
        private BigDecimal montoPendiente;
    }
}

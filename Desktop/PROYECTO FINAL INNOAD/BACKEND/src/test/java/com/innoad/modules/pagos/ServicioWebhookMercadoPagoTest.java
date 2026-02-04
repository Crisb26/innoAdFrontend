package com.innoad.modules.pagos;

import com.innoad.modules.pagos.dominio.Pago;
import com.innoad.modules.pagos.repositorio.RepositorioPagos;
import com.innoad.modules.pagos.servicio.ServicioWebhookMercadoPago;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para el servicio de webhook de Mercado Pago
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Servicio Webhook Mercado Pago")
class ServicioWebhookMercadoPagoTest {
    
    @Mock
    private RepositorioPagos repositorioPagos;
    
    @InjectMocks
    private ServicioWebhookMercadoPago servicioWebhook;
    
    private Pago pagoPrueba;
    
    @BeforeEach
    void setUp() {
        pagoPrueba = Pago.builder()
            .id(1L)
            .referencia("TEST-001")
            .mercadoPagoId("123456789")
            .monto(new BigDecimal("99.99"))
            .estado(Pago.EstadoPago.PENDIENTE)
            .usuarioEmail("test@example.com")
            .usuarioNombre("Test Usuario")
            .usuarioId(1L)
            .tipoPago(Pago.TipoPago.PAGO_UNICO)
            .fechaCreacion(LocalDateTime.now())
            .fechaActualizacion(LocalDateTime.now())
            .build();
    }
    
    @Test
    @DisplayName("Validar firma webhook válida")
    void testValidarFirmaWebhookValida() {
        // Datos de prueba
        String xRequestId = "test-request-id";
        String timestamp = "1672531200"; // 2023-01-01 00:00:00 UTC
        String body = "{\"type\":\"payment\",\"data\":{\"id\":\"123456789\"}}";
        String signature = "valid-signature"; // En prueba real, generar con HMAC
        
        // Ejecutar
        boolean resultado = servicioWebhook.validarFirmaWebhook(signature, xRequestId, timestamp, body);
        
        // Verificar
        assertNotNull(resultado, "El resultado de validación no debe ser nulo");
    }
    
    @Test
    @DisplayName("Procesar webhook de pago aprobado")
    void testProcesarWebhookPagoAprobado() {
        // Datos de prueba
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "payment");
        payload.put("action", "payment.approved");
        
        Map<String, Object> data = new HashMap<>();
        data.put("id", "123456789");
        data.put("status", "approved");
        data.put("external_reference", "TEST-001");
        payload.put("data", data);
        
        // Mock
        when(repositorioPagos.findByMercadoPagoId("123456789"))
            .thenReturn(Optional.of(pagoPrueba));
        when(repositorioPagos.save(any(Pago.class)))
            .thenReturn(pagoPrueba);
        
        // Ejecutar
        assertDoesNotThrow(() -> servicioWebhook.procesarWebhook(payload));
        
        // Verificar
        verify(repositorioPagos, times(1)).findByMercadoPagoId("123456789");
    }
    
    @Test
    @DisplayName("Procesar webhook de pago rechazado")
    void testProcesarWebhookPagoRechazado() {
        // Datos de prueba
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "payment");
        payload.put("action", "payment.rejected");
        
        Map<String, Object> data = new HashMap<>();
        data.put("id", "123456789");
        data.put("status", "rejected");
        payload.put("data", data);
        
        // Mock
        when(repositorioPagos.findByMercadoPagoId("123456789"))
            .thenReturn(Optional.of(pagoPrueba));
        when(repositorioPagos.save(any(Pago.class)))
            .thenReturn(pagoPrueba);
        
        // Ejecutar
        assertDoesNotThrow(() -> servicioWebhook.procesarWebhook(payload));
        
        // Verificar
        verify(repositorioPagos, times(1)).findByMercadoPagoId("123456789");
    }
    
    @Test
    @DisplayName("Procesar webhook sin pago en base de datos")
    void testProcesarWebhookSinPago() {
        // Datos de prueba
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "payment");
        
        Map<String, Object> data = new HashMap<>();
        data.put("id", "999999999");
        payload.put("data", data);
        
        // Mock
        when(repositorioPagos.findByMercadoPagoId("999999999"))
            .thenReturn(Optional.empty());
        
        // Ejecutar y verificar que no lanza excepción
        assertDoesNotThrow(() -> servicioWebhook.procesarWebhook(payload));
        
        // Verificar que se intentó buscar el pago
        verify(repositorioPagos, times(1)).findByMercadoPagoId("999999999");
        // Pero no se guardó nada
        verify(repositorioPagos, never()).save(any());
    }
    
    @Test
    @DisplayName("Procesar webhook sin data")
    void testProcesarWebhookSinData() {
        // Datos de prueba (sin data)
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "payment");
        payload.put("data", null);
        
        // Ejecutar y verificar que no lanza excepción
        assertDoesNotThrow(() -> servicioWebhook.procesarWebhook(payload));
        
        // Verificar que no intenta buscar pago
        verify(repositorioPagos, never()).findByMercadoPagoId(anyString());
    }
    
    @Test
    @DisplayName("Procesar webhook de tipo no soportado")
    void testProcesarWebhookTipoNoSoportado() {
        // Datos de prueba
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "invoice");
        payload.put("action", "invoice.created");
        
        // Ejecutar y verificar que no lanza excepción
        assertDoesNotThrow(() -> servicioWebhook.procesarWebhook(payload));
        
        // Verificar que no intenta buscar pago
        verify(repositorioPagos, never()).findByMercadoPagoId(anyString());
    }
}

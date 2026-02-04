package com.innoad.modules.mantenimiento.controlador;

import com.innoad.modules.mantenimiento.dto.AlertaDTO;
import com.innoad.modules.mantenimiento.servicio.ServicioAlerta;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.util.List;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ControladorWebSocketAlertas {

    private final ServicioAlerta servicioAlerta;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Suscribirse a alertas en tiempo real
     * Cliente se conecta a: /topic/alertas
     */
    @MessageMapping("/alertas/suscribir")
    @SendTo("/topic/alertas")
    public List<AlertaDTO> suscribirseAAlertas() {
        log.info("Cliente suscrito a alertas en tiempo real");
        return servicioAlerta.obtenerAlertasActivas();
    }

    /**
     * Suscribirse a alertas críticas específicamente
     * Cliente se conecta a: /topic/alertas/criticas
     */
    @MessageMapping("/alertas/criticas/suscribir")
    @SendTo("/topic/alertas/criticas")
    public List<AlertaDTO> suscribirseAAlertasCriticas() {
        log.info("Cliente suscrito a alertas críticas en tiempo real");
        return servicioAlerta.obtenerAlertasCriticas();
    }

    /**
     * Suscribirse a alertas de un dispositivo específico
     * Cliente se conecta a: /topic/alertas/dispositivo/{dispositivoId}
     */
    @MessageMapping("/alertas/dispositivo/{dispositivoId}")
    @SendTo("/topic/alertas/dispositivo/{dispositivoId}")
    public AlertaDTO recibirAlertasDispositivo(@DestinationVariable String dispositivoId, AlertaDTO alerta) {
        log.info("Alerta recibida para dispositivo: {}", dispositivoId);
        return alerta;
    }

    /**
     * Notificar nueva alerta a todos los clientes conectados
     */
    public void notificarNuevaAlerta(AlertaDTO alerta) {
        try {
            messagingTemplate.convertAndSend("/topic/alertas", alerta);
            
            if (alerta.getTipo().name().equals("CRITICA")) {
                messagingTemplate.convertAndSend("/topic/alertas/criticas", alerta);
            }
            
            if (alerta.getDispositivoId() != null) {
                messagingTemplate.convertAndSend(
                    "/topic/alertas/dispositivo/" + alerta.getDispositivoId(),
                    alerta
                );
            }
            
            log.info("Alerta notificada a través de WebSocket: {}", alerta.getId());
        } catch (Exception e) {
            log.error("Error notificando alerta", e);
        }
    }

    /**
     * Notificar resolución de alerta
     */
    public void notificarResolucionAlerta(AlertaDTO alerta) {
        try {
            messagingTemplate.convertAndSend("/topic/alertas/resueltas", alerta);
            log.info("Resolución de alerta notificada: {}", alerta.getId());
        } catch (Exception e) {
            log.error("Error notificando resolución", e);
        }
    }

    /**
     * Notificar escalamiento de alerta
     */
    public void notificarEscalamientoAlerta(AlertaDTO alerta) {
        try {
            messagingTemplate.convertAndSend("/topic/alertas/escaladas", alerta);
            log.info("Escalamiento de alerta notificado: {}", alerta.getId());
        } catch (Exception e) {
            log.error("Error notificando escalamiento", e);
        }
    }
}

package com.innoad.shared.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class InterceptorRateLimitingHandlerImpl implements HandlerInterceptor {
    
    private static final int LIMITE_SOLICITUDES = 100;
    private static final long VENTANA_TIEMPO = 60000; // 1 minuto
    private static final int SC_TOO_MANY_REQUESTS = 429;
    private final Map<String, Queue<Long>> solicitudesPorIP = new ConcurrentHashMap<>();
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String ipCliente = obtenerIPCliente(request);
        
        if (excedelimite(ipCliente)) {
            log.warn("Rate limit excedido para IP: {}", ipCliente);
            response.setStatus(SC_TOO_MANY_REQUESTS);
            response.getWriter().write("Rate limit excedido. Intenta más tarde.");
            return false;
        }
        
        registrarSolicitud(ipCliente);
        return true;
    }
    
    private String obtenerIPCliente(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
    
    private boolean excedelimite(String ip) {
        Queue<Long> solicitudes = solicitudesPorIP.getOrDefault(ip, new LinkedList<>());
        long ahora = System.currentTimeMillis();
        
        // Eliminar solicitudes fuera de la ventana de tiempo
        while (!solicitudes.isEmpty() && ahora - solicitudes.peek() > VENTANA_TIEMPO) {
            solicitudes.poll();
        }
        
        return solicitudes.size() >= LIMITE_SOLICITUDES;
    }
    
    private void registrarSolicitud(String ip) {
        Queue<Long> solicitudes = solicitudesPorIP.computeIfAbsent(ip, k -> new LinkedList<>());
        solicitudes.offer(System.currentTimeMillis());
    }
}

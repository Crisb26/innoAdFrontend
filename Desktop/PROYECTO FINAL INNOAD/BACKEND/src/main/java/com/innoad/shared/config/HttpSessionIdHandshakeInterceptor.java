package com.innoad.shared.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import jakarta.servlet.http.HttpSession;
import java.util.Map;

/**
 * Interceptor para capturar la sesión HTTP en el handshake de WebSocket
 */
@Slf4j
public class HttpSessionIdHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes)
            throws Exception {

        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            HttpSession session = servletRequest.getServletRequest().getSession(false);

            if (session != null) {
                attributes.put("sessionId", session.getId());
                log.debug("WebSocket handshake - Sesión capturada: {}", session.getId());
            } else {
                log.debug("WebSocket handshake - Sin sesión HTTP");
            }
        }

        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                              WebSocketHandler wsHandler, Exception exception) {
        if (exception != null) {
            log.error("Error en WebSocket handshake: {}", exception.getMessage());
        } else {
            log.info("WebSocket handshake completado exitosamente");
        }
    }
}

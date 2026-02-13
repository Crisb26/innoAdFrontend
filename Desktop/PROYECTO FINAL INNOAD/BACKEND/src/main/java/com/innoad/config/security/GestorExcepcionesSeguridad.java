package com.innoad.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class GestorExcepcionesSeguridad implements AuthenticationEntryPoint {
    
    private final ObjectMapper objectMapper;
    
    @Override
    public void commence(HttpServletRequest request, 
                        HttpServletResponse response,
                        AuthenticationException authException) throws IOException, ServletException {
        
        log.warn("Intento de acceso no autorizado desde IP: {} hacia: {}", 
            obtenerIPReal(request), request.getRequestURI());
        
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        
        Map<String, Object> errorDetails = Map.of(
            "timestamp", System.currentTimeMillis(),
            "status", HttpServletResponse.SC_UNAUTHORIZED,
            "error", "No autorizado",
            "mensaje", "Token JWT no válido o ausente",
            "ruta", request.getRequestURI()
        );
        
        response.getWriter().write(objectMapper.writeValueAsString(errorDetails));
    }
    
    private String obtenerIPReal(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress;
    }
}

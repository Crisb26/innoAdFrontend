package com.innoad.config.security;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@Slf4j
@RequiredArgsConstructor
public class InterceptorRateLimitLogin implements HandlerInterceptor {
    
    private final Bucket loginRateLimiter;
    
    @Override
    public boolean preHandle(HttpServletRequest request, 
                           jakarta.servlet.http.HttpServletResponse response, 
                           Object handler) throws Exception {
        
        // Solo aplicar rate limit a login
        if (request.getRequestURI().contains("/api/autenticacion/login")) {
            String clientIP = obtenerIPReal(request);
            
            ConsumptionProbe probe = loginRateLimiter.tryConsumeAndReturnRemaining(1);

            if (!probe.isConsumed()) {
                // Convertir nanosegundos a segundos
                long segundosFaltantes = probe.getNanosToWaitForRefill() / 1_000_000_000;

                log.warn("Rate limit excedido en login desde IP: {}", clientIP);

                response.setStatus(429); // Too Many Requests
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Demasiados intentos de login. Intenta en " +
                    segundosFaltantes + " segundos\"}");

                return false;
            }
        }
        
        return true;
    }
    
    private String obtenerIPReal(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress;
    }
}

package com.innoad.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.innoad.config.jwt.ProveedorTokenJWT;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
@RequiredArgsConstructor
public class FiltroJWT extends OncePerRequestFilter {
    
    private final ProveedorTokenJWT proveedorToken;
    private final UserDetailsService userDetailsService;
    private final Bucket apiRateLimiter;
    private final ObjectMapper objectMapper;
    
    // Rate limiter por IP
    private final Map<String, Bucket> rateLimitersPorIP = new ConcurrentHashMap<>();
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        try {
            // ==================== VERIFICAR RATE LIMIT POR IP ====================
            String clientIP = obtenerIPReal(request);
            if (!verificarRateLimit(clientIP)) {
                response.setStatus(429); // 429 Too Many Requests
                response.setContentType("application/json");
                response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                    "error", "Demasiadas solicitudes desde tu IP",
                    "mensaje", "Has excedido el límite de 100 requests por minuto"
                )));
                return;
            }
            
            // ==================== OBTENER Y VALIDAR TOKEN ====================
            String token = obtenerToken(request);
            
            if (token != null && proveedorToken.validarToken(token)) {
                String nombreUsuario = proveedorToken.obtenerNombreUsuario(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(nombreUsuario);
                
                UsernamePasswordAuthenticationToken auth = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                    );
                
                SecurityContextHolder.getContext().setAuthentication(auth);
                
                // Registrar acceso en log de auditoría
                log.info("Usuario autenticado: {}, IP: {}, Ruta: {}", 
                    nombreUsuario, clientIP, request.getRequestURI());
            }
            
            filterChain.doFilter(request, response);
            
        } catch (Exception e) {
            log.error("Error en filtro JWT: {}", e.getMessage(), e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                "error", "Token inválido",
                "mensaje", e.getMessage()
            )));
        }
    }
    
    /**
     * Verifica el rate limit para una IP
     */
    private boolean verificarRateLimit(String clientIP) {
        Bucket bucket = rateLimitersPorIP.computeIfAbsent(clientIP, 
            ip -> Bucket4j.builder()
                .addLimit(Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1))))
                .build()
        );
        
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        return probe.isConsumed();
    }
    
    /**
     * Obtiene la IP real del cliente (considerando proxies)
     */
    private String obtenerIPReal(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        
        if (ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0];
        }
        
        return ipAddress.trim();
    }
    
    /**
     * Extrae el token JWT del header Authorization
     */
    private String obtenerToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }
}

package com.innoad.modules.mantenimiento.filtro;

import com.innoad.modules.mantenimiento.repositorio.RepositorioMantenimiento;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class FiltroMantenimiento implements Filter {
    
    private final RepositorioMantenimiento repositorioMantenimiento;
    private final ObjectMapper objectMapper;
    
    private static final String[] ENDPOINTS_LECTURA = {
        "/api/v1/campanas", "/api/v1/pantallas", "/api/v1/contenidos",
        "/api/v1/reportes", "/api/v1/usuarios"
    };
    
    private static final String[] ENDPOINTS_GRAFICOS = {
        "/api/v1/graficos"
    };
    
    private static final String[] ENDPOINTS_PUBLICACION = {
        "/api/v1/campanas", "/api/v1/contenidos", "/api/v1/reportes"
    };
    
    private static final String[] ENDPOINTS_DESCARGA = {
        "/api/v1/reportes/descargar", "/descargar"
    };
    
    private static final String[] ENDPOINTS_EXCEPTO = {
        "/api/v1/mantenimiento/estado",
        "/api/v1/mantenimiento/verificar-acceso",
        "/api/v1/autenticacion",
        "/api/v1/usuarios/registrar",
        "/swagger-ui", "/v3/api-docs"
    };
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String requestURI = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();
        
        // Verificar si el endpoint está excepto
        if (estaExcepto(requestURI)) {
            chain.doFilter(request, response);
            return;
        }
        
        // Obtener mantenimiento activo
        var mantenimiento = repositorioMantenimiento.getMantenimientoActivo();
        
        if (mantenimiento.isPresent()) {
            var m = mantenimiento.get();
            
            // Si está activo, verificar permisos
            boolean bloqueado = false;
            String razonBloqueo = "";
            
            // Revisar cada restricción
            if (m.getBloqueaGraficos() && esEndpointGraficos(requestURI)) {
                bloqueado = true;
                razonBloqueo = "Gráficos deshabilitados durante mantenimiento";
            } else if (m.getBloqueaPublicacion() && esEndpointPublicacion(requestURI) && esOperacionEscritura(method)) {
                bloqueado = true;
                razonBloqueo = "Publicación deshabilitada durante mantenimiento";
            } else if (m.getBloqueaDescarga() && esEndpointDescarga(requestURI)) {
                bloqueado = true;
                razonBloqueo = "Descarga deshabilitada durante mantenimiento";
            } else if (!m.getPermiteLectura() && esOperacionLectura(method)) {
                // Si no permite lectura y es GET/HEAD, bloquear
                if (esEndpointLectura(requestURI)) {
                    bloqueado = true;
                    razonBloqueo = "Sistema en mantenimiento - " + m.getMensaje();
                }
            }
            
            if (bloqueado) {
                httpResponse.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
                httpResponse.setContentType("application/json;charset=UTF-8");
                
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", razonBloqueo);
                errorResponse.put("mantenimiento", true);
                errorResponse.put("motivo", m.getMotivo());
                errorResponse.put("mensaje", m.getMensaje());
                
                httpResponse.getWriter().write(objectMapper.writeValueAsString(errorResponse));
                return;
            }
        }
        
        chain.doFilter(request, response);
    }
    
    private boolean estaExcepto(String uri) {
        for (String excepto : ENDPOINTS_EXCEPTO) {
            if (uri.contains(excepto)) {
                return true;
            }
        }
        return false;
    }
    
    private boolean esEndpointLectura(String uri) {
        for (String endpoint : ENDPOINTS_LECTURA) {
            if (uri.contains(endpoint)) {
                return true;
            }
        }
        return false;
    }
    
    private boolean esEndpointGraficos(String uri) {
        for (String endpoint : ENDPOINTS_GRAFICOS) {
            if (uri.contains(endpoint)) {
                return true;
            }
        }
        return false;
    }
    
    private boolean esEndpointPublicacion(String uri) {
        for (String endpoint : ENDPOINTS_PUBLICACION) {
            if (uri.contains(endpoint)) {
                return true;
            }
        }
        return false;
    }
    
    private boolean esEndpointDescarga(String uri) {
        for (String endpoint : ENDPOINTS_DESCARGA) {
            if (uri.contains(endpoint)) {
                return true;
            }
        }
        return false;
    }
    
    private boolean esOperacionLectura(String method) {
        return "GET".equals(method) || "HEAD".equals(method);
    }
    
    private boolean esOperacionEscritura(String method) {
        return "POST".equals(method) || "PUT".equals(method) || 
               "PATCH".equals(method) || "DELETE".equals(method);
    }
}

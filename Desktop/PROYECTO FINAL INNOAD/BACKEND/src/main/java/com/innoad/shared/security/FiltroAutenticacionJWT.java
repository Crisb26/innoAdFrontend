package com.innoad.shared.security;

import com.innoad.modules.auth.service.ServicioJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro de autenticación JWT que intercepta todas las peticiones HTTP.
 * Valida el token JWT y establece el contexto de seguridad.
 */
@Component
@RequiredArgsConstructor
public class FiltroAutenticacionJWT extends OncePerRequestFilter {
    
    private final ServicioJWT servicioJWT;
    private final UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        // Log de la petición (útil para debugging)
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        // Rutas públicas que no necesitan token JWT
        if (esRutaPublica(path)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Obtener el header de autorización
        final String authHeader = request.getHeader("Authorization");
        
        // Si no hay header o no empieza con "Bearer ", continuar sin autenticar
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            // Extraer el token
            final String jwt = authHeader.substring(7);
            final String nombreUsuario = servicioJWT.extraerNombreUsuario(jwt);
            
            // Si hay nombre de usuario y no hay autenticación actual
            if (nombreUsuario != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Cargar los detalles del usuario
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(nombreUsuario);
                
                // Validar el token
                if (servicioJWT.esTokenValido(jwt, userDetails)) {
                    // Crear el token de autenticación
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    
                    // Establecer detalles adicionales
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Establecer la autenticación en el contexto de seguridad
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Limpiar el contexto de seguridad en caso de error
            SecurityContextHolder.clearContext();
        }
        
        // Continuar con la cadena de filtros
        filterChain.doFilter(request, response);
    }
    
    /**
     * Verifica si la ruta es pública y no requiere autenticación JWT
     */
    private boolean esRutaPublica(String path) {
        return path.startsWith("/api/v1/auth/") ||
               path.startsWith("/api/v1/autenticacion/") ||  // Alias por compatibilidad
               path.startsWith("/api/autenticacion/") ||      // Alias legacy
               path.startsWith("/api/v1/raspberry/") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/v3/api-docs") ||
               path.startsWith("/api-docs") ||
               path.startsWith("/actuator") ||
               path.startsWith("/h2-console") ||
               path.startsWith("/uploads") ||
               path.startsWith("/static") ||
               path.equals("/error") ||
               path.equals("/favicon.ico") ||
               path.equals("/api/mantenimiento/estado");
    }
}

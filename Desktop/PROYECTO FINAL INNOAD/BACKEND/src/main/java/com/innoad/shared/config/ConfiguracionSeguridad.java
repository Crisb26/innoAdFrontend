package com.innoad.shared.config;

import com.innoad.shared.security.FiltroAutenticacionJWT;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * ❌ CLASE DESACTIVADA - NO SE USA ❌
 *
 * RAZÓN: Conflicto con ConfiguracionSeguridadAvanzada
 * REEMPLAZO: com.innoad.config.security.ConfiguracionSeguridadAvanzada
 *
 * Esta clase quedó obsoleta después del refactor de seguridad.
 * Todas las anotaciones @Configuration fueron removidas para que Spring ignore esta clase.
 *
 * NO ELIMINAR: Se mantiene como referencia histórica.
 */
//@Configuration  // ❌ DESACTIVADO
//@EnableWebSecurity  // ❌ DESACTIVADO
//@EnableMethodSecurity  // ❌ DESACTIVADO
@RequiredArgsConstructor
@Deprecated(since = "2.0.0", forRemoval = true)
public class ConfiguracionSeguridad {
    
    private final FiltroAutenticacionJWT filtroJwt;
    private final UserDetailsService userDetailsService;
    
    //@Bean  // ❌ DESACTIVADO - bean definido en ConfiguracionSeguridadAvanzada
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // ===== ENDPOINTS PÚBLICOS (SIN AUTENTICACIÓN) =====
                        .requestMatchers(
                                // Autenticación y registro (estándar REST)
                                "/api/v1/auth/**",
                                "/api/auth/**",  // Soporte para frontends sin versión
                                
                                // Alias por compatibilidad (deprecar eventualmente)
                                "/api/autenticacion/**",
                                "/api/v1/autenticacion/**",
                                
                                // Raspberry Pi
                                "/api/v1/raspberry/**",
                                
                                // Mantenimiento público
                                "/api/mantenimiento/estado",
                                
                                // Documentación
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/api-docs/**",
                                
                                // Actuator y salud
                                "/actuator/**",
                                "/actuator/health/**",
                                
                                // H2 Console (solo desarrollo)
                                "/h2-console/**",
                                
                                // Archivos estáticos
                                "/uploads/**",
                                "/static/**",
                                
                                // Error handling
                                "/error",
                                "/favicon.ico"
                        ).permitAll()

                        // ===== ENDPOINTS ADMINISTRATIVOS =====
                        .requestMatchers(
                                "/api/admin/**", 
                                "/api/v1/admin/**",
                                "/api/mantenimiento/activar", 
                                "/api/mantenimiento/desactivar"
                        ).hasRole("ADMINISTRADOR")

                        // ===== ENDPOINTS TÉCNICOS =====
                        .requestMatchers("/api/tecnico/**", "/api/v1/tecnico/**")
                        .hasAnyRole("ADMINISTRADOR", "TECNICO", "DESARROLLADOR")

                        // ===== ENDPOINTS AUTENTICADOS =====
                        .requestMatchers(
                                "/api/v1/pantallas/**", 
                                "/api/v1/contenidos/**",
                                "/api/v1/campaigns/**",
                                "/api/v1/stats/**"
                        ).authenticated()

                        // Resto de endpoints requieren autenticación
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                // Deshabilitar headers de seguridad para H2 Console (solo desarrollo)
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin())
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(filtroJwt, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    //@Bean  // ❌ DESACTIVADO - bean definido en ConfiguracionSeguridadAvanzada
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    //@Bean  // ❌ DESACTIVADO - se obtiene automáticamente de AuthenticationConfiguration
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    //@Bean  // ❌ DESACTIVADO - bean definido en ConfiguracionSeguridadAvanzada
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    //@Bean  // ❌ DESACTIVADO - bean definido en ConfiguracionSeguridadAvanzada
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Origenes permitidos (desarrollo, servidor casero y emergencia cloud)
        configuration.setAllowedOriginPatterns(Arrays.asList(
                // === Desarrollo local ===
                "http://localhost:*",                       // Desarrollo local (cualquier puerto)
                "http://localhost",                          // Desarrollo local sin puerto
                "http://127.0.0.1:*",                      // Desarrollo local IP
                "http://127.0.0.1",                         // Desarrollo local IP sin puerto

                // === Servidor casero (redes privadas) ===
                "http://192.168.*:*",                       // Red privada clase C con puerto
                "http://192.168.*",                          // Red privada clase C sin puerto
                "http://10.*:*",                             // Red privada clase A con puerto
                "http://10.*",                               // Red privada clase A sin puerto
                "http://172.16.*:*",                         // Red privada clase B con puerto
                "http://172.16.*",                           // Red privada clase B sin puerto
                "http://*.local:*",                          // mDNS / Bonjour
                "http://*.local",                            // mDNS / Bonjour sin puerto

                // === Emergencia: Cloud (Azure / Netlify) ===
                "https://innoad.com",                       // Dominio produccion
                "https://www.innoad.com",                   // Dominio produccion con www
                "https://*.netlify.app",                    // Netlify deployment (EMERGENCIA)
                "https://*.azurecontainerapps.io",          // Azure Container Apps (EMERGENCIA)
                "https://*.vercel.app"                      // Vercel deployment (EMERGENCIA)
        ));
        
        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
        ));
        
        // Headers permitidos
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "Cache-Control",
                "Origin",
                "X-Auth-Token"
        ));
        
        // Headers expuestos al cliente
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Disposition",
                "X-Total-Count"
        ));
        
        // Permitir credenciales (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // Cache de configuración CORS (1 hora)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

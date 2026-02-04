package com.innoad.config.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Duration;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class ConfiguracionSeguridadAvanzada {
    
    private final FiltroJWT filtroJWT;
    private final GestorExcepcionesSeguridad gestorExcepciones;
    
    /**
     * Encriptador BCrypt con fuerza máxima (12 rounds)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
    
    /**
     * Configuración de cadena de seguridad HTTP
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // ==================== CORS CONFIGURATION ====================
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // ==================== CSRF PROTECTION ====================
            .csrf(csrf -> csrf.disable()) // Deshabilitado para APIs REST con JWT
            
            // ==================== SESSION MANAGEMENT ====================
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // ==================== SECURITY HEADERS ====================
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'")
                )
                .xssProtection(xss -> xss
                    .disable()
                )
                .frameOptions(frame -> frame
                    .deny()
                )
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000)
                )
            )
            
            // ==================== ENDPOINT SECURITY ====================
            .authorizeHttpRequests(authz -> authz
                // Públicos
                .requestMatchers(
                    "/api/public/**",
                    "/api/autenticacion/registrar",
                    "/api/autenticacion/login",
                    "/api/autenticacion/refresh-token",
                    "/api/salud",
                    "/swagger-ui/**",
                    "/v3/api-docs/**"
                ).permitAll()
                
                // Admin
                .requestMatchers(
                    "/api/admin/**"
                ).hasRole("ADMIN")
                
                // Autenticados
                .requestMatchers(
                    "/api/usuario/**",
                    "/api/campanas/**",
                    "/api/contenidos/**",
                    "/api/pantallas/**",
                    "/api/reportes/**"
                ).authenticated()
                
                // Resto requiere autenticación
                .anyRequest().authenticated()
            )
            
            // ==================== JWT FILTER ====================
            .addFilterBefore(filtroJWT, UsernamePasswordAuthenticationFilter.class)
            
            // ==================== EXCEPTION HANDLING ====================
            .exceptionHandling(exceptionHandling -> exceptionHandling
                .authenticationEntryPoint(gestorExcepciones)
            );
        
        return http.build();
    }
    
    /**
     * CORS Configuration - Solo dominios autorizados
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Solo estos orígenes pueden acceder
        config.setAllowedOrigins(Arrays.asList(
            "https://innoadfrontend.netlify.app",
            "https://localhost:4200",
            "http://localhost:4200"
        ));
        
        // Métodos permitidos
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Headers permitidos
        config.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // Headers expuestos
        config.setExposedHeaders(Arrays.asList(
            "Authorization",
            "X-Total-Count",
            "X-Page-Number"
        ));
        
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // 1 hora de caché
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
    
    /**
     * Rate Limiter para login - 5 intentos cada 15 minutos
     */
    @Bean(name = "loginRateLimiter")
    public Bucket loginRateLimiter() {
        Bandwidth limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(15)));
        return Bucket4j.builder()
            .addLimit(limit)
            .build();
    }
    
    /**
     * Rate Limiter para API general - 100 requests por minuto
     */
    @Bean(name = "apiRateLimiter")
    public Bucket apiRateLimiter() {
        Bandwidth limit = Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1)));
        return Bucket4j.builder()
            .addLimit(limit)
            .build();
    }
}

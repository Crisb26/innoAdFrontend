package com.innoad.modules.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Servicio para la gestión de tokens JWT.
 * Proporciona métodos para generar, validar y extraer información de tokens.
 */
@Service
public class ServicioJWT {
    
    @Value("${jwt.secret}")
    private String secretKey;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;
    
    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;
    
    /**
     * Extrae el nombre de usuario del token
     */
    public String extraerNombreUsuario(String token) {
        return extraerClaim(token, Claims::getSubject);
    }
    
    /**
     * Extrae un claim específico del token
     */
    public <T> T extraerClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extraerTodosLosClaims(token);
        return claimsResolver.apply(claims);
    }
    
    /**
     * Genera un token para el usuario
     */
    public String generarToken(UserDetails userDetails) {
        return generarToken(new HashMap<>(), userDetails);
    }
    
    /**
     * Genera un token con claims adicionales
     */
    public String generarToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return construirToken(extraClaims, userDetails, jwtExpiration);
    }
    
    /**
     * Genera un token de refresh
     */
    public String generarTokenRefresh(UserDetails userDetails) {
        return construirToken(new HashMap<>(), userDetails, refreshExpiration);
    }
    
    /**
     * Construye el token JWT
     */
    private String construirToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails,
            long expiration
    ) {
    return Jwts
        .builder()
        .claims(extraClaims)
        .subject(userDetails.getUsername())
        .issuedAt(new Date(System.currentTimeMillis()))
        .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), Jwts.SIG.HS256)
        .compact();
    }
    
    /**
     * Valida si el token es válido para el usuario
     */
    public boolean esTokenValido(String token, UserDetails userDetails) {
        final String username = extraerNombreUsuario(token);
        return (username.equals(userDetails.getUsername())) && !esTokenExpirado(token);
    }
    
    /**
     * Verifica si el token ha expirado
     */
    private boolean esTokenExpirado(String token) {
        return extraerExpiracion(token).before(new Date());
    }
    
    /**
     * Extrae la fecha de expiración del token
     */
    private Date extraerExpiracion(String token) {
        return extraerClaim(token, Claims::getExpiration);
    }
    
    /**
     * Extrae todos los claims del token
     */
    private Claims extraerTodosLosClaims(String token) {
    return Jwts
        .parser()
        .verifyWith((SecretKey) getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    /**
     * Obtiene la clave de firma
     */
    private SecretKey getSignInKey() {
        try {
            // Intentar decodificar como Base64 (configuración recomendada)
            byte[] keyBytes = Decoders.BASE64.decode(secretKey);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (IllegalArgumentException ex) {
            // Si no es Base64 válida, usar la representación en bytes del texto (fallback)
            byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
            return Keys.hmacShaKeyFor(keyBytes);
        }
    }
}

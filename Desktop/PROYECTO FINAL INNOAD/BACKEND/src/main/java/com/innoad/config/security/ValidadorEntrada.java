package com.innoad.config.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
@Slf4j
public class ValidadorEntrada {
    
    // Patrones de validación
    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    
    private static final Pattern USUARIO_PATTERN = 
        Pattern.compile("^[a-zA-Z0-9_-]{3,20}$");
    
    private static final Pattern CONTRASEÑA_FUERTE_PATTERN =
        Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");
    
    private static final Pattern SQL_INJECTION_PATTERN =
        Pattern.compile("('|(\\-\\-)|(;)|(\\|\\|)|(\\*)|(\\*)|(DROP)|(INSERT)|(UPDATE)|(DELETE)|" +
                       "(SELECT)|(UNION)|(EXEC)|(EXECUTE))", Pattern.CASE_INSENSITIVE);
    
    private static final Pattern XSS_PATTERN =
        Pattern.compile("<[^>]*>|javascript:|onerror=|onload=|onclick=");
    
    /**
     * Valida un email
     */
    public boolean esEmailValido(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }
    
    /**
     * Valida un nombre de usuario
     */
    public boolean esUsuarioValido(String usuario) {
        if (usuario == null || usuario.isEmpty()) {
            return false;
        }
        return USUARIO_PATTERN.matcher(usuario).matches();
    }
    
    /**
     * Valida que la contraseña sea fuerte
     * Requisitos: Min 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial
     */
    public boolean esContraseñaFuerte(String contraseña) {
        if (contraseña == null || contraseña.isEmpty()) {
            return false;
        }
        return CONTRASEÑA_FUERTE_PATTERN.matcher(contraseña).matches();
    }
    
    /**
     * Detecta intentos de SQL Injection
     */
    public boolean contieneSQLInjection(String input) {
        if (input == null) {
            return false;
        }
        return SQL_INJECTION_PATTERN.matcher(input).find();
    }
    
    /**
     * Detecta intentos de XSS
     */
    public boolean contieneXSS(String input) {
        if (input == null) {
            return false;
        }
        return XSS_PATTERN.matcher(input).find();
    }
    
    /**
     * Sanitiza entrada eliminando caracteres peligrosos
     */
    public String sanitizar(String input) {
        if (input == null) {
            return "";
        }
        
        return input
            .replaceAll("<[^>]*>", "") // Elimina HTML tags
            .replaceAll("javascript:", "")
            .replaceAll("onerror=", "")
            .replaceAll("onload=", "")
            .replaceAll("onclick=", "")
            .trim();
    }
    
    /**
     * Valida que no sea NULL o vacío
     */
    public boolean noEstaVacio(String valor) {
        return valor != null && !valor.trim().isEmpty();
    }
    
    /**
     * Valida longitud máxima
     */
    public boolean cumpleLongitudMaxima(String valor, int longitud) {
        return valor != null && valor.length() <= longitud;
    }
}

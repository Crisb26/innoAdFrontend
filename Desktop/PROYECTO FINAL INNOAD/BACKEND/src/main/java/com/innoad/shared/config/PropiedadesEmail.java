package com.innoad.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;
import lombok.Setter;

/**
 * Propiedades de Email/SMTP cargadas desde variables de entorno y application.yml
 */
@Configuration
@ConfigurationProperties(prefix = "mail")
@Getter
@Setter
public class PropiedadesEmail {
    
    private String host;
    private Integer port = 587;
    private String username;
    private String password;
    private String from = "soporte@innoad.com";
    private String fromName = "InnoAd - Soporte";
    private Boolean auth = true;
    private Boolean startTlsEnable = true;
    private Boolean startTlsRequired = true;
    private Integer maxRetries = 3;
    private Integer retryDelayMs = 2000;
    private Boolean debug = false;
    private Integer timeoutMs = 10000;
    private Integer connectionTimeoutMs = 5000;
    
    // Validación
    public void validar() {
        if (host == null || host.isBlank()) {
            throw new IllegalArgumentException("Mail SMTP host no configurado. Establece MAIL_HOST");
        }
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Mail username no configurado. Establece MAIL_USERNAME");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Mail password no configurado. Establece MAIL_PASSWORD");
        }
        if (port <= 0 || port > 65535) {
            throw new IllegalArgumentException("Mail port debe estar entre 1 y 65535");
        }
    }
}

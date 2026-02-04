package com.innoad.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;
import lombok.Setter;

/**
 * Propiedades de OpenAI cargadas desde variables de entorno y application.yml
 * Ej: OPENAI_API_KEY o openai.api-key en las propiedades
 */
@Configuration
@ConfigurationProperties(prefix = "openai")
@Getter
@Setter
public class PropiedadesOpenAI {
    
    private String apiKey;
    private String apiUrl = "https://api.openai.com/v1";
    private String model = "gpt-4";
    private Integer maxTokens = 2000;
    private Float temperature = 0.7f;
    private Integer timeoutSeconds = 30;
    private Integer maxRetries = 3;
    private Integer retryDelayMs = 1000;
    
    // Validación
    public void validar() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("OpenAI API Key no configurada. Establece OPENAI_API_KEY");
        }
        if (maxTokens <= 0 || maxTokens > 4000) {
            throw new IllegalArgumentException("maxTokens debe estar entre 1 y 4000");
        }
        if (temperature < 0 || temperature > 2) {
            throw new IllegalArgumentException("temperature debe estar entre 0 y 2");
        }
    }
}

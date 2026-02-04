package com.innoad.shared.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import java.time.Duration;

/**
 * Configuración de RestTemplate para llamadas HTTP a servicios externos
 * (OpenAI, SMTP, etc.)
 */
@Configuration
public class ConfiguracionRestTemplate {
    
    /**
     * RestTemplate optimizado para llamadas a OpenAI con timeout y reintentos
     */
    @Bean(name = "restTemplateOpenAI")
    public RestTemplate restTemplateOpenAI(RestTemplateBuilder builder) {
        return builder
            .setConnectTimeout(Duration.ofSeconds(10))
            .setReadTimeout(Duration.ofSeconds(30))
            .build();
    }
    
    /**
     * RestTemplate genérico para otras llamadas HTTP
     */
    @Bean(name = "restTemplateGeneral")
    public RestTemplate restTemplateGeneral(RestTemplateBuilder builder) {
        return builder
            .setConnectTimeout(Duration.ofSeconds(5))
            .setReadTimeout(Duration.ofSeconds(15))
            .build();
    }
}

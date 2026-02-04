package com.innoad.shared.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Interceptor para RestTemplate que agrega autorización a OpenAI
 * y maneja errores de forma consistente
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InterceptorOpenAI implements ClientHttpRequestInterceptor {
    
    private final PropiedadesOpenAI propiedadesOpenAI;
    
    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body, 
            ClientHttpRequestExecution execution) throws IOException {
        
        // Agregar Authorization header
        request.getHeaders().set("Authorization", "Bearer " + propiedadesOpenAI.getApiKey());
        request.getHeaders().set("Content-Type", "application/json");
        
        log.debug("Enviando solicitud a OpenAI: {} {}", request.getMethod(), request.getURI());
        
        try {
            ClientHttpResponse response = execution.execute(request, body);
            
            if (!response.getStatusCode().is2xxSuccessful()) {
                log.warn("OpenAI retornó estado: {}", response.getStatusCode());
            }
            
            return response;
        } catch (IOException e) {
            log.error("Error comunicando con OpenAI: {}", e.getMessage());
            throw e;
        }
    }
}

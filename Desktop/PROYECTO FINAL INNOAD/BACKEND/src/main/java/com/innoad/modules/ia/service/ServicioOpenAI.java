package com.innoad.modules.ia.service;

import com.innoad.modules.ia.domain.PromptIAPorRol;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioOpenAI {

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${openai.model:gpt-4}")
    private String modelo;

    @Value("${openai.max.tokens:2000}")
    private Integer maxTokens;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Método simple para generar respuesta sin contexto adicional (usado por chatbot)
     */
    public String generarRespuesta(String sistemaContexto, String pregunta) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                log.warn("API key de OpenAI no configurada, retornando respuesta local");
                return "Lo siento, no puedo procesar tu pregunta en este momento. Por favor intenta más tarde.";
            }

            Map<String, Object> payload = new HashMap<>();
            payload.put("model", modelo);
            payload.put("messages", List.of(
                Map.of("role", "system", "content", sistemaContexto),
                Map.of("role", "user", "content", pregunta)
            ));
            payload.put("max_tokens", maxTokens);
            payload.put("temperature", 0.7);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            String payloadJson = objectMapper.writeValueAsString(payload);
            HttpEntity<String> request = new HttpEntity<>(payloadJson, headers);

            String response = restTemplate.postForObject(apiUrl, request, String.class);
            JsonNode responseJson = objectMapper.readTree(response);

            if (responseJson.has("error")) {
                log.error("Error de OpenAI: {}", responseJson.get("error").get("message").asText());
                return "Error al procesar tu pregunta. Por favor intenta de nuevo.";
            }

            return responseJson.get("choices")
                    .get(0)
                    .get("message")
                    .get("content")
                    .asText();

        } catch (Exception e) {
            log.error("Error al generar respuesta con OpenAI: {}", e.getMessage());
            return "No pude procesar tu pregunta. Por favor, intenta de nuevo.";
        }
    }

    @Transactional(readOnly = true)
    public RespuestaOpenAI llamarAPI(String pregunta, PromptIAPorRol prompt, String contexto) {
        log.info("Llamando a OpenAI API para pregunta: {}", pregunta.substring(0, Math.min(50, pregunta.length())));
        
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                log.warn("API key de OpenAI no configurada");
                return RespuestaOpenAI.error("API key no configurada");
            }

            long tiempoInicio = System.currentTimeMillis();

            String mensajeDelSistema = prompt.getInstruccion();
            if (contexto != null && !contexto.isEmpty()) {
                mensajeDelSistema += "\n\nContexto del sistema:\n" + contexto;
            }

            Map<String, Object> payload = construirPayload(mensajeDelSistema, pregunta, prompt);
            HttpEntity<String> request = construirRequest(payload);

            String response = restTemplate.postForObject(apiUrl, request, String.class);
            JsonNode responseJson = objectMapper.readTree(response);

            if (responseJson.has("error")) {
                String errorMsg = responseJson.get("error").get("message").asText();
                log.error("Error de OpenAI: {}", errorMsg);
                return RespuestaOpenAI.error(errorMsg);
            }

            String respuesta = responseJson.get("choices")
                    .get(0)
                    .get("message")
                    .get("content")
                    .asText();

            int tokensUsados = responseJson.get("usage").get("total_tokens").asInt();
            float tiempoRespuesta = (System.currentTimeMillis() - tiempoInicio) / 1000.0f;

            log.info("Respuesta obtenida de OpenAI. Tokens: {}, Tiempo: {}s", tokensUsados, tiempoRespuesta);

            return RespuestaOpenAI.exitoso(respuesta, tokensUsados, tiempoRespuesta);
        } catch (Exception e) {
            log.error("Error al llamar OpenAI API: {}", e.getMessage());
            return RespuestaOpenAI.error("Error al procesar la solicitud: " + e.getMessage());
        }
    }

    private Map<String, Object> construirPayload(String mensajeDelSistema, String pregunta, PromptIAPorRol prompt) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("model", modelo);
        
        List<Map<String, String>> messages = List.of(
            Map.of("role", "system", "content", mensajeDelSistema),
            Map.of("role", "user", "content", pregunta)
        );
        payload.put("messages", messages);
        
        payload.put("max_tokens", prompt.getTokenMaximo());
        payload.put("temperature", prompt.getTemperatura());
        
        return payload;
    }

    private HttpEntity<String> construirRequest(Map<String, Object> payload) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        
        String payloadJson = objectMapper.writeValueAsString(payload);
        return new HttpEntity<>(payloadJson, headers);
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class RespuestaOpenAI {
        private Boolean exito;
        private String respuesta;
        private Integer tokensUtilizados;
        private Float tiempoRespuesta;
        private String error;

        public static RespuestaOpenAI exitoso(String respuesta, Integer tokens, Float tiempo) {
            return RespuestaOpenAI.builder()
                    .exito(true)
                    .respuesta(respuesta)
                    .tokensUtilizados(tokens)
                    .tiempoRespuesta(tiempo)
                    .build();
        }

        public static RespuestaOpenAI error(String mensaje) {
            return RespuestaOpenAI.builder()
                    .exito(false)
                    .error(mensaje)
                    .build();
        }
    }
}

package com.innoad.modules.ia.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.innoad.modules.ia.domain.ConversacionIA;
import com.innoad.modules.content.domain.Publicidad;
import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.ia.repository.RepositorioConversacionIA;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Servicio del agente de inteligencia artificial para InnoAd.
 * Proporciona asistencia en la creación, optimización y análisis de publicidades.
 */
@Service
@RequiredArgsConstructor
public class ServicioAgenteIA {
    
    private final WebClient.Builder webClientBuilder;
    private final RepositorioConversacionIA repositorioConversacionIA;
    private final ObjectMapper objectMapper;
    
    @Value("${innoad.ai.api-url}")
    private String apiUrl;
    
    @Value("${innoad.ai.api-key}")
    private String apiKey;
    
    @Value("${innoad.ai.model}")
    private String model;
    
    @Value("${innoad.ai.max-tokens}")
    private Integer maxTokens;
    
    @Value("${innoad.ai.temperature}")
    private Double temperature;
    
    /**
     * Genera sugerencias de contenido publicitario usando IA
     */
    @Transactional
    public String generarContenidoPublicitario(Usuario usuario, String descripcionProducto, String audienciaObjetivo) {
        String prompt = String.format(
            """
            Eres un experto en publicidad digital y marketing. 
            Genera un contenido publicitario atractivo y persuasivo para el siguiente producto/servicio:
            
            Descripción: %s
            Audiencia objetivo: %s
            
            El contenido debe incluir:
            1. Un título llamativo (máximo 60 caracteres)
            2. Una descripción breve y persuasiva (máximo 150 palabras)
            3. Un call-to-action efectivo
            4. 5 hashtags relevantes
            
            Formato de respuesta en JSON:
            {
                "titulo": "...",
                "descripcion": "...",
                "callToAction": "...",
                "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
            }
            """,
            descripcionProducto,
            audienciaObjetivo
        );
        
        return consultarIA(usuario, prompt, "generacion_contenido");
    }
    
    /**
     * Analiza y optimiza una publicidad existente
     */
    @Transactional
    public String analizarPublicidad(Usuario usuario, Publicidad publicidad) {
        String prompt = String.format(
            """
            Analiza la siguiente publicidad y proporciona recomendaciones de mejora:
            
            Título: %s
            Descripción: %s
            Impresiones: %d
            Clics: %d
            CTR: %.2f%%
            
            Proporciona:
            1. Análisis de efectividad (1-10)
            2. Puntos fuertes
            3. Áreas de mejora
            4. Sugerencias específicas de optimización
            5. Recomendaciones de keywords adicionales
            
            Responde en formato JSON con las claves: calificacion, puntosuertes, areasMejora, sugerencias, keywords
            """,
            publicidad.getTitulo(),
            publicidad.getDescripcion(),
            publicidad.getImpresiones(),
            publicidad.getClics(),
            publicidad.calcularCTR()
        );
        
        return consultarIA(usuario, prompt, "analisis_publicidad");
    }
    
    /**
     * Genera ideas de campañas publicitarias
     */
    @Transactional
    public String generarIdeasCampana(Usuario usuario, String industria, String objetivo, Double presupuesto) {
        String prompt = String.format(
            """
            Genera 3 ideas creativas de campañas publicitarias para:
            
            Industria: %s
            Objetivo: %s
            Presupuesto: $%.2f
            
            Para cada idea incluye:
            1. Nombre de la campaña
            2. Concepto principal
            3. Canales recomendados
            4. Estrategia de contenido
            5. KPIs a medir
            6. Estimación de resultados
            
            Responde en formato JSON con un array de campañas.
            """,
            industria,
            objetivo,
            presupuesto
        );
        
        return consultarIA(usuario, prompt, "generacion_campanas");
    }
    
    /**
     * Proporciona recomendaciones de targeting
     */
    @Transactional
    public String recomendarTargeting(Usuario usuario, String producto, String ubicacion) {
        String prompt = String.format(
            """
            Proporciona recomendaciones de targeting para una campaña publicitaria:
            
            Producto/Servicio: %s
            Ubicación: %s
            
            Incluye:
            1. Demografía recomendada (edad, género, nivel socioeconómico)
            2. Intereses y comportamientos
            3. Mejores horarios de publicación
            4. Plataformas digitales más efectivas
            5. Estimación de audiencia potencial
            
            Responde en formato JSON estructurado.
            """,
            producto,
            ubicacion
        );
        
        return consultarIA(usuario, prompt, "recomendacion_targeting");
    }
    
    /**
     * Genera copy publicitario para diferentes formatos
     */
    @Transactional
    public String generarCopyMultiformato(Usuario usuario, String mensaje, List<String> formatos) {
        String formatosStr = String.join(", ", formatos);
        String prompt = String.format(
            """
            Genera copy publicitario adaptado para diferentes formatos:
            
            Mensaje principal: %s
            Formatos solicitados: %s
            
            Para cada formato genera:
            - Versión adaptada del mensaje
            - Longitud óptima
            - Elementos visuales recomendados
            
            Responde en formato JSON con un objeto por cada formato.
            """,
            mensaje,
            formatosStr
        );
        
        return consultarIA(usuario, prompt, "generacion_copy");
    }
    
    /**
     * Método principal que consulta la API de IA
     */
    private String consultarIA(Usuario usuario, String prompt, String contexto) {
        long inicioTiempo = System.currentTimeMillis();
        
        try {
            // Preparar la solicitud a la API de IA
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", List.of(
                Map.of(
                    "role", "system",
                    "content", "Eres un experto asistente de marketing y publicidad digital para la plataforma InnoAd. Siempre respondes en español y en formato JSON válido."
                ),
                Map.of(
                    "role", "user",
                    "content", prompt
                )
            ));
            requestBody.put("max_tokens", maxTokens);
            requestBody.put("temperature", temperature);
            
            // Realizar la llamada a la API
            WebClient webClient = webClientBuilder.build();
            String respuesta = webClient.post()
                    .uri(apiUrl + "/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            // Parsear la respuesta
            JsonNode jsonNode = objectMapper.readTree(respuesta);
            String contenidoRespuesta = jsonNode.get("choices")
                    .get(0)
                    .get("message")
                    .get("content")
                    .asText();
            
            int tokensUsados = jsonNode.get("usage").get("total_tokens").asInt();
            long tiempoRespuesta = System.currentTimeMillis() - inicioTiempo;
            
            // Guardar la conversación en la base de datos
            ConversacionIA conversacion = ConversacionIA.builder()
                    .usuario(usuario)
                    .mensajeUsuario(prompt)
                    .respuestaIA(contenidoRespuesta)
                    .contexto(contexto)
                    .tokensUsados(tokensUsados)
                    .costoAproximado(calcularCosto(tokensUsados))
                    .tiempoRespuestaMs((int) tiempoRespuesta)
                    .modeloUtilizado(model)
                    .exitoso(true)
                    .build();
            
            repositorioConversacionIA.save(conversacion);
            
            return contenidoRespuesta;
            
        } catch (Exception e) {
            // Guardar el error en la base de datos
            ConversacionIA conversacion = ConversacionIA.builder()
                    .usuario(usuario)
                    .mensajeUsuario(prompt)
                    .respuestaIA("")
                    .contexto(contexto)
                    .exitoso(false)
                    .mensajeError(e.getMessage())
                    .tiempoRespuestaMs((int) (System.currentTimeMillis() - inicioTiempo))
                    .build();
            
            repositorioConversacionIA.save(conversacion);
            
            throw new RuntimeException("Error al consultar la IA: " + e.getMessage());
        }
    }
    
    /**
     * Calcula el costo aproximado basado en tokens usados
     */
    private Double calcularCosto(int tokens) {
        // Costo aproximado para GPT-4: $0.03 por 1000 tokens de entrada + $0.06 por 1000 tokens de salida
        // Asumiendo 50/50 entrada/salida
        return (tokens / 1000.0) * 0.045;
    }
    
    /**
     * Obtiene el historial de conversaciones de un usuario
     */
    public List<ConversacionIA> obtenerHistorialUsuario(Usuario usuario) {
        return repositorioConversacionIA.findTop10ByUsuarioOrderByFechaConversacionDesc(usuario);
    }
    
    /**
     * Calcula estadísticas de uso de IA para un usuario
     */
    public Map<String, Object> obtenerEstadisticasUsuario(Usuario usuario) {
        Map<String, Object> estadisticas = new HashMap<>();
        
        Long totalTokens = repositorioConversacionIA.calcularTotalTokensUsados(usuario);
        Double costoTotal = repositorioConversacionIA.calcularCostoTotal(usuario);
        List<ConversacionIA> conversaciones = repositorioConversacionIA.findByUsuarioOrderByFechaConversacionDesc(usuario);
        
        estadisticas.put("totalConversaciones", conversaciones.size());
        estadisticas.put("totalTokensUsados", totalTokens != null ? totalTokens : 0);
        estadisticas.put("costoTotal", costoTotal != null ? costoTotal : 0.0);
        estadisticas.put("conversacionesExitosas", 
            conversaciones.stream().filter(ConversacionIA::getExitoso).count());
        
        return estadisticas;
    }
}

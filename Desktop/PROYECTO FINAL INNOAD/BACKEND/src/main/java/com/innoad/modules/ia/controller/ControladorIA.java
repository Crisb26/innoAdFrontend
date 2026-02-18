package com.innoad.modules.ia.controller;

import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.ia.service.BaseConocimientoInnoAd;
import com.innoad.modules.ia.service.ServicioAgenteIA;
import com.innoad.shared.dto.RolUsuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Controlador para la IA de InnoAd
 * Maneja consultas de usuarios y proporciona respuestas contextualizadas
 */
@RestController
@RequestMapping("/api/v1/ia")
@RequiredArgsConstructor
@Slf4j
public class ControladorIA {

    private final BaseConocimientoInnoAd baseConocimiento;
    private final ServicioAgenteIA servicioAgenteIA;

    /**
     * Procesar pregunta del usuario
     * Primero intenta respuesta de FAQ, si no existe consulta OpenAI
     */
    @PostMapping("/procesar-pregunta")
    public ResponseEntity<Map<String, Object>> procesarPregunta(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal Usuario usuario) {

        try {
            String pregunta = (String) request.get("pregunta");

            if (pregunta == null || pregunta.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Pregunta vacía"));
            }

            log.debug("Procesando pregunta de usuario {}: {}", usuario.getId(), pregunta);

            // 1. Intentar respuesta de FAQ
            String respuestaFAQ = baseConocimiento.obtenerRespuestaFAQ(pregunta);

            if (respuestaFAQ != null) {
                log.debug("Respuesta rápida de FAQ para usuario {}", usuario.getId());
                return ResponseEntity.ok(Map.of(
                        "respuesta", respuestaFAQ,
                        "tipo", "faq",
                        "confianza", 0.95,
                        "fuente", "FAQ InnoAd",
                        "tiempoMs", 10
                ));
            }

            // 2. Si no hay FAQ, usar OpenAI con contexto
            log.debug("Consultando OpenAI para usuario {} con rol {}", usuario.getId(), usuario.getRol());

            // Construir prompt con contexto
            String contextoSistema = baseConocimiento.obtenerContextoSistema();
            String contextoRol = baseConocimiento.obtenerContextoParaOpenAI(usuario.getRol());

            String promptCompleto = String.format("""
                    %s

                    %s

                    PREGUNTA DEL USUARIO:
                    %s

                    INSTRUCCIONES:
                    - Responde en español, de manera amigable y clara
                    - Si la pregunta no está relacionada con InnoAd, indica amablemente que solo ayudas con temas del sistema
                    - Sugiere funcionalidades relevantes cuando sea apropiado
                    - Si requiere permisos que el usuario no tiene, indícalo claramente
                    - Mantén respuestas concisas (máximo 300 palabras)

                    RESPUESTA:
                    """, contextoSistema, contextoRol, pregunta);

            // Consultar servicio de IA (simulado por ahora)
            String respuestaIA = generarRespuestaIA(promptCompleto);

            return ResponseEntity.ok(Map.of(
                    "respuesta", respuestaIA,
                    "tipo", "openai",
                    "confianza", 0.85,
                    "fuente", "GPT-4 Mini",
                    "tiempoMs", 2500
            ));

        } catch (Exception e) {
            log.error("Error procesando pregunta", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error", "Error al procesar pregunta",
                            "detalle", e.getMessage()
                    ));
        }
    }

    /**
     * Obtener sugerencias de preguntas comunes para el usuario
     */
    @GetMapping("/sugerencias")
    public ResponseEntity<Map<String, Object>> obtenerSugerencias(
            @AuthenticationPrincipal Usuario usuario) {

        List<String> sugerencias = baseConocimiento.obtenerSugerenciasComunes(usuario.getRol());

        return ResponseEntity.ok(Map.of(
                "sugerencias", sugerencias,
                "cantidad", sugerencias.size()
        ));
    }

    /**
     * Obtener bienvenida personalizada según rol
     */
    @GetMapping("/bienvenida")
    public ResponseEntity<Map<String, Object>> obtenerBienvenida(
            @AuthenticationPrincipal Usuario usuario) {

        String bienvenida = baseConocimiento.obtenerBienvenidaPerRol(
                usuario.getRol(),
                usuario.getNombreCompleto() != null ? usuario.getNombreCompleto() : usuario.getNombreUsuario()
        );

        return ResponseEntity.ok(Map.of(
                "bienvenida", bienvenida,
                "rol", usuario.getRol().toString(),
                "usuario", usuario.getNombreUsuario()
        ));
    }

    /**
     * Obtener contexto del sistema (para debugging/desarrollo)
     */
    @GetMapping("/contexto-sistema")
    public ResponseEntity<Map<String, Object>> obtenerContextoSistema() {
        String contexto = baseConocimiento.obtenerContextoSistema();

        return ResponseEntity.ok(Map.of(
                "contexto", contexto,
                "timestamp", System.currentTimeMillis()
        ));
    }

    /**
     * Generar contenido publicitario (delegado a ServicioAgenteIA)
     */
    @PostMapping("/generar-contenido")
    public ResponseEntity<Map<String, Object>> generarContenidoPublicitario(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal Usuario usuario) {

        try {
            String descripcion = request.get("descripcion");
            String audiencia = request.get("audiencia");

            if (descripcion == null || audiencia == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Faltan parámetros"));
            }

            String respuesta = servicioAgenteIA.generarContenidoPublicitario(usuario, descripcion, audiencia);

            return ResponseEntity.ok(Map.of(
                    "contenido", respuesta,
                    "tipo", "generacion_contenido",
                    "exitoso", true
            ));

        } catch (Exception e) {
            log.error("Error generando contenido", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error al generar contenido"));
        }
    }

    /**
     * Obtener ideas de campañas (delegado a ServicioAgenteIA)
     */
    @PostMapping("/ideas-campana")
    public ResponseEntity<Map<String, Object>> generarIdeasCampana(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal Usuario usuario) {

        try {
            String industria = (String) request.get("industria");
            String objetivo = (String) request.get("objetivo");
            Double presupuesto = ((Number) request.get("presupuesto")).doubleValue();

            if (industria == null || objetivo == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Faltan parámetros"));
            }

            String respuesta = servicioAgenteIA.generarIdeasCampana(usuario, industria, objetivo, presupuesto);

            return ResponseEntity.ok(Map.of(
                    "ideas", respuesta,
                    "tipo", "generacion_campanas",
                    "exitoso", true
            ));

        } catch (Exception e) {
            log.error("Error generando ideas de campaña", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error al generar ideas"));
        }
    }

    /**
     * Obtener recomendaciones de targeting (delegado a ServicioAgenteIA)
     */
    @PostMapping("/targeting")
    public ResponseEntity<Map<String, Object>> recomendarTargeting(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal Usuario usuario) {

        try {
            String producto = request.get("producto");
            String ubicacion = request.get("ubicacion");

            if (producto == null || ubicacion == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Faltan parámetros"));
            }

            String respuesta = servicioAgenteIA.recomendarTargeting(usuario, producto, ubicacion);

            return ResponseEntity.ok(Map.of(
                    "recomendaciones", respuesta,
                    "tipo", "recomendacion_targeting",
                    "exitoso", true
            ));

        } catch (Exception e) {
            log.error("Error generando recomendaciones", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error al generar recomendaciones"));
        }
    }

    /**
     * Health check para IA
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "modulo", "IA",
                "baseCono cimiento", true,
                "timestamp", System.currentTimeMillis()
        ));
    }

    // ==================== MÉTODOS PRIVADOS ====================

    /**
     * Generar respuesta de IA (placeholder)
     * En producción, esto llamaría a OpenAI API
     */
    private String generarRespuestaIA(String prompt) {
        // Placeholder: En producción, esto llamaría a OpenAI
        // Por ahora devuelve una respuesta genérica
        return """
                Gracias por tu pregunta sobre InnoAd.

                La plataforma está diseñada para ayudarte a gestionar campañas publicitarias digitales de manera eficiente.

                Puedo ayudarte con:
                • Cómo crear y gestionar campañas
                • Cómo subir contenido multimedia
                • Cómo programar horarios
                • Cómo ver estadísticas y reportes
                • Cómo contactar soporte técnico

                ¿Hay algo específico que necesites saber?
                """;
    }

}

package com.innoad.modules.ia.base;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.regex.Pattern;

@Component
@Slf4j
public class BaseConocimientoInnoAd {
    
    private final Map<String, String> informacionBasica = new HashMap<>();
    private final Map<String, List<String>> preguntasSimuladas = new HashMap<>();
    
    public BaseConocimientoInnoAd() {
        inicializarConocimiento();
    }
    
    private void inicializarConocimiento() {
        // Información básica sobre InnoAd
        informacionBasica.put("QUE_ES", 
            "InnoAd es una plataforma integral de gestión de publicidad con inteligencia artificial. " +
            "Permite a los profesionales del marketing crear, distribuir y analizar campañas publicitarias " +
            "de forma automática e inteligente. Utiliza IA para generar contenido, optimizar targeting " +
            "y maximizar el retorno de inversión (ROI).");
        
        informacionBasica.put("TARIFAS",
            "Nuestros planes son flexibles:\n" +
            "• PLAN BÁSICO: $49/mes - Hasta 5 campañas, análisis básico, soporte por email\n" +
            "• PLAN PROFESIONAL: $149/mes - Hasta 20 campañas, análisis avanzado, IA generativa, soporte prioritario\n" +
            "• PLAN EMPRESARIAL: Personalizado - Campañas ilimitadas, IA personalizada, API, soporte 24/7\n" +
            "Primer mes 50% de descuento. Todos los planes incluyen 30 días de prueba gratis.");
        
        informacionBasica.put("CARACTERISTICAS",
            "Características principales de InnoAd:\n" +
            "✓ Generación automática de anuncios con IA\n" +
            "✓ Análisis predictivo y optimización de campañas\n" +
            "✓ Segmentación avanzada de audiencias\n" +
            "✓ Reportes detallados en tiempo real\n" +
            "✓ Integración con principales plataformas publicitarias\n" +
            "✓ Chat asistente IA para soporte\n" +
            "✓ Automatización de publicación en múltiples canales");
        
        informacionBasica.put("VENTAJAS",
            "Ventajas competitivas de InnoAd:\n" +
            "• Ahorro de tiempo: Reduce en 80% el tiempo de creación de campañas\n" +
            "• Mejora de ROI: Promedio de 300% aumento en retorno de inversión\n" +
            "• Inteligencia artificial: Modelos entrenados en millones de campañas exitosas\n" +
            "• Soporte 24/7: Equipo de expertos disponibles en cualquier momento\n" +
            "• Escalabilidad: Desde startups hasta empresas Fortune 500");
        
        informacionBasica.put("MODULOS",
            "Módulos principales de InnoAd:\n" +
            "📊 Dashboard - Vista general de todas tus campañas y métricas\n" +
            "🎯 Campañas - Crear y gestionar campañas publicitarias\n" +
            "📝 Contenidos - Gestor de contenido y creatividades\n" +
            "💬 Chat IA - Asistente inteligente con acceso a toda la plataforma\n" +
            "📈 Reportes - Análisis detallados y exportación de datos\n" +
            "⚙️ Configuración - Ajustes de cuenta, integraciones y preferencias");
        
        informacionBasica.put("SOPORTE",
            "Canales de soporte disponibles:\n" +
            "📧 Email: soporte@innoad.com (respuesta en < 2 horas)\n" +
            "💬 Chat en vivo: Disponible de 9am-10pm (zona horaria del usuario)\n" +
            "📞 Teléfono: Solo para planes Empresarial\n" +
            "📚 Centro de ayuda: Tutoriales, webinars y documentación\n" +
            "🐛 Bug reports: support@innoad.com con etiqueta [BUG]");
        
        // Palabras clave y preguntas simuladas
        preguntasSimuladas.put("tarifas", 
            Arrays.asList("precio", "costo", "plan", "pago", "suscripción", "cuánto cuesta"));
        
        preguntasSimuladas.put("caracteristicas",
            Arrays.asList("qué puede", "funcionalidades", "features", "capacidades", "herramientas"));
        
        preguntasSimuladas.put("ventajas",
            Arrays.asList("beneficio", "por qué", "diferencia", "mejor", "ventaja competitiva"));
        
        preguntasSimuladas.put("modulos",
            Arrays.asList("sección", "área", "módulo", "parte", "herramienta", "función"));
        
        preguntasSimuladas.put("soporte",
            Arrays.asList("ayuda", "contacto", "problema", "error", "asistencia", "cómo"));
        
        preguntasSimuladas.put("que_es",
            Arrays.asList("qué es", "quién eres", "explicar", "qué hace", "para qué sirve"));
    }
    
    /**
     * Procesa una pregunta del usuario y retorna respuesta contextual
     */
    public Map<String, Object> procesarPregunta(String pregunta) {
        Map<String, Object> respuesta = new HashMap<>();
        
        pregunta = pregunta.toLowerCase().trim();
        
        // Detectar categoría de pregunta
        String categoria = detectarCategoria(pregunta);
        String respuestaTexto = obtenerRespuesta(categoria);
        double confianza = calcularConfianza(pregunta, categoria);
        
        respuesta.put("respuesta", respuestaTexto);
        respuesta.put("categoria", categoria);
        respuesta.put("confianza", confianza);
        respuesta.put("timestamp", System.currentTimeMillis());
        respuesta.put("esContextual", confianza > 0.7);
        
        log.info("Pregunta procesada: {} | Categoría: {} | Confianza: {}", 
            pregunta.substring(0, Math.min(50, pregunta.length())), categoria, confianza);
        
        return respuesta;
    }
    
    /**
     * Detecta la categoría de la pregunta
     */
    private String detectarCategoria(String pregunta) {
        int maxCoincidencias = 0;
        String categoriaDetectada = "general";
        
        for (Map.Entry<String, List<String>> entrada : preguntasSimuladas.entrySet()) {
            int coincidencias = 0;
            for (String palabra : entrada.getValue()) {
                if (pregunta.contains(palabra)) {
                    coincidencias++;
                }
            }
            
            if (coincidencias > maxCoincidencias) {
                maxCoincidencias = coincidencias;
                categoriaDetectada = entrada.getKey();
            }
        }
        
        return categoriaDetectada;
    }
    
    /**
     * Obtiene la respuesta según categoría
     */
    private String obtenerRespuesta(String categoria) {
        return informacionBasica.getOrDefault(categoria.toUpperCase(), informacionBasica.get("QUE_ES"));
    }
    
    /**
     * Calcula confianza de respuesta (0.0 - 1.0)
     */
    private double calcularConfianza(String pregunta, String categoria) {
        List<String> palabrasClave = preguntasSimuladas.get(categoria);
        if (palabrasClave == null || palabrasClave.isEmpty()) {
            return 0.5;
        }
        
        long coincidencias = palabrasClave.stream()
            .filter(pregunta::contains)
            .count();
        
        return Math.min(1.0, 0.6 + (coincidencias * 0.15));
    }
    
    /**
     * Obtiene información específica
     */
    public String obtenerInformacion(String clave) {
        return informacionBasica.getOrDefault(clave.toUpperCase(), "");
    }
    
    /**
     * Verifica si una pregunta está relacionada con InnoAd
     */
    public boolean esPreguntaRelacionada(String pregunta) {
        pregunta = pregunta.toLowerCase();
        String[] palabrasClaveInnoAd = {
            "innoad", "campaña", "publicidad", "anuncio", "reporte", "analytics",
            "contenido", "audiencia", "tarifa", "precio", "plan", "ayuda"
        };
        
        return Arrays.stream(palabrasClaveInnoAd)
            .anyMatch(pregunta::contains);
    }
}

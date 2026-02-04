package com.innoad.modules.ia.domain;

import lombok.experimental.UtilityClass;
import java.util.HashMap;
import java.util.Map;

/**
 * Base de conocimiento centralizada sobre InnoAd
 * Contiene información sobre tarifas, features, descripción y casos de uso
 * Utilizada por el chatbot para responder preguntas contextuales
 */
@UtilityClass
public class BaseConocimientoInnoAd {

    public static final String DESCRIPCION_GENERAL = """
            InnoAd es una plataforma integral de gestión publicitaria inteligente que revoluciona 
            la manera en que las empresas crean, despliegan y optimizan sus campañas de marketing. 
            Combina IA avanzada, análisis de datos en tiempo real y automación para maximizar 
            el retorno de inversión (ROI) en publicidad digital.
            """;

    public static final String MIRADA_GENERAL = """
            InnoAd es tu socio estratégico en publicidad digital. Somos una plataforma SaaS 
            que utiliza Inteligencia Artificial para ayudarte a:
            - Crear campañas publicitarias más efectivas
            - Alcanzar a tu audiencia ideal con precisión
            - Optimizar tu presupuesto publicitario
            - Medir el impacto real de tus inversiones
            - Automatizar procesos repetitivos
            """;

    public static final Map<String, String> CARACTERISTICAS_PRINCIPALES = Map.ofEntries(
            Map.entry("Asistente IA", "Chatbot inteligente que responde preguntas sobre tarifas, features y te ayuda a optimizar campañas"),
            Map.entry("Generador de Contenidos", "Crea automáticamente copias publicitarias optimizadas para conversión"),
            Map.entry("Análisis de Publicidad", "Analiza campañas existentes y proporciona recomendaciones de mejora"),
            Map.entry("Gestor de Campañas", "Interface visual para crear, editar y monitorear múltiples campañas"),
            Map.entry("Dashboard Analítico", "Visualización en tiempo real de métricas clave (CTR, CPC, ROI, conversiones)"),
            Map.entry("Targeting Inteligente", "IA sugiere audiencias más relevantes basada en datos históricos"),
            Map.entry("Hardware Monitoring", "Monitoreo de servidores y rendimiento de la infraestructura"),
            Map.entry("Reportes Personalizados", "Genera reportes PDF/Excel con métricas customizadas"),
            Map.entry("API REST", "Integración con sistemas externos mediante API documentada"),
            Map.entry("Herramientas Profesionales", "Suite completa para agencias y especialistas en marketing")
    );

    public static final Map<String, String> PLANES_TARIFARIOS = Map.ofEntries(
            Map.entry("PLAN_STARTER", 
                    "Plan Starter - $29/mes\n" +
                    "- Hasta 3 campañas activas\n" +
                    "- 10,000 impresiones/mes\n" +
                    "- Reportes básicos\n" +
                    "- Chat IA con 100 consultas/mes\n" +
                    "- Soporte por email\n" +
                    "Ideal para emprendedores y pequeños negocios"),
            
            Map.entry("PLAN_PROFESIONAL", 
                    "Plan Profesional - $99/mes\n" +
                    "- Hasta 15 campañas activas\n" +
                    "- 100,000 impresiones/mes\n" +
                    "- Reportes avanzados y personalizados\n" +
                    "- Chat IA ilimitado\n" +
                    "- Generador de contenidos (50 copies/mes)\n" +
                    "- Targeting inteligente\n" +
                    "- Soporte prioritario por email y chat\n" +
                    "- Acceso a webinars y capacitación\n" +
                    "Perfecto para agencias y especialistas"),
            
            Map.entry("PLAN_EMPRESARIAL", 
                    "Plan Empresarial - $299/mes\n" +
                    "- Campañas ilimitadas\n" +
                    "- Impresiones ilimitadas\n" +
                    "- Todos los features del Plan Profesional\n" +
                    "- Generador de contenidos ilimitado\n" +
                    "- API REST con límite de 10,000 requests/día\n" +
                    "- Integración con CRM (Salesforce, HubSpot)\n" +
                    "- Hardware monitoring incluido\n" +
                    "- Gestor de usuarios y roles\n" +
                    "- Soporte 24/7 por teléfono, email y chat\n" +
                    "- Account manager dedicado\n" +
                    "- Consultoría estratégica trimestral\n" +
                    "Para empresas que requieren máximo poder"),
            
            Map.entry("PLAN_PERSONALIZADO", 
                    "Plan Personalizado - Consultar\n" +
                    "- Todo ilimitado\n" +
                    "- SLA garantizado\n" +
                    "- Infraestructura dedicada\n" +
                    "- Equipo de implementación y soporte\n" +
                    "- Capacitación completa del equipo\n" +
                    "- Features customizados según necesidades\n" +
                    "Contacta a sales@innoad.com para más información")
    );

    public static final Map<String, Object> COMPARATIVA_PLANES = Map.ofEntries(
            Map.entry("STARTER", Map.of(
                    "precio", "$29/mes",
                    "campanas", "3",
                    "impresiones", "10,000",
                    "ia_consultas", "100",
                    "contenidos_generados", "0",
                    "api_access", false,
                    "soporte", "Email"
            )),
            Map.entry("PROFESIONAL", Map.of(
                    "precio", "$99/mes",
                    "campanas", "15",
                    "impresiones", "100,000",
                    "ia_consultas", "Ilimitado",
                    "contenidos_generados", "50/mes",
                    "api_access", false,
                    "soporte", "Email + Chat prioritario"
            )),
            Map.entry("EMPRESARIAL", Map.of(
                    "precio", "$299/mes",
                    "campanas", "Ilimitado",
                    "impresiones", "Ilimitado",
                    "ia_consultas", "Ilimitado",
                    "contenidos_generados", "Ilimitado",
                    "api_access", true,
                    "soporte", "24/7 Teléfono + Email + Chat"
            )),
            Map.entry("PERSONALIZADO", Map.of(
                    "precio", "Negociable",
                    "campanas", "Ilimitado",
                    "impresiones", "Ilimitado",
                    "ia_consultas", "Ilimitado",
                    "contenidos_generados", "Ilimitado",
                    "api_access", true,
                    "soporte", "24/7 + Consultoría estratégica"
            ))
    );

    public static final Map<String, String> CASOS_DE_USO = Map.ofEntries(
            Map.entry("E-COMMERCE", 
                    "Optimiza tus campañas de productos. InnoAd analiza el comportamiento de compra " +
                    "y genera anuncios personalizados. Resultado: aumenta conversiones hasta 40% con " +
                    "targeting inteligente."),
            
            Map.entry("AGENCIAS", 
                    "Gestiona múltiples clientes en una sola plataforma. Reportes automáticos, " +
                    "generador de contenidos y análisis comparativo. Ahorra 20+ horas/mes de trabajo " +
                    "manual."),
            
            Map.entry("STARTUPS", 
                    "Presupuesto limitado, máximo impacto. La IA de InnoAd optimiza cada peso. " +
                    "Puedes testear audiencias, creativas y canales automáticamente."),
            
            Map.entry("EMPRESAS_B2B", 
                    "Genera leads cualificados. Nuestro targeting inteligente identifica decisores " +
                    "clave en tu industria. Reduce costo por lead significativamente."),
            
            Map.entry("SaaS", 
                    "Automatiza adquisición de clientes. Nuestro sistema de análisis predice qué " +
                    "usuarios serán más valiosos y optimiza hacia ellos.")
    );

    public static final Map<String, String> BENEFICIOS = Map.ofEntries(
            Map.entry("ROI MEJORADO", "Aumenta tu retorno de inversión hasta 3x con optimización IA"),
            Map.entry("AHORRO_TIEMPO", "Automatiza 80% del trabajo manual. Enfócate en estrategia"),
            Map.entry("DATOS_EN_TIEMPO_REAL", "Dashboard en vivo con todas tus métricas importantes"),
            Map.entry("ESCALABILIDAD", "Gestiona desde 1 hasta 1,000+ campañas sin complejidad"),
            Map.entry("SOPORTE_EXPERTOS", "Equipo que entiende de marketing y tecnología"),
            Map.entry("INTEGRACIONES", "Conecta con Google Ads, Meta, TikTok, CRM y más")
    );

    public static final String PROMPT_SISTEMA_CHATBOT = """
            Eres un asistente de soporte de InnoAd, una plataforma integral de gestión publicitaria 
            inteligente. Tu objetivo es:
            
            1. RESPONDER PREGUNTAS sobre qué es InnoAd, sus features, tarifas y casos de uso
            2. AYUDAR USUARIOS a entender qué plan es mejor para sus necesidades
            3. GUIAR sobre cómo optimizar campañas publicitarias
            4. RESOLVER DUDAS técnicas de forma clara y simple
            5. SER AMABLE, PROFESIONAL y orientado a soluciones
            
            CONTEXTO IMPORTANTE:
            - InnoAd es una plataforma SaaS de publicidad inteligente con IA
            - Ofrecemos 4 planes: Starter ($29), Profesional ($99), Empresarial ($299), Personalizado
            - Nuestros features principales incluyen IA Chat, generador de contenidos, análisis y dashboards
            - Si no sabes la respuesta, ofrece contactar a sales@innoad.com
            
            NUNCA:
            - Hagas promesas que no podemos cumplir
            - Compartas precios sin contexto completo
            - Ignores las preguntas del usuario
            - Respondas como si fueras otro sistema (eres InnoAd)
            
            SIEMPRE:
            - Sé específico y útil
            - Incluye ejemplos reales cuando sea posible
            - Sugiere el plan que mejor se adapte a sus necesidades
            - Ofrece alternativas
            """;

    /**
     * Obtiene toda la información sobre InnoAd estructurada
     */
    public static Map<String, Object> obtenerBaseConocimientoCompleta() {
        Map<String, Object> base = new HashMap<>();
        base.put("descripcion", DESCRIPCION_GENERAL);
        base.put("mirada_general", MIRADA_GENERAL);
        base.put("caracteristicas", CARACTERISTICAS_PRINCIPALES);
        base.put("planes", PLANES_TARIFARIOS);
        base.put("comparativa", COMPARATIVA_PLANES);
        base.put("casos_uso", CASOS_DE_USO);
        base.put("beneficios", BENEFICIOS);
        base.put("prompt_sistema", PROMPT_SISTEMA_CHATBOT);
        return base;
    }

    /**
     * Información rápida para respuestas del chat
     */
    public static String obtenerRespuestaRapida(String pregunta) {
        String preguntaLower = pregunta.toLowerCase();

        if (preguntaLower.contains("precio") || preguntaLower.contains("costo") || 
            preguntaLower.contains("tarifa") || preguntaLower.contains("plan")) {
            return "Tenemos 4 planes:\n" +
                   "✓ STARTER: $29/mes (3 campañas, 100 consultas IA/mes)\n" +
                   "✓ PROFESIONAL: $99/mes (15 campañas, IA ilimitada, 50 contenidos/mes)\n" +
                   "✓ EMPRESARIAL: $299/mes (todo ilimitado, API, soporte 24/7)\n" +
                   "✓ PERSONALIZADO: Consulta ventas para soluciones custom\n\n" +
                   "¿Cuál es tu caso de uso? Te recomendaré el plan perfecto.";
        }

        if (preguntaLower.contains("qué es") || preguntaLower.contains("que es innoad") || 
            preguntaLower.contains("innoad") && preguntaLower.contains("descripción")) {
            return MIRADA_GENERAL;
        }

        if (preguntaLower.contains("features") || preguntaLower.contains("features") || 
            preguntaLower.contains("funciona") || preguntaLower.contains("puedo hacer")) {
            return "InnoAd incluye:\n" +
                   "🤖 Asistente IA - Chat inteligente para optimizar campañas\n" +
                   "✍️ Generador de Contenidos - Crea copias publicitarias automáticamente\n" +
                   "📊 Dashboard Analítico - Métricas en tiempo real\n" +
                   "🎯 Targeting Inteligente - IA sugiere mejores audiencias\n" +
                   "📈 Reportes Personalizados - PDF/Excel con tus métricas\n" +
                   "⚙️ API REST - Integración con sistemas externos\n" +
                   "💪 Análisis de Publicidad - Optimiza anuncios existentes\n" +
                   "📱 Gestor de Campañas - Crea y edita múltiples campañas\n\n" +
                   "¿Cuál te interesa más?";
        }

        if (preguntaLower.contains("contacto") || preguntaLower.contains("teléfono") || 
            preguntaLower.contains("email") || preguntaLower.contains("soporte")) {
            return "Puedes contactarnos:\n" +
                   "📧 Email: support@innoad.com\n" +
                   "💼 Ventas: sales@innoad.com\n" +
                   "🌐 Web: www.innoad.com\n" +
                   "💬 Chat en vivo en nuestro sitio web\n\n" +
                   "También puedes escribirme aquí, ¡soy un asistente IA que aprende!";
        }

        return null; // No hay respuesta rápida, consultar OpenAI
    }
}

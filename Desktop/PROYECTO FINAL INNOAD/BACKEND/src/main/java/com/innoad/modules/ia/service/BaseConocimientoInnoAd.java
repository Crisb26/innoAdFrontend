package com.innoad.modules.ia.service;

import com.innoad.shared.dto.RolUsuario;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Base de Conocimiento sobre el Sistema InnoAd
 * Proporciona respuestas rápidas sobre features del sistema sin necesidad de llamar OpenAI
 */
@Service
@Slf4j
public class BaseConocimientoInnoAd {

    /**
     * Obtiene contexto general del sistema
     */
    public String obtenerContextoSistema() {
        return """
            InnoAd es una plataforma integral de gestión de publicidad digital en pantallas LED.

            FUNCIONALIDADES PRINCIPALES:
            1. Crear y gestionar campañas publicitarias con múltiples estados
            2. Administrar pantallas digitales (ubicaciones físicas, conexión, control remoto)
            3. Subir y organizar contenido multimedia (imágenes, videos)
            4. Programar horarios de publicación y reproducción automática
            5. Ver reportes y estadísticas en tiempo real
            6. Chat en vivo con soporte técnico
            7. IA asistente para crear contenido y optimizar campañas

            ROLES DE USUARIO:
            - ADMIN: Control total del sistema, gestiona usuarios, pantallas, configuración global
            - TECNICO: Gestiona pantallas, revisa contenido, brinda soporte técnico a usuarios
            - USUARIO: Crea campañas y contenido, ve estadísticas de sus campañas

            ARQUITECTURA:
            - Backend: Java Spring Boot 3.5.8 en servidor de producción
            - Frontend: Angular 18.2.14 con componentes standalone
            - Base de datos: PostgreSQL con tablas optimizadas
            - Comunicación en tiempo real: WebSocket STOMP
            - API REST: Endpoints RESTful con autenticación JWT
            """;
    }

    /**
     * Obtiene respuesta de FAQ para preguntas comunes
     * Devuelve null si no hay FAQ disponible (necesita OpenAI)
     */
    public String obtenerRespuestaFAQ(String pregunta) {
        String preguntaLower = pregunta.toLowerCase();

        // CAMPAÑAS
        if (contiene(preguntaLower, "crear campaña", "nueva campaña", "agregar campaña", "hacer campaña")) {
            return obtenerRespuestaCrearCampana();
        }

        if (contiene(preguntaLower, "duplicar campaña", "copiar campaña", "clonar campaña")) {
            return obtenerRespuestaDuplicarCampana();
        }

        if (contiene(preguntaLower, "editar campaña", "modificar campaña", "cambiar campaña")) {
            return obtenerRespuestaEditarCampana();
        }

        if (contiene(preguntaLower, "eliminar campaña", "borrar campaña", "quitar campaña")) {
            return obtenerRespuestaEliminarCampana();
        }

        if (contiene(preguntaLower, "estado de campaña", "cambiar estado", "activar campaña", "pausar campaña")) {
            return obtenerRespuestaEstadoCampana();
        }

        // CONTENIDO
        if (contiene(preguntaLower, "subir contenido", "cargar contenido", "agregar imagen", "subir video", "agregar video")) {
            return obtenerRespuestaSubirContenido();
        }

        if (contiene(preguntaLower, "formatos de archivo", "qué formatos", "tipos de archivo", "extensiones")) {
            return obtenerRespuestaFormatosArchivos();
        }

        if (contiene(preguntaLower, "tamaño máximo", "peso máximo", "límite de archivo")) {
            return obtenerRespuestaTamanoMaximo();
        }

        // PANTALLAS
        if (contiene(preguntaLower, "conectar pantalla", "añadir pantalla", "nueva pantalla", "crear pantalla")) {
            return obtenerRespuestaConectarPantalla();
        }

        if (contiene(preguntaLower, "ver pantallas", "listar pantallas", "mis pantallas", "pantallas conectadas")) {
            return obtenerRespuestaVerPantallas();
        }

        // REPORTES Y ESTADÍSTICAS
        if (contiene(preguntaLower, "reportes", "estadísticas", "análisis", "métricas", "desempeño")) {
            return obtenerRespuestaReportes();
        }

        if (contiene(preguntaLower, "exportar", "descargar reporte", "pdf", "excel", "csv")) {
            return obtenerRespuestaExportarReportes();
        }

        // SOPORTE
        if (contiene(preguntaLower, "chat soporte", "hablar técnico", "necesito ayuda", "contactar soporte", "hablar con alguien")) {
            return obtenerRespuestaSoporte();
        }

        if (contiene(preguntaLower, "tiempo respuesta", "cuánto tarda", "disponible soporte", "horario soporte", "atención")) {
            return obtenerRespuestaHorarioSoporte();
        }

        // PERMISOS Y ROLES
        if (contiene(preguntaLower, "qué puedo hacer", "mis permisos", "acceso", "permitido", "no veo")) {
            return obtenerRespuestaPermisos();
        }

        // CUENTA
        if (contiene(preguntaLower, "cambiar contraseña", "olvide contraseña", "resetear")) {
            return obtenerRespuestaCambiarContrasena();
        }

        // No hay respuesta de FAQ
        return null;
    }

    /**
     * Obtiene sugerencias de preguntas comunes según el rol
     */
    public List<String> obtenerSugerenciasComunes(RolUsuario rol) {
        return switch (rol) {
            case ADMIN -> Arrays.asList(
                "¿Cómo gestiono los usuarios del sistema?",
                "¿Cómo conectar nuevas pantallas?",
                "¿Cómo ver estadísticas de toda la plataforma?",
                "¿Cómo cambiar la configuración del sistema?",
                "¿Cómo asignar técnicos a una ubicación?",
                "¿Cómo ver histórico de cambios?",
                "¿Cómo crear campañas destacadas?"
            );

            case TECNICO -> Arrays.asList(
                "¿Cómo revisar contenido pendiente?",
                "¿Cómo activar pantallas?",
                "¿Cómo generar reporte de dispositivos?",
                "¿Cómo atender solicitudes de usuarios?",
                "¿Cómo actualizar estado de pantalla?",
                "¿Cómo escalar problema a administrador?",
                "¿Cómo ver campañas activas en cada ubicación?"
            );

            default -> Arrays.asList( // USUARIO
                "¿Cómo crear una campaña?",
                "¿Cómo subir contenido multimedia?",
                "¿Cómo ver mis estadísticas?",
                "¿Cómo duplicar una campaña?",
                "¿Cómo programar una campaña?",
                "¿Qué formatos de archivo puedo usar?",
                "¿Cómo contactar soporte técnico?"
            );
        };
    }

    /**
     * Obtiene respuesta personalizada según rol para onboarding
     */
    public String obtenerBienvenidaPerRol(RolUsuario rol, String nombreUsuario) {
        return switch (rol) {
            case ADMIN -> String.format(
                """
                ¡Bienvenido, %s! 👑

                Como Administrador, tienes acceso total a InnoAd. Puedes:
                • Gestionar usuarios y asignar roles
                • Administrar todas las pantallas digitales
                • Ver estadísticas globales de la plataforma
                • Configurar ajustes del sistema
                • Escalar problemas técnicos

                ¿Qué necesitas hacer primero?
                """, nombreUsuario
            );

            case TECNICO -> String.format(
                """
                ¡Bienvenido, %s! 🔧

                Como Técnico, tu rol es:
                • Gestionar y mantener pantallas digitales
                • Revisar y aprobar contenido
                • Proporcionar soporte a usuarios
                • Generar reportes de dispositivos
                • Escalar problemas complejos a administrador

                ¿Qué necesitas revisar hoy?
                """, nombreUsuario
            );

            default -> String.format(
                """
                ¡Bienvenido, %s! 👤

                Estás listo para comenzar con InnoAd. Puedes:
                • Crear y gestionar tus campañas publicitarias
                • Subir tu contenido multimedia
                • Programar cuándo se mostrará tu contenido
                • Ver estadísticas en tiempo real
                • Contactar soporte técnico si lo necesitas

                ¿Cuál es tu primer paso?
                """, nombreUsuario
            );
        };
    }

    /**
     * Obtiene contexto de usuario para prompts de OpenAI
     */
    public String obtenerContextoParaOpenAI(RolUsuario rol) {
        return switch (rol) {
            case ADMIN -> """
                Recuerda que el usuario es un ADMINISTRADOR de InnoAd.
                Tiene acceso a todas las funcionalidades del sistema.
                Puede crear, modificar y eliminar cualquier recurso.
                Responsable de la gestión global de la plataforma.
                """;

            case TECNICO -> """
                Recuerda que el usuario es un TÉCNICO de InnoAd.
                Su responsabilidad es mantener pantallas y apoyar usuarios.
                No puede crear usuarios ni cambiar configuración global.
                Puede ver contenido de todos los usuarios para revisión.
                """;

            default -> """
                Recuerda que el usuario es un USUARIO regular de InnoAd.
                Solo puede crear y gestionar sus propias campañas y contenido.
                No puede ver campañas de otros usuarios.
                Puede contactar soporte técnico para ayuda.
                """;
        };
    }

    // ==================== RESPUESTAS DE FAQ ====================

    private String obtenerRespuestaCrearCampana() {
        return """
            📢 **Cómo crear una campaña en InnoAd**

            Sigue estos pasos:

            1. **Ve a Campañas** en el menú principal
            2. **Haz clic en "Nueva Campaña"** (botón esquina superior derecha)
            3. **Completa el formulario:**
               - **Nombre:** Dale un nombre descriptivo (ej: "Promoción Verano 2025")
               - **Descripción:** Explica el objetivo (ej: "Promoción especial para clientes nuevos")
               - **Contenido:** Selecciona imágenes/videos de tu biblioteca
               - **Pantallas:** Elige dónde se mostrará (si tienes acceso)
               - **Fechas:** Define inicio y fin de la campaña
               - **Prioridad:** Urgencia relativa (1-10)

            4. **Haz clic en "Guardar"** para crear como borrador
            5. **Haz clic en "Activar"** cuando esté lista

            💡 **Consejo:** Guarda como borrador primero para revisar, luego activa.

            ¿Necesitas ayuda con algún campo específico?
            """;
    }

    private String obtenerRespuestaDuplicarCampana() {
        return """
            📋 **Cómo duplicar una campaña**

            Duplicar es perfecto para crear variaciones rápidas:

            1. **Abre la campaña** que deseas duplicar
            2. **Haz clic en el botón "Duplicar"** (icono de copiar)
            3. Se creará una **copia exacta** con estado "BORRADOR"
            4. **Modifica lo que necesites:**
               - Cambiar nombre
               - Actualizar fechas
               - Ajustar contenido
               - Cambiar pantallas destino

            5. **Guarda y activa**

            ✅ **Ventajas:**
            - Reutiliza campañas exitosas
            - Copia automática de contenido y configuración
            - Crea variantes regionales fácilmente
            - Ahorra tiempo de configuración

            ¿Deseas duplicar una campaña ahora?
            """;
    }

    private String obtenerRespuestaEditarCampana() {
        return """
            ✏️ **Cómo editar una campaña**

            Puedes modificar campañas en estado BORRADOR:

            1. **Abre la campaña** que deseas editar
            2. **Haz clic en "Editar"**
            3. **Modifica los campos** que necesites:
               - Nombre, descripción
               - Fechas de inicio/fin
               - Contenido seleccionado
               - Pantallas destino
               - Prioridad

            4. **Guarda los cambios**

            ⚠️ **Restricciones:**
            - Solo puedes editar campañas en estado BORRADOR
            - Si está ACTIVA, debes pausarla primero
            - Los cambios se guardan inmediatamente

            📌 **Para cambios en campañas activas:**
            - Pausa la campaña
            - Edita lo que necesites
            - Reactiva cuando esté lista

            ¿Qué necesitas cambiar?
            """;
    }

    private String obtenerRespuestaEliminarCampana() {
        return """
            🗑️ **Cómo eliminar una campaña**

            Puedes eliminar campañas que ya no necesites:

            1. **Abre la campaña** que deseas eliminar
            2. **Haz clic en el botón "Eliminar"** (icono de basura)
            3. **Confirma la eliminación** en el diálogo

            ⚠️ **Importante:**
            - La eliminación es **PERMANENTE**
            - No se puede deshacer
            - Se elimina junto con sus estadísticas

            💡 **Alternativa:**
            - En lugar de eliminar, puedes **cambiar estado a FINALIZADA**
            - Así mantienes el histórico para reportes

            ¿Estás seguro de que quieres eliminar?
            """;
    }

    private String obtenerRespuestaEstadoCampana() {
        return """
            🔄 **Estados de Campaña en InnoAd**

            Las campañas tienen varios estados:

            1️⃣ **BORRADOR** - Recién creada, aún en edición
               • Puedes editar todos los campos
               • No se muestra en pantallas
               • Haz clic en "Activar" para comenzar

            2️⃣ **ACTIVA** - Se está mostrando en pantallas
               • Se reproduce según el horario
               • Puedes pausarla temporalmente
               • Ver estadísticas en tiempo real

            3️⃣ **PAUSADA** - Temporalmente detenida
               • No se muestra en pantallas
               • Puedes reactivarla
               • Conserva su fecha de fin

            4️⃣ **FINALIZADA** - Terminou su período
               • Ya no se muestra
               • Datos históricos disponibles
               • Puedes crear duplicados de ella

            **Cambiar estado:**
            - Desde la campaña, usa botones: Activar, Pausar, Detener
            - Desde listado, usa el menú contextual

            ¿Qué estado necesitas?
            """;
    }

    private String obtenerRespuestaSubirContenido() {
        return """
            📸 **Cómo subir contenido multimedia**

            Sigue estos pasos:

            1. **Ve a Contenidos** en el menú
            2. **Haz clic en "Subir Contenido"**
            3. **Arrastra tu archivo** o haz clic para seleccionar
            4. **Espera la carga** (la barra de progreso mostrará el avance)
            5. **Completa los datos:**
               - Título descriptivo
               - Descripción breve
               - Duración (para videos)
               - Tags (etiquetas opcionales)

            6. **Haz clic en "Confirmar"**

            El contenido quedará en tu biblioteca lista para usar en campañas.

            💡 **Consejos:**
            - Usa títulos descriptivos para encontrar fácilmente
            - Comprime imágenes grandes antes de subir
            - Recorta videos largos en segmentos
            - Organiza con tags

            ¿Necesitas ayuda con el formato?
            """;
    }

    private String obtenerRespuestaFormatosArchivos() {
        return """
            📁 **Formatos de archivo aceptados en InnoAd**

            **Imágenes (estáticas):**
            ✅ JPG / JPEG - Fotografías, fotos
            ✅ PNG - Imágenes con transparencia
            ✅ GIF - Imágenes animadas

            **Videos:**
            ✅ MP4 - Formato universal
            ✅ AVI - Compatible con sistemas legacy
            ✅ MOV - Videos de iPhone/Mac

            **Documentos (como imágenes):**
            ✅ PDF - Convertido a imagen para mostrar

            **Formatos NO soportados:**
            ❌ PSD, AI, CDR (archivos de diseño)
            ❌ TIFF, BMP (muy pesados)
            ❌ WEBM, MKV (formatos no estándar)
            ❌ WAV, MP3 (solo audio)

            💡 **Conversión recomendada:**
            - Convierte PSD a PNG o JPG
            - Convierte AVI a MP4
            - Comprime con herramientas online

            ¿Qué archivo necesitas convertir?
            """;
    }

    private String obtenerRespuestaTamanoMaximo() {
        return """
            📏 **Límites de tamaño de archivo**

            **Máximo por archivo:** 10 MB

            **Recomendaciones por tipo:**

            📸 **Imágenes:**
            - JPG: 2-4 MB (buena calidad)
            - PNG: 1-3 MB (si tiene transparencia)
            - Resolución: 1920x1080 o superior

            🎬 **Videos:**
            - Máximo 10 MB
            - Duración: hasta 2 minutos
            - Resolución: 1920x1080 Full HD
            - Bitrate: 5 Mbps recomendado

            💡 **Cómo reducir tamaño:**

            **Imágenes:**
            1. Abre en Paint, Photoshop, o Canva
            2. Exporta como JPG (menor tamaño que PNG)
            3. Usa herramientas: tinypng.com, compressor.io

            **Videos:**
            1. Usa HandBrake (gratis, multiplataforma)
            2. Configuración: H.264, 5 Mbps, 1920x1080
            3. O usa herramientas online: compressor.io

            ¿Necesitas comprimir algo?
            """;
    }

    private String obtenerRespuestaConectarPantalla() {
        return """
            📺 **Cómo conectar una pantalla LED (Solo ADMIN/TECNICO)**

            Requiere permisos de ADMINISTRADOR o TÉCNICO.

            **Pasos:**
            1. Ve a **Pantallas** en el menú
            2. Haz clic en **"Nueva Pantalla"**
            3. Completa el formulario:
               - **Nombre:** Ubicación de la pantalla (ej: "Lobby Principal")
               - **Modelo:** Tipo de pantalla
               - **Resolución:** 1920x1080, etc.
               - **Ubicación:** Ciudad/dirección física
               - **IP/Hardware ID:** Identificador de conexión
               - **Descripción:** Notas adicionales

            4. Haz clic en **"Registrar"**
            5. La pantalla se conectará automáticamente

            **Para que funcione:**
            - La pantalla debe tener conexión a internet
            - Debe ejecutar el software cliente de InnoAd
            - Debe estar en la misma red o VPN

            ⚠️ **Si es usuario regular:**
            - No tienes acceso a esta función
            - Contacta a tu técnico o administrador
            - Ellos conectarán las pantallas

            ¿Necesitas ayuda técnica con la conexión?
            """;
    }

    private String obtenerRespuestaVerPantallas() {
        return """
            📺 **Ver pantallas (disponibilidad por rol)**

            **ADMIN y TÉCNICO:**
            1. Ve a **Pantallas** en el menú
            2. Verás lista con todas las pantallas
            3. Estados:
               - 🟢 Verde: Conectada y en línea
               - 🟡 Amarillo: Conectada pero inactiva
               - 🔴 Rojo: Desconectada
            4. Haz clic en una para ver detalles:
               - Contenido actual
               - Última actividad
               - Estadísticas

            **USUARIO regular:**
            - No tienes acceso directo a Pantallas
            - Cuando creas una campaña, eliges pantallas disponibles
            - Solo ves las que tu técnico ha asignado

            💡 **Interpretar estados:**
            - 🟢 Listo para reproducir contenido
            - 🟡 Necesita reactivación
            - 🔴 Verificar conexión de internet

            ¿Qué pantalla necesitas?
            """;
    }

    private String obtenerRespuestaReportes() {
        return """
            📊 **Cómo ver reportes y estadísticas**

            **Pasos:**
            1. Ve a **Reportes** en el menú
            2. Verás panel con:
               - 📈 Impresiones totales (cuántas veces se mostró)
               - 🎯 CTR (tasa de clics)
               - ⏱️ Tiempo promedio de visualización
               - 📺 Pantallas activas
               - 🎬 Campañas en ejecución

            3. **Filtrar datos:**
               - Por rango de fechas
               - Por campaña específica
               - Por pantalla/ubicación
               - Por tipo de contenido

            4. **Gráficos:**
               - Tendencias por día/semana/mes
               - Comparativa de campañas
               - Mapa de ubicaciones

            💡 **Interpretar métricas:**
            - **Impresiones:** Total veces mostrado
            - **CTR:** (Clics/Impresiones) × 100
            - **Engagement:** Interacción de usuarios

            ⚠️ **Según tu rol:**
            - ADMIN: Ve estadísticas de TODO
            - TÉCNICO: Ve reportes de pantallas asignadas
            - USUARIO: Ve solo sus campañas

            ¿Qué métrica necesitas?
            """;
    }

    private String obtenerRespuestaExportarReportes() {
        return """
            📥 **Cómo exportar reportes**

            **Pasos:**
            1. Ve a **Reportes**
            2. Configura los filtros deseados
            3. Haz clic en **"Descargar"**
            4. Elige formato:
               📄 **PDF** - Para imprimir o compartir
               📊 **Excel** - Para análisis en Excel
               📝 **CSV** - Para importar a otros programas

            5. El archivo se descargará automáticamente

            **Qué incluye cada formato:**
            - Fecha de reporte
            - Período incluido
            - Métricas principales
            - Gráficos (PDF y Excel)
            - Datos desglosados por campaña

            💡 **Usos comunes:**
            - Presentar a directivos (PDF)
            - Análisis detallado (Excel)
            - Importar a BI tools (CSV)

            ¿Necesitas un formato específico?
            """;
    }

    private String obtenerRespuestaSoporte() {
        return """
            💬 **Cómo contactar soporte técnico**

            **Iniciar chat:**
            1. Haz clic en el icono de **chat** (esquina inferior derecha)
            2. O ve a **Soporte** en el menú
            3. Escribe tu pregunta o problema

            **¿Quién te responderá?**
            - 🔧 **Técnico:** Atiende primero, resuelve problemas comunes
            - 👑 **Administrador:** Si el técnico no puede resolver

            **Durante la conversación:**
            - Puedes adjuntar capturas de pantalla
            - Adjuntar archivos relevantes
            - El chat persiste (puedes verlo después)

            💡 **Para respuestas más rápidas:**
            - Describe el problema con detalle
            - Incluye capturas si es visual
            - Menciona cuándo empezó
            - Qué ya intentaste

            **Tiempo de respuesta:**
            - Usuarios: 5-10 minutos
            - Técnicos: 10-15 minutos
            - Problemas críticos: Prioridad máxima

            ¿Necesitas contactar ahora?
            """;
    }

    private String obtenerRespuestaHorarioSoporte() {
        return """
            🕐 **Horario y tiempo de respuesta de soporte**

            **Horario de atención:**
            📅 Lunes a Viernes
            🕐 8:00 AM a 6:00 PM (hora local)

            **Tiempo de respuesta:**
            ⚡ **Problemas críticos:** 5 minutos
            🟠 **Problemas normales:** 10-15 minutos
            🟡 **Consultas generales:** 20-30 minutos

            **Fuera de horario:**
            - Puedes dejar mensajes en el chat
            - Se responderá al día siguiente
            - Para emergencias 24/7: Contacatar admin directo

            **Canales disponibles:**
            💬 Chat en vivo (principal)
            📧 Email: soporte@innoad.com (respuesta en 1 hora)
            📞 Teléfono: Solo casos críticos

            ¿Cuál es tu emergencia?
            """;
    }

    private String obtenerRespuestaPermisos() {
        return """
            🔐 **Tus permisos según tu rol**

            **Si eres ADMINISTRADOR (👑):**
            ✅ Ver y gestionar TODOS los usuarios
            ✅ Conectar y controlar TODAS las pantallas
            ✅ Ver TODAS las campañas y contenidos
            ✅ Cambiar configuración del sistema
            ✅ Crear y eliminar campañas de otros usuarios
            ✅ Acceder a reportes globales
            ✅ Escalar problemas de técnicos

            **Si eres TÉCNICO (🔧):**
            ✅ Revisar y aprobar contenido
            ✅ Gestionar pantallas asignadas
            ✅ Ver campañas en mis ubicaciones
            ✅ Atender soporte a usuarios
            ✅ Generar reportes de dispositivos
            ❌ Cambiar configuración global
            ❌ Ver campañas de otros usuarios
            ❌ Crear usuarios

            **Si eres USUARIO (👤):**
            ✅ Crear mis propias campañas
            ✅ Subir mi contenido
            ✅ Ver mis estadísticas
            ✅ Duplicar mis campañas
            ✅ Contactar soporte
            ❌ Ver campañas de otros
            ❌ Gestionar pantallas
            ❌ Crear usuarios

            **¿No ves algo que esperabas?**
            Contacta a tu administrador para solicitar permisos.

            ¿Necesitas más detalles?
            """;
    }

    private String obtenerRespuestaCambiarContrasena() {
        return """
            🔑 **Cambiar o recuperar contraseña**

            **Para cambiar tu contraseña actual:**
            1. Haz clic en tu **perfil** (esquina superior derecha)
            2. Selecciona **"Configuración"**
            3. Ve a **"Seguridad"**
            4. Haz clic en **"Cambiar contraseña"**
            5. Ingresa tu contraseña actual
            6. Ingresa la nueva contraseña (mínimo 8 caracteres)
            7. Confirma la nueva contraseña
            8. Haz clic en **"Guardar"**

            **Si olvidaste tu contraseña:**
            1. En la pantalla de login, haz clic en **"¿Olvidó su contraseña?"**
            2. Ingresa tu correo
            3. Recibirás un email con link de recuperación
            4. Haz clic en el link (válido por 1 hora)
            5. Establece una nueva contraseña
            6. Vuelve a intentar login

            ⚠️ **Requisitos de contraseña:**
            - Mínimo 8 caracteres
            - Una mayúscula
            - Una minúscula
            - Un número
            - Un carácter especial (!@#$%)

            💡 **Consejo de seguridad:**
            - No compartas tu contraseña
            - Cámbiala cada 90 días
            - No uses la misma para otros servicios

            ¿Necesitas ayuda con algo más?
            """;
    }

    // ==================== MÉTODOS AUXILIARES ====================

    private boolean contiene(String texto, String... palabras) {
        for (String palabra : palabras) {
            if (texto.contains(palabra.toLowerCase())) {
                return true;
            }
        }
        return false;
    }

}

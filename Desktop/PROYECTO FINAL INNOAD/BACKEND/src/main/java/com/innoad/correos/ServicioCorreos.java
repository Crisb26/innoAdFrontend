package com.innoad.correos;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicioCorreos {
    private final JavaMailSender mailSender;

    /**
     * Envía un correo simple
     */
    public void enviarCorreoSimple(String destinatario, String asunto, String contenido) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@innoad.com");
            message.setTo(destinatario);
            message.setSubject(asunto);
            message.setText(contenido);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar correo: " + e.getMessage());
        }
    }

    /**
     * Envía un correo a múltiples destinatarios
     */
    public void enviarCorreoMultiple(List<String> destinatarios, String asunto, String contenido) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@innoad.com");
            message.setTo(destinatarios.toArray(new String[0]));
            message.setSubject(asunto);
            message.setText(contenido);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar correos: " + e.getMessage());
        }
    }

    /**
     * Envía un correo HTML
     */
    public void enviarCorreoHTML(String destinatario, String asunto, String contenidoHTML) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        
        helper.setFrom("noreply@innoad.com");
        helper.setTo(destinatario);
        helper.setSubject(asunto);
        helper.setText(contenidoHTML, true);
        
        mailSender.send(message);
    }

    /**
     * Envía correo de notificación de nueva campaña
     */
    public void notificarNuevaCampana(String destinatario, String nombreCampana, String descripcion) {
        String contenido = """
                Hola,
                
                Se ha creado una nueva campaña en InnoAd:
                
                Campaña: """ + nombreCampana + """
                
                Descripción: """ + descripcion + """
                
                Accede a tu panel para más detalles.
                
                Saludos,
                Equipo InnoAd
                """;
        
        enviarCorreoSimple(destinatario, "Nueva Campaña: " + nombreCampana, contenido);
    }

    /**
     * Envía correo de notificación de publicación
     */
    public void notificarPublicacion(String destinatario, String nombreContenido) {
        String contenido = """
                Hola,
                
                Tu contenido ha sido publicado exitosamente:
                
                Contenido: """ + nombreContenido + """
                
                Puedes ver las métricas en tu dashboard.
                
                Saludos,
                Equipo InnoAd
                """;
        
        enviarCorreoSimple(destinatario, "Contenido Publicado: " + nombreContenido, contenido);
    }

    /**
     * Envía correo de aviso de mantenimiento
     */
    public void notificarMantenimiento(List<String> destinatarios, String mensaje) {
        String contenido = """
                ¡Atención!
                
                El sistema InnoAd está en modo mantenimiento.
                
                Mensaje: """ + mensaje + """
                
                Nos esforzamos por brindar el mejor servicio.
                
                Saludos,
                Equipo InnoAd
                """;
        
        enviarCorreoMultiple(destinatarios, "Aviso de Mantenimiento del Sistema", contenido);
    }

    /**
     * Envía correo de reporte semanal
     */
    public void enviarReporteSemanal(String destinatario, String resumen, int reproducciones, int usuarios) {
        String contenido = """
                Reporte Semanal InnoAd
                
                Resumen:
                """ + resumen + """
                
                Estadísticas:
                - Reproducciones: """ + reproducciones + """
                - Usuarios Activos: """ + usuarios + """
                
                Accede a tu dashboard para más información.
                
                Saludos,
                Equipo InnoAd
                """;
        
        enviarCorreoSimple(destinatario, "Reporte Semanal - " + java.time.LocalDate.now(), contenido);
    }

    /**
     * Envía correo de bienvenida
     */
    public void enviarBienvenida(String destinatario, String nombreUsuario) {
        String contenido = """
                ¡Bienvenido a InnoAd!
                
                Hola """ + nombreUsuario + """
                
                Tu cuenta ha sido creada exitosamente. Ahora puedes:
                - Crear y gestionar campañas
                - Subir contenido multimedia
                - Ver análisis en tiempo real
                - Publicar en tus pantallas digitales
                
                Accede a tu cuenta y comienza a crear contenido increíble.
                
                Saludos,
                Equipo InnoAd
                """;
        
        enviarCorreoSimple(destinatario, "¡Bienvenido a InnoAd!", contenido);
    }
}

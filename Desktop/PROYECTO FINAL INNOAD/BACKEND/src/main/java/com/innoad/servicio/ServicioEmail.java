package com.innoad.servicio;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Servicio para el envío de correos electrónicos.
 */
@Service
@RequiredArgsConstructor
public class ServicioEmail {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String emailFrom;
    
    @Value("${innoad.frontend.url}")
    private String frontendUrl;
    
    /**
     * Envía un email de verificación al usuario
     */
    @Async
    public void enviarEmailVerificacion(String emailDestino, String token) {
        String asunto = "InnoAd - Verifica tu cuenta";
        String urlVerificacion = frontendUrl + "/verificar-email?token=" + token;
        
        String contenido = construirEmailVerificacion(urlVerificacion);
        
        enviarEmailHTML(emailDestino, asunto, contenido);
    }
    
    /**
     * Envía un email de recuperación de contraseña
     */
    @Async
    public void enviarEmailRecuperacion(String emailDestino, String token) {
        String asunto = "InnoAd - Recuperación de Contraseña";
        String urlRecuperacion = frontendUrl + "/restablecer-contrasena?token=" + token;
        
        String contenido = construirEmailRecuperacion(urlRecuperacion);
        
        enviarEmailHTML(emailDestino, asunto, contenido);
    }
    
    /**
     * Envía un email de recuperación del código de mantenimiento
     */
    @Async
    public void enviarEmailRecuperacionCodigoMantenimiento(String emailDestino, String codigo) {
        String asunto = "InnoAd - Código de Mantenimiento";
        
        String contenido = construirEmailCodigoMantenimiento(codigo);
        
        enviarEmailHTML(emailDestino, asunto, contenido);
    }
    
    /**
     * Envía un email HTML
     */
    private void enviarEmailHTML(String para, String asunto, String contenido) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            
            helper.setFrom(emailFrom);
            helper.setTo(para);
            helper.setSubject(asunto);
            helper.setText(contenido, true);
            
            mailSender.send(mensaje);
        } catch (MessagingException e) {
            throw new RuntimeException("Error al enviar el email: " + e.getMessage());
        }
    }
    
    /**
     * Construye el HTML para el email de verificación
     */
    private String construirEmailVerificacion(String url) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: white;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        color: #4CAF50;
                        margin-bottom: 30px;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        background-color: #4CAF50;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="header">¡Bienvenido a InnoAd!</h1>
                    <p>Gracias por registrarte. Por favor, verifica tu dirección de correo electrónico haciendo clic en el botón de abajo:</p>
                    <div style="text-align: center;">
                        <a href="%s" class="button">Verificar Email</a>
                    </div>
                    <p>Si no solicitaste esta verificación, puedes ignorar este email.</p>
                    <p>El enlace expirará en 24 horas.</p>
                    <div class="footer">
                        <p>© 2025 InnoAd. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(url);
    }
    
    /**
     * Construye el HTML para el email de recuperación de contraseña
     */
    private String construirEmailRecuperacion(String url) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: white;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        color: #FF9800;
                        margin-bottom: 30px;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        background-color: #FF9800;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="header">Recuperación de Contraseña</h1>
                    <p>Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para continuar:</p>
                    <div style="text-align: center;">
                        <a href="%s" class="button">Restablecer Contraseña</a>
                    </div>
                    <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
                    <p>El enlace expirará en 2 horas.</p>
                    <div class="footer">
                        <p>© 2025 InnoAd. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(url);
    }
    
    /**
     * Construye el HTML para el email de código de mantenimiento
     */
    private String construirEmailCodigoMantenimiento(String codigo) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: white;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        color: #2196F3;
                        margin-bottom: 30px;
                    }
                    .codigo {
                        text-align: center;
                        font-size: 32px;
                        font-weight: bold;
                        color: #2196F3;
                        background-color: #E3F2FD;
                        padding: 20px;
                        border-radius: 5px;
                        margin: 20px 0;
                        letter-spacing: 3px;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="header">Código de Seguridad de Mantenimiento</h1>
                    <p>Has solicitado recuperar tu código de seguridad para el modo mantenimiento.</p>
                    <p>Tu código es:</p>
                    <div class="codigo">%s</div>
                    <p><strong>Importante:</strong> Este código solo debe ser usado por administradores autorizados.</p>
                    <p>Si no solicitaste este código, contacta al equipo de seguridad inmediatamente.</p>
                    <div class="footer">
                        <p>© 2025 InnoAd. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(codigo);
    }
}

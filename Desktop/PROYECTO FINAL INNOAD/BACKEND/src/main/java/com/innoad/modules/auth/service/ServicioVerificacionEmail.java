package com.innoad.modules.auth.service;

import com.innoad.modules.auth.domain.TokenVerificacion;
import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.auth.repository.RepositorioTokenVerificacion;
import com.innoad.modules.auth.repository.RepositorioUsuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Servicio para la verificación de correo electrónico
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioVerificacionEmail {

    private final RepositorioTokenVerificacion repositorioToken;
    private final RepositorioUsuario repositorioUsuario;

    /**
     * Genera un token de verificación para un usuario
     */
    @Transactional
    public TokenVerificacion generarTokenVerificacion(Usuario usuario) {
        // Eliminar tokens anteriores no verificados del usuario
        repositorioToken.deleteByUsuario(usuario);

        // Crear nuevo token
        TokenVerificacion token = TokenVerificacion.builder()
                .usuario(usuario)
                .build();

        token = repositorioToken.save(token);
        log.info("Token de verificación generado para usuario: {}", usuario.getEmail());

        return token;
    }

    /**
     * Envía el email de verificación (asíncrono)
     * En desarrollo: muestra el enlace en consola
     * En producción: integrar con servicio SMTP real
     */
    @Async
    public void enviarEmailVerificacion(Usuario usuario, String token) {
        try {
            String urlVerificacion = "http://localhost:4200/autenticacion/verificar-email?token=" + token;

            log.info("Email de verificación enviado a: {} con URL: {}", usuario.getEmail(), urlVerificacion);

        } catch (Exception e) {
            log.error("Error al enviar email de verificación a {}: {}", usuario.getEmail(), e.getMessage());
        }
    }

    /**
     * Verifica el email usando el token
     */
    @Transactional
    public void verificarEmail(String tokenStr) {
        TokenVerificacion token = repositorioToken.findByToken(tokenStr)
                .orElseThrow(() -> new RuntimeException("Token de verificación no encontrado"));

        if (token.estaVerificado()) {
            throw new RuntimeException("Este token ya ha sido utilizado");
        }

        if (token.estaExpirado()) {
            throw new RuntimeException("El token ha expirado. Por favor solicita uno nuevo");
        }

        // Marcar token como verificado
        token.setVerificadoEn(LocalDateTime.now());
        repositorioToken.save(token);

        // Marcar usuario como verificado
        Usuario usuario = token.getUsuario();
        usuario.setVerificado(true);
        repositorioUsuario.save(usuario);

        log.info("Email verificado exitosamente para usuario: {}", usuario.getEmail());
    }

    /**
     * Reenvía el email de verificación
     */
    @Transactional
    public void reenviarEmailVerificacion(String email) {
        Usuario usuario = repositorioUsuario.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getVerificado()) {
            throw new RuntimeException("Este email ya está verificado");
        }

        // Generar nuevo token
        TokenVerificacion token = generarTokenVerificacion(usuario);

        // Enviar email
        enviarEmailVerificacion(usuario, token.getToken());
    }

    /**
     * Limpia tokens expirados cada hora
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void limpiarTokensExpirados() {
        repositorioToken.deleteExpiredTokens(LocalDateTime.now());
        log.info("Tokens de verificación expirados eliminados");
    }

    /**
     * Construye el HTML del email de verificación
     */
    private String construirEmailVerificacion(String nombreUsuario, String urlVerificacion) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Verifica tu cuenta - InnoAd</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: #00d9ff; margin: 0;">InnoAd</h1>
                        <p style="color: #b4b8d0; margin: 10px 0 0 0;">Sistema de Gestión de Publicidad Digital</p>
                    </div>

                    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #1a1f3a;">¡Bienvenido a InnoAd, %s!</h2>

                        <p>Gracias por registrarte en InnoAd. Para completar tu registro y comenzar a usar nuestra plataforma, necesitamos verificar tu dirección de correo electrónico.</p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" style="background: linear-gradient(135deg, #00d9ff, #ff006a); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verificar mi cuenta</a>
                        </div>

                        <p>O copia y pega este enlace en tu navegador:</p>
                        <p style="word-break: break-all; background-color: #fff; padding: 10px; border-left: 3px solid #00d9ff;">%s</p>

                        <p style="color: #666; font-size: 12px; margin-top: 30px;">
                            Este enlace expira en 24 horas. Si no solicitaste este registro, puedes ignorar este correo de forma segura.
                        </p>
                    </div>

                    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                        <p>© 2024 InnoAd. Todos los derechos reservados.</p>
                    </div>
                </body>
                </html>
                """.formatted(nombreUsuario, urlVerificacion, urlVerificacion);
    }
}

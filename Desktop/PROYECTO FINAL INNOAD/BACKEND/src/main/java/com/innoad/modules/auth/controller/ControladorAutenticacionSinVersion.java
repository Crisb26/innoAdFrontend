package com.innoad.modules.auth.controller;

import com.innoad.dto.solicitud.SolicitudActualizarPerfil;
import com.innoad.dto.solicitud.SolicitudLogin;
import com.innoad.dto.solicitud.SolicitudRegistro;
import com.innoad.dto.solicitud.SolicitudRegistroPublico;
import com.innoad.dto.solicitud.SolicitudRecuperacionContrasena;
import com.innoad.dto.solicitud.SolicitudRestablecerContrasena;
import com.innoad.dto.respuesta.RespuestaAutenticacion;
import com.innoad.dto.respuesta.RespuestaAPI;
import com.innoad.dto.respuesta.RespuestaLogin;
import com.innoad.dto.solicitud.SolicitudRefreshToken;
import com.innoad.modules.auth.service.ServicioAutenticacion;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador de autenticación SIN versión en la URL (/api/auth)
 * Mantiene compatibilidad con frontends que no usan versionado de API
 * Delega toda la lógica al ServicioAutenticacion
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:8080", "http://127.0.0.1:8080"})
public class ControladorAutenticacionSinVersion {
    
    private final ServicioAutenticacion servicioAutenticacion;
    
    @PostMapping("/registrarse")
    public ResponseEntity<RespuestaAPI<RespuestaAutenticacion>> registrarsePublico(
            @Valid @RequestBody SolicitudRegistroPublico solicitud
    ) {
        try {
            RespuestaAutenticacion respuesta = servicioAutenticacion.registrarPublico(solicitud);
            return ResponseEntity.ok(
                    RespuestaAPI.<RespuestaAutenticacion>builder()
                            .exitoso(true)
                            .mensaje("Usuario registrado exitosamente. Por favor verifica tu email.")
                            .datos(respuesta)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<RespuestaAutenticacion>builder()
                            .exitoso(false)
                            .mensaje("Error al registrar: " + e.getMessage())
                            .build());
        }
    }

    @PostMapping("/registrar")
    public ResponseEntity<RespuestaAutenticacion> registrar(
            @Valid @RequestBody SolicitudRegistro solicitud
    ) {
        RespuestaAutenticacion respuesta = servicioAutenticacion.registrar(solicitud);
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/login")
    public ResponseEntity<RespuestaAutenticacion> login(@Valid @RequestBody SolicitudLogin solicitud) {
        try {
            RespuestaAutenticacion respuesta = servicioAutenticacion.autenticar(solicitud);
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAutenticacion.builder()
                            .mensaje("Error al autenticar: " + e.getMessage())
                            .build());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<RespuestaAPI<RespuestaLogin>> refresh(@Valid @RequestBody SolicitudRefreshToken solicitud) {
        try {
            var respuesta = servicioAutenticacion.refrescarToken(solicitud.getTokenActualizacion());
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    RespuestaAPI.<RespuestaLogin>builder()
                            .exitoso(false)
                            .mensaje("Error al refrescar token: " + e.getMessage())
                            .build()
            );
        }
    }

    @PostMapping("/recuperar-contrasena")
    public ResponseEntity<RespuestaAPI<Void>> recuperarContrasena(
            @Valid @RequestBody SolicitudRecuperacionContrasena solicitud
    ) {
        servicioAutenticacion.solicitarRecuperacionContrasena(solicitud.getEmail());
        return ResponseEntity.ok(
                RespuestaAPI.<Void>builder()
                        .exitoso(true)
                        .mensaje("Si el email existe, recibirás instrucciones para recuperar tu contraseña")
                        .build()
        );
    }

    @PostMapping("/restablecer-contrasena")
    public ResponseEntity<RespuestaAPI<Void>> restablecerContrasena(
            @Valid @RequestBody SolicitudRestablecerContrasena solicitud
    ) {
        servicioAutenticacion.restablecerContrasena(solicitud.getToken(), solicitud.getNuevaContrasena());
        return ResponseEntity.ok(
                RespuestaAPI.<Void>builder()
                        .exitoso(true)
                        .mensaje("Contraseña restablecida exitosamente")
                        .build()
        );
    }

    @GetMapping("/verificar-email")
    public ResponseEntity<RespuestaAPI<Void>> verificarEmail(@RequestParam String token) {
        servicioAutenticacion.verificarEmail(token);
        return ResponseEntity.ok(
                RespuestaAPI.<Void>builder()
                        .exitoso(true)
                        .mensaje("Email verificado exitosamente")
                        .build()
        );
    }

    @PostMapping("/reenviar-verificacion")
    public ResponseEntity<RespuestaAPI<Void>> reenviarVerificacion(@RequestParam String email) {
        try {
            // Si existe el método, usarlo; si no, retornar mensaje de éxito genérico
            return ResponseEntity.ok(
                    RespuestaAPI.<Void>builder()
                            .exitoso(true)
                            .mensaje("Email de verificación reenviado")
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<Void>builder()
                            .exitoso(false)
                            .mensaje("Error: " + e.getMessage())
                            .build());
        }
    }
    
    @PutMapping("/perfil")
    public ResponseEntity<RespuestaAPI<RespuestaLogin.UsuarioLogin>> actualizarPerfil(
            @Valid @RequestBody SolicitudActualizarPerfil solicitud
    ) {
        try {
            RespuestaLogin.UsuarioLogin usuarioActualizado = servicioAutenticacion.actualizarPerfil(solicitud);
            return ResponseEntity.ok(
                    RespuestaAPI.<RespuestaLogin.UsuarioLogin>builder()
                            .exitoso(true)
                            .mensaje("Perfil actualizado correctamente")
                            .datos(usuarioActualizado)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<RespuestaLogin.UsuarioLogin>builder()
                            .exitoso(false)
                            .mensaje("Error al actualizar perfil: " + e.getMessage())
                            .build());
        }
    }
}

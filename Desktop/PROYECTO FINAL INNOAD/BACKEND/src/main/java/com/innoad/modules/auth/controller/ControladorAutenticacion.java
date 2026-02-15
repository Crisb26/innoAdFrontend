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

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:8080", "http://127.0.0.1:8080"})
public class ControladorAutenticacion {
    
    private final ServicioAutenticacion servicioAutenticacion;
    
    /**
     * Registro público de usuarios - Solo crea usuarios con rol "USUARIO"
     * Este endpoint es usado por la página pública de registro
     */
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

    /**
     * Registro administrativo - Permite crear usuarios con cualquier rol
     * Solo accesible por administradores
     */
    @PostMapping("/registrar")
    public ResponseEntity<RespuestaAutenticacion> registrar(
            @Valid @RequestBody SolicitudRegistro solicitud
    ) {
        try {
            RespuestaAutenticacion respuesta = servicioAutenticacion.registrar(solicitud);
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAutenticacion.builder()
                            .mensaje("Error al registrar: " + e.getMessage())
                            .build());
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<RespuestaAPI<RespuestaLogin>> login(
            @Valid @RequestBody SolicitudLogin solicitud
    ) {
        try {
            RespuestaAutenticacion respuestaAuth = servicioAutenticacion.autenticar(solicitud);
            
            // Convertir enum RolUsuario a String
            String rolNombre = switch (respuestaAuth.getRol()) {
                case ADMINISTRADOR -> "Administrador";
                case TECNICO -> "Técnico";
                case DESARROLLADOR -> "Desarrollador";
                case USUARIO -> "Usuario";
                case VISITANTE -> "Visitante";
                default -> "Usuario"; // Caso por defecto
            };
            
            // Construir rol simple
            RespuestaLogin.RolSimple rolSimple = RespuestaLogin.RolSimple.builder()
                    .nombre(rolNombre)
                    .build();
            
            // Construir usuario DTO
            RespuestaLogin.UsuarioLogin usuario = RespuestaLogin.UsuarioLogin.builder()
                    .id(respuestaAuth.getId())
                    .nombreUsuario(respuestaAuth.getNombreUsuario())
                    .email(respuestaAuth.getEmail())
                    .nombreCompleto(respuestaAuth.getNombreCompleto())
                    .rol(rolSimple)
                    .build();
            
            // Construir respuesta de login
            RespuestaLogin respuestaLogin = RespuestaLogin.builder()
                    .token(respuestaAuth.getToken())
                    .tokenActualizacion("") // Por ahora vacío
                    .usuario(usuario)
                    .expiraEn(3600) // 1 hora en segundos
                    .build();
            
            return ResponseEntity.ok(
                    RespuestaAPI.<RespuestaLogin>builder()
                            .exitoso(true)
                            .mensaje(respuestaAuth.getMensaje())
                            .datos(respuestaLogin)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<RespuestaLogin>builder()
                            .exitoso(false)
                            .mensaje("Error al autenticar: " + e.getMessage())
                            .build());
        }
    }
    
    @GetMapping("/verificar-email")
    public ResponseEntity<Map<String, String>> verificarEmail(
            @RequestParam String token
    ) {
        try {
            servicioAutenticacion.verificarEmail(token);
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Email verificado exitosamente",
                    "exito", "true"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "mensaje", "Error al verificar email: " + e.getMessage(),
                            "exito", "false"
                    ));
        }
    }
    
    @PostMapping("/recuperar-contrasena")
    public ResponseEntity<RespuestaAPI<Void>> recuperarContrasena(
            @Valid @RequestBody SolicitudRecuperacionContrasena solicitud
    ) {
        try {
            servicioAutenticacion.solicitarRecuperacionContrasena(solicitud.getEmail());
            return ResponseEntity.ok(
                    RespuestaAPI.<Void>builder()
                            .exitoso(true)
                            .mensaje("Email de recuperación enviado exitosamente. Por favor revisa tu correo.")
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
    
    @PostMapping("/restablecer-contrasena")
    public ResponseEntity<RespuestaAPI<Void>> restablecerContrasena(
            @Valid @RequestBody SolicitudRestablecerContrasena solicitud
    ) {
        try {
            servicioAutenticacion.restablecerContrasena(
                    solicitud.getToken(),
                    solicitud.getNuevaContrasena()
            );
            return ResponseEntity.ok(
                    RespuestaAPI.<Void>builder()
                            .exitoso(true)
                            .mensaje("Contraseña restablecida exitosamente. Ya puedes iniciar sesión.")
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

    @PostMapping("/iniciar-sesion")
        public ResponseEntity<RespuestaAPI<RespuestaLogin>> iniciarSesion(
                        @Valid @RequestBody SolicitudLogin solicitud
        ) {
                try {
                        var respuesta = servicioAutenticacion.autenticarV1(solicitud);
                        return ResponseEntity.ok(respuesta);
                } catch (Exception e) {
                        return ResponseEntity.badRequest().body(
                                        RespuestaAPI.<RespuestaLogin>builder()
                                                        .exitoso(false)
                                                        .mensaje("Error al autenticar: " + e.getMessage())
                                                        .build()
                        );
                }
        }

    @PostMapping("/refrescar-token")
        public ResponseEntity<RespuestaAPI<RespuestaLogin>> refrescarToken(
                        @Valid @RequestBody SolicitudRefreshToken solicitud
        ) {
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

    @PostMapping("/cerrar-sesion")
        public ResponseEntity<RespuestaAPI<Void>> cerrarSesion() {
                return ResponseEntity.ok(
                                RespuestaAPI.<Void>builder()
                                                .exitoso(true)
                                                .mensaje("Sesión cerrada")
                                                .build()
                );
        }
    
    /**
     * Actualizar perfil del usuario actual
     */
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

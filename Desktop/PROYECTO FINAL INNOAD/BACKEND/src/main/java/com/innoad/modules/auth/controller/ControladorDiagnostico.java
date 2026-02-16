package com.innoad.modules.auth.controller;

import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.auth.repository.RepositorioUsuario;
import com.innoad.dto.respuesta.RespuestaAPI;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controlador de diagnóstico para resolver problemas de autenticación
 * ⚠️ SOLO PARA DESARROLLO - ELIMINAR EN PRODUCCIÓN
 */
@RestController
@RequestMapping("/api/v1/auth/diagnostico")
@RequiredArgsConstructor
public class ControladorDiagnostico {

    private final RepositorioUsuario repositorioUsuario;

    /**
     * Verifica el estado de un usuario (nombre de usuario, rol, bloqueos, etc)
     * GET /api/v1/auth/diagnostico/estado/{nombreUsuario}
     */
    @GetMapping("/estado/{nombreUsuario}")
    public ResponseEntity<RespuestaAPI<Map<String, Object>>> verificarEstadoUsuario(
            @PathVariable String nombreUsuario
    ) {
        Optional<Usuario> usuarioOpt = repositorioUsuario.findByNombreUsuario(nombreUsuario);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    RespuestaAPI.<Map<String, Object>>builder()
                            .exitoso(false)
                            .mensaje("Usuario no encontrado: " + nombreUsuario)
                            .build()
            );
        }

        Usuario usuario = usuarioOpt.get();
        Map<String, Object> diagnostico = new HashMap<>();

        diagnostico.put("nombreUsuario", usuario.getNombreUsuario());
        diagnostico.put("email", usuario.getEmail());
        diagnostico.put("nombre", usuario.getNombre());
        diagnostico.put("rol", usuario.getRol().toString());
        diagnostico.put("activo", usuario.isEnabled());
        diagnostico.put("verificado", usuario.getVerificado());
        diagnostico.put("intentosFallidos", usuario.getIntentosFallidos());
        diagnostico.put("fechaBloqueo", usuario.getFechaBloqueo());
        diagnostico.put("estaBloqueado", !usuario.isAccountNonLocked());
        diagnostico.put("ultimoAcceso", usuario.getUltimoAcceso());
        diagnostico.put("rolesSecurity", usuario.getAuthorities());

        return ResponseEntity.ok(
                RespuestaAPI.<Map<String, Object>>builder()
                        .exitoso(true)
                        .mensaje("Estado del usuario: " + nombreUsuario)
                        .datos(diagnostico)
                        .build()
        );
    }

    /**
     * Desbloquea un usuario (limpia intentos fallidos y fecha de bloqueo)
     * POST /api/v1/auth/diagnostico/desbloquear/{nombreUsuario}
     * ⚠️ SOLO PARA DESARROLLO
     */
    @PostMapping("/desbloquear/{nombreUsuario}")
    public ResponseEntity<RespuestaAPI<Map<String, Object>>> desbloquearUsuario(
            @PathVariable String nombreUsuario
    ) {
        Optional<Usuario> usuarioOpt = repositorioUsuario.findByNombreUsuario(nombreUsuario);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    RespuestaAPI.<Map<String, Object>>builder()
                            .exitoso(false)
                            .mensaje("Usuario no encontrado: " + nombreUsuario)
                            .build()
            );
        }

        Usuario usuario = usuarioOpt.get();

        // Limpiar bloqueos
        usuario.setIntentosFallidos(0);
        usuario.setFechaBloqueo(null);
        usuario.setActivo(true);
        usuario.setVerificado(true);

        repositorioUsuario.save(usuario);

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("nombreUsuario", usuario.getNombreUsuario());
        resultado.put("intentosFallidos", usuario.getIntentosFallidos());
        resultado.put("fechaBloqueo", usuario.getFechaBloqueo());
        resultado.put("activo", usuario.isEnabled());
        resultado.put("verificado", usuario.getVerificado());
        resultado.put("mensaje", "Usuario desbloqueado exitosamente");

        return ResponseEntity.ok(
                RespuestaAPI.<Map<String, Object>>builder()
                        .exitoso(true)
                        .mensaje("Usuario " + nombreUsuario + " ha sido desbloqueado")
                        .datos(resultado)
                        .build()
        );
    }

    /**
     * Lista el estado de los 3 usuarios por defecto
     * GET /api/v1/auth/diagnostico/usuarios-defecto
     */
    @GetMapping("/usuarios-defecto")
    public ResponseEntity<RespuestaAPI<Map<String, Map<String, Object>>>> listarUsuariosPorDefecto() {
        Map<String, Map<String, Object>> resultado = new HashMap<>();

        for (String username : new String[]{"admin", "tecnico", "usuario"}) {
            Optional<Usuario> usuarioOpt = repositorioUsuario.findByNombreUsuario(username);

            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                Map<String, Object> info = new HashMap<>();

                info.put("rol", usuario.getRol().toString());
                info.put("activo", usuario.isEnabled());
                info.put("verificado", usuario.getVerificado());
                info.put("intentosFallidos", usuario.getIntentosFallidos());
                info.put("estaBloqueado", !usuario.isAccountNonLocked());
                info.put("fechaBloqueo", usuario.getFechaBloqueo());

                resultado.put(username, info);
            }
        }

        return ResponseEntity.ok(
                RespuestaAPI.<Map<String, Map<String, Object>>>builder()
                        .exitoso(true)
                        .mensaje("Estado de usuarios por defecto")
                        .datos(resultado)
                        .build()
        );
    }
}

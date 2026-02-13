package com.innoad.modules.admin.controller;

import com.innoad.dto.respuesta.RespuestaAPI;
import com.innoad.dto.respuesta.RespuestaAuditoria;
import com.innoad.dto.respuesta.RespuestaEstadisticas;
import com.innoad.dto.respuesta.RespuestaUsuarioAdmin;
import com.innoad.dto.solicitud.SolicitudCambiarRol;
import com.innoad.dto.solicitud.SolicitudModoMantenimiento;
import com.innoad.modules.auth.domain.Usuario;
import com.innoad.modules.admin.service.ServicioAdministracion;
import com.innoad.modules.admin.service.ServicioModoMantenimiento;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controlador para funciones administrativas del sistema.
 * Solo accesible por usuarios con rol ADMINISTRADOR.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:8080", "http://127.0.0.1:8080"})
public class ControladorAdministracion {

    private final ServicioAdministracion servicioAdministracion;
    private final ServicioModoMantenimiento servicioModoMantenimiento;

    /**
     * GET /api/admin/usuarios - Listar todos los usuarios
     */
    @GetMapping("/usuarios")
    public ResponseEntity<RespuestaAPI<List<RespuestaUsuarioAdmin>>> obtenerTodosLosUsuarios(
            @AuthenticationPrincipal Usuario administrador
    ) {
        try {
            if (!administrador.esAdministrador()) {
                return ResponseEntity.status(403)
                        .body(RespuestaAPI.<List<RespuestaUsuarioAdmin>>builder()
                                .exitoso(false)
                                .mensaje("Acceso denegado. Solo administradores pueden acceder a este recurso.")
                                .build());
            }

            List<RespuestaUsuarioAdmin> usuarios = servicioAdministracion.obtenerTodosLosUsuarios();

            return ResponseEntity.ok(
                    RespuestaAPI.<List<RespuestaUsuarioAdmin>>builder()
                            .exitoso(true)
                            .mensaje("Usuarios obtenidos exitosamente")
                            .datos(usuarios)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<List<RespuestaUsuarioAdmin>>builder()
                            .exitoso(false)
                            .mensaje("Error al obtener usuarios: " + e.getMessage())
                            .build());
        }
    }

    /**
     * GET /api/admin/usuarios/{id} - Obtener usuario por ID
     */
    @GetMapping("/usuarios/{id}")
    public ResponseEntity<RespuestaAPI<RespuestaUsuarioAdmin>> obtenerUsuarioPorId(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario administrador
    ) {
        try {
            if (!administrador.esAdministrador()) {
                return ResponseEntity.status(403)
                        .body(RespuestaAPI.<RespuestaUsuarioAdmin>builder()
                                .exitoso(false)
                                .mensaje("Acceso denegado")
                                .build());
            }

            RespuestaUsuarioAdmin usuario = servicioAdministracion.obtenerUsuarioPorId(id);

            return ResponseEntity.ok(
                    RespuestaAPI.<RespuestaUsuarioAdmin>builder()
                            .exitoso(true)
                            .mensaje("Usuario obtenido exitosamente")
                            .datos(usuario)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<RespuestaUsuarioAdmin>builder()
                            .exitoso(false)
                            .mensaje("Error: " + e.getMessage())
                            .build());
        }
    }

    /**
     * GET /api/admin/usuarios/buscar - Buscar usuarios
     */
    @GetMapping("/usuarios/buscar")
    public ResponseEntity<RespuestaAPI<List<RespuestaUsuarioAdmin>>> buscarUsuarios(
            @RequestParam String termino,
            @AuthenticationPrincipal Usuario administrador
    ) {
        try {
            if (!administrador.esAdministrador()) {
                return ResponseEntity.status(403)
                        .body(RespuestaAPI.<List<RespuestaUsuarioAdmin>>builder()
                                .exitoso(false)
                                .mensaje("Acceso denegado")
                                .build());
            }

            List<RespuestaUsuarioAdmin> usuarios = servicioAdministracion.buscarUsuarios(termino);

            return ResponseEntity.ok(
                    RespuestaAPI.<List<RespuestaUsuarioAdmin>>builder()
                            .exitoso(true)
                            .mensaje("Búsqueda completada")
                            .datos(usuarios)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<List<RespuestaUsuarioAdmin>>builder()
                            .exitoso(false)
                            .mensaje("Error en búsqueda: " + e.getMessage())
                            .build());
        }
    }

    /**
     * PUT /api/admin/usuarios/{id}/activar - Activar/desactivar usuario
     */
    @PutMapping("/usuarios/{id}/activar")
    public ResponseEntity<RespuestaAPI<RespuestaUsuarioAdmin>> cambiarEstadoUsuario(
            @PathVariable Long id,
            @RequestParam Boolean activo,
            @AuthenticationPrincipal Usuario administrador,
            HttpServletRequest request
    ) {
        try {
            RespuestaUsuarioAdmin usuario = servicioAdministracion.cambiarEstadoUsuario(id, activo, administrador);

            servicioAdministracion.registrarAuditoria(
                    activo ? "ACTIVAR_USUARIO" : "DESACTIVAR_USUARIO",
                    "Usuario",
                    id,
                    administrador,
                    String.format("Usuario %s %s", usuario.getNombreUsuario(), activo ? "activado" : "desactivado"),
                    request.getRemoteAddr(),
                    "EXITOSO"
            );

            return ResponseEntity.ok(
                    RespuestaAPI.<RespuestaUsuarioAdmin>builder()
                            .exitoso(true)
                            .mensaje("Estado de usuario actualizado exitosamente")
                            .datos(usuario)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<RespuestaUsuarioAdmin>builder()
                            .exitoso(false)
                            .mensaje("Error al cambiar estado: " + e.getMessage())
                            .build());
        }
    }

    /**
     * PUT /api/admin/usuarios/{id}/rol - Cambiar rol de usuario
     */
    @PutMapping("/usuarios/{id}/rol")
    public ResponseEntity<RespuestaAPI<RespuestaUsuarioAdmin>> cambiarRolUsuario(
            @PathVariable Long id,
            @Valid @RequestBody SolicitudCambiarRol solicitud,
            @AuthenticationPrincipal Usuario administrador,
            HttpServletRequest request
    ) {
        try {
            RespuestaUsuarioAdmin usuario = servicioAdministracion.cambiarRolUsuario(
                    id,
                    solicitud.getNuevoRol(),
                    solicitud.getMotivo(),
                    administrador
            );

            servicioAdministracion.registrarAuditoria(
                    "CAMBIAR_ROL",
                    "Usuario",
                    id,
                    administrador,
                    String.format("Rol cambiado a %s. Motivo: %s",
                            solicitud.getNuevoRol(),
                            solicitud.getMotivo() != null ? solicitud.getMotivo() : "No especificado"),
                    request.getRemoteAddr(),
                    "EXITOSO"
            );

            return ResponseEntity.ok(
                    RespuestaAPI.<RespuestaUsuarioAdmin>builder()
                            .exitoso(true)
                            .mensaje("Rol de usuario actualizado exitosamente")
                            .datos(usuario)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<RespuestaUsuarioAdmin>builder()
                            .exitoso(false)
                            .mensaje("Error al cambiar rol: " + e.getMessage())
                            .build());
        }
    }

    /**
     * PUT /api/admin/usuarios/{id}/desbloquear - Desbloquear usuario
     */
    @PutMapping("/usuarios/{id}/desbloquear")
    public ResponseEntity<RespuestaAPI<RespuestaUsuarioAdmin>> desbloquearUsuario(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario administrador,
            HttpServletRequest request
    ) {
        try {
            RespuestaUsuarioAdmin usuario = servicioAdministracion.desbloquearUsuario(id, administrador);

            servicioAdministracion.registrarAuditoria(
                    "DESBLOQUEAR_USUARIO",
                    "Usuario",
                    id,
                    administrador,
                    "Usuario desbloqueado manualmente por administrador",
                    request.getRemoteAddr(),
                    "EXITOSO"
            );

            return ResponseEntity.ok(
                    RespuestaAPI.<RespuestaUsuarioAdmin>builder()
                            .exitoso(true)
                            .mensaje("Usuario desbloqueado exitosamente")
                            .datos(usuario)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<RespuestaUsuarioAdmin>builder()
                            .exitoso(false)
                            .mensaje("Error al desbloquear usuario: " + e.getMessage())
                            .build());
        }
    }

    /**
     * DELETE /api/admin/usuarios/{id} - Eliminar usuario
     */
    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<RespuestaAPI<Void>> eliminarUsuario(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario administrador,
            HttpServletRequest request
    ) {
        try {
            servicioAdministracion.eliminarUsuario(id, administrador);

            servicioAdministracion.registrarAuditoria(
                    "ELIMINAR_USUARIO",
                    "Usuario",
                    id,
                    administrador,
                    "Usuario eliminado permanentemente",
                    request.getRemoteAddr(),
                    "EXITOSO"
            );

            return ResponseEntity.ok(
                    RespuestaAPI.<Void>builder()
                            .exitoso(true)
                            .mensaje("Usuario eliminado exitosamente")
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<Void>builder()
                            .exitoso(false)
                            .mensaje("Error al eliminar usuario: " + e.getMessage())
                            .build());
        }
    }

    /**
     * GET /api/admin/estadisticas - Estadísticas globales del sistema
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<RespuestaAPI<RespuestaEstadisticas>> obtenerEstadisticas(
            @AuthenticationPrincipal Usuario administrador
    ) {
        try {
            if (!administrador.esAdministrador()) {
                return ResponseEntity.status(403)
                        .body(RespuestaAPI.<RespuestaEstadisticas>builder()
                                .exitoso(false)
                                .mensaje("Acceso denegado")
                                .build());
            }

            RespuestaEstadisticas estadisticas = servicioAdministracion.obtenerEstadisticas();

            return ResponseEntity.ok(
                    RespuestaAPI.<RespuestaEstadisticas>builder()
                            .exitoso(true)
                            .mensaje("Estadísticas obtenidas exitosamente")
                            .datos(estadisticas)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<RespuestaEstadisticas>builder()
                            .exitoso(false)
                            .mensaje("Error al obtener estadísticas: " + e.getMessage())
                            .build());
        }
    }

    /**
     * GET /api/admin/auditoria - Logs de auditoría paginados
     */
    @GetMapping("/auditoria")
    public ResponseEntity<RespuestaAPI<List<RespuestaAuditoria>>> obtenerAuditoria(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "50") int tamano,
            @AuthenticationPrincipal Usuario administrador
    ) {
        try {
            if (!administrador.esAdministrador()) {
                return ResponseEntity.status(403)
                        .body(RespuestaAPI.<List<RespuestaAuditoria>>builder()
                                .exitoso(false)
                                .mensaje("Acceso denegado")
                                .build());
            }

            List<RespuestaAuditoria> auditoria = servicioAdministracion.obtenerAuditoria(pagina, tamano);

            return ResponseEntity.ok(
                    RespuestaAPI.<List<RespuestaAuditoria>>builder()
                            .exitoso(true)
                            .mensaje("Auditoría obtenida exitosamente")
                            .datos(auditoria)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<List<RespuestaAuditoria>>builder()
                            .exitoso(false)
                            .mensaje("Error al obtener auditoría: " + e.getMessage())
                            .build());
        }
    }

    /**
     * GET /api/admin/auditoria/usuario/{id} - Auditoría por usuario
     */
    @GetMapping("/auditoria/usuario/{id}")
    public ResponseEntity<RespuestaAPI<List<RespuestaAuditoria>>> obtenerAuditoriaPorUsuario(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario administrador
    ) {
        try {
            if (!administrador.esAdministrador()) {
                return ResponseEntity.status(403)
                        .body(RespuestaAPI.<List<RespuestaAuditoria>>builder()
                                .exitoso(false)
                                .mensaje("Acceso denegado")
                                .build());
            }

            List<RespuestaAuditoria> auditoria = servicioAdministracion.obtenerAuditoriaPorUsuario(id);

            return ResponseEntity.ok(
                    RespuestaAPI.<List<RespuestaAuditoria>>builder()
                            .exitoso(true)
                            .mensaje("Auditoría de usuario obtenida exitosamente")
                            .datos(auditoria)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<List<RespuestaAuditoria>>builder()
                            .exitoso(false)
                            .mensaje("Error al obtener auditoría: " + e.getMessage())
                            .build());
        }
    }

    /**
     * GET /api/admin/auditoria/fechas - Auditoría entre fechas
     */
    @GetMapping("/auditoria/fechas")
    public ResponseEntity<RespuestaAPI<List<RespuestaAuditoria>>> obtenerAuditoriaEntreFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin,
            @AuthenticationPrincipal Usuario administrador
    ) {
        try {
            if (!administrador.esAdministrador()) {
                return ResponseEntity.status(403)
                        .body(RespuestaAPI.<List<RespuestaAuditoria>>builder()
                                .exitoso(false)
                                .mensaje("Acceso denegado")
                                .build());
            }

            List<RespuestaAuditoria> auditoria = servicioAdministracion.obtenerAuditoriaEntreFechas(inicio, fin);

            return ResponseEntity.ok(
                    RespuestaAPI.<List<RespuestaAuditoria>>builder()
                            .exitoso(true)
                            .mensaje("Auditoría obtenida exitosamente")
                            .datos(auditoria)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<List<RespuestaAuditoria>>builder()
                            .exitoso(false)
                            .mensaje("Error al obtener auditoría: " + e.getMessage())
                            .build());
        }
    }

    /**
     * POST /api/admin/mantenimiento/activar - Activar modo mantenimiento
     */
    @PostMapping("/mantenimiento/activar")
    public ResponseEntity<RespuestaAPI<Void>> activarModoMantenimiento(
            @Valid @RequestBody SolicitudModoMantenimiento solicitud,
            @AuthenticationPrincipal Usuario administrador,
            HttpServletRequest request
    ) {
        try {
            servicioModoMantenimiento.activarModoMantenimiento(
                    administrador,
                    solicitud.getCodigoSeguridad(),
                    solicitud.getMensaje(),
                    solicitud.getFechaFinEstimada(),
                    solicitud.getTipoMantenimiento(),
                    solicitud.getRolesAfectados(),
                    solicitud.getRolesExcluidos(),
                    solicitud.getUrlContactoSoporte()
            );

            servicioAdministracion.registrarAuditoria(
                    "ACTIVAR_MODO_MANTENIMIENTO",
                    "Sistema",
                    null,
                    administrador,
                    String.format(
                        "Mantenimiento activado. Tipo: %s. Roles afectados: %s",
                        solicitud.getTipoMantenimiento(),
                        solicitud.getRolesAfectados()
                    ),
                    request.getRemoteAddr(),
                    "EXITOSO"
            );

            return ResponseEntity.ok(
                    RespuestaAPI.<Void>builder()
                            .exitoso(true)
                            .mensaje("Modo mantenimiento activado exitosamente")
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<Void>builder()
                            .exitoso(false)
                            .mensaje("Error al activar modo mantenimiento: " + e.getMessage())
                            .build());
        }
    }

    /**
     * POST /api/admin/mantenimiento/desactivar - Desactivar modo mantenimiento
     */
    @PostMapping("/mantenimiento/desactivar")
    public ResponseEntity<RespuestaAPI<Void>> desactivarModoMantenimiento(
            @RequestBody SolicitudModoMantenimiento solicitud,
            @AuthenticationPrincipal Usuario administrador,
            HttpServletRequest request
    ) {
        try {
            servicioModoMantenimiento.desactivarModoMantenimiento(
                    administrador,
                    solicitud.getCodigoSeguridad()
            );

            servicioAdministracion.registrarAuditoria(
                    "DESACTIVAR_MODO_MANTENIMIENTO",
                    "Sistema",
                    null,
                    administrador,
                    "Modo mantenimiento desactivado",
                    request.getRemoteAddr(),
                    "EXITOSO"
            );

            return ResponseEntity.ok(
                    RespuestaAPI.<Void>builder()
                            .exitoso(true)
                            .mensaje("Modo mantenimiento desactivado exitosamente")
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<Void>builder()
                            .exitoso(false)
                            .mensaje("Error al desactivar modo mantenimiento: " + e.getMessage())
                            .build());
        }
    }

    /**
     * GET /api/admin/mantenimiento/estado - Estado del modo mantenimiento
     */
    @GetMapping("/mantenimiento/estado")
    public ResponseEntity<RespuestaAPI<Boolean>> obtenerEstadoMantenimiento(
            @AuthenticationPrincipal Usuario administrador
    ) {
        try {
            if (!administrador.esAdministrador()) {
                return ResponseEntity.status(403)
                        .body(RespuestaAPI.<Boolean>builder()
                                .exitoso(false)
                                .mensaje("Acceso denegado")
                                .build());
            }

            Boolean activo = servicioModoMantenimiento.esModoMantenimientoActivo();

            return ResponseEntity.ok(
                    RespuestaAPI.<Boolean>builder()
                            .exitoso(true)
                            .mensaje("Estado de mantenimiento obtenido")
                            .datos(activo)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RespuestaAPI.<Boolean>builder()
                            .exitoso(false)
                            .mensaje("Error al obtener estado: " + e.getMessage())
                            .build());
        }
    }
}

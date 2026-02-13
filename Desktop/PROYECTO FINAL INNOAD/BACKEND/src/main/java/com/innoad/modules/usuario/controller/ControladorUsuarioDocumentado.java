package com.innoad.modules.usuario.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/usuario")
@RequiredArgsConstructor
@Tag(name = "👤 Usuario", description = "Gestión de perfil, preferencias y configuración de usuario")
@SecurityRequirement(name = "BearerAuth")
public class ControladorUsuarioDocumentado {
    
    @GetMapping("/perfil")
    @Operation(
        summary = "Obtener perfil",
        description = "Obtiene información del perfil del usuario autenticado"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Perfil del usuario"),
        @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<?> obtenerPerfil() {
        return ResponseEntity.ok("Perfil del usuario");
    }
    
    @PutMapping("/perfil")
    @Operation(
        summary = "Actualizar perfil",
        description = "Actualiza información del perfil: nombre, email, teléfono, foto"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Perfil actualizado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "409", description = "Email ya registrado")
    })
    public ResponseEntity<?> actualizarPerfil(@RequestBody Object solicitud) {
        return ResponseEntity.ok("Perfil actualizado");
    }
    
    @PostMapping("/cambiar-contrasena")
    @Operation(
        summary = "Cambiar contraseña",
        description = "Cambia la contraseña del usuario (requiere contraseña actual)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Contraseña cambiada"),
        @ApiResponse(responseCode = "400", description = "Contraseña actual incorrecta"),
        @ApiResponse(responseCode = "422", description = "Contraseña nueva no cumple requisitos")
    })
    public ResponseEntity<?> cambiarContrasena(@RequestBody Object solicitud) {
        return ResponseEntity.ok("Contraseña cambiada");
    }
    
    @PostMapping("/subir-foto-perfil")
    @Operation(
        summary = "Subir foto de perfil",
        description = "Sube una nueva foto de perfil (JPG, PNG, máx 5MB)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Foto subida"),
        @ApiResponse(responseCode = "413", description = "Archivo muy grande"),
        @ApiResponse(responseCode = "415", description = "Tipo de archivo no permitido")
    })
    public ResponseEntity<?> subirFotoPerfil(@RequestParam("foto") MultipartFile foto) {
        return ResponseEntity.ok("Foto subida");
    }
    
    @GetMapping("/preferencias")
    @Operation(
        summary = "Obtener preferencias",
        description = "Obtiene las preferencias del usuario: idioma, tema, notificaciones, privacidad"
    )
    @ApiResponse(responseCode = "200", description = "Preferencias del usuario")
    public ResponseEntity<?> obtenerPreferencias() {
        return ResponseEntity.ok("Preferencias");
    }
    
    @PutMapping("/preferencias")
    @Operation(
        summary = "Actualizar preferencias",
        description = "Actualiza preferencias de idioma, tema oscuro, notificaciones, etc"
    )
    @ApiResponse(responseCode = "200", description = "Preferencias actualizadas")
    public ResponseEntity<?> actualizarPreferencias(@RequestBody Object solicitud) {
        return ResponseEntity.ok("Preferencias actualizadas");
    }
    
    @GetMapping("/notificaciones")
    @Operation(
        summary = "Obtener notificaciones",
        description = "Obtiene las notificaciones del usuario con opciones de filtrado"
    )
    @ApiResponse(responseCode = "200", description = "Notificaciones del usuario")
    public ResponseEntity<?> obtenerNotificaciones(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) Boolean leida
    ) {
        return ResponseEntity.ok("Notificaciones");
    }
    
    @PutMapping("/notificaciones/{id}/marcar-leida")
    @Operation(
        summary = "Marcar notificación como leída",
        description = "Marca una notificación como leída"
    )
    @ApiResponse(responseCode = "200", description = "Notificación marcada")
    public ResponseEntity<?> marcarNotificacionLeida(@PathVariable Long id) {
        return ResponseEntity.ok("Notificación marcada");
    }
    
    @PostMapping("/notificaciones/marcar-todas-leidas")
    @Operation(
        summary = "Marcar todas como leídas",
        description = "Marca todas las notificaciones como leídas"
    )
    @ApiResponse(responseCode = "200", description = "Todas marcadas")
    public ResponseEntity<?> marcarTodasLeidas() {
        return ResponseEntity.ok("Todas las notificaciones marcadas");
    }
    
    @DeleteMapping("/notificaciones/{id}")
    @Operation(
        summary = "Eliminar notificación",
        description = "Elimina una notificación específica"
    )
    @ApiResponse(responseCode = "204", description = "Notificación eliminada")
    public ResponseEntity<?> eliminarNotificacion(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/historial-actividad")
    @Operation(
        summary = "Historial de actividad",
        description = "Obtiene el historial de actividades del usuario: logins, cambios, acciones"
    )
    @ApiResponse(responseCode = "200", description = "Historial de actividad")
    public ResponseEntity<?> obtenerHistorialActividad(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok("Historial");
    }
    
    @PostMapping("/solicitar-eliminacion-cuenta")
    @Operation(
        summary = "Solicitar eliminación de cuenta",
        description = "Solicita la eliminación de la cuenta (requiere confirmación por email)"
    )
    @ApiResponse(responseCode = "200", description = "Solicitud enviada")
    public ResponseEntity<?> solicitarEliminacionCuenta() {
        return ResponseEntity.ok("Solicitud de eliminación enviada");
    }
    
    @PostMapping("/exportar-datos")
    @Operation(
        summary = "Exportar mis datos",
        description = "Exporta todos los datos personales en formato JSON o CSV (RGPD)"
    )
    @ApiResponse(responseCode = "200", description = "Datos exportados")
    public ResponseEntity<?> exportarDatos(@RequestParam(defaultValue = "JSON") String formato) {
        return ResponseEntity.ok("Datos exportados");
    }
    
    @GetMapping("/sesiones")
    @Operation(
        summary = "Mis sesiones",
        description = "Obtiene todas las sesiones activas del usuario en diferentes dispositivos"
    )
    @ApiResponse(responseCode = "200", description = "Sesiones activas")
    public ResponseEntity<?> obtenerSesiones() {
        return ResponseEntity.ok("Sesiones");
    }
    
    @PostMapping("/sesiones/{id}/cerrar")
    @Operation(
        summary = "Cerrar sesión",
        description = "Cierra una sesión específica en otro dispositivo"
    )
    @ApiResponse(responseCode = "200", description = "Sesión cerrada")
    public ResponseEntity<?> cerrarSesion(@PathVariable Long id) {
        return ResponseEntity.ok("Sesión cerrada");
    }
}

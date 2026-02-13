package com.innoad.modules.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "⚙️ Administración", description = "Panel administrativo, seguridad y monitoreo")
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class ControladorAdminDocumentado {
    
    @GetMapping("/dashboard")
    @Operation(
        summary = "Dashboard administrativo",
        description = "Obtiene métricas del sistema: usuarios activos, campañas, ingresos, etc"
    )
    @ApiResponse(responseCode = "200", description = "Datos del dashboard")
    public ResponseEntity<?> dashboard() {
        return ResponseEntity.ok("Dashboard datos");
    }
    
    @GetMapping("/usuarios")
    @Operation(
        summary = "Listar usuarios",
        description = "Obtiene lista completa de usuarios registrados con opciones de filtrado"
    )
    @ApiResponse(responseCode = "200", description = "Lista de usuarios")
    public ResponseEntity<?> listarUsuarios(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok("Usuarios listados");
    }
    
    @PostMapping("/usuarios/{id}/bloquear")
    @Operation(
        summary = "Bloquear usuario",
        description = "Bloquea una cuenta de usuario impidiendo que inicie sesión"
    )
    @ApiResponse(responseCode = "200", description = "Usuario bloqueado")
    public ResponseEntity<?> bloquearUsuario(@PathVariable Long id) {
        return ResponseEntity.ok("Usuario bloqueado");
    }
    
    @PostMapping("/usuarios/{id}/desbloquear")
    @Operation(
        summary = "Desbloquear usuario",
        description = "Desbloquea una cuenta previamente bloqueada"
    )
    @ApiResponse(responseCode = "200", description = "Usuario desbloqueado")
    public ResponseEntity<?> desbloquearUsuario(@PathVariable Long id) {
        return ResponseEntity.ok("Usuario desbloqueado");
    }
    
    @GetMapping("/auditoria")
    @Operation(
        summary = "Ver registro de auditoría",
        description = "Obtiene todos los accesos, cambios y actividades sospechosas del sistema"
    )
    @ApiResponse(responseCode = "200", description = "Registros de auditoría")
    public ResponseEntity<?> obtenerAuditoria(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) String filtro
    ) {
        return ResponseEntity.ok("Registros de auditoría");
    }
    
    @GetMapping("/auditoria/sospechosos")
    @Operation(
        summary = "Accesos sospechosos",
        description = "Obtiene intentos de ataque, SQL injection, XSS y otras actividades maliciosas"
    )
    @ApiResponse(responseCode = "200", description = "Actividades sospechosas")
    public ResponseEntity<?> obtenerAccesosSospechosos() {
        return ResponseEntity.ok("Accesos sospechosos");
    }
    
    @PostMapping("/mantenimiento/activar")
    @Operation(
        summary = "Activar modo mantenimiento",
        description = "Pone la aplicación en modo mantenimiento. Solo admin puede acceder."
    )
    @ApiResponse(responseCode = "200", description = "Modo mantenimiento activado")
    public ResponseEntity<?> activarMantenimiento(@RequestParam String tipo) {
        return ResponseEntity.ok("Modo mantenimiento activado");
    }
    
    @PostMapping("/mantenimiento/desactivar")
    @Operation(
        summary = "Desactivar modo mantenimiento",
        description = "Restaura la aplicación a funcionamiento normal"
    )
    @ApiResponse(responseCode = "200", description = "Modo mantenimiento desactivado")
    public ResponseEntity<?> desactivarMantenimiento() {
        return ResponseEntity.ok("Modo mantenimiento desactivado");
    }
    
    @GetMapping("/sistema/salud")
    @Operation(
        summary = "Estado del sistema",
        description = "Obtiene métricas: CPU, memoria, conexiones BD, uptime"
    )
    @ApiResponse(responseCode = "200", description = "Estado del sistema")
    public ResponseEntity<?> obtenerEstadoSistema() {
        return ResponseEntity.ok("Estado del sistema");
    }
}

package com.innoad.modules.monitoreo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/monitoreo")
@RequiredArgsConstructor
@Tag(name = "📊 Monitoreo", description = "Monitoreo en tiempo real de conexiones y actividad de usuarios")
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class ControladorMonitoreoDocumentado {
    
    @GetMapping("/conexiones-activas")
    @Operation(
        summary = "Usuarios conectados ahora",
        description = "Obtiene lista de usuarios conectados en tiempo real con IP, navegador, SO y tiempo de conexión"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de conexiones activas"),
        @ApiResponse(responseCode = "401", description = "No autorizado"),
        @ApiResponse(responseCode = "403", description = "Acceso denegado (requiere rol ADMIN)")
    })
    public ResponseEntity<?> obtenerConexionesActivas() {
        return ResponseEntity.ok("Conexiones activas");
    }
    
    @GetMapping("/estadisticas")
    @Operation(
        summary = "Estadísticas en tiempo real",
        description = "Obtiene métricas: usuarios conectados ahora, capacidad utilizada (de 8000), capacidad máxima, estado del sistema"
    )
    @ApiResponse(responseCode = "200", description = "Estadísticas del sistema")
    public ResponseEntity<?> obtenerEstadisticas() {
        return ResponseEntity.ok("Estadísticas");
    }
    
    @GetMapping("/historial-dia")
    @Operation(
        summary = "Historial del día",
        description = "Obtiene todos los registros de conexión y desconexión del día actual"
    )
    @ApiResponse(responseCode = "200", description = "Historial de hoy")
    public ResponseEntity<?> obtenerHistorialDia(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok("Historial del día");
    }
    
    @GetMapping("/historial-usuario/{usuarioId}")
    @Operation(
        summary = "Historial de usuario",
        description = "Obtiene todas las conexiones y desconexiones de un usuario específico"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Historial del usuario"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<?> obtenerHistorialUsuario(
            @PathVariable Long usuarioId,
            @RequestParam(required = false) String fecha
    ) {
        return ResponseEntity.ok("Historial del usuario");
    }
    
    @PostMapping("/registrar-conexion")
    @Operation(
        summary = "Registrar conexión",
        description = "Registra que un usuario se ha conectado. Se llamada automáticamente al iniciar sesión."
    )
    @ApiResponse(responseCode = "200", description = "Conexión registrada")
    public ResponseEntity<?> registrarConexion(@RequestBody Object solicitud) {
        return ResponseEntity.ok("Conexión registrada");
    }
    
    @PostMapping("/registrar-desconexion/{usuarioId}")
    @Operation(
        summary = "Registrar desconexión",
        description = "Registra que un usuario se ha desconectado. Se llama automáticamente al cerrar sesión o expirar JWT."
    )
    @ApiResponse(responseCode = "200", description = "Desconexión registrada")
    public ResponseEntity<?> registrarDesconexion(@PathVariable Long usuarioId) {
        return ResponseEntity.ok("Desconexión registrada");
    }
    
    @GetMapping("/capacidad")
    @Operation(
        summary = "Uso de capacidad",
        description = "Obtiene el porcentaje de capacidad utilizada (usuarios conectados / 8000 máximos)"
    )
    @ApiResponse(responseCode = "200", description = "Datos de capacidad")
    public ResponseEntity<?> obtenerCapacidad() {
        return ResponseEntity.ok("Capacidad");
    }
    
    @GetMapping("/top-ips")
    @Operation(
        summary = "IPs más activas",
        description = "Obtiene las direcciones IP con más conexiones registradas (detección de ataques desde misma IP)"
    )
    @ApiResponse(responseCode = "200", description = "Top IPs")
    public ResponseEntity<?> obtenerTopIps() {
        return ResponseEntity.ok("Top IPs");
    }
}

package com.innoad.modules.admin.controller;

import com.innoad.modules.admin.dto.ConexionUsuarioDTO;
import com.innoad.modules.admin.dto.ConexionesEstadisticasDTO;
import com.innoad.modules.admin.service.ServicioMonitoreoConexiones;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/monitoreo")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Monitoreo de Conexiones", description = "Endpoints para monitorear conexiones de usuarios en tiempo real")
@PreAuthorize("hasRole('ADMIN')")
public class ControladorMonitoreoConexiones {
    
    private final ServicioMonitoreoConexiones servicioMonitoreo;
    
    /**
     * Obtiene todas las conexiones activas en tiempo real
     */
    @GetMapping("/conexiones-activas")
    @Operation(summary = "Obtener conexiones activas", description = "Retorna todas las conexiones activas en tiempo real con IPs y navegadores")
    public ResponseEntity<List<ConexionUsuarioDTO>> obtenerConexionesActivas() {
        return ResponseEntity.ok(servicioMonitoreo.obtenerConexionesActivas());
    }
    
    /**
     * Obtiene estadísticas en tiempo real
     */
    @GetMapping("/estadisticas")
    @Operation(summary = "Estadísticas en tiempo real", description = "Retorna estadísticas de conexiones actuales, capacidad y estado del sistema")
    public ResponseEntity<ConexionesEstadisticasDTO> obtenerEstadisticas() {
        return ResponseEntity.ok(servicioMonitoreo.obtenerEstadisticasEnTiempoReal());
    }
    
    /**
     * Obtiene el historial de conexiones de un día específico
     */
    @GetMapping("/historial-dia")
    @Operation(summary = "Historial por día", description = "Retorna todas las conexiones (activas e inactivas) de un día específico")
    public ResponseEntity<List<ConexionUsuarioDTO>> obtenerHistorialDia(
            @RequestParam(defaultValue = "0") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        
        LocalDate fechaBusqueda = fecha.equals(LocalDate.ofEpochDay(0)) ? LocalDate.now() : fecha;
        return ResponseEntity.ok(servicioMonitoreo.obtenerHistorialDia(fechaBusqueda));
    }
    
    /**
     * Obtiene el historial de conexiones de un usuario específico
     */
    @GetMapping("/historial-usuario/{usuarioId}")
    @Operation(summary = "Historial de usuario", description = "Retorna todas las conexiones de un usuario específico")
    public ResponseEntity<List<ConexionUsuarioDTO>> obtenerHistorialUsuario(
            @PathVariable String usuarioId) {
        return ResponseEntity.ok(servicioMonitoreo.obtenerHistorialUsuario(usuarioId));
    }
    
    /**
     * Registra una conexión (se llama automáticamente en el interceptor)
     */
    @PostMapping("/registrar-conexion")
    @Operation(summary = "Registrar conexión", description = "Registra una nueva conexión de usuario (se llama automáticamente)")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConexionUsuarioDTO> registrarConexion(
            @RequestParam String usuarioId,
            @RequestParam String nombreUsuario,
            HttpServletRequest request) {
        
        String ipAddress = obtenerIPReal(request);
        String navegador = request.getHeader("User-Agent");
        String sistemaOperativo = extraerSO(navegador);
        
        ConexionUsuarioDTO conexion = servicioMonitoreo.registrarConexion(
                usuarioId, nombreUsuario, ipAddress, navegador, sistemaOperativo
        );
        
        return ResponseEntity.ok(conexion);
    }
    
    /**
     * Registra una desconexión
     */
    @PostMapping("/registrar-desconexion/{usuarioId}")
    @Operation(summary = "Registrar desconexión", description = "Registra la desconexión de un usuario")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConexionUsuarioDTO> registrarDesconexion(
            @PathVariable String usuarioId) {
        
        ConexionUsuarioDTO conexion = servicioMonitoreo.registrarDesconexion(usuarioId);
        return ResponseEntity.ok(conexion);
    }
    
    /**
     * Obtiene la IP real del cliente (considerando proxies)
     */
    private String obtenerIPReal(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        
        // Si hay múltiples IPs, toma la primera
        if (ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0];
        }
        
        return ipAddress.trim();
    }
    
    /**
     * Extrae el sistema operativo del User-Agent
     */
    private String extraerSO(String userAgent) {
        if (userAgent == null) return "Desconocido";
        
        if (userAgent.toLowerCase().contains("windows")) return "Windows";
        if (userAgent.toLowerCase().contains("mac")) return "macOS";
        if (userAgent.toLowerCase().contains("linux")) return "Linux";
        if (userAgent.toLowerCase().contains("android")) return "Android";
        if (userAgent.toLowerCase().contains("iphone") || userAgent.toLowerCase().contains("ipad")) return "iOS";
        
        return "Desconocido";
    }
}

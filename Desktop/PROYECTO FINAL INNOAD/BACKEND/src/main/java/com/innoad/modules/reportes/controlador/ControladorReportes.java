package com.innoad.modules.reportes.controlador;

import com.innoad.modules.reportes.dto.ReporteDTO;
import com.innoad.modules.reportes.servicio.ServicioReportes;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * Controlador para gestión de reportes
 * Endpoints para generar, descargar y consultar reportes
 */
@RestController
@RequestMapping("/api/reportes")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class ControladorReportes {

    @Autowired
    private ServicioReportes servicioReportes;

    /**
     * Obtener lista de reportes del usuario
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PROFESSIONAL')")
    public ResponseEntity<List<ReporteDTO>> obtenerReportes() {
        try {
            log.info("Solicitando lista de reportes");
            List<ReporteDTO> reportes = servicioReportes.obtenerTodosLosReportes();
            return ResponseEntity.ok(reportes);
        } catch (Exception e) {
            log.error("Error obteniendo reportes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generar nuevo reporte
     */
    @PostMapping("/generar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PROFESSIONAL')")
    public ResponseEntity<Map<String, Object>> generarReporte(@RequestBody Map<String, Object> request) {
        try {
            log.info("Generando nuevo reporte");
            String tipo = (String) request.get("tipo");
            String periodo = (String) request.get("periodo");
            
            ReporteDTO reporte = servicioReportes.generarReporte(tipo, periodo);
            
            return ResponseEntity.ok(Map.of(
                "exito", true,
                "reporte", reporte,
                "mensaje", "Reporte generado exitosamente"
            ));
        } catch (Exception e) {
            log.error("Error generando reporte", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("exito", false, "error", e.getMessage()));
        }
    }

    /**
     * Descargar reporte en PDF
     */
    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PROFESSIONAL')")
    public ResponseEntity<byte[]> descargarReportePDF(@PathVariable Long id) {
        try {
            log.info("Descargando reporte en PDF: {}", id);
            byte[] pdf = servicioReportes.generarPDF(id);
            return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=reporte_" + id + ".pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdf);
        } catch (Exception e) {
            log.error("Error descargando PDF", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Descargar reporte en Excel
     */
    @GetMapping("/{id}/excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PROFESSIONAL')")
    public ResponseEntity<byte[]> descargarReporteExcel(@PathVariable Long id) {
        try {
            log.info("Descargando reporte en Excel: {}", id);
            byte[] excel = servicioReportes.generarExcel(id);
            return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=reporte_" + id + ".xlsx")
                .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                .body(excel);
        } catch (Exception e) {
            log.error("Error descargando Excel", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Eliminar reporte
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> eliminarReporte(@PathVariable Long id) {
        try {
            log.info("Eliminando reporte: {}", id);
            servicioReportes.eliminarReporte(id);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Reporte eliminado"));
        } catch (Exception e) {
            log.error("Error eliminando reporte", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtener detalles de un reporte
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PROFESSIONAL')")
    public ResponseEntity<ReporteDTO> obtenerReporte(@PathVariable Long id) {
        try {
            log.info("Obteniendo detalles del reporte: {}", id);
            ReporteDTO reporte = servicioReportes.obtenerReportePorId(id);
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            log.error("Error obteniendo reporte", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

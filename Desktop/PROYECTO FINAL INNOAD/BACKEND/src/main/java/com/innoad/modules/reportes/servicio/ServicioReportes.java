package com.innoad.modules.reportes.servicio;

import com.innoad.modules.reportes.modelo.Reporte;
import com.innoad.modules.reportes.repository.RepositorioReportes;
import com.innoad.modules.reportes.dto.ReporteDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioReportes {
    
    private final RepositorioReportes repositorioReportes;
    
    public Reporte crearReporte(String titulo, String tipo, String periodo, String generadoPor) {
        Reporte reporte = Reporte.builder()
            .titulo(titulo)
            .tipo(tipo)
            .periodo(periodo)
            .generadoPor(generadoPor)
            .fechaGeneracion(LocalDateTime.now())
            .estado("PENDIENTE")
            .disponible(false)
            .build();
        
        return repositorioReportes.save(reporte);
    }
    
    public Optional<Reporte> obtenerReporte(Long id) {
        return repositorioReportes.findById(id);
    }
    
    public List<Reporte> listarReportes() {
        return repositorioReportes.findAll();
    }
    
    public List<Reporte> listarReportesPorTipo(String tipo) {
        return repositorioReportes.findByTipo(tipo);
    }
    
    public Reporte actualizarEstado(Long id, String nuevoEstado) {
        Optional<Reporte> reporte = repositorioReportes.findById(id);
        if (reporte.isPresent()) {
            Reporte r = reporte.get();
            r.setEstado(nuevoEstado);
            return repositorioReportes.save(r);
        }
        return null;
    }
    
    public Reporte generarReporte(Long id, String datos, Double costoGeneracion, Integer tokensUsados) {
        Optional<Reporte> reporte = repositorioReportes.findById(id);
        if (reporte.isPresent()) {
            Reporte r = reporte.get();
            r.setDatos(datos);
            r.setCostoGeneracion(costoGeneracion);
            r.setTokensUsados(tokensUsados);
            r.setEstado("COMPLETADO");
            r.setDisponible(true);
            r.setFechaExpiracion(LocalDateTime.now().plusDays(30));
            return repositorioReportes.save(r);
        }
        return null;
    }
    
    // Sobrecarga para generarReporte(String tipo, String periodo)
    public ReporteDTO generarReporte(String tipo, String periodo) {
        Reporte reporte = crearReporte("Reporte " + tipo, tipo, periodo, "system");
        return convertirADTO(reporte);
    }
    
    public void eliminarReporte(Long id) {
        repositorioReportes.deleteById(id);
        log.info("Reporte {} eliminado", id);
    }
    
    public List<Reporte> obtenerReportesRecientes(int limite) {
        return repositorioReportes.findRecientes(limite);
    }
    
    public List<Reporte> obtenerReportesPorUsuario(String usuario) {
        return repositorioReportes.findByGeneradoPor(usuario);
    }
    
    public List<ReporteDTO> obtenerTodosLosReportes() {
        return repositorioReportes.findAll()
            .stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }
    
    public byte[] generarPDF(Long id) {
        Optional<Reporte> reporte = repositorioReportes.findById(id);
        if (reporte.isPresent()) {
            // Implementar generación de PDF
            return new byte[0]; // Placeholder
        }
        return null;
    }
    
    public byte[] generarExcel(Long id) {
        Optional<Reporte> reporte = repositorioReportes.findById(id);
        if (reporte.isPresent()) {
            // Implementar generación de Excel
            return new byte[0]; // Placeholder
        }
        return null;
    }
    
    public ReporteDTO obtenerReportePorId(Long id) {
        Optional<Reporte> reporte = repositorioReportes.findById(id);
        return reporte.map(this::convertirADTO).orElse(null);
    }
    
    private ReporteDTO convertirADTO(Reporte reporte) {
        return ReporteDTO.builder()
            .id(reporte.getId())
            .titulo(reporte.getTitulo())
            .tipo(reporte.getTipo())
            .periodo(reporte.getPeriodo())
            .estado(reporte.getEstado())
            .fechaGeneracion(reporte.getFechaGeneracion())
            .disponible(reporte.getDisponible())
            .generadoPor(reporte.getGeneradoPor())
            .build();
    }
}

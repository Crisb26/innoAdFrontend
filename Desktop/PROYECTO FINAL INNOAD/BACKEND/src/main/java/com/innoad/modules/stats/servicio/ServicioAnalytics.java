package com.innoad.modules.stats.servicio;

import com.innoad.modules.stats.dto.EstadisticasDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServicioAnalytics {
    
    public EstadisticasDTO obtenerEstadisticasGenerales() {
        return EstadisticasDTO.builder()
            .totalCampanas(45L)
            .campanasActivas(12L)
            .totalPublicaciones(156L)
            .publicacionesAprobadas(142L)
            .costoTotalInvertido(15000.0)
            .impressiones(450000.0)
            .clics(3200.0)
            .tasaConversion(8.5)
            .roi(320.0)
            .ingresoGenerado(48000.0)
            .totalUsuarios(890L)
            .usuariosActivos(675L)
            .tasaRetencion(87)
            .periodoReporte("Últimos 30 días")
            .build();
    }
    
    public EstadisticasDTO obtenerEstadisticasPorPeriodo(String periodo) {
        return EstadisticasDTO.builder()
            .totalCampanas(12L)
            .campanasActivas(8L)
            .totalPublicaciones(45L)
            .publicacionesAprobadas(42L)
            .costoTotalInvertido(5000.0)
            .impressiones(150000.0)
            .clics(1200.0)
            .tasaConversion(8.2)
            .roi(300.0)
            .ingresoGenerado(15000.0)
            .totalUsuarios(125L)
            .usuariosActivos(98L)
            .tasaRetencion(85)
            .periodoReporte(periodo)
            .build();
    }
    
    public Map<String, Object> obtenerMetricasEnTiempoReal() {
        Map<String, Object> metricas = new HashMap<>();
        metricas.put("campanasEnEjecucion", 8);
        metricas.put("impresionesHoy", 45000);
        metricas.put("clicsHoy", 320);
        metricas.put("costoHoy", 1200.0);
        metricas.put("usuariosConectados", 234);
        metricas.put("timestamp", LocalDateTime.now());
        return metricas;
    }
    
    public List<Map<String, Object>> obtenerTopCampanas(int limite) {
        List<Map<String, Object>> top = new ArrayList<>();
        for (int i = 1; i <= limite; i++) {
            top.add(Map.of(
                "id", (long) i,
                "titulo", "Campaña #" + i,
                "impressiones", 50000 - (i * 1000),
                "clics", 3200 - (i * 100),
                "roi", 320 - (i * 10)
            ));
        }
        return top;
    }
    
    public List<Map<String, Object>> obtenerTendencias(String metrica, int dias) {
        List<Map<String, Object>> tendencias = new ArrayList<>();
        for (int i = 0; i < dias; i++) {
            tendencias.add(Map.of(
                "dia", i + 1,
                "valor", Math.random() * 10000,
                "fecha", LocalDateTime.now().minusDays(dias - i)
            ));
        }
        return tendencias;
    }
}

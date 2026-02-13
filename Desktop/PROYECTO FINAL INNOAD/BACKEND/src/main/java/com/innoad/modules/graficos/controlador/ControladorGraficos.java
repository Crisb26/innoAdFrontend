package com.innoad.modules.graficos.controlador;

import com.innoad.modules.stats.servicio.ServicioAnalytics;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/graficos")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class ControladorGraficos {

    @Autowired
    private ServicioAnalytics servicioAnalytics;

    @GetMapping("/{periodo}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'OPERATOR')")
    public ResponseEntity<Map<String, Object>> obtenerGraficos(@PathVariable String periodo) {
        try {
            log.info("Solicitud de graficos para periodo: {}", periodo);
            
            Map<String, Object> respuesta = new HashMap<>();
            
            List<String> labels = new ArrayList<>();
            List<Integer> datosChat = new ArrayList<>();
            List<Integer> datosIA = new ArrayList<>();
            
            switch (periodo.toLowerCase()) {
                case "ultima-hora":
                    generarDatosUltimaHora(labels, datosChat, datosIA);
                    break;
                case "hoy":
                    generarDatosHoy(labels, datosChat, datosIA);
                    break;
                case "semanal":
                    generarDatosSemanal(labels, datosChat, datosIA);
                    break;
                default:
                    generarDatosHoy(labels, datosChat, datosIA);
            }
            
            respuesta.put("labels", labels);
            respuesta.put("datasets", crearDatasets(datosChat, datosIA));
            respuesta.put("periodo", periodo);
            
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            log.error("Error obteniendo graficos", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private void generarDatosUltimaHora(List<String> labels, List<Integer> datosChat, List<Integer> datosIA) {
        for (int i = 0; i < 12; i++) {
            labels.add(String.format("%02d:%02d", i * 5 / 60, i * 5 % 60));
            datosChat.add((int) (Math.random() * 100));
            datosIA.add((int) (Math.random() * 30));
        }
    }

    private void generarDatosHoy(List<String> labels, List<Integer> datosChat, List<Integer> datosIA) {
        String[] horas = {"00:00", "04:00", "08:00", "12:00", "16:00", "20:00"};
        for (String hora : horas) {
            labels.add(hora);
            datosChat.add((int) (Math.random() * 500));
            datosIA.add((int) (Math.random() * 150));
        }
    }

    private void generarDatosSemanal(List<String> labels, List<Integer> datosChat, List<Integer> datosIA) {
        String[] dias = {"Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"};
        for (String dia : dias) {
            labels.add(dia);
            datosChat.add((int) (Math.random() * 3000));
            datosIA.add((int) (Math.random() * 1000));
        }
    }

    private List<Map<String, Object>> crearDatasets(List<Integer> datosChat, List<Integer> datosIA) {
        List<Map<String, Object>> datasets = new ArrayList<>();
        
        Map<String, Object> datasetChat = new HashMap<>();
        datasetChat.put("label", "Mensajes Chat");
        datasetChat.put("data", datosChat);
        datasetChat.put("borderColor", "rgb(102, 126, 234)");
        datasetChat.put("backgroundColor", "rgba(102, 126, 234, 0.1)");
        datasetChat.put("tension", 0.4);
        datasetChat.put("fill", true);
        datasets.add(datasetChat);
        
        Map<String, Object> datasetIA = new HashMap<>();
        datasetIA.put("label", "Preguntas IA");
        datasetIA.put("data", datosIA);
        datasetIA.put("borderColor", "rgb(245, 87, 108)");
        datasetIA.put("backgroundColor", "rgba(245, 87, 108, 0.1)");
        datasetIA.put("tension", 0.4);
        datasetIA.put("fill", true);
        datasets.add(datasetIA);
        
        return datasets;
    }
}

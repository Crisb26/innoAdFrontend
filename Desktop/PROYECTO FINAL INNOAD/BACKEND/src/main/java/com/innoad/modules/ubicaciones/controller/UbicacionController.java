package com.innoad.modules.ubicaciones.controller;

import com.innoad.modules.ubicaciones.servicio.UbicacionServicio;
import com.innoad.modules.ubicaciones.dto.CiudadDTO;
import com.innoad.modules.ubicaciones.dto.LugarDTO;
import com.innoad.modules.ubicaciones.dto.PisoDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;
import java.util.List;

@RestController
@RequestMapping("/api/ubicaciones")
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class UbicacionController {
    
    @Autowired
    private UbicacionServicio ubicacionServicio;
    
    /**
     * Obtiene todas las ciudades activas
     * GET /api/ubicaciones/ciudades
     */
    @GetMapping("/ciudades")
    public ResponseEntity<List<CiudadDTO>> obtenerCiudades() {
        log.info("GET /api/ubicaciones/ciudades");
        List<CiudadDTO> ciudades = ubicacionServicio.obtenerTodasLasCiudades();
        return ResponseEntity.ok(ciudades);
    }
    
    /**
     * Obtiene los lugares de una ciudad específica
     * GET /api/ubicaciones/ciudades/{ciudadId}/lugares
     */
    @GetMapping("/ciudades/{ciudadId}/lugares")
    public ResponseEntity<List<LugarDTO>> obtenerLugaresPorCiudad(
            @PathVariable Long ciudadId) {
        log.info("GET /api/ubicaciones/ciudades/{}/lugares", ciudadId);
        List<LugarDTO> lugares = ubicacionServicio.obtenerLugaresPorCiudad(ciudadId);
        return ResponseEntity.ok(lugares);
    }
    
    /**
     * Obtiene los pisos disponibles de un lugar
     * GET /api/ubicaciones/lugares/{lugarId}/pisos
     */
    @GetMapping("/lugares/{lugarId}/pisos")
    public ResponseEntity<List<PisoDTO>> obtenerPisosPorLugar(
            @PathVariable Long lugarId) {
        log.info("GET /api/ubicaciones/lugares/{}/pisos", lugarId);
        List<PisoDTO> pisos = ubicacionServicio.obtenerPisosPorLugar(lugarId);
        return ResponseEntity.ok(pisos);
    }
    
    /**
     * Obtiene detalles de una ciudad específica
     * GET /api/ubicaciones/ciudades/{ciudadId}
     */
    @GetMapping("/ciudades/{ciudadId}")
    public ResponseEntity<CiudadDTO> obtenerCiudadPorId(
            @PathVariable Long ciudadId) {
        log.info("GET /api/ubicaciones/ciudades/{}", ciudadId);
        CiudadDTO ciudad = ubicacionServicio.obtenerCiudadPorId(ciudadId);
        return ResponseEntity.ok(ciudad);
    }
    
    /**
     * Obtiene detalles de un lugar específico
     * GET /api/ubicaciones/lugares/{lugarId}
     */
    @GetMapping("/lugares/{lugarId}")
    public ResponseEntity<LugarDTO> obtenerLugarPorId(
            @PathVariable Long lugarId) {
        log.info("GET /api/ubicaciones/lugares/{}", lugarId);
        LugarDTO lugar = ubicacionServicio.obtenerLugarPorId(lugarId);
        return ResponseEntity.ok(lugar);
    }
}
